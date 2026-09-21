import React, { useState, useMemo } from 'react';
import { Calendar, Cake, Clock, Heart, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AgeCalculator: React.FC = () => {
  const [birthDate, setBirthDate] = useState<string>('1998-05-15');
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { showToast } = useToast();

  const ageData = useMemo(() => {
    if (!birthDate) return null;
    const start = new Date(birthDate);
    const end = asOfDate ? new Date(asOfDate) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return null;
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    // Day of week born
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const birthDayName = daysOfWeek[start.getDay()];

    // Next birthday countdown
    const currentYearBirthday = new Date(end.getFullYear(), start.getMonth(), start.getDate());
    let nextBday = currentYearBirthday;
    if (currentYearBirthday < end) {
      nextBday = new Date(end.getFullYear() + 1, start.getMonth(), start.getDate());
    }
    const daysToNextBday = Math.ceil((nextBday.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      totalSeconds,
      birthDayName,
      daysToNextBday,
    };
  }, [birthDate, asOfDate]);

  return (
    <div className="space-y-6">
      {/* Date Pickers */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Cake className="w-4 h-4 text-indigo-600" />
              Date of Birth
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Calculate Age As Of
            </label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-indigo-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Age Result Banner */}
      {ageData && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-lg text-center space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-100">Exact Chronological Age</span>
            <div className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {ageData.years} <span className="text-lg md:text-2xl font-normal opacity-90">Years</span> {ageData.months}{' '}
              <span className="text-lg md:text-2xl font-normal opacity-90">Months</span> {ageData.days}{' '}
              <span className="text-lg md:text-2xl font-normal opacity-90">Days</span>
            </div>
            <p className="text-xs md:text-sm text-indigo-100/90 pt-2">
              Born on a <strong>{ageData.birthDayName}</strong> • Next birthday in{' '}
              <strong>{ageData.daysToNextBday} days</strong> 🎂
            </p>
          </div>

          {/* Breakdown Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xs text-slate-500 font-medium">Total Weeks</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {ageData.totalWeeks.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xs text-slate-500 font-medium">Total Days</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {ageData.totalDays.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xs text-slate-500 font-medium">Total Hours</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {ageData.totalHours.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xs text-slate-500 font-medium">Total Minutes</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {ageData.totalMinutes.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-500 font-medium">Estimated Heartbeats</div>
              <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                ~{(ageData.totalMinutes * 72).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AgeCalculator;
