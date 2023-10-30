import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { Document, Page } from "react-pdf";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";

interface pdfRendererProps {
  url: string;
}

const PDFfullscreen = ({ url }: pdfRendererProps) => {
  const { toast } = useToast();
  const [numPages, setNumPages] = useState<number>();
  const { width, ref } = useResizeDetector();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-1.5" aria-label="fullscreen" variant="ghost">
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-7xl w-full min-w-[90%] max-sm:max-w-[90%] max-sm:rounded-lg">
        <SimpleBar className="max-h-[calc(100vh-10rem]" autoHide={false}>
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 2-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error loading PDF",
                  description: "Something went wrong",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              file={url}
              className=" max-h-[80vh] h-[80vh] overflow-scroll"
            >
              {new Array(numPages).fill(0).map((_, i) => (
                <Page key={i} pageNumber={i + 1} width={width ? width : 1} />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PDFfullscreen;
