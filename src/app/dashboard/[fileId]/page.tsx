import ChatWrapper from "@/components/chat/ChatWrapper";
import PDFRenderer from "@/components/PDFRenderer";
import { db } from "@/db";
import { constructMetadata } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface pageProps {
  params: {
    fileId: string;
  };
}

export const metadata = constructMetadata({
  title: "Chat now",
});

const page = async ({ params }: pageProps) => {
  const { fileId } = params;

  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileId}`);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: user.id,
    },
  });

  if (!file) notFound();

  return (
    <>
      <div className="flex-1 hidden justify-between max-sm:flex flex-col h-[calc(100vh-3.5rem)] bg-gray-50">
        <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
          <div className="flex-1 xl:flex">
            <div className="px-4 py-3 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
              <PDFRenderer url={file.url} />
            </div>
          </div>

          <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-t-0 lg:border-l">
            <ChatWrapper fileId={file.id} />
          </div>
        </div>
      </div>
      {/* <ResizablePanelGroup
        direction="vertical"
        className="min-h-[92vh] hidden max-sm:flex min-w-full rounded-lg border"
      >
        <ResizablePanel defaultSize={100}>
          <PDFRenderer url={file.url} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={100}>
          <ChatWrapper fileId={file.id} />
        </ResizablePanel>
      </ResizablePanelGroup> */}
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[92vh] max-sm:hidden max-sm:invisible min-w-full rounded-lg border"
      >
        <ResizablePanel defaultSize={60} minSize={40}>
          <PDFRenderer url={file.url} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={40}>
          <ChatWrapper fileId={file.id} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

export default page;
