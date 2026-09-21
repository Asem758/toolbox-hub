import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Hash,
  Copy,
  Check,
  FileCode,
  Upload,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Key,
  Layers,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { copyToClipboard } from '../../lib/utils';

// Pure JavaScript MD5 Implementation
function md5(input: string | Uint8Array): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = input;
  }

  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }

  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const words: number[] = [];
  const byteLen = bytes.length;
  for (let i = 0; i < byteLen; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  words[byteLen >> 2] |= 0x80 << ((byteLen % 4) * 8);
  words[(((byteLen + 8) >> 6) << 4) + 14] = byteLen * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < words.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, words[i] || 0, 7, -680876936);
    d = md5ff(d, a, b, c, words[i + 1] || 0, 12, -389564586);
    c = md5ff(c, d, a, b, words[i + 2] || 0, 17, 606105819);
    b = md5ff(b, c, d, a, words[i + 3] || 0, 22, -1044525330);
    a = md5ff(a, b, c, d, words[i + 4] || 0, 7, -176418897);
    d = md5ff(d, a, b, c, words[i + 5] || 0, 12, 1200080426);
    c = md5ff(c, d, a, b, words[i + 6] || 0, 17, -1473231341);
    b = md5ff(b, c, d, a, words[i + 7] || 0, 22, -45705983);
    a = md5ff(a, b, c, d, words[i + 8] || 0, 7, 1770035416);
    d = md5ff(d, a, b, c, words[i + 9] || 0, 12, -1958414417);
    c = md5ff(c, d, a, b, words[i + 10] || 0, 17, -42063);
    b = md5ff(b, c, d, a, words[i + 11] || 0, 22, -1990404162);
    a = md5ff(a, b, c, d, words[i + 12] || 0, 7, 1804603682);
    d = md5ff(d, a, b, c, words[i + 13] || 0, 12, -40341101);
    c = md5ff(c, d, a, b, words[i + 14] || 0, 17, -1502002290);
    b = md5ff(b, c, d, a, words[i + 15] || 0, 22, 1236535329);

    a = md5gg(a, b, c, d, words[i + 1] || 0, 5, -165796510);
    d = md5gg(d, a, b, c, words[i + 6] || 0, 9, -1069501632);
    c = md5gg(c, d, a, b, words[i + 11] || 0, 14, 643717713);
    b = md5gg(b, c, d, a, words[i] || 0, 20, -373897302);
    a = md5gg(a, b, c, d, words[i + 5] || 0, 5, -701558691);
    d = md5gg(d, a, b, c, words[i + 10] || 0, 9, 38016083);
    c = md5gg(c, d, a, b, words[i + 15] || 0, 14, -660478335);
    b = md5gg(b, c, d, a, words[i + 4] || 0, 20, -405537848);
    a = md5gg(a, b, c, d, words[i + 9] || 0, 5, 568446438);
    d = md5gg(d, a, b, c, words[i + 14] || 0, 9, -1019803690);
    c = md5gg(c, d, a, b, words[i + 3] || 0, 14, -187363961);
    b = md5gg(b, c, d, a, words[i + 8] || 0, 20, 1163531501);
    a = md5gg(a, b, c, d, words[i + 13] || 0, 5, -1444681467);
    d = md5gg(d, a, b, c, words[i + 2] || 0, 9, -51403784);
    c = md5gg(c, d, a, b, words[i + 7] || 0, 14, 1735328473);
    b = md5gg(b, c, d, a, words[i + 12] || 0, 20, -1926607734);

    a = md5hh(a, b, c, d, words[i + 5] || 0, 4, -378558);
    d = md5hh(d, a, b, c, words[i + 8] || 0, 11, -2022574463);
    c = md5hh(c, d, a, b, words[i + 11] || 0, 16, 1839030562);
    b = md5hh(b, c, d, a, words[i + 14] || 0, 23, -35309556);
    a = md5hh(a, b, c, d, words[i + 1] || 0, 4, -1530992060);
    d = md5hh(d, a, b, c, words[i + 4] || 0, 11, 1272893353);
    c = md5hh(c, d, a, b, words[i + 7] || 0, 16, -155497632);
    b = md5hh(b, c, d, a, words[i + 10] || 0, 23, -1094730640);
    a = md5hh(a, b, c, d, words[i + 13] || 0, 4, 681279174);
    d = md5hh(d, a, b, c, words[i] || 0, 11, -358537222);
    c = md5hh(c, d, a, b, words[i + 3] || 0, 16, -722521979);
    b = md5hh(b, c, d, a, words[i + 6] || 0, 23, 76029189);
    a = md5hh(a, b, c, d, words[i + 9] || 0, 4, -640364487);
    d = md5hh(d, a, b, c, words[i + 12] || 0, 11, -421815835);
    c = md5hh(c, d, a, b, words[i + 15] || 0, 16, 530742520);
    b = md5hh(b, c, d, a, words[i + 2] || 0, 23, -995338651);

    a = md5ii(a, b, c, d, words[i] || 0, 6, -198630844);
    d = md5ii(d, a, b, c, words[i + 7] || 0, 10, 1126891415);
    c = md5ii(c, d, a, b, words[i + 14] || 0, 15, -1416354905);
    b = md5ii(b, c, d, a, words[i + 5] || 0, 21, -57434055);
    a = md5ii(a, b, c, d, words[i + 12] || 0, 6, 1700485571);
    d = md5ii(d, a, b, c, words[i + 3] || 0, 10, -1894986606);
    c = md5ii(c, d, a, b, words[i + 10] || 0, 15, -1051523);
    b = md5ii(b, c, d, a, words[i + 1] || 0, 21, -2054922799);
    a = md5ii(a, b, c, d, words[i + 8] || 0, 6, 1873313359);
    d = md5ii(d, a, b, c, words[i + 15] || 0, 10, -30611744);
    c = md5ii(c, d, a, b, words[i + 6] || 0, 15, -1560198380);
    b = md5ii(b, c, d, a, words[i + 13] || 0, 21, 1309151649);
    a = md5ii(a, b, c, d, words[i + 4] || 0, 6, -145523070);
    d = md5ii(d, a, b, c, words[i + 11] || 0, 10, -1120210379);
    c = md5ii(c, d, a, b, words[i + 2] || 0, 15, 718787259);
    b = md5ii(b, c, d, a, words[i + 9] || 0, 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const hexDigits = '0123456789abcdef';
  let out = '';
  const resultWords = [a, b, c, d];
  for (let i = 0; i < 4; i++) {
    const val = resultWords[i];
    for (let j = 0; j < 4; j++) {
      const byte = (val >>> (j * 8)) & 0xff;
      out += hexDigits.charAt((byte >>> 4) & 0x0f) + hexDigits.charAt(byte & 0x0f);
    }
  }
  return out;
}

// Pure JS CRC32 calculation
function crc32(input: Uint8Array): string {
  let crc = 0 ^ -1;
  for (let i = 0; i < input.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ input[i]) & 0xff];
  }
  return ((crc ^ -1) >>> 0).toString(16).padStart(8, '0');
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[i] = c;
}

export const HashGenerator: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState<string>('The quick brown fox jumps over the lazy dog');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileData, setFileData] = useState<Uint8Array | null>(null);

  // HMAC Secret Key
  const [hmacKey, setHmacKey] = useState<string>('');
  const [caseFormat, setCaseFormat] = useState<'lower' | 'upper' | 'base64'>('lower');
  const [expectedHash, setExpectedHash] = useState<string>('');

  // Computed hashes state
  const [hashes, setHashes] = useState<{
    sha256: string;
    sha512: string;
    sha384: string;
    sha1: string;
    md5: string;
    crc32: string;
    hmacSha256: string;
  }>({
    sha256: '',
    sha512: '',
    sha384: '',
    sha1: '',
    md5: '',
    crc32: '',
    hmacSha256: '',
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Convert ArrayBuffer to Hex or Base64 string
  const formatBuffer = (buffer: ArrayBuffer, format: 'lower' | 'upper' | 'base64'): string => {
    const bytes = new Uint8Array(buffer);
    if (format === 'base64') {
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return format === 'upper' ? hex.toUpperCase() : hex.toLowerCase();
  };

  // Re-compute hashes
  const computeAllHashes = async () => {
    setIsProcessing(true);
    try {
      let dataBytes: Uint8Array;
      if (inputMode === 'file' && fileData) {
        dataBytes = fileData;
      } else {
        dataBytes = new TextEncoder().encode(inputText);
      }

      // Native Web Crypto digests
      const [sha256Buf, sha512Buf, sha384Buf, sha1Buf] = await Promise.all([
        window.crypto.subtle.digest('SHA-256', dataBytes),
        window.crypto.subtle.digest('SHA-512', dataBytes),
        window.crypto.subtle.digest('SHA-384', dataBytes),
        window.crypto.subtle.digest('SHA-1', dataBytes),
      ]);

      const sha256Hex = formatBuffer(sha256Buf, caseFormat);
      const sha512Hex = formatBuffer(sha512Buf, caseFormat);
      const sha384Hex = formatBuffer(sha384Buf, caseFormat);
      const sha1Hex = formatBuffer(sha1Buf, caseFormat);

      // MD5 & CRC32
      const md5HexRaw = md5(dataBytes);
      const md5Hex =
        caseFormat === 'upper'
          ? md5HexRaw.toUpperCase()
          : caseFormat === 'base64'
          ? btoa(
              md5HexRaw
                .match(/.{1,2}/g)!
                .map((byte) => String.fromCharCode(parseInt(byte, 16)))
                .join('')
            )
          : md5HexRaw;

      const crc32Raw = crc32(dataBytes);
      const crc32Hex = caseFormat === 'upper' ? crc32Raw.toUpperCase() : crc32Raw;

      // HMAC SHA-256 if key provided
      let hmacResult = '';
      if (hmacKey) {
        const keyBytes = new TextEncoder().encode(hmacKey);
        const cryptoKey = await window.crypto.subtle.importKey(
          'raw',
          keyBytes,
          { name: 'HMAC', hash: { name: 'SHA-256' } },
          false,
          ['sign']
        );
        const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, dataBytes);
        hmacResult = formatBuffer(signature, caseFormat);
      }

      setHashes({
        sha256: sha256Hex,
        sha512: sha512Hex,
        sha384: sha384Hex,
        sha1: sha1Hex,
        md5: md5Hex,
        crc32: crc32Hex,
        hmacSha256: hmacResult,
      });
    } catch (err) {
      console.error('Hash calculation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    computeAllHashes();
  }, [inputText, fileData, inputMode, hmacKey, caseFormat]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setInputMode('file');

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result instanceof ArrayBuffer) {
        setFileData(new Uint8Array(evt.target.result));
        showToast(`Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'info');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCopy = async (text: string, keyName: string) => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(keyName);
      showToast(`Copied ${keyName} hash!`, 'success');
      setTimeout(() => setCopiedKey(null), 1500);
    }
  };

  const handleCopyAll = async () => {
    const summary = [
      `Input (${inputMode}): ${inputMode === 'file' ? fileName : inputText}`,
      `MD5:        ${hashes.md5}`,
      `SHA-1:      ${hashes.sha1}`,
      `SHA-256:    ${hashes.sha256}`,
      `SHA-384:    ${hashes.sha384}`,
      `SHA-512:    ${hashes.sha512}`,
      `CRC-32:     ${hashes.crc32}`,
      hashes.hmacSha256 ? `HMAC-SHA256: ${hashes.hmacSha256}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopiedKey('all');
      showToast('Copied all computed hashes!', 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Check if expected hash matches any of the computed hashes
  const cleanExpected = expectedHash.trim().toLowerCase();
  const matchedAlgorithm = cleanExpected
    ? Object.entries(hashes).find(
        ([_, val]) => typeof val === 'string' && val.toLowerCase() === cleanExpected
      )?.[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Input Mode Selector & Format Deck */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              inputMode === 'text'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> Text / String
          </button>
          <button
            onClick={() => setInputMode('file')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              inputMode === 'file'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> File Checksum
          </button>
        </div>

        {/* Output format switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Format:</span>
            <select
              value={caseFormat}
              onChange={(e) => setCaseFormat(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none"
            >
              <option value="lower">Hexadecimal (lowercase)</option>
              <option value="upper">Hexadecimal (UPPERCASE)</option>
              <option value="base64">Base64 String</option>
            </select>
          </div>

          <button
            onClick={handleCopyAll}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            {copiedKey === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === 'all' ? 'Copied All' : 'Copy All Hashes'}
          </button>
        </div>
      </div>

      {/* Input Data Section */}
      {inputMode === 'text' ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Plaintext Input String:
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {inputText.length} characters ({new TextEncoder().encode(inputText).length} bytes)
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste any text to hash..."
            rows={4}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              setFileName(file.name);
              setFileSize(file.size);
              const reader = new FileReader();
              reader.onload = (evt) => {
                if (evt.target?.result instanceof ArrayBuffer) {
                  setFileData(new Uint8Array(evt.target.result));
                  showToast(`Loaded ${file.name}`, 'info');
                }
              };
              reader.readAsArrayBuffer(file);
            }
          }}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-8 text-center bg-white dark:bg-slate-900 shadow-sm transition-all"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <FileCheck className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            {fileName ? fileName : 'Upload File to Compute Checksums'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {fileSize > 0
              ? `File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB (${fileSize.toLocaleString()} bytes)`
              : 'Drag and drop any binary, zip, installer, or document file. 100% computed in browser.'}
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <label className="cursor-pointer px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors inline-flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" /> Select File
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Optional HMAC & Checksum Verification Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HMAC Key */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            HMAC Secret Key (Optional):
          </label>
          <input
            type="text"
            value={hmacKey}
            onChange={(e) => setHmacKey(e.target.value)}
            placeholder="Enter secret key for HMAC computation..."
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Checksum Verifier */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              Verify Against Expected Checksum:
            </label>
            {cleanExpected && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  matchedAlgorithm
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {matchedAlgorithm ? `MATCH (${matchedAlgorithm.toUpperCase()})` : 'NO MATCH'}
              </span>
            )}
          </div>
          <input
            type="text"
            value={expectedHash}
            onChange={(e) => setExpectedHash(e.target.value)}
            placeholder="Paste expected SHA256, MD5, or SHA1 hash here..."
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Hash Results Grid */}
      <div className="space-y-3">
        {[
          {
            key: 'sha256',
            name: 'SHA-256',
            val: hashes.sha256,
            bits: '256 bits (32 bytes)',
            badge: 'Standard & Secure',
            badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
          },
          {
            key: 'sha512',
            name: 'SHA-512',
            val: hashes.sha512,
            bits: '512 bits (64 bytes)',
            badge: 'High Security',
            badgeColor: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300',
          },
          {
            key: 'sha384',
            name: 'SHA-384',
            val: hashes.sha384,
            bits: '384 bits (48 bytes)',
            badge: 'NSA Suite B',
            badgeColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
          },
          {
            key: 'sha1',
            name: 'SHA-1',
            val: hashes.sha1,
            bits: '160 bits (20 bytes)',
            badge: 'Legacy / Git',
            badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
          },
          {
            key: 'md5',
            name: 'MD5',
            val: hashes.md5,
            bits: '128 bits (16 bytes)',
            badge: 'Checksum Only',
            badgeColor: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
          },
          {
            key: 'crc32',
            name: 'CRC-32',
            val: hashes.crc32,
            bits: '32 bits (4 bytes)',
            badge: 'Error Detection',
            badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
          },
          ...(hmacKey
            ? [
                {
                  key: 'hmacSha256',
                  name: 'HMAC-SHA256',
                  val: hashes.hmacSha256,
                  bits: '256 bits (Keyed-Hash)',
                  badge: 'Authenticated',
                  badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
                },
              ]
            : []),
        ].map((algo) => {
          const isMatch = cleanExpected && algo.val && algo.val.toLowerCase() === cleanExpected;

          return (
            <div
              key={algo.key}
              className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                isMatch
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {algo.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${algo.badgeColor}`}>
                    {algo.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {algo.bits}
                  </span>
                </div>

                {isMatch && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Checksum Matches!
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 break-all select-all">
                  {algo.val || 'Calculating...'}
                </span>

                <button
                  onClick={() => handleCopy(algo.val, algo.name)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition-colors shrink-0"
                  title={`Copy ${algo.name}`}
                >
                  {copiedKey === algo.name ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy Guarantee */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong>100% In-Browser Cryptography:</strong> All hashes are computed locally via Web Crypto API. Files and plaintexts are never transmitted across the network or stored on any server.
        </span>
      </div>
    </div>
  );
};

export default HashGenerator;
