import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" });
export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = getUser();

      if (!user || !user.id) throw new Error("Unauthorized");
      return {
        user: user.id,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.user,
          // url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          url: file.url,
          uploadStatus: "PROCESSING",
        },
      });

      await fetch(file.url)
        .then(async (response) => {
          const blob = await response.blob();
          const loader = new PDFLoader(blob);

          const pageLevelDocs = await loader.load();

          const pagesAmt = pageLevelDocs.length;

          // // vectorise and Index!
          // const pinecone = await getPineconeClient();
          const pineconeIndex = pinecone.Index("docsy");

          const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
          });

          const combinedData = pageLevelDocs.map((document) => {
            return {
              ...document,
              metadata: {
                fileId: createdFile.id,
              },
              dataset: "pdf",
            };
          });

          await PineconeStore.fromDocuments(combinedData, embeddings, {
            pineconeIndex,
          });

          await db.file.update({
            data: {
              uploadStatus: "SUCCESS",
            },
            where: {
              id: createdFile.id,
            },
          });
        })
        .catch(async (err) => {
          console.log(err);
          await db.file.update({
            data: {
              uploadStatus: "FAILED",
            },
            where: {
              id: createdFile.id,
            },
          });
        });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
