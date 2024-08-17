// src/types/pdfjs-dist.d.ts
declare module "pdfjs-dist/build/pdf.worker.entry" {
  const workerSrc: string;
  export default workerSrc;
}

declare module "pdfjs-dist" {
  import {
    PDFDocumentProxy,
    PDFPageProxy,
    PDFPromise,
    GlobalWorkerOptions,
  } from "pdfjs-dist/types/src/display/api";
  export const getDocument: (
    src: string | Uint8Array | PDFSource
  ) => PDFPromise<PDFDocumentProxy>;
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
}
