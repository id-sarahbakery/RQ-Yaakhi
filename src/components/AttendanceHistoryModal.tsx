/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HelpCircle,
  TrendingUp,
  Sliders,
  Sparkles,
  Info,
  Printer
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { Santri } from '../types';

interface AttendanceHistoryModalProps {
  santri: Santri | null;
  isOpen: boolean;
  onClose: () => void;
}

interface AttendanceRecord {
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  notes?: string;
}

export default function AttendanceHistoryModal({ santri, isOpen, onClose }: AttendanceHistoryModalProps) {
  const [currentMonth, setCurrentMonth] = useState<number>(4); // Default to May (0-indexed so 4 is May)
  const currentYear = 2026;
  const todayStr = '2026-05-28'; // Fixed application simulated date

  // Attendance database local state
  const [history, setHistory] = useState<Record<string, AttendanceRecord>>({});
  const [selectedDayToEdit, setSelectedDayToEdit] = useState<string | null>(null);

  // Month names for display
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Weekdays header
  const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  useEffect(() => {
    if (!santri) return;

    // Load from localStorage or generate deterministically
    const historyKey = `pesantren_attendance_history_${santri.id}`;
    const saved = localStorage.getItem(historyKey);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const generated = generateHistory(santri.id);
        const merged = { ...generated, ...parsed };
        setHistory(merged);
        localStorage.setItem(historyKey, JSON.stringify(merged));
      } catch (e) {
        console.error('Error parsing attendance history:', e);
        const generated = generateHistory(santri.id);
        setHistory(generated);
        localStorage.setItem(historyKey, JSON.stringify(generated));
      }
    } else {
      const generated = generateHistory(santri.id);
      setHistory(generated);
      localStorage.setItem(historyKey, JSON.stringify(generated));
    }
  }, [santri]);

  // Deterministic generator of attendance for Dec 2025 - May 2026
  const generateHistory = (studentId: string): Record<string, AttendanceRecord> => {
    const records: Record<string, AttendanceRecord> = {};
    
    // Generate dates from Dec 1, 2025 to May 31, 2026
    const start = new Date(2025, 11, 1); // Dec 1, 2025
    const end = new Date(2026, 4, 31); // May 31, 2026
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay(); // 0 = Sunday
      
      if (dayOfWeek === 0) {
        // Sundays are off-days (Libur)
        continue;
      }
      
      // Let's exclude today and future dates from default filled records (May 29th, 30th, 31st)
      if (dateStr > todayStr) {
        continue;
      }
      
      // Seed combined string to make deterministic hash
      let hash = 0;
      const combined = studentId + dateStr;
      for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      }
      const val = Math.abs(hash) % 100;
      
      // Distribution: ~86% Hadir, ~6% Izin, ~5% Sakit, ~3% Alpa
      let status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' = 'Hadir';
      let notes = 'Hadir mengikuti KBM tepat waktu';
      
      if (val >= 86 && val < 92) {
        status = 'Izin';
        notes = 'Izin keperluan pulang keluarga / syar\'i';
      } else if (val >= 92 && val < 97) {
        status = 'Sakit';
        notes = 'Sakit (dilampirkan surat dokter asrama)';
      } else if (val >= 97) {
        status = 'Alpa';
        notes = 'Tanpa keterangan (diperingatkan pengasuh)';
      }
      
      records[dateStr] = { status, notes };
    }
    
    return records;
  };

  if (!santri || !isOpen) return null;

  // Render variables
  // Check how many days in the selected month
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Get index of the first day of the month (0 = Sun, 1 = Mon ... 6 = Sat)
  const firstDayOfWeekIndex = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust to start on Monday (0 = Mon, ..., 6 = Sun)
  const startingEmptyCells = (firstDayOfWeekIndex + 6) % 7;

  // Navigation handlers
  const handlePrevMonth = () => {
    setSelectedDayToEdit(null);
    setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setSelectedDayToEdit(null);
    setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));
  };

  // Status updating handler
  const handleUpdateDayStatus = (dateStr: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa') => {
    const updatedHistory = {
      ...history,
      [dateStr]: {
        status,
        notes: `Diperbarui manual via kalender portal santri`
      }
    };
    setHistory(updatedHistory);
    
    const historyKey = `pesantren_attendance_history_${santri.id}`;
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    setSelectedDayToEdit(null);
  };

  // Statistics calculations (specifically for the last 30 days from 2026-05-28 going backwards)
  const calculateLast30DaysStats = () => {
    let totalClassDays = 0;
    let countHadir = 0;
    let countIzin = 0;
    let countSakit = 0;
    let countAlpa = 0;
    
    const start = new Date(currentYear, 4, 28); // May 28
    start.setDate(start.getDate() - 29); // 30 days ago
    
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      
      if (dayOfWeek === 0) {
        // Skip Sundays from stats since they represent school holiday
        continue;
      }
      
      totalClassDays++;
      const record = history[dateStr];
      if (record) {
        if (record.status === 'Hadir') countHadir++;
        else if (record.status === 'Izin') countIzin++;
        else if (record.status === 'Sakit') countSakit++;
        else if (record.status === 'Alpa') countAlpa++;
      } else {
        // Assume default "Hadir" for past class days if no record exists yet (unless it is future date)
        if (dateStr <= todayStr) {
          countHadir++;
        }
      }
    }
    
    const percentage = totalClassDays > 0 ? Math.round((countHadir / totalClassDays) * 100) : 100;
    
    return {
      totalClassDays,
      countHadir,
      countIzin,
      countSakit,
      countAlpa,
      percentage
    };
  };

  const stats = calculateLast30DaysStats();

  const calculate6MonthTrend = () => {
    const monthsToCalculate = [
      { year: 2025, monthIdx: 11, label: 'Des 25' },
      { year: 2026, monthIdx: 0, label: 'Jan 26' },
      { year: 2026, monthIdx: 1, label: 'Feb 26' },
      { year: 2026, monthIdx: 2, label: 'Mar 26' },
      { year: 2026, monthIdx: 3, label: 'Apr 26' },
      { year: 2026, monthIdx: 4, label: 'Mei 26' }
    ];

    return monthsToCalculate.map(({ year, monthIdx, label }) => {
      let totalClassDays = 0;
      let countHadir = 0;
      let countIzin = 0;
      let countSakit = 0;
      let countAlpa = 0;

      // Get total days in that specific month
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        // Build date string in local format YYYY-MM-DD
        const paddedDay = day.toString().padStart(2, '0');
        const paddedMonth = (monthIdx + 1).toString().padStart(2, '0');
        const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
        
        const d = new Date(year, monthIdx, day);
        // Skip Sundays
        if (d.getDay() === 0) continue;
        
        // Skip future dates
        if (dateStr > todayStr) continue;

        totalClassDays++;
        
        const record = history[dateStr];
        if (record) {
          if (record.status === 'Hadir') countHadir++;
          else if (record.status === 'Izin') countIzin++;
          else if (record.status === 'Sakit') countSakit++;
          else if (record.status === 'Alpa') countAlpa++;
        } else {
          // If no record exists yet, default to Hadir if in the past
          if (dateStr <= todayStr) {
            countHadir++;
          }
        }
      }

      const rate = totalClassDays > 0 ? Math.round((countHadir / totalClassDays) * 100) : 100;

      return {
        month: label,
        'Kehadiran (%)': rate,
        Hadir: countHadir,
        Izin: countIzin,
        Sakit: countSakit,
        Alpa: countAlpa,
        hadir: countHadir,
        total: totalClassDays
      };
    });
  };

  const trendData = calculate6MonthTrend();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto print:absolute print:bg-white print:p-0 print:overflow-visible">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border border-slate-300 rounded-sm w-full max-w-2xl shadow-2xl overflow-hidden text-left my-8 print:my-0 print:border-none print:shadow-none print:max-w-none"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-sm">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Riwayat Absensi Kehadiran</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">DETAIL DISIPLIN DAN STATISTIK 30 HARI TERAKHIR</p>
              </div>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="p-1 px-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-sm transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Cetak Riwayat Absensi"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Cetak</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 px-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-sm border border-slate-200 transition cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Student metadata widget card */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-sm gap-4 text-left">
              <div>
                <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm uppercase">Nama Mahasantri</span>
                <p className="text-sm font-black text-slate-900 mt-1 uppercase">{santri.name}</p>
                <p className="text-[10px] text-slate-500 font-mono font-medium mt-0.5">NIS: {santri.nis} • {santri.halaqahName} ({santri.gender})</p>
              </div>

              {/* 30 Days stats calculation display */}
              <div className="bg-white border border-slate-200 p-3 rounded-sm flex items-center gap-3 shadow-xs">
                <TrendingUp className="w-7 h-7 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">Kehadiran 30 Hari</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-black text-slate-800 font-mono">{stats.percentage}%</span>
                    <span className="text-[9.5px] font-bold text-emerald-600 font-mono">({stats.countHadir}/{stats.totalClassDays} ssn)</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block font-medium">Izin: {stats.countIzin} | Sakit: {stats.countSakit} | Alpa: {stats.countAlpa}</span>
                </div>
              </div>
            </div>

            {/* 6-Month Attendance Rate Trend Chart */}
            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                <div>
                  <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Tren Tingkat Kehadiran (6 Bulan Terakhir)</h5>
                  <p className="text-[9px] text-slate-400 font-mono">PERSENTASE KEHADIRAN AKTIF BULANAN — TARGET MINIMUM KELULUSAN 85%</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-sm uppercase">Analisis Retrospektif</span>
                </div>
              </div>
              
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 15, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#64748b" 
                      tickLine={false} 
                      axisLine={false}
                      style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }} 
                    />
                    <YAxis 
                      domain={[50, 100]} 
                      ticks={[50, 60, 70, 80, 90, 100]}
                      stroke="#64748b" 
                      tickLine={false}
                      axisLine={false}
                      style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }} 
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2 rounded-xs border border-slate-800 shadow-xl text-left scale-95 origin-top-left">
                              <p className="text-[10px] font-black font-mono border-b border-white/10 pb-0.5 mb-1 text-slate-300">{data.month}</p>
                              <p className="text-xs font-black text-emerald-400 font-mono">Kehadiran: {data['Kehadiran (%)']}%</p>
                              <p className="text-[9.5px] font-medium text-slate-300 font-mono">Hadir: {data.hadir} / {data.total} Sesi</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Kehadiran (%)" 
                      stroke="#4f46e5" 
                      strokeWidth={2.5} 
                      dot={{ r: 4, strokeWidth: 1.5, fill: "#ffffff", stroke: "#4f46e5" }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 6-Month Monthly Comparison Bar Chart */}
            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                <div>
                  <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Perbandingan Status Bulanan (6 Bulan Terakhir)</h5>
                  <p className="text-[9px] text-slate-400 font-mono">AKUMULASI STATUS HADIR, IZIN, SAKIT, DAN ALPA SETIAP BULAN</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-sm uppercase">Komposisi Absensi</span>
                </div>
              </div>
              
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 15, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#64748b" 
                      tickLine={false} 
                      axisLine={false}
                      style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }} 
                    />
                    <YAxis 
                      stroke="#64748b" 
                      tickLine={false}
                      axisLine={false}
                      style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }} 
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const monthData = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-xs border border-slate-800 shadow-xl text-left scale-95 origin-top-left space-y-1">
                              <p className="text-[10px] font-black font-mono border-b border-white/10 pb-1 mb-1 text-slate-300">
                                {monthData.month}
                              </p>
                              {payload.map((entry) => (
                                <p key={entry.name} className="text-[11px] font-bold font-mono flex items-center justify-between gap-4">
                                  <span style={{ color: entry.color }}>● {entry.name}:</span>
                                  <span className="text-white">{entry.value} Sesi</span>
                                </p>
                              ))}
                              <p className="text-[9.5px] text-slate-400 border-t border-white/10 pt-1 font-mono">
                                Total Hari Kelas: {monthData.total}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={28}
                      iconSize={8}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 'bold', paddingBottom: '4px' }}
                    />
                    <Bar dataKey="Hadir" name="Hadir" fill="#10b981" stackId="a" />
                    <Bar dataKey="Izin" name="Izin" fill="#3b82f6" stackId="a" />
                    <Bar dataKey="Sakit" name="Sakit" fill="#f59e0b" stackId="a" />
                    <Bar dataKey="Alpa" name="Alpa" fill="#ef4444" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Calendar panel */}
            <div className="space-y-4">
              {/* Calendar Month Header control */}
              <div className="flex items-center justify-between bg-slate-100/70 p-2.5 rounded-sm border border-slate-200/60">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 px-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-sm shadow-xs transition cursor-pointer flex items-center gap-1 text-[11px] print:hidden"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
                
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  {monthNames[currentMonth]} {currentYear}
                </h5>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 px-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-sm shadow-xs transition cursor-pointer flex items-center gap-1 text-[11px] print:hidden"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs">
                {/* Day of Week label row */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center">
                  {weekdays.map((day, idx) => (
                    <div 
                      key={day} 
                      className={`py-2 text-[10px] font-bold uppercase tracking-wider ${
                        idx === 6 ? 'text-rose-500' : 'text-slate-500'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grid cells */}
                <div className="grid grid-cols-7 divide-x divide-y divide-slate-150 bg-slate-100">
                  {/* Empty spacer cells */}
                  {Array.from({ length: startingEmptyCells }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="bg-slate-50/50 aspect-square py-2.5 px-3 min-h-[56px]" />
                  ))}

                  {/* Operational calendar cells */}
                  {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const paddedDay = dayNum.toString().padStart(2, '0');
                    const paddedMonth = (currentMonth + 1).toString().padStart(2, '0');
                    const cellDateStr = `${currentYear}-${paddedMonth}-${paddedDay}`;
                    
                    const dayOfWeek = new Date(currentYear, currentMonth, dayNum).getDay();
                    const isSunday = dayOfWeek === 0;
                    const isFuture = cellDateStr > todayStr;
                    const isToday = cellDateStr === todayStr;

                    let status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Libur' | 'MasaDepan' = 'Hadir';
                    let notes = '';

                    if (isFuture) {
                      status = 'MasaDepan';
                    } else if (isSunday) {
                      status = 'Libur';
                    } else {
                      const record = history[cellDateStr];
                      if (record) {
                        status = record.status;
                        notes = record.notes || '';
                      } else {
                        // Default fallback status for weekdays in the past
                        status = 'Hadir';
                        notes = 'Hadir KBM';
                      }
                    }

                    // Style configuration
                    let cellBg = 'bg-white hover:bg-slate-50';
                    let textStyle = 'text-slate-800 font-bold';
                    let dotColor = '';
                    let label = '';

                    switch (status) {
                      case 'Hadir':
                        cellBg = 'bg-emerald-50/70 hover:bg-emerald-100/50 text-emerald-950 border border-emerald-200/55';
                        textStyle = 'text-emerald-900 font-black';
                        dotColor = 'bg-emerald-500';
                        label = 'H';
                        break;
                      case 'Izin':
                        cellBg = 'bg-blue-50/70 hover:bg-blue-100/50 text-blue-950 border border-blue-200/55';
                        textStyle = 'text-blue-900 font-extrabold';
                        dotColor = 'bg-blue-500';
                        label = 'I';
                        break;
                      case 'Sakit':
                        cellBg = 'bg-amber-50/70 hover:bg-amber-100/50 text-amber-950 border border-amber-200/55';
                        textStyle = 'text-amber-900 font-extrabold';
                        dotColor = 'bg-amber-500';
                        label = 'S';
                        break;
                      case 'Alpa':
                        cellBg = 'bg-rose-50/80 hover:bg-rose-100/60 text-rose-950 border border-rose-200/55';
                        textStyle = 'text-rose-900 font-black';
                        dotColor = 'bg-rose-500';
                        label = 'A';
                        break;
                      case 'Libur':
                        cellBg = 'bg-slate-100 text-slate-400';
                        textStyle = 'text-rose-450 font-normal';
                        label = 'Libur';
                        break;
                      case 'MasaDepan':
                        cellBg = 'bg-white text-slate-300';
                        textStyle = 'text-slate-300 font-normal';
                        label = '-';
                        break;
                    }

                    const isEditable = !isFuture && !isSunday;

                    return (
                      <div 
                        key={`day-${dayNum}`}
                        onClick={() => {
                          if (isEditable) {
                            setSelectedDayToEdit(selectedDayToEdit === cellDateStr ? null : cellDateStr);
                          }
                        }}
                        className={`aspect-square p-1.5 flex flex-col justify-between text-left min-h-[64px] transition-all relative ${cellBg} ${
                          isEditable ? 'cursor-pointer select-none group' : ''
                        } ${isToday ? 'ring-2 ring-blue-600 ring-inset ring-offset-0' : ''}`}
                        title={isEditable ? `${cellDateStr}: Klik untuk koreksi status (${status})` : `${cellDateStr} (${status})`}
                      >
                        {/* Day indicator & editable badge */}
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-mono font-bold ${textStyle}`}>
                            {dayNum}
                          </span>
                          {isToday && (
                            <span className="text-[7.5px] font-extrabold bg-blue-600 text-white px-1 leading-none py-0.5 rounded-inner tracking-widest font-mono shrink-0 uppercase">Hari Ini</span>
                          )}
                        </div>

                        {/* Status visual tag or dot descriptor */}
                        <div className="flex items-center justify-between gap-1 mt-auto">
                          {status !== 'Libur' && status !== 'MasaDepan' ? (
                            <div className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                              <span className="text-[9px] font-black uppercase font-mono tracking-tight text-slate-650 opacity-90">
                                {status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[8px] uppercase tracking-wider font-semibold opacity-70">
                              {label}
                            </span>
                          )}

                          {isEditable && (
                            <span className="text-[8px] text-slate-450 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                              Koreksi
                            </span>
                          )}
                        </div>

                        {/* Overlay dropdown for status overriding */}
                        {selectedDayToEdit === cellDateStr && (
                          <div 
                            className="absolute left-1/2 bottom-full -translate-x-1/2 -mb-1 bg-slate-900 text-white p-2 rounded-xs shadow-2xl z-30 flex flex-col gap-1 min-w-[110px] animate-in fade-in duration-75"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-white/10 text-center font-mono">Set STATUS</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateDayStatus(cellDateStr, 'Hadir')}
                              className="text-[9.5px] font-extrabold py-0.5 px-1.5 rounded-xs hover:bg-emerald-600 cursor-pointer text-left transition-colors flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>HADIR</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateDayStatus(cellDateStr, 'Izin')}
                              className="text-[9.5px] font-extrabold py-0.5 px-1.5 rounded-xs hover:bg-blue-600 cursor-pointer text-left transition-colors flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              <span>IZIN</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateDayStatus(cellDateStr, 'Sakit')}
                              className="text-[9.5px] font-extrabold py-0.5 px-1.5 rounded-xs hover:bg-amber-600 cursor-pointer text-left transition-colors flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span>SAKIT</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateDayStatus(cellDateStr, 'Alpa')}
                              className="text-[9.5px] font-extrabold py-0.5 px-1.5 rounded-xs hover:bg-rose-600 cursor-pointer text-left transition-colors flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              <span>ALPA</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick interactive hints & Legend */}
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex gap-1.5 items-start">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[10.5px] text-slate-650 leading-relaxed font-medium">
                  <strong>Keterangan Kalender :</strong> Klik pada petak tanggal aktif di atas untuk mengoreksi status absensi (misalnya dari Alpa ke Hadir/Sakit). Perubahan akan memperbarui rasio persentase secara instan.
                </p>
              </div>

              {/* Legend List */}
              <div className="flex flex-wrap items-center gap-2.5 text-[9px] font-bold uppercase tracking-wider font-mono shrink-0">
                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Hadir</span>
                </span>
                <span className="flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-100 px-1.5 py-0.5 rounded-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Izin</span>
                </span>
                <span className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-100 px-1.5 py-0.5 rounded-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Sakit</span>
                </span>
                <span className="flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-100 px-1.5 py-0.5 rounded-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Alpa</span>
                </span>
              </div>
            </div>

          </div>

          {/* Modal Footer actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
            <span className="text-[9px] text-slate-400 font-mono font-bold uppercase">
              RUMAH TAHFIDZ AUTOMATED ATTENDANCE DIARY
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-950 text-white font-bold text-xs rounded-sm shadow-sm transition-colors cursor-pointer"
            >
              Tutup Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
