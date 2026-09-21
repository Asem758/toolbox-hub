import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Server,
  Zap,
  Info,
  Lock,
  KeyRound,
  FileText,
} from 'lucide-react';
import { copyToClipboard } from '../../lib/utils';

// Top common leaked/weak passwords for client-side matching
const COMMON_PASSWORDS = new Set([
  '123456', 'password', '123456789', '12345678', '12345', '111111', '1234567',
  'sunshine', 'qwerty', 'iloveyou', 'princess', 'admin', 'welcome', '666666',
  'football', 'monkey', 'charlie', 'donald', 'master', 'dragon', 'baseball',
  '123123', 'starwars', 'killer', 'trustno1', 'shadow', 'hunter', 'secret',
  'superman', 'michael', 'jordan', 'matrix', 'batman', 'harley', 'password1',
  'pass1234', 'default', 'root', 'login', 'access', 'qwert123', 'letmein',
  'p@ssword', 'p@ssw0rd', 'admin123', 'root123', 'test123', 'master123',
]);

const SEQUENTIAL_PATTERNS = [
  '123456', '234567', '345678', '456789', '567890',
  'abcdef', 'bcdefg', 'cdefgh', 'defghi', 'efghij',
  'qwerty', 'asdfgh', 'zxcvbn', 'wertyu', 'sdfghj', 'xcvbnm',
];

export const PasswordStrengthChecker: React.FC = () => {
  const { showToast } = useToast();
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Analyze password characteristics
  const analysis = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        entropy: 0,
        poolSize: 0,
        label: 'Enter a Password',
        colorClass: 'bg-slate-300 dark:bg-slate-700',
        textColorClass: 'text-slate-500',
        borderColor: 'border-slate-200 dark:border-slate-800',
        crackTimes: {
          onlineSlow: '0 seconds',
          onlineFast: '0 seconds',
          gpuCluster: '0 seconds',
          supercomputer: '0 seconds',
        },
        checks: {
          length8: false,
          length12: false,
          length16: false,
          hasLower: false,
          hasUpper: false,
          hasNumber: false,
          hasSymbol: false,
          noCommon: true,
          noSequences: true,
          noRepetition: true,
        },
        suggestions: ['Enter a password above to evaluate its cryptographic strength and crack resistance.'],
      };
    }

    const len = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);

    let poolSize = 0;
    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasNumber) poolSize += 10;
    if (hasSymbol) poolSize += 33;

    // Check for common leaked passwords
    const lowerPwd = password.toLowerCase();
    const isCommon = COMMON_PASSWORDS.has(lowerPwd);

    // Check for sequential patterns
    const hasSequences = SEQUENTIAL_PATTERNS.some((pattern) => lowerPwd.includes(pattern));

    // Check for repeated characters (e.g. aaaa, 1111)
    const hasRepetition = /(.)\1{2,}/.test(password);

    // Raw entropy in bits: L * log2(poolSize)
    let entropy = poolSize > 0 ? len * Math.log2(poolSize) : 0;

    // Penalties for weaknesses
    if (isCommon) entropy = Math.min(entropy, 15);
    if (hasSequences) entropy = Math.max(0, entropy - 18);
    if (hasRepetition) entropy = Math.max(0, entropy - 12);
    if (len < 8) entropy = Math.min(entropy, 25);

    // Calculate 0 - 100 Score
    let score = Math.min(100, Math.round((entropy / 80) * 100));
    if (isCommon) score = Math.min(score, 10);

    let label = 'Very Weak';
    let colorClass = 'bg-rose-500';
    let textColorClass = 'text-rose-600 dark:text-rose-400';
    let borderColor = 'border-rose-300 dark:border-rose-800';

    if (score >= 85) {
      label = 'Very Strong / Unbreakable';
      colorClass = 'bg-emerald-500';
      textColorClass = 'text-emerald-600 dark:text-emerald-400';
      borderColor = 'border-emerald-300 dark:border-emerald-800';
    } else if (score >= 65) {
      label = 'Strong';
      colorClass = 'bg-teal-500';
      textColorClass = 'text-teal-600 dark:text-teal-400';
      borderColor = 'border-teal-300 dark:border-teal-800';
    } else if (score >= 45) {
      label = 'Fair';
      colorClass = 'bg-amber-500';
      textColorClass = 'text-amber-600 dark:text-amber-400';
      borderColor = 'border-amber-300 dark:border-amber-800';
    } else if (score >= 25) {
      label = 'Weak';
      colorClass = 'bg-orange-500';
      textColorClass = 'text-orange-600 dark:text-orange-400';
      borderColor = 'border-orange-300 dark:border-orange-800';
    }

    // Crack time estimations (total combinations / guesses per second)
    const combinations = Math.pow(poolSize || 1, len);

    const formatTime = (seconds: number): string => {
      if (!isFinite(seconds) || seconds > 1e18) return 'Millions of centuries';
      if (seconds < 0.001) return 'Instantly (< 1ms)';
      if (seconds < 1) return 'Instantly (< 1s)';
      if (seconds < 60) return `${Math.round(seconds)} seconds`;
      const minutes = seconds / 60;
      if (minutes < 60) return `${Math.round(minutes)} minutes`;
      const hours = minutes / 60;
      if (hours < 24) return `${Math.round(hours)} hours`;
      const days = hours / 24;
      if (days < 365) return `${Math.round(days)} days`;
      const years = days / 365;
      if (years < 100) return `${Math.round(years)} years`;
      if (years < 10000) return `${Math.round(years).toLocaleString()} years`;
      if (years < 1e6) return `${(years / 1000).toFixed(1)} thousand years`;
      if (years < 1e9) return `${(years / 1e6).toFixed(1)} million years`;
      if (years < 1e12) return `${(years / 1e9).toFixed(1)} billion years`;
      return 'Trillions of years';
    };

    const crackTimes = {
      // 100 guesses/sec (Online web login with rate limiter)
      onlineSlow: isCommon ? 'Instantly' : formatTime(combinations / 100),
      // 10,000 guesses/sec (Fast unthrottled API brute-force)
      onlineFast: isCommon ? 'Instantly' : formatTime(combinations / 10000),
      // 100 Billion guesses/sec (Offline high-end GPU cluster running Hashcat / MD5 / NTLM)
      gpuCluster: isCommon ? 'Instantly' : formatTime(combinations / 1e11),
      // 100 Trillion guesses/sec (Supercomputer / State-level farm)
      supercomputer: isCommon ? 'Instantly' : formatTime(combinations / 1e14),
    };

    // Suggestions array
    const suggestions: string[] = [];
    if (isCommon) {
      suggestions.push('⚠️ This password appears in common data breach wordlists. Avoid using it anywhere.');
    }
    if (len < 12) {
      suggestions.push(`Add ${12 - len} more characters to reach the recommended 12+ character minimum.`);
    }
    if (!hasUpper) {
      suggestions.push('Include uppercase letters (A-Z) to expand character permutations.');
    }
    if (!hasLower) {
      suggestions.push('Include lowercase letters (a-z).');
    }
    if (!hasNumber) {
      suggestions.push('Add numeric digits (0-9).');
    }
    if (!hasSymbol) {
      suggestions.push('Add special characters or symbols (!@#$%^&*).');
    }
    if (hasSequences) {
      suggestions.push('Remove sequential sequences like "12345" or "qwerty".');
    }
    if (hasRepetition) {
      suggestions.push('Avoid repeating identical characters in a row (e.g. "aaa").');
    }
    if (suggestions.length === 0) {
      suggestions.push('Excellent password strength! It provides outstanding entropy and resistance against brute-force attacks.');
    }

    return {
      score,
      entropy: Math.round(entropy * 10) / 10,
      poolSize,
      label,
      colorClass,
      textColorClass,
      borderColor,
      crackTimes,
      checks: {
        length8: len >= 8,
        length12: len >= 12,
        length16: len >= 16,
        hasLower,
        hasUpper,
        hasNumber,
        hasSymbol,
        noCommon: !isCommon,
        noSequences: !hasSequences,
        noRepetition: !hasRepetition,
      },
      suggestions,
    };
  }, [password]);

  // Generate strong random password
  const generateStrongPassword = () => {
    const charset = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*()_+~|}{[]:;?><';
    let res = '';
    const array = new Uint32Array(16);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 16; i++) {
      res += charset[array[i] % charset.length];
    }
    setPassword(res);
    showToast('Generated high-entropy secure password!', 'success');
  };

  const handleCopy = async () => {
    if (!password) return;
    const ok = await copyToClipboard(password);
    if (ok) {
      setCopied(true);
      showToast('Password copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Password Input Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            Enter or Paste Password to Test:
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type your password here..."
              className="w-full pl-4 pr-32 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-base outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {password && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                  title="Copy password"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick action helper buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={generateStrongPassword}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-900/40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Sample Strong Password
            </button>
            {password && (
              <button
                onClick={() => setPassword('')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Length: <strong>{password.length}</strong> chars</span>
            <span>·</span>
            <span>Entropy: <strong>{analysis.entropy}</strong> bits</span>
          </div>
        </div>

        {/* Real-time Strength Meter */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Strength Level:
              </span>
              <span className={`text-sm font-extrabold ${analysis.textColorClass}`}>
                {analysis.label}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {analysis.score} / 100
            </span>
          </div>

          {/* 5-step segmented progress bar */}
          <div className="grid grid-cols-5 gap-1.5 h-2.5">
            {[1, 2, 3, 4, 5].map((seg) => {
              const segThreshold = seg * 20;
              const isActive = analysis.score >= segThreshold - 15;
              return (
                <div
                  key={seg}
                  className={`rounded-full transition-all duration-300 ${
                    isActive ? analysis.colorClass : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Estimated Brute-Force Crack Times */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Estimated Brute-Force Crack Time
          </h4>
          <span className="text-xs text-slate-400">Based on entropy & hardware speeds</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Online rate limited */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Server className="w-3.5 h-3.5 text-blue-500" /> Web Login
              </span>
              <span>100/sec</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              {analysis.crackTimes.onlineSlow}
            </p>
            <p className="text-[11px] text-slate-400">Online rate-limited attack</p>
          </div>

          {/* Fast API */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Fast API
              </span>
              <span>10k/sec</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              {analysis.crackTimes.onlineFast}
            </p>
            <p className="text-[11px] text-slate-400">Unthrottled endpoint</p>
          </div>

          {/* GPU Cluster */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Cpu className="w-3.5 h-3.5 text-rose-500" /> GPU Farm
              </span>
              <span>100B/sec</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              {analysis.crackTimes.gpuCluster}
            </p>
            <p className="text-[11px] text-slate-400">Multi-RTX 4090 hash cluster</p>
          </div>

          {/* Supercomputer */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Shield className="w-3.5 h-3.5 text-purple-500" /> Supercomputer
              </span>
              <span>100T/sec</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              {analysis.crackTimes.supercomputer}
            </p>
            <p className="text-[11px] text-slate-400">Massive enterprise grid</p>
          </div>
        </div>
      </div>

      {/* Security Criteria Breakdown & Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checklist */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Security Checklist & Standards
          </h4>

          <div className="space-y-2.5">
            {[
              { label: 'At least 8 characters (NIST baseline)', valid: analysis.checks.length8 },
              { label: 'At least 12+ characters (Recommended)', valid: analysis.checks.length12 },
              { label: 'At least 16+ characters (High security)', valid: analysis.checks.length16 },
              { label: 'Includes lowercase letters (a-z)', valid: analysis.checks.hasLower },
              { label: 'Includes uppercase letters (A-Z)', valid: analysis.checks.hasUpper },
              { label: 'Includes numeric digits (0-9)', valid: analysis.checks.hasNumber },
              { label: 'Includes special symbols (!@#$...)', valid: analysis.checks.hasSymbol },
              { label: 'Not in top common breach dictionary', valid: analysis.checks.noCommon },
              { label: 'No sequential patterns (qwerty, 12345)', valid: analysis.checks.noSequences },
              { label: 'No repetitive character clusters', valid: analysis.checks.noRepetition },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                <span className={item.valid ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400'}>
                  {item.label}
                </span>
                {item.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions & Advice */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              Recommendations & Analysis
            </h4>

            <div className="space-y-2">
              {analysis.suggestions.map((sug, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2"
                >
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Seal */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>100% Client-Side Privacy:</strong> Your password is never sent to any server or API. All evaluations run strictly in your browser memory.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthChecker;
