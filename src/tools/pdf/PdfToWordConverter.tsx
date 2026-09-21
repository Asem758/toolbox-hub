import React, { useState, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { pdfjsLib } from '../../utils/pdfHelper';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import jsPDF from 'jspdf';
import {
  FileText,
  Upload,
  Download,
  Copy,
  Check,
  Search,
  Sparkles,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface ParsedPage {
  pageNumber: number;
  text: string;
  lines: string[];
  wordCount: number;
}

export const PdfToWordConverter: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [pages, setPages] = useState<ParsedPage[]>([]);
  const [activePage, setActivePage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<'docx' | 'txt' | 'html'>('docx');

  // Load a demo business PDF report
  const handleLoadSamplePdf = async () => {
    try {
      setIsLoading(true);
      setProgress(20);

      // Create a sample PDF in memory using jsPDF
      const samplePdf = new jsPDF();
      
      // Page 1: Executive Summary
      samplePdf.setFont('helvetica', 'bold');
      samplePdf.setFontSize(22);
      samplePdf.setTextColor(30, 41, 59);
      samplePdf.text('Quarterly Business Performance Report', 20, 30);

      samplePdf.setFont('helvetica', 'normal');
      samplePdf.setFontSize(12);
      samplePdf.setTextColor(71, 85, 105);
      samplePdf.text('Prepared for: Strategic Executive Board', 20, 42);
      samplePdf.text('Date: Q3 Fiscal Review', 20, 50);

      samplePdf.setDrawColor(226, 232, 240);
      samplePdf.setLineWidth(0.5);
      samplePdf.line(20, 56, 190, 56);

      samplePdf.setFont('helvetica', 'bold');
      samplePdf.setFontSize(14);
      samplePdf.setTextColor(30, 41, 59);
      samplePdf.text('1. Executive Overview & Core Metrics', 20, 70);

      samplePdf.setFont('helvetica', 'normal');
      samplePdf.setFontSize(11);
      samplePdf.setTextColor(51, 65, 85);
      const paragraph1 =
        'During the third quarter, our team achieved accelerated customer acquisition across enterprise sectors. Total recurring revenue reached $2.4M, representing a 34% year-over-year expansion. Infrastructure optimization and client-side processing tools reduced operational server overhead by 42%.';
      samplePdf.text(samplePdf.splitTextToSize(paragraph1, 170), 20, 80);

      samplePdf.setFont('helvetica', 'bold');
      samplePdf.setFontSize(14);
      samplePdf.setTextColor(30, 41, 59);
      samplePdf.text('2. Key Performance Indicators', 20, 120);

      samplePdf.setFont('helvetica', 'normal');
      samplePdf.setFontSize(11);
      samplePdf.text('• Enterprise Net Retention Rate: 118%', 25, 132);
      samplePdf.text('• Average Response Latency: <15ms (Global Edge CDN)', 25, 142);
      samplePdf.text('• Customer Satisfaction Score (CSAT): 98.4%', 25, 152);
      samplePdf.text('• Active Monthly Browser Tool Users: 450,000+', 25, 162);

      // Page 2: Strategic Roadmap
      samplePdf.addPage();
      samplePdf.setFont('helvetica', 'bold');
      samplePdf.setFontSize(18);
      samplePdf.setTextColor(30, 41, 59);
      samplePdf.text('Strategic Product Roadmap & Growth Initiatives', 20, 30);

      samplePdf.setFont('helvetica', 'normal');
      samplePdf.setFontSize(11);
      samplePdf.setTextColor(51, 65, 85);
      const paragraph2 =
        'Looking forward to the subsequent quarter, our primary engineering objective is releasing zero-latency document conversion tools directly within client browsers. This eliminates cloud database risks, guarantees zero user data retention, and delivers instantaneous productivity.';
      samplePdf.text(samplePdf.splitTextToSize(paragraph2, 170), 20, 45);

      const pdfArrayBuffer = samplePdf.output('arraybuffer');
      await parsePdfData(pdfArrayBuffer, 'sample-quarterly-report.pdf', pdfArrayBuffer.byteLength);
      showToast('Loaded sample business report PDF', 'info');
    } catch (err: any) {
      console.error(err);
      showToast('Error generating sample: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please upload a valid PDF document (.pdf)', 'error');
      return;
    }

    try {
      setIsLoading(true);
      setProgress(10);
      const arrayBuffer = await file.arrayBuffer();
      await parsePdfData(arrayBuffer, file.name, file.size);
      showToast(`Extracted text from ${file.name}`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to parse PDF: ' + (err.message || 'Corrupted or password-protected PDF'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const parsePdfData = async (buffer: ArrayBuffer, name: string, size: number) => {
    setFileName(name);
    setFileSize(size);

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const extractedPages: ParsedPage[] = [];

    for (let i = 1; i <= numPages; i++) {
      setProgress(Math.round((i / numPages) * 90));
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      let lastY: number | null = null;
      const lines: string[] = [];
      let currentLine = '';

      textContent.items.forEach((item: any) => {
        if ('str' in item) {
          const y = item.transform ? item.transform[5] : null;
          // Check if new line (Y position dropped)
          if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
            if (currentLine.trim()) {
              lines.push(currentLine.trim());
            }
            currentLine = item.str;
          } else {
            currentLine += (currentLine ? ' ' : '') + item.str;
          }
          lastY = y;
        }
      });

      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }

      const fullPageText = lines.join('\n\n');
      const words = fullPageText.split(/\s+/).filter(Boolean).length;

      extractedPages.push({
        pageNumber: i,
        text: fullPageText,
        lines,
        wordCount: words,
      });
    }

    setPages(extractedPages);
    setActivePage(1);
    setProgress(100);
  };

  // Convert extracted text into genuine .docx format
  const handleExportDocx = async () => {
    if (pages.length === 0) return;

    try {
      setIsExportingDocx(true);

      const docChildren: Paragraph[] = [];

      pages.forEach((p, pageIdx) => {
        // Page header marker if multi-page
        if (pageIdx > 0) {
          docChildren.push(
            new Paragraph({
              text: '',
              pageBreakBefore: true,
            })
          );
        }

        p.lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) return;

          // Detect potential headings (short lines, starts with numbers or uppercase)
          const isHeading =
            trimmed.length < 80 &&
            (/^[0-9]+\.\s+[A-Z]/.test(trimmed) ||
              trimmed === trimmed.toUpperCase() ||
              /^Report|^Quarterly|^Executive|^Overview|^Summary|^Strategic/i.test(trimmed));

          if (isHeading) {
            docChildren.push(
              new Paragraph({
                text: trimmed,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
              })
            );
          } else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: trimmed.replace(/^[•-]\s*/, ''),
                  }),
                ],
                bullet: { level: 0 },
                spacing: { after: 80 },
              })
            );
          } else {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: trimmed,
                    size: 24, // 12pt
                  }),
                ],
                spacing: { after: 160 },
              })
            );
          }
        });
      });

      const doc = new Document({
        title: fileName.replace(/\.pdf$/i, ''),
        description: 'Converted from PDF with ToolBox Hub',
        sections: [
          {
            properties: {},
            children: docChildren,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = fileName.replace(/\.pdf$/i, '') || 'converted-document';
      a.download = `${baseName}.docx`;
      a.click();
      URL.revokeObjectURL(url);

      showToast(`Downloaded ${baseName}.docx`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Error exporting DOCX: ' + err.message, 'error');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportTxt = () => {
    const fullText = pages.map((p) => `--- Page ${p.pageNumber} ---\n\n${p.text}`).join('\n\n\n');
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = fileName.replace(/\.pdf$/i, '') || 'converted-document';
    a.download = `${baseName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${baseName}.txt`, 'success');
  };

  const handleExportHtml = () => {
    const bodyHtml = pages
      .map(
        (p) =>
          `<div class="page" style="margin-bottom: 40px; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="font-size: 12px; color: #94a3b8; margin-bottom: 20px;">Page ${p.pageNumber}</div>
  ${p.lines.map((line) => `<p style="line-height: 1.6; margin-bottom: 12px;">${line}</p>`).join('\n  ')}
</div>`
      )
      .join('\n\n');

    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${fileName.replace(/\.pdf$/i, '')}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; color: #1e293b; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = fileName.replace(/\.pdf$/i, '') || 'converted-document';
    a.download = `${baseName}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${baseName}.html`, 'success');
  };

  const handleCopyAll = async () => {
    const fullText = pages.map((p) => p.text).join('\n\n');
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    showToast('Copied all document text to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const totalWords = pages.reduce((acc, p) => acc + p.wordCount, 0);
  const currentPageData = pages.find((p) => p.pageNumber === activePage) || pages[0];

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload PDF Document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleLoadSamplePdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample PDF Report
          </button>

          {pages.length > 0 && (
            <button
              onClick={() => {
                setPages([]);
                setFileName('');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {pages.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>

            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isExportingDocx ? 'Creating DOCX...' : 'Download Word (.docx)'}
            </button>
          </div>
        )}
      </div>

      {pages.length === 0 ? (
        /* Empty / Upload View */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-12 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 mx-auto flex items-center justify-center">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Select or Drop PDF File to Convert to Word
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              100% Client-Side Processing. Extracts text, paragraphs, headings and lists into formatted Microsoft Word (.docx), TXT, and HTML files.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Private (No Cloud Uploads)
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Preserves Headings & Bullets
            </span>
          </div>
        </div>
      ) : (
        /* Parsed Document View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Document Stats & Export Settings */}
          <div className="lg:col-span-4 space-y-4">
            {/* Meta info card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {fileName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {(fileSize / 1024).toFixed(1)} KB · {pages.length} Pages
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Words</div>
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {totalWords.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Pages</div>
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {pages.length}
                  </div>
                </div>
              </div>

              {/* Download Buttons Group */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleExportDocx}
                  disabled={isExportingDocx}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Microsoft Word (.docx)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExportTxt}
                    className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3 h-3" />
                    Plain Text (.txt)
                  </button>
                  <button
                    onClick={handleExportHtml}
                    className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3 h-3" />
                    Web HTML (.html)
                  </button>
                </div>
              </div>
            </div>

            {/* Page Jump List */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Jump to Page:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {pages.map((p) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => setActivePage(p.pageNumber)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      activePage === p.pageNumber
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Pg {p.pageNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Page Viewer & Extracted Copy */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              {/* Pagination controls & In-page search */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    disabled={activePage <= 1}
                    onClick={() => setActivePage((prev) => Math.max(1, prev - 1))}
                    className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 ${
                      activePage <= 1
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Page {activePage} of {pages.length}
                  </span>
                  <button
                    disabled={activePage >= pages.length}
                    onClick={() => setActivePage((prev) => Math.min(pages.length, prev + 1))}
                    className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 ${
                      activePage >= pages.length
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search in page..."
                    className="w-44 px-2.5 py-1.5 pl-7 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2 top-2.5 text-slate-400" />
                </div>
              </div>

              {/* Document Text Content Renderer */}
              <div className="min-h-[420px] max-h-[600px] overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-3">
                {currentPageData?.lines.length ? (
                  currentPageData.lines.map((line, lIdx) => {
                    const isHeading =
                      line.length < 80 &&
                      (/^[0-9]+\.\s+[A-Z]/.test(line) ||
                        line === line.toUpperCase() ||
                        /^Report|^Quarterly|^Executive|^Overview|^Summary|^Strategic/i.test(line));

                    if (isHeading) {
                      return (
                        <h4
                          key={lIdx}
                          className="font-bold text-sm sm:text-base text-slate-900 dark:text-white pt-2"
                        >
                          {line}
                        </h4>
                      );
                    }

                    if (line.startsWith('•') || line.startsWith('-')) {
                      return (
                        <div key={lIdx} className="flex items-start gap-2 pl-3 text-slate-700 dark:text-slate-300">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{line.replace(/^[•-]\s*/, '')}</span>
                        </div>
                      );
                    }

                    return (
                      <p key={lIdx} className="text-slate-700 dark:text-slate-300">
                        {line}
                      </p>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    No text detected on this page. (Might be a scanned image-only PDF)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfToWordConverter;
