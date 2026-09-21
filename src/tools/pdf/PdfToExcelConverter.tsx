import React, { useState, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { pdfjsLib } from '../../utils/pdfHelper';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import {
  Table as TableIcon,
  Upload,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Search,
  Settings2,
  Edit2,
} from 'lucide-react';

interface SheetData {
  pageNumber: number;
  rows: string[][];
}

export const PdfToExcelConverter: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [combineSheets, setCombineSheets] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Load a demo PDF table with financial & order data
  const handleLoadSamplePdf = async () => {
    try {
      setIsLoading(true);
      setProgress(25);

      const samplePdf = new jsPDF();
      
      // Header
      samplePdf.setFont('helvetica', 'bold');
      samplePdf.setFontSize(16);
      samplePdf.text('Monthly Financial & Sales Ledger', 15, 20);

      samplePdf.setFont('helvetica', 'normal');
      samplePdf.setFontSize(10);
      samplePdf.text('Accounting Period: 2026 Fiscal Year · Department: Global Operations', 15, 28);

      // Table headers
      const headers = ['ID', 'Item Description', 'Category', 'Units', 'Unit Price', 'Total Revenue'];
      let startY = 40;
      
      samplePdf.setFont('helvetica', 'bold');
      samplePdf.setFontSize(9);
      const colX = [15, 30, 85, 125, 145, 175];
      
      headers.forEach((h, idx) => {
        samplePdf.text(h, colX[idx], startY);
      });

      samplePdf.setDrawColor(200, 200, 200);
      samplePdf.line(15, startY + 3, 195, startY + 3);

      // Table rows
      const dataRows = [
        ['1001', 'Cloud Database Cluster Tier 3', 'Enterprise', '12', '$850.00', '$10,200.00'],
        ['1002', 'Dedicated CDN Edge Node', 'Network', '24', '$320.00', '$7,680.00'],
        ['1003', 'SSL Wildcard Security Cert', 'Security', '8', '$149.00', '$1,192.00'],
        ['1004', 'Automated Daily Backups (TB)', 'Storage', '50', '$45.00', '$2,250.00'],
        ['1005', 'High-Bandwidth Load Balancer', 'Network', '6', '$420.00', '$2,520.00'],
        ['1006', 'Developer Workspace Pro Seats', 'SaaS', '150', '$18.00', '$2,700.00'],
        ['1007', 'API Gateway Rate Shield', 'Security', '4', '$600.00', '$2,400.00'],
        ['1008', 'Enterprise 24/7 SLA Support', 'Service', '1', '$3,500.00', '$3,500.00'],
      ];

      samplePdf.setFont('helvetica', 'normal');
      samplePdf.setFontSize(9);

      dataRows.forEach((row, rIdx) => {
        const y = startY + 12 + rIdx * 10;
        row.forEach((cell, cIdx) => {
          samplePdf.text(cell, colX[cIdx], y);
        });
      });

      const pdfArrayBuffer = samplePdf.output('arraybuffer');
      await parsePdfTables(pdfArrayBuffer, 'financial-sales-ledger.pdf', pdfArrayBuffer.byteLength);
      showToast('Loaded sample financial PDF table', 'info');
    } catch (err: any) {
      console.error(err);
      showToast('Error creating sample: ' + err.message, 'error');
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
      setProgress(15);
      const arrayBuffer = await file.arrayBuffer();
      await parsePdfTables(arrayBuffer, file.name, file.size);
      showToast(`Detected tables in ${file.name}`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to parse PDF table data: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract structured table rows by grouping text positions
  const parsePdfTables = async (buffer: ArrayBuffer, name: string, size: number) => {
    setFileName(name);
    setFileSize(size);

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const extractedSheets: SheetData[] = [];

    for (let i = 1; i <= numPages; i++) {
      setProgress(Math.round((i / numPages) * 90));
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Group text items by Y coordinate with a tolerance threshold
      const lineMap = new Map<number, { x: number; text: string }[]>();
      const yTolerance = 4; // pixels tolerance for row alignment

      textContent.items.forEach((item: any) => {
        if ('str' in item && item.str.trim()) {
          const x = item.transform ? Math.round(item.transform[4]) : 0;
          const y = item.transform ? Math.round(item.transform[5]) : 0;

          // Find existing line bucket within yTolerance
          let targetY = Array.from(lineMap.keys()).find((k) => Math.abs(k - y) <= yTolerance);
          if (targetY === undefined) {
            targetY = y;
            lineMap.set(targetY, []);
          }

          lineMap.get(targetY)!.push({ x, text: item.str.trim() });
        }
      });

      // Sort rows descending by Y (PDF Y=0 is bottom)
      const sortedYKeys = Array.from(lineMap.keys()).sort((a, b) => b - a);

      const tableRows: string[][] = [];

      sortedYKeys.forEach((yKey) => {
        const items = lineMap.get(yKey)!;
        // Sort cells in this row by X (left to right)
        items.sort((a, b) => a.x - b.x);

        // Group into distinct columns or cells
        const rowCells: string[] = [];
        let currentCell = '';
        let lastX = -1;

        items.forEach((it) => {
          // If spacing between items is significant, start new column
          if (lastX !== -1 && it.x - lastX > 35) {
            if (currentCell) {
              rowCells.push(currentCell);
            }
            currentCell = it.text;
          } else {
            currentCell += (currentCell ? ' ' : '') + it.text;
          }
          lastX = it.x;
        });

        if (currentCell) {
          rowCells.push(currentCell);
        }

        // Only include non-empty rows
        if (rowCells.length > 0) {
          tableRows.push(rowCells);
        }
      });

      // Normalize row column counts so the table grid is rectangular
      const maxCols = Math.max(...tableRows.map((r) => r.length), 1);
      const normalizedRows = tableRows.map((row) => {
        const padded = [...row];
        while (padded.length < maxCols) {
          padded.push('');
        }
        return padded;
      });

      extractedSheets.push({
        pageNumber: i,
        rows: normalizedRows.length > 0 ? normalizedRows : [['No table data detected on this page']],
      });
    }

    setSheets(extractedSheets);
    setActiveSheetIndex(0);
    setProgress(100);
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    setSheets((prev) => {
      const next = [...prev];
      const curSheet = { ...next[activeSheetIndex] };
      const nextRows = curSheet.rows.map((row, r) =>
        r === rIdx ? row.map((cell, c) => (c === cIdx ? val : cell)) : row
      );
      curSheet.rows = nextRows;
      next[activeSheetIndex] = curSheet;
      return next;
    });
  };

  const handleAddRow = () => {
    setSheets((prev) => {
      const next = [...prev];
      const curSheet = { ...next[activeSheetIndex] };
      const colCount = curSheet.rows[0]?.length || 4;
      curSheet.rows = [...curSheet.rows, new Array(colCount).fill('')];
      next[activeSheetIndex] = curSheet;
      return next;
    });
    showToast('Added new empty row', 'info');
  };

  const handleDeleteRow = (rIdx: number) => {
    setSheets((prev) => {
      const next = [...prev];
      const curSheet = { ...next[activeSheetIndex] };
      curSheet.rows = curSheet.rows.filter((_, idx) => idx !== rIdx);
      next[activeSheetIndex] = curSheet;
      return next;
    });
  };

  const handleAddColumn = () => {
    setSheets((prev) => {
      const next = [...prev];
      const curSheet = { ...next[activeSheetIndex] };
      curSheet.rows = curSheet.rows.map((r) => [...r, '']);
      next[activeSheetIndex] = curSheet;
      return next;
    });
    showToast('Added new column', 'info');
  };

  // Export genuine .xlsx workbook
  const handleExportXlsx = () => {
    if (sheets.length === 0) return;

    try {
      const wb = XLSX.utils.book_new();

      if (combineSheets || sheets.length === 1) {
        const allRows: string[][] = [];
        sheets.forEach((sheet, idx) => {
          if (idx > 0) {
            allRows.push([]); // blank row between pages
            allRows.push([`--- Page ${sheet.pageNumber} ---`]);
          }
          sheet.rows.forEach((r) => allRows.push(r));
        });

        const ws = XLSX.utils.aoa_to_sheet(allRows);
        XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');
      } else {
        sheets.forEach((sheet) => {
          const ws = XLSX.utils.aoa_to_sheet(sheet.rows);
          XLSX.utils.book_append_sheet(wb, ws, `Page ${sheet.pageNumber}`);
        });
      }

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = fileName.replace(/\.pdf$/i, '') || 'converted-spreadsheet';
      a.download = `${baseName}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      showToast(`Downloaded ${baseName}.xlsx`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Error exporting Excel: ' + err.message, 'error');
    }
  };

  const handleExportCsv = () => {
    if (sheets.length === 0) return;

    const curRows = sheets[activeSheetIndex]?.rows || [];
    const csvContent = curRows
      .map((row) =>
        row
          .map((cell) => {
            const escaped = cell.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = fileName.replace(/\.pdf$/i, '') || 'converted-data';
    a.download = `${baseName}-page-${activeSheetIndex + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Downloaded CSV for Page ${activeSheetIndex + 1}`, 'success');
  };

  const handleCopyTsv = async () => {
    const curRows = sheets[activeSheetIndex]?.rows || [];
    const tsv = curRows.map((r) => r.join('\t')).join('\n');
    await navigator.clipboard.writeText(tsv);
    setCopied(true);
    showToast('Copied table data (paste directly into Excel / Google Sheets)', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const currentSheet = sheets[activeSheetIndex] || sheets[0];

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload PDF
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample Financial Table
          </button>

          {sheets.length > 0 && (
            <button
              onClick={() => {
                setSheets([]);
                setFileName('');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {sheets.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Table'}
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            <button
              onClick={handleExportXlsx}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Excel (.xlsx)
            </button>
          </div>
        )}
      </div>

      {sheets.length === 0 ? (
        /* Empty / Upload View */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-12 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors cursor-pointer space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 mx-auto flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Select or Drop PDF File to Extract Tables to Excel
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Extract tabular ledgers, invoices, statements, and numbers into interactive editable spreadsheets and download real Microsoft Excel (.xlsx) or CSV files.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Browser Privacy
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Multi-Page Sheet Parsing
            </span>
          </div>
        </div>
      ) : (
        /* Parsed Table Grid View */
        <div className="space-y-5">
          {/* Controls & Multi-sheet tab selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">PDF Sheets:</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {sheets.map((sheet, idx) => (
                  <button
                    key={sheet.pageNumber}
                    onClick={() => setActiveSheetIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeSheetIndex === idx
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Page {sheet.pageNumber} ({sheet.rows.length} rows)
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={combineSheets}
                  onChange={(e) => setCombineSheets(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Combine all pages into one Excel sheet</span>
              </label>

              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                <button
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Row
                </button>
                <button
                  onClick={handleAddColumn}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Column
                </button>
              </div>
            </div>
          </div>

          {/* Editable Spreadsheet Table */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500">
                Interactive Grid Editor (Click any cell to edit directly before downloading)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentSheet?.rows.length || 0} rows × {currentSheet?.rows[0]?.length || 0} columns
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-[500px]">
              <table className="w-full text-xs text-left border-collapse">
                <tbody>
                  {currentSheet?.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={
                        rIdx === 0
                          ? 'bg-slate-100 dark:bg-slate-800/80 font-bold border-b border-slate-200 dark:border-slate-700'
                          : 'border-b border-slate-100 dark:border-slate-800/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20'
                      }
                    >
                      {/* Row index indicator */}
                      <td className="w-10 px-2 py-1.5 text-center font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 select-none">
                        {rIdx + 1}
                      </td>

                      {/* Cells */}
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="p-1 border-r border-slate-100 dark:border-slate-800/50 min-w-[120px]"
                        >
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                            className="w-full px-2 py-1 bg-transparent hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 rounded outline-none text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 font-sans"
                          />
                        </td>
                      ))}

                      {/* Delete row button */}
                      <td className="w-8 px-1 text-center">
                        <button
                          title="Delete Row"
                          onClick={() => handleDeleteRow(rIdx)}
                          className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfToExcelConverter;
