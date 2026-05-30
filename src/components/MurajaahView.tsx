/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  Plus, 
  Trash, 
  Award, 
  Calendar, 
  ChevronRight, 
  User, 
  Filter, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Smile, 
  Grid 
} from 'lucide-react';
import { MurajaahSession, Santri, Ustadz } from '../types';

interface MurajaahViewProps {
  santriList: Santri[];
  ustadzList: Ustadz[];
  murajaahList: MurajaahSession[];
  onAddMurajaah: (session: Omit<MurajaahSession, 'id'>) => void;
  onDeleteMurajaah: (id: string) => void;
}

export default function MurajaahView({
  santriList,
  ustadzList,
  murajaahList,
  onAddMurajaah,
  onDeleteMurajaah
}: MurajaahViewProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHalaqah, setSelectedHalaqah] = useState('Semua');
  const [selectedSmoothness, setSelectedSmoothness] = useState('Semua');

  // Input states
  const [selectedSantriId, setSelectedSantriId] = useState(santriList[0]?.id || '');
  const [selectedUstadzId, setSelectedUstadzId] = useState(ustadzList[0]?.id || '');
  const [surah, setSurah] = useState('Al-Mulk');
  const [verseRange, setVerseRange] = useState('1-30');
  const [smoothness, setSmoothness] = useState<MurajaahSession['smoothness']>('Mutqin (Sangat Lancar)');
  const [score, setScore] = useState(90);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = santriList.find(s => s.id === selectedSantriId);
    const ustadz = ustadzList.find(u => u.id === selectedUstadzId);
    if (!student || !ustadz) return;

    onAddMurajaah({
      santriId: student.id,
      santriName: student.name,
      halaqahName: student.halaqahName,
      ustadzName: ustadz.name,
      date: date || new Date().toISOString().split('T')[0],
      surah,
      verseRange,
      smoothness,
      score: Number(score),
      notes: notes || undefined
    });

    setSuccessMessage(`Sesi Murajaah ${student.name} (${surah} ${verseRange}) berhasil dicatat!`);
    setTimeout(() => setSuccessMessage(null), 4000);

    // Reset some inputs
    setNotes('');
    setVerseRange('');
    setScore(90);
  };

  // List of unique Halagah options
  const halaqahOptions = Array.from(new Set(santriList.map(s => s.halaqahName)));

  // Filtered List
  const filteredSessions = murajaahList.filter(session => {
    const matchesSearch = session.santriName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          session.surah.toLowerCase().includes(searchQuery.toLowerCase());
    
    // find student to check actual current selected halaqah
    const studentObj = santriList.find(s => s.id === session.santriId);
    const matchesHalaqah = selectedHalaqah === 'Semua' || (studentObj && studentObj.halaqahName === selectedHalaqah) || session.halaqahName === selectedHalaqah;
    const matchesSmoothness = selectedSmoothness === 'Semua' || session.smoothness === selectedSmoothness;

    return matchesSearch && matchesHalaqah && matchesSmoothness;
  });

  // Aggregated Stats
  const totalSessions = filteredSessions.length;
  const averageScore = totalSessions > 0 
    ? Math.round(filteredSessions.reduce((acc, curr) => acc + curr.score, 0) / totalSessions) 
    : 0;

  const mutqinCount = filteredSessions.filter(s => s.smoothness.startsWith('Mutqin')).length;
  const mutqinPercentage = totalSessions > 0 ? Math.round((mutqinCount / totalSessions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Analytics Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h2 id="murajaah-page-title" className="text-xl font-black text-slate-900 uppercase tracking-tight">Pusat Murajaah & Peninjauan Hafalan</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">LOG EVALUASI & VERIFIKASI RETENSI REVISI SURAH SEBAGAIRAHMATAN LIL ALAMIN</p>
        </div>
      </div>

      {successMessage && (
        <div id="murajaah-success-banner" className="p-4 bg-emerald-50 text-emerald-800 rounded-sm flex items-center gap-3 border border-emerald-200 text-left animate-in slide-in-from-top-4 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-tight">{successMessage}</span>
        </div>
      )}

      {/* 2. Standard Statistics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        {/* Card 1: Total Recorded */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Aktivitas Murajaah</p>
            <p className="text-2xl font-black text-slate-950 font-mono mt-0.5">{totalSessions}</p>
            <span className="text-[10px] text-slate-500 block">Sesi Terdaftar Seluruhnya</span>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nilai Rata-rata</p>
            <p className="text-2xl font-black text-emerald-600 font-mono mt-0.5">{averageScore}</p>
            <span className="text-[10px] text-slate-500 block">Predisposisi Mutu Hafalan</span>
          </div>
        </div>

        {/* Card 3: Mutqin Percentage */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Tingkat Mutqin</p>
            <p className="text-2xl font-black text-indigo-600 font-mono mt-0.5">{mutqinPercentage}%</p>
            <span className="text-[10px] text-slate-500 block">Sangat Lancar / Kokoh</span>
          </div>
        </div>

        {/* Card 4: Need Review */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Perlu di-Ulang</p>
            <p className="text-2xl font-black text-rose-600 font-mono mt-0.5">
              {filteredSessions.filter(s => s.smoothness.startsWith('Kurang')).length}
            </p>
            <span className="text-[10px] text-slate-500 block font-medium">Sesi Belum Lancar</span>
          </div>
        </div>
      </div>

      {/* 3. Forms & Grid Entries Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Interactive Input Form (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-sm">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Catat Evaluasi Murajaah</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-medium">Input hasil ujian periodik atau murajaah harian untuk memperkuat retensi hafalan di depan Ustadz pembimbing.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Santri</label>
              <select
                value={selectedSantriId}
                onChange={(e) => setSelectedSantriId(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-700 font-bold border border-slate-200 rounded-sm px-3 py-2.5 focus:bg-white focus:outline-none"
              >
                {santriList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.nis} - {st.halaqahName})
                  </option>
                ))}
              </select>
            </div>

            {/* Mentor selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Musyrif Penguji</label>
              <select
                value={selectedUstadzId}
                onChange={(e) => setSelectedUstadzId(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-705 text-slate-700 font-bold border border-slate-200 rounded-sm px-3 py-2.5 focus:bg-white focus:outline-none"
              >
                {ustadzList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Surah and verses range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Surah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Al-Baqarah"
                  value={surah}
                  onChange={(e) => setSurah(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rentang Ayat / Juz</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1-20 atau Juz 30"
                  value={verseRange}
                  onChange={(e) => setVerseRange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quality categories */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tingkat Kelancaran</label>
                <select
                  value={smoothness}
                  onChange={(e) => setSmoothness(e.target.value as any)}
                  className="w-full bg-slate-50 text-xs border border-slate-200 rounded-sm px-2.5 py-2 focus:bg-white focus:outline-none focus:border-blue-500 font-bold text-slate-700"
                >
                  <option value="Mutqin (Sangat Lancar)">Mutqin (Sangat Lancar)</option>
                  <option value="Lancar">Lancar</option>
                  <option value="Cukup">Cukup</option>
                  <option value="Kurang (Perlu Ulang)">Kurang (Perlu Ulang)</option>
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nilai Murajaah (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Date */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">TANGGAL SESI</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Catatan tambahan */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan Evaluasi / Rekomendasi Mentor</label>
              <textarea
                placeholder="Contoh: Sangat baik. Bacaan terdengar merdu, waqaf sudah sesuai. Harap ulangi sesekali secara mandiri."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-sm border border-blue-700 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simpan Rekaman Murajaah</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Search Registry Stream (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1 uppercase tracking-tight">Riwayat Evaluasi Murajaah</h3>
              <p className="text-xs text-slate-500 font-medium">Log bimbingan evaluasi kesempurnaan hafalan yang telah dievaluasi berkala.</p>
            </div>

            {/* Quick Interactive Filtering Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Search text */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari santri / surah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 text-[11px] placeholder-slate-400 pl-7 pr-2 py-2 border border-slate-200 rounded-sm focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
                />
              </div>

              {/* Halaqah dropdown */}
              <div>
                <select
                  value={selectedHalaqah}
                  onChange={(e) => setSelectedHalaqah(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2 py-2 text-[11px] font-bold text-slate-600 focus:outline-none"
                >
                  <option value="Semua">Semua Halaqah</option>
                  {halaqahOptions.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Smoothness dropdown */}
              <div>
                <select
                  value={selectedSmoothness}
                  onChange={(e) => setSelectedSmoothness(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2 py-2 text-[11px] font-bold text-slate-600 focus:outline-none"
                >
                  <option value="Semua">Semua Kelancaran</option>
                  <option value="Mutqin (Sangat Lancar)">Mutqin</option>
                  <option value="Lancar">Lancar</option>
                  <option value="Cukup">Cukup</option>
                  <option value="Kurang (Perlu Ulang)">Perlu Ulang</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[460px] custom-scrollbar space-y-3 pr-2 flex-1 mt-4">
            {filteredSessions.length === 0 ? (
              <div className="p-12 text-center rounded-sm border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tidak ada sesi murajaah yang cocok</p>
                <p className="text-[11px] text-slate-400 mt-1">Gunakan kata kunci pencarian lain atau buat rekaman baru di formulir sebelah kiri.</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const smoothnessColor = 
                  session.smoothness.startsWith('Mutqin') ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                  session.smoothness === 'Lancar' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  session.smoothness === 'Cukup' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  'bg-rose-50 border-rose-200 text-rose-700';

                return (
                  <div
                    key={session.id}
                    className="p-4 bg-slate-50 rounded-sm border border-slate-200 hover:border-slate-300 transition flex flex-col md:flex-row md:items-start justify-between gap-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 sm:p-2.5 rounded-sm bg-white border border-slate-250 shrink-0 flex items-center justify-center font-bold font-mono text-sm text-indigo-600">
                        {session.santriName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {session.santriName}
                          </h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs border shrink-0 ${smoothnessColor}`}>
                            {session.smoothness.split(' ')[0]}
                          </span>
                        </div>
                        <span className="text-[9.5px]/none text-slate-400 font-bold block mt-1.5 font-mono">
                          {session.halaqahName} • PEMBINA: {session.ustadzName}
                        </span>
                        
                        <div className="mt-3 text-xs">
                          <span className="text-slate-400 font-bold">Surah: </span>
                          <span className="font-extrabold text-slate-900 bg-white border border-slate-200/60 px-1.5 py-0.5 rounded-sm font-mono">{session.surah}</span>
                          <span className="text-slate-400 font-bold ml-1.5">Ayat/Juz: </span> 
                          <span className="font-bold text-slate-700 font-mono">{session.verseRange}</span>
                        </div>

                        {session.notes && (
                          <div className="text-[10.5px] leading-relaxed text-slate-500 italic bg-white p-2 border border-slate-200 rounded-sm mt-3.5">
                            "{session.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-200 pt-3 md:pt-0 gap-3">
                      <div className="text-left md:text-right">
                        <div className="flex items-center gap-1 text-[9.5px] text-slate-400 font-bold uppercase font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Nilas:</span>
                          <span className="text-xs font-black bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-xs font-mono">
                            {session.score}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Yakin ingin menghapus rekaman murajaah ini?')) {
                            onDeleteMurajaah(session.id);
                          }
                        }}
                        className="p-1 px-1.5 text-slate-350 hover:text-red-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-sm transition cursor-pointer"
                        title="Hapus Sesi Murajaah"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
