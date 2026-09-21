import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  const version = pdfjsLib.version || '6.2.108';
  // Use unpkg ES module worker that matches the installed pdfjs-dist version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
}

export { pdfjsLib };
