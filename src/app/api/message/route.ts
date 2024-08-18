import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest, NextResponse } from "next/server";
import { OpenAIStream, StreamingTextResponse, AnthropicStream } from "ai";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

interface SearchResult {
  pageContent: string;
  metadata: {
    fileName: string;
  };
}

function customFilter(result: SearchResult, targetFileName: string): boolean {
  return result.metadata?.fileName === targetFileName;
}

export const runtime = "edge";

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = getUser();

  const { id: userId } = user;

  if (!user.id) return new Response("Unauthorized", { status: 401 });

  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("NOT FOUND", { status: 404 });

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  // const embeddings = new OpenAIEmbeddings({
  //   openAIApiKey: process.env.OPENAI_API_KEY,
  // });

  // console.log("embeddings", embeddings);

  // // 1 . create the index
  // const pineconeIndex = pinecone.Index("docsy");

  // console.log("pineconeIndex", pineconeIndex);

  // //
  // const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  //   pineconeIndex,
  // });

  // const results = await vectorStore.similaritySearch(message, 1, {
  //   filter: (result: SearchResult) => customFilter(result, file.id),
  // });

  // console.log("results", results);

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  console.log("prevMessages", prevMessages);

  const formattedMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  console.log("formattedMessages", formattedMessages);

  // CONTEXT:
  // ${results.map((r) => r.pageContent).join("\n\n")}

  const PROMPT = `
  Use the following pieces of context (the document data as astring) or previous conversaton if needed to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
  \n----------------\n

   PREVIOUS CONVERSATION:
   ${formattedMessages.map((message) => {
     if (message.role === "user") return `User: ${message.content}\n`;
     return `Assistant: ${message.content}\n`;
   })}

  \n----------------\n
  // CONTEXT:
  ${file.fileText}

  USER INPUT: ${message}`;

  const response = await anthropic.completions.create({
    max_tokens_to_sample: 100,
    prompt: Anthropic.HUMAN_PROMPT + PROMPT + Anthropic.AI_PROMPT,
    model: "claude-2.1",
    stream: true,
  });

  //@ts-ignore
  const stream = AnthropicStream(response, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId,
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
};
