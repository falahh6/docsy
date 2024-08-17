"use client";

import { trpc } from "@/app/_trpc/Client";
import UploadButton from "./UploadButton";
import { Ghost, Loader2, MessagesSquare, Plus, Trash2Icon } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useState } from "react";

const Dashboard = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);
  const utils = trpc.useContext();
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();
  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate();
    },
    onMutate({ id }) {
      setCurrentlyDeletingFile(id);
    },
    onSettled() {
      setCurrentlyDeletingFile(null);
    },
  });

  return (
    <main className="mx-auto max-w-7xl md:p-10 max-sm:w-[80%]">
      <div className="mt-8 flex items-start max-sm:items-center max-sm:align-middle justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0 ">
        <h1 className="mb-3 max-sm:mb-0 font-bold text-5xl text-gray-900 max-sm:text-2xl">
          My Files
        </h1>

        <UploadButton isSubscribed={isSubscribed} />
      </div>

      {/* display files */}
      {files && files?.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg max-sm"
                key={file.id}
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-start justify-start space-x-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 max-sm:h-6 max-sm:w-6" />
                    <div className="flex-1 truncate">
                      <div className="flex items-start space-x-3 ">
                        <h3 className="truncate text-lg font-medium text-zinc-900 max-sm:text-sm">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {format(new Date(file.createdAt), "MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessagesSquare className="h-4 w-4" />
                    {file.messages.length}
                  </div>
                  <Button
                    onClick={() => deleteFile({ id: file.id })}
                    size={"sm"}
                    className="w-full"
                    variant={"destructive"}
                  >
                    {currentlyDeletingFile === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin " />
                    ) : (
                      <Trash2Icon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton className="my-2" count={3} height={100} />
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <Ghost className="w-8 h-8 text-zinc-800" />
          <h3 className="text-semibold textcl">Pretty empty here</h3>
          <p>Let&apos;s add your first PDF.</p>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
