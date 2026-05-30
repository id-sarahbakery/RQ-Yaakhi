/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Trash,
  Award,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Mic,
  Sliders,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { TahsinSession, Santri, Ustadz } from '../types';

interface TahsinViewProps {
  santriList: Santri[];
  ustadzList: Ustadz[];
  tahsinList: TahsinSession[];
  onAddTahsin: (session: Omit<TahsinSession, 'id'>) => void;
  onDeleteTahsin: (id: string) => void;
}

export default function TahsinView({
  santriList,
  ustadzList,
  tahsinList,
  onAddTahsin,
  onDeleteTahsin
}: TahsinViewProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHalaqah, setSelectedHalaqah] = useState('Semua');
  const [selectedScoreTier, setSelectedScoreTier] = useState('Semua');

  // Input state
  const [selectedSantriId, setSelectedSantriId] = useState(santriList[0]?.id || '');
  const [selectedUstadzId, setSelectedUstadzId] = useState(ustadzList[0]?.id || '');
  const [surah, setSurah] = useState('Al-Fatihah');
  const [verseRange, setVerseRange] = useState('1-7');
  const [makhrajScore, setMakhrajScore] = useState(90);
  const [tajwidScore, setTajwidScore] = useState(90);
  const [fluencyScore, setFluencyScore] = useState(90);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = santriList.find(s => s.id === selectedSantriId);
    const ustadz = ustadzList.find(u => u.id === selectedUstadzId);
    if (!student || !ustadz) return;

    onAddTahsin({
      santriId: student.id,
      santriName: student.name,
      halaqahName: student.halaqahName,
      ustadzName: ustadz.name,
      date: date || new Date().toISOString().split('T')[0],
      surah,
      verseRange,
      makhrajScore: Number(makhrajScore),
      tajwidScore: Number(tajwidScore),
      fluencyScore: Number(fluencyScore),
      notes: notes || undefined
    });

    setSuccessMessage(`Hasil Tahsin ${student.name} berhasil dicatatkan!`);
    setTimeout(() => setSuccessMessage(null), 4000);

    // Reset inputs
    setNotes('');
    setVerseRange('');
  };

  // Unique halaqah options for filter
  const halaqahOptions = Array.from(new Set(santriList.map(s => s.halaqahName)));

  // Filter tahsin list
  const filteredSessions = tahsinList.filter(s => {
    const matchesSearch = s.santriName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.surah.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHalaqah = selectedHalaqah === 'Semua' || s.halaqahName === selectedHalaqah;
    
    // Average score calculation
    const avg = Math.round((s.makhrajScore + s.tajwidScore + s.fluencyScore) / 3);
    let matchesTier = true;
    if (selectedScoreTier === 'Istimewa') {
      matchesTier = avg >= 90;
    } else if (selectedScoreTier === 'Bagus') {
      matchesTier = avg >= 80 && avg < 90;
    } else if (selectedScoreTier === 'Cukup') {
      matchesTier = avg >= 70 && avg < 80;
    } else if (selectedScoreTier === 'Butuh Bimbingan') {
      matchesTier = avg < 70;
    }

    return matchesSearch && matchesHalaqah && matchesTier;
  });

  // Analytics helper metrics
  const totalSesi = filteredSessions.length;
  const avgMakhraj = totalSesi > 0 ? Math.round(filteredSessions.reduce((acc, c) => acc + c.makhrajScore, 0) / totalSesi) : 0;
  const avgTajwid = totalSesi > 0 ? Math.round(filteredSessions.reduce((acc, c) => acc + c.tajwidScore, 0) / totalSesi) : 0;
  const avgFluency = totalSesi > 0 ? Math.round(filteredSessions.reduce((acc, c) => acc + c.fluencyScore, 0) / totalSesi) : 0;
  
  // Total Average
  const totalAvg = totalSesi > 0 ? Math.round((avgMakhraj + avgTajwid + avgFluency) / 3) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h2 id="tahsin-page-title" className="text-xl font-black text-slate-900 uppercase tracking-tight">Klinik Tahsin & Evaluasi Tartil</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">SISTEM DIAGNOSTIK PRESTASI MAKHARIJUL HURUF, TAJWID & HUKUM WAQAF MANDIRI</p>
        </div>
      </div>

      {successMessage && (
        <div id="tahsin-success-banner" className="p-4 bg-emerald-50 text-emerald-800 rounded-sm flex items-center gap-3 border border-emerald-200 text-left animate-in slide-in-from-top-4 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-tight">{successMessage}</span>
        </div>
      )}

      {/* 2. Responsive Analytics Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        
        {/* Card 1: Makharij Block */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nilai Rata-rata Makhraj</p>
            <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{avgMakhraj}</p>
            <span className="text-[10px] text-slate-500 block">Titik artikulasi huruf / lisan</span>
          </div>
        </div>

        {/* Card 2: Tajweed law */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nilai Rata-rata Tajwid</p>
            <p className="text-2xl font-black text-blue-600 font-mono mt-0.5">{avgTajwid}</p>
            <span className="text-[10px] text-slate-400 block font-sans">Ketepatan hukum bacaan</span>
          </div>
        </div>

        {/* Card 3: Fluency and tartil speed */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nilai Rata-rata Tartil</p>
            <p className="text-2xl font-black text-emerald-600 font-mono mt-0.5">{avgFluency}</p>
            <span className="text-[10px] text-slate-500 block">Tempo & Kelancaran nafas</span>
          </div>
        </div>

        {/* Card 4: Evaluation average composite */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-purple-50 text-purple-605 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Composite Score</p>
            <p className="text-2xl font-black text-purple-600 font-mono mt-0.5">{totalAvg}</p>
            <span className="text-[10px] text-slate-500 block">Ujian Kelulusan Tartil Al-Qur'an</span>
          </div>
        </div>
      </div>

      {/* 3. Panel layout: Form vs Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Diagnostik Evaluasi Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 border border-purple-100 rounded-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Formulir Penilaian Tartil</h3>
              <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">DETAIL EVALUASI INDIVIDUAL</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-6 font-medium">Beri ulasan teknis makhraj, tajwid, dan kelancaran untuk menetapkan kriteria kelulusan mahasantri.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Student list */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Identitas Mahasantri</label>
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

            {/* Mentor Ustadz list */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pembimbing Evaluasi</label>
              <select
                value={selectedUstadzId}
                onChange={(e) => setSelectedUstadzId(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-707 text-slate-700 font-bold border border-slate-200 rounded-sm px-3 py-2.5 focus:bg-white focus:outline-none"
              >
                {ustadzList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Surah / Verse range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bahan Surah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Al-Baqarah"
                  value={surah}
                  onChange={(e) => setSurah(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rentang Ayat</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1-15"
                  value={verseRange}
                  onChange={(e) => setVerseRange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Three detailed sliding criteria */}
            <div className="space-y-3.5 bg-slate-50 p-4 rounded-sm border border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono block border-b border-slate-200 pb-1">
                Kriteria Rincian Skor (0 - 100)
              </p>

              {/* Slider 1: Makharijul Huruf */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>1. Makharijul Huruf (Kejelasan Sifat)</span>
                  <span className="font-mono text-purple-650 text-purple-600 font-extrabold">{makhrajScore} / 100</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={makhrajScore}
                  onChange={(e) => setMakhrajScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Slider 2: Hukum Tajwid */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>2. Kaidah Hukum Tajwid</span>
                  <span className="font-mono text-purple-600 font-extrabold">{tajwidScore} / 100</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={tajwidScore}
                  onChange={(e) => setTajwidScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Slider 3: Fluency & Tartil Speed */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>3. Kelancaran & Adab Tartil</span>
                  <span className="font-mono text-purple-600 font-extrabold">{fluencyScore} / 100</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={fluencyScore}
                  onChange={(e) => setFluencyScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">TANGGAL PENILAIAN</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Improvement notes */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan Bimbingan / Rekomendasi Terapi Lisan</label>
              <textarea
                placeholder="Contoh: Perlu latihan peregangan rahang untuk huruf-huruf tebal (istila' seperti Shad, Dhod, Tha). Dengung qolqolah kubro di akhir ayat sudah mantap."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* Action submit button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-purple-650 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-sm border border-purple-700 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Simpan Hasil Tahsin</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Log Registry & Search Stream (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1 uppercase tracking-tight">Log Evaluasi Tahsin</h3>
              <p className="text-xs text-slate-500 font-medium font-sans">Daftar rekam pengamatan tilawah tartil dan perbaikan waqaf-ibtidaiyah.</p>
            </div>

            {/* Interactive searching options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Search text */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama / surah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 font-medium text-[11px] placeholder-slate-400 pl-8 pr-2 py-2 border border-slate-200 rounded-sm focus:outline-none focus:bg-white focus:border-purple-500"
                />
              </div>

              {/* Halaqah filter */}
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

              {/* Composite score tier filter */}
              <div>
                <select
                  value={selectedScoreTier}
                  onChange={(e) => setSelectedScoreTier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2 py-2 text-[11px] font-bold text-slate-600 focus:outline-none"
                >
                  <option value="Semua">Semua Predikat</option>
                  <option value="Istimewa">Istimewa (Avg &ge; 90)</option>
                  <option value="Bagus">Bagus (Avg 80 - 89)</option>
                  <option value="Cukup">Cukup (Avg 70 - 79)</option>
                  <option value="Butuh Bimbingan">Butuh Terapi (Avg &lt; 70)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[460px] custom-scrollbar space-y-3 pr-2 flex-1 mt-4">
            {filteredSessions.length === 0 ? (
              <div className="p-12 text-center rounded-sm border border-dashed border-slate-200">
                <Mic className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tidak ada record tahsin yang cocok</p>
                <p className="text-[11px] text-slate-400 mt-1">Gunakan kata kunci pencarian alternatif atau simpan record baru.</p>
              </div>
            ) : (
              filteredSessions.map((tahsin) => {
                const combinedAvg = Math.round((tahsin.makhrajScore + tahsin.tajwidScore + tahsin.fluencyScore) / 3);
                
                const tierColor = 
                  combinedAvg >= 90 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                  combinedAvg >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  combinedAvg >= 70 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-rose-50 text-rose-700 border-rose-200';

                const predikat = 
                  combinedAvg >= 90 ? 'Istimewa' :
                  combinedAvg >= 80 ? 'Bagus' :
                  combinedAvg >= 70 ? 'Cukup' :
                  'Butuh Terapi';

                return (
                  <div
                    key={tahsin.id}
                    className="p-4 bg-slate-50 rounded-sm border border-slate-200 hover:border-slate-300 transition flex flex-col md:flex-row md:items-start justify-between gap-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 sm:p-2.5 rounded-sm bg-white border border-slate-250 shrink-0 flex items-center justify-center font-bold font-mono text-sm text-purple-600">
                        {tahsin.santriName.charAt(0)}
                      </div>
                      <div className="min-w-0 pr-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {tahsin.santriName}
                          </h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs border shrink-0 ${tierColor}`}>
                            {predikat}
                          </span>
                        </div>
                        <span className="text-[9.5px]/none text-slate-400 font-bold block mt-1.5 font-mono">
                          {tahsin.halaqahName} • PEMBINA: {tahsin.ustadzName}
                        </span>

                        {/* Surah / Verse detail block */}
                        <div className="mt-3 text-xs flex gap-3 text-slate-600">
                          <div>
                            <span className="text-slate-400 font-bold">Surah: </span>
                            <span className="font-extrabold text-slate-905 text-slate-900 bg-white border border-slate-200 px-1.5 py-0.5 rounded-sm font-mono">{tahsin.surah}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold">Ayat: </span>
                            <span className="font-bold text-slate-700 font-mono">{tahsin.verseRange}</span>
                          </div>
                        </div>

                        {/* Scores grid bar details */}
                        <div className="grid grid-cols-3 gap-2 mt-3.5 bg-white p-2 rounded-sm border border-slate-150 text-[10px] text-slate-500 font-medium">
                          <div>
                            <span className="block text-slate-400 uppercase tracking-wider text-[8px] font-bold">Makhraj</span>
                            <span className="font-bold text-slate-800 font-mono">{tahsin.makhrajScore} / 100</span>
                          </div>
                          <div>
                            <span className="block text-slate-400 uppercase tracking-wider text-[8px] font-bold">Tajweed</span>
                            <span className="font-bold text-slate-800 font-mono">{tahsin.tajwidScore} / 100</span>
                          </div>
                          <div>
                            <span className="block text-slate-400 uppercase tracking-wider text-[8px] font-bold">Fluency</span>
                            <span className="font-bold text-slate-800 font-mono">{tahsin.fluencyScore} / 100</span>
                          </div>
                        </div>

                        {tahsin.notes && (
                          <div className="text-[10.5px]/relaxed text-slate-500 italic bg-white p-2.5 border border-slate-200 rounded-sm mt-3.5">
                            "{tahsin.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-200 pt-3 md:pt-0 gap-3">
                      <div className="text-left md:text-right">
                        <div className="flex items-center gap-1 text-[9.5px]/none text-slate-400 font-bold uppercase font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{tahsin.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rata2:</span>
                          <span className="text-xs font-black bg-purple-55 bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-0.5 rounded-xs font-mono">
                            {combinedAvg}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Yakin ingin menghapus rekaman evaluasi tahsin ini?')) {
                            onDeleteTahsin(tahsin.id);
                          }
                        }}
                        className="p-1 px-1.5 text-slate-350 hover:text-red-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-sm transition cursor-pointer"
                        title="Hapus Sesi Tahsin"
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
