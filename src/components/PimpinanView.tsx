/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle,
  Search,
  Filter,
  Users,
  Grid,
  Calendar,
  Layers,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Printer,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { Santri, Halaqah, Transaction, Activity, Ustadz } from '../types';

interface PimpinanViewProps {
  santriList: Santri[];
  halaqahList: Halaqah[];
  ustadzList: Ustadz[];
  transactionList: Transaction[];
  activities: Activity[];
}

export default function PimpinanView({
  santriList,
  halaqahList,
  ustadzList,
  transactionList,
  activities
}: PimpinanViewProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Deterministic generator fallback for santri attendance history matching system logic
  const generateDeterministicHistory = (studentId: string): Record<string, { status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' }> => {
    const records: Record<string, { status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' }> = {};
    const currentYear = 2026;
    const todayStr = '2026-05-28';
    
    // Generate dates from April 1, 2026 to May 31, 2026
    const start = new Date(currentYear, 3, 1); // April 1
    const end = new Date(currentYear, 4, 31); // May 31
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay(); // 0 = Sunday
      
      if (dayOfWeek === 0) {
        continue;
      }
      
      if (dateStr > todayStr) {
        continue;
      }
      
      let hash = 0;
      const combined = studentId + dateStr;
      for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      }
      const val = Math.abs(hash) % 100;
      
      let status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' = 'Hadir';
      
      if (val >= 86 && val < 92) {
        status = 'Izin';
      } else if (val >= 92 && val < 97) {
        status = 'Sakit';
      } else if (val >= 97) {
        status = 'Alpa';
      }
      
      records[dateStr] = { status };
    }
    
    return records;
  };

  // Compile overall statistics across all available attendance history in the database
  let totalHadir = 0;
  let totalIzin = 0;
  let totalSakit = 0;
  let totalAlpa = 0;

  santriList.forEach(s => {
    const historyKey = `pesantren_attendance_history_${s.id}`;
    let history: Record<string, { status: string }> = {};
    const saved = localStorage.getItem(historyKey);
    if (saved) {
      try {
        history = JSON.parse(saved);
      } catch {
        history = generateDeterministicHistory(s.id);
      }
    } else {
      history = generateDeterministicHistory(s.id);
    }
    
    Object.values(history).forEach(record => {
      if (record.status === 'Hadir') totalHadir++;
      else if (record.status === 'Izin') totalIzin++;
      else if (record.status === 'Sakit') totalSakit++;
      else if (record.status === 'Alpa') totalAlpa++;
    });
  });

  const grandTotalAttendance = totalHadir + totalIzin + totalSakit + totalAlpa;
  const overallAttendanceRate = grandTotalAttendance > 0 
    ? Math.round((totalHadir / grandTotalAttendance) * 100) 
    : 100;

  const attendancePieData = [
    { name: 'Hadir', value: totalHadir, color: '#10b981' },
    { name: 'Izin', value: totalIzin, color: '#3b82f6' },
    { name: 'Sakit', value: totalSakit, color: '#f59e0b' },
    { name: 'Alpa', value: totalAlpa, color: '#ef4444' }
  ];
  
  // Simulated approvals for reports
  const [signedReports, setSignedReports] = useState<Record<string, { signed: boolean; date?: string }>>({
    'rep-03': { signed: true, date: '2026-03-31' },
    'rep-04': { signed: true, date: '2026-04-30' },
  });

  const handleSignReport = (id: string, name: string) => {
    const today = new Date().toISOString().split('T')[0];
    setSignedReports(prev => ({
      ...prev,
      [id]: { signed: true, date: today }
    }));
    setSuccessMsg(`Laporan bulanan ${name} berhasil disetujui & ditandatangani secara elektronik.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDownloadReport = (name: string) => {
    setSuccessMsg(`Mengunduh PDF Laporan ${name}... Selesai.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // 1. Financial totals
  const incomeTotal = transactionList
    .filter(t => t.type === 'Pemasukan')
    .reduce((acc, c) => acc + c.amount, 0);

  const expenseTotal = transactionList
    .filter(t => t.type === 'Pengeluaran')
    .reduce((acc, c) => acc + c.amount, 0);

  const netSavings = incomeTotal - expenseTotal;

  // SPP stats
  const lunasCount = santriList.filter(s => s.sppStatus === 'Lunas').length;
  const menunggakCount = santriList.filter(s => s.sppStatus === 'Menunggak').length;
  const totalSppSantri = santriList.length;
  const sppRatio = totalSppSantri > 0 ? Math.round((lunasCount / totalSppSantri) * 100) : 0;

  // 2. Halaqah Performance Compilation
  const halaqahPerformances = halaqahList.map(h => {
    const members = santriList.filter(s => s.halaqahId === h.id || s.halaqahName === h.name);
    const avgScore = members.length > 0
      ? Math.round(members.reduce((acc, m) => acc + m.averageScore, 0) / members.length)
      : 85;

    const totalPages = members.reduce((acc, m) => acc + m.memorizedPages, 0);
    const averagePages = members.length > 0 
      ? Math.round(totalPages / members.length) 
      : 0;

    return {
      ...h,
      avgScore,
      totalPages,
      averagePages,
      studentCount: members.length
    };
  }).sort((a, b) => b.avgScore - a.avgScore); // Rank by score

  // Reports
  const reportTemplates = [
    { id: 'rep-05', name: 'Laporan Progres Tahfidz & Keuangan - Mei 2026', period: 'Mei 2026', author: 'Super Admin', status: 'Draft Menunggu TTD' },
    { id: 'rep-04', name: 'Laporan Progres Tahfidz & Keuangan - April 2026', period: 'April 2026', author: 'Super Admin', status: 'Disetujui & TTD' },
    { id: 'rep-03', name: 'Laporan Progres Tahfidz & Keuangan - Maret 2026', period: 'Maret 2026', author: 'Super Admin', status: 'Disetujui & TTD' },
  ];

  // Activities search
  const filteredActivities = activities.filter(act => 
    act.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="pimpinan-page-title" className="text-xl font-black text-slate-900 uppercase tracking-tight">Dashboard Pimpinan & Laporan</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">EVALUASI STRATEGIS, REKAPITULASI PROGRAM KERJA, DAN OTORISASI BULANAN PESANTREN</p>
        </div>
        <button
          onClick={() => {
            window.print();
          }}
          className="px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 bg-white shadow-xs rounded-sm text-xs font-bold font-mono transition inline-flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-400" />
          <span>CETAK LAPORAN UTAMA</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-8o text-indigo-800 rounded-sm flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-150">
          <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-tight">{successMsg}</span>
        </div>
      )}

      {/* Financial Health Snapshot Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Income Total */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Pemasukan Bulanan (Mei)</span>
              <p className="text-[22px] font-black font-mono text-slate-900 mt-1">
                Rp {incomeTotal.toLocaleString('id-ID')}
              </p>
            </div>
            <span className="p-1 px-1.5 bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 rounded-xs text-[9.5px]/none flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Shatter Log</span>
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Rerata Iuran SPP:</span>
            <span className="font-bold text-slate-700">{sppRatio}% Lunas SPP</span>
          </div>
        </div>

        {/* Expenses total */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Pengeluaran Bulanan (Mei)</span>
              <p className="text-[22px] font-black font-mono text-slate-900 mt-1">
                Rp {expenseTotal.toLocaleString('id-ID')}
              </p>
            </div>
            <span className="p-1 px-1.5 bg-rose-50 text-rose-600 font-bold border border-rose-100 rounded-xs text-[9.5px]/none flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Gaji & Operas</span>
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Komitmen Gaji Ustadz:</span>
            <span className="font-extrabold text-rose-600">Terbuku Lancar</span>
          </div>
        </div>

        {/* Net Cash Flow balance */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm bg-gradient-to-br from-indigo-50/20 to-slate-50/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Arus Kas Bersih (Saldo)</span>
              <p className={`text-[22px] font-black font-mono mt-1 ${netSavings >= 0 ? 'text-indigo-650 text-indigo-750 text-indigo-600' : 'text-rose-600'}`}>
                Rp {netSavings.toLocaleString('id-ID')}
              </p>
            </div>
            <span className="p-1 px-1.5 bg-indigo-50 text-indigo-650 text-indigo-600 font-bold border border-indigo-100 rounded-xs text-[9.5px]/none flex items-center gap-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Surplus</span>
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Tunggakan SPP Santri:</span>
            <span className="font-bold text-amber-600 font-mono">{menunggakCount} Santri</span>
          </div>
        </div>

      </div>

      {/* Main interactive grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Reports & Approvals Block (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Monthly Report approval queue */}
          <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-sm">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Otorisasi Laporan Bulanan</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-medium">Otorisasi dan tanda tangani file rekapitulasi data akademik dan finansial untuk diajukan ke dewan pembina yayasan.</p>

            <div className="space-y-3.5">
              {reportTemplates.map((rep) => {
                const isSigned = signedReports[rep.id]?.signed;
                const signDate = signedReports[rep.id]?.date;

                return (
                  <div key={rep.id} className="p-4 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-left">
                      <h4 className="text-[12.5px] font-extrabold text-slate-900 leading-snug">{rep.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold font-mono uppercase mt-1">
                        PENULIS: {rep.author} • PERIODE: {rep.period}
                      </p>
                      
                      {isSigned ? (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 rounded-xs px-2 py-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>DISETUJUI PIMPINAN (TTD: {signDate})</span>
                        </div>
                      ) : (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-black text-amber-750 bg-amber-50 border border-amber-200 rounded-xs px-2 py-0.5 text-amber-700">
                          <span>MENUNGGU PERSETUJUAN PIMPINAN</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadReport(rep.name)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-sm shadow-xs transition cursor-pointer"
                        title="Unduh PDF Laporan"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {!isSigned && (
                        <button
                          onClick={() => handleSignReport(rep.id, rep.name)}
                          className="p-1 px-3.5 bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white font-extrabold text-[11px] rounded-sm shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>TTD LAPORAN</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Halaqah Performance comparisons */}
          <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm table-container">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-sm">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Kinerja Berdasarkan Halaqah</h3>
                <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">PERBANDINGAN MUTU AKADEMIK TERPILIH</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-medium">Peringkat halaqah berdasarkan rata-rata makhraj/setoran dan kuantitas halaman teruji saat evaluasi.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-[11.5px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono text-[9.5px]/none uppercase text-left">
                    <th className="pb-2.5 font-bold">Nama Halaqah</th>
                    <th className="pb-2.5 font-bold text-center">Mentor</th>
                    <th className="pb-2.5 font-bold text-center">Santri</th>
                    <th className="pb-2.5 font-bold text-center">Rerata Skor</th>
                    <th className="pb-2.5 font-bold text-right">Rerata Hlm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {halaqahPerformances.map((hp) => (
                    <tr key={hp.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 font-extrabold text-slate-905 text-slate-950 text-left">{hp.name}</td>
                      <td className="py-3 text-slate-550 text-slate-500 text-center font-medium">{hp.mentor}</td>
                      <td className="py-3 text-slate-500 font-bold font-mono text-center">{hp.studentCount} Santri</td>
                      <td className="py-3 text-center">
                        <span className={`p-0.5 px-2 rounded-xs border font-bold font-mono ${
                          hp.avgScore >= 90 ? 'bg-indigo-50 border-indigo-150 text-indigo-700' :
                          hp.avgScore >= 80 ? 'bg-emerald-50 border-emerald-150 text-emerald-700' :
                          'bg-amber-50 border-amber-150 text-amber-700'
                        }`}>
                          {hp.avgScore}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-700 font-mono">{hp.averagePages} Hlm / Santri</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Kolom Kanan (5 Kolom): PieChart dan Audit Trail */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Card PieChart Kehadiran */}
          <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800 rounded-sm">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Rasio Kehadiran Santri</h3>
                <p className="text-[10px] text-slate-400 font-bold font-mono mt-0.5">ANALISIS DISIPLIN INTERAKTIF</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">Wawasan akumulatif kehadiran harian santri (Hadir, Izin, Sakit, Alpa) yang disinkronkan secara real-time.</p>

            <div className="relative h-44 my-2 flex items-center justify-center">
              {/* Center Absolute Label with Circle stats matching dashboard style */}
              <div className="absolute text-center">
                <span className="text-lg font-black text-slate-800 dark:text-white leading-none block font-mono">{overallAttendanceRate}%</span>
                <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block">Tingkat Hadir</span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} Sesi`, 'Kategori']} 
                    contentStyle={{ borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Color Indicators Legend block */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-[10px] font-bold text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              {attendancePieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between min-w-0 bg-slate-50 dark:bg-slate-800/45 p-1.5 px-2.5 border border-slate-150 dark:border-slate-800 rounded-sm">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-white font-black ml-1 shrink-0">{item.value.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log / Stream */}
          <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm flex flex-col justify-between flex-1">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 text-white rounded-sm">
                  <Users className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Console Audit Trail (Aktivitas)</h3>
                  <p className="text-[10px] text-slate-400 font-bold font-mono mt-0.5">SISTEM MONITOR DEWAN PEMBINA</p>
                </div>
              </div>
              
              <p className="text-xs text-slate-500">Log real-time semua pendaftaran santri, setoran hafalan, mutasi keuangan harian pengelola.</p>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari aktivitas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 text-[11px] placeholder-slate-400 pl-8 pr-2 py-2 border border-slate-200 rounded-sm focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[300px] custom-scrollbar space-y-3 mt-4 pr-1 flex-1">
              {filteredActivities.length === 0 ? (
                <div className="p-12 text-center rounded-sm border border-dashed border-slate-150 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Tidak ada aktivitas yang sesuai
                </div>
              ) : (
                  filteredActivities.map((act) => {
                    let badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
                    if (act.category === 'Setoran') badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                    if (act.category === 'Keuangan') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    if (act.category === 'Absen') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';

                    return (
                      <div key={act.id} className="p-3 bg-slate-50 hover:bg-slate-100/40 border border-slate-200 rounded-sm text-[11px] text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[8.5px] font-black border uppercase tracking-wider px-1.5 py-0.5 rounded-xs ${badgeColor}`}>
                            {act.category}
                          </span>
                          <span className="text-[9.5px]/none text-slate-400 font-bold font-mono uppercase">{act.timeAgo}</span>
                        </div>
                        <p className="text-slate-805 text-slate-800 font-semibold mt-2 leading-relaxed">
                          {act.message}
                        </p>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
