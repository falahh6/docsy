import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";
const f = createUploadthing();

const middeleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) throw new Error("Unauthorized");

  const subscriptionPlan = await getUserSubscriptionPlan();

  return {
    user: user.id,
    subscriptionPlan,
  };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middeleware>>;
  file: {
    key: string;
    url: string;
    name: string;
  };
}) => {
  const fileExist = await db.file.findFirst({
    where: {
      key: file.key,
    },
  });

  if (fileExist) return;

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.user,
      url: file.url,
      fileText: "",
      uploadStatus: "PROCESSING",
    },
  });

  await fetch(file.url)
    .then(async (response) => {
      const blob = await response.blob();
      const loader = new PDFLoader(blob);

      const pageLevelDocs = await loader.load();
      console.log("pageLevelDocs", pageLevelDocs[0].pageContent);

      await db.file.update({
        data: {
          fileText: JSON.stringify(pageLevelDocs[0].pageContent),
        },
        where: {
          id: createdFile.id,
        },
      });

      const pagesAmt = pageLevelDocs.length;
      console.log(pagesAmt);

      const { subscriptionPlan } = metadata;
      const { isSubscribed } = subscriptionPlan;

      console.log(subscriptionPlan, isSubscribed);

      const isProExceeded =
        pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
      const isFreeExceeded =
        pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

      console.log(isProExceeded, isFreeExceeded);

      if (
        (isSubscribed && isProExceeded) ||
        (!isSubscribed && isFreeExceeded)
      ) {
        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createdFile.id,
          },
        });
      }

      // // vectorise and Index!
      // const pinecone = await getPineconeClient();
      const pineconeIndex = pinecone.Index("docsy");

      // const embeddings = new OpenAIEmbeddings({
      //   openAIApiKey: process.env.OPENAI_API_KEY,
      // });

      const combinedData = pageLevelDocs.map((document) => {
        return {
          ...document,
          metadata: {
            fileId: createdFile.id,
          },
          dataset: "pdf",
        };
      });

      // await PineconeStore.fromDocuments(combinedData, embeddings, {
      //   pineconeIndex,
      // });

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
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });
    });
};

export const ourFileRouter = {
  freePlanPdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middeleware)
    .onUploadComplete(onUploadComplete),
  proPlanPdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(middeleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
