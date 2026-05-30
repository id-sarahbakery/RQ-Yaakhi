/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClipboardCheck, Sparkles, Plus, Smile, BookOpen, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Setoran, Santri, SetoranType } from '../types';

interface SetoranViewProps {
  setoranList: Setoran[];
  santriList: Santri[];
  onAddSetoran: (setoran: Omit<Setoran, 'id'>) => void;
  onQuickSuccessMessage?: string;
}

export default function SetoranView({
  setoranList,
  santriList,
  onAddSetoran
}: SetoranViewProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [selectedSantriId, setSelectedSantriId] = useState(santriList[0]?.id || '');
  const [setoranType, setSetoranType] = useState<SetoranType>('Hafalan Baru');
  const [surahName, setSurahName] = useState('Al-Baqarah');
  const [verseRange, setVerseRange] = useState('1-10');
  const [pageCount, setPageCount] = useState(2);
  const [score, setScore] = useState(90);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = santriList.find(s => s.id === selectedSantriId);
    if (!student) return;

    onAddSetoran({
      santriId: student.id,
      santriName: student.name,
      halaqahName: student.halaqahName,
      date: new Date().toISOString().split('T')[0], // Today's date
      type: setoranType,
      surah: surahName,
      verseRange: verseRange,
      pageCount: Number(pageCount),
      score: Number(score),
      notes: notes || undefined
    });

    setSuccessMessage(`Setoran ${setoranType} ${student.name} (${surahName} ${verseRange}) berhasil dicatatkan!`);
    setTimeout(() => setSuccessMessage(null), 4000);

    // Reset inputs
    setNotes('');
    setVerseRange('');
    setPageCount(2);
    setScore(90);
  };

  return (
    <div className="space-y-6">
      {/* Success banner alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-sm flex items-center gap-3 border border-emerald-200 text-left animate-in slide-in-from-top-4 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold font-sans uppercase tracking-tight">{successMessage}</span>
        </div>
      )}

      {/* Grid container layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Create Entry Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-sm">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Rekam Setoran Hafalan Harian</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-medium">Input rekam hafalan baru (Ziyadah) atau murajaah peninjauan ulang yang disetorkan di depan Ustadz pembina</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Santri Pelapor</label>
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

            {/* Selector list: Hafalan Baru vs Murajaah */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori Setoran</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setSetoranType('Hafalan Baru')}
                  className={`py-2 px-3 text-xs font-bold rounded-sm border transition-all cursor-pointer ${
                    setoranType === 'Hafalan Baru'
                      ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Hafalan Baru (Ziyadah)
                </button>
                <button
                  type="button"
                  onClick={() => setSetoranType('Murajaah')}
                  className={`py-2 px-3 text-xs font-bold rounded-sm border transition-all cursor-pointer ${
                    setoranType === 'Murajaah'
                      ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Murajaah
                </button>
              </div>
            </div>

            {/* Surah and verses range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Surah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Al-Baqarah"
                  value={surahName}
                  onChange={(e) => setSurahName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rentang Ayat</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 15-20"
                  value={verseRange}
                  onChange={(e) => setVerseRange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Count of pages and core grading */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jumlah Halaman</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={pageCount}
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nilai Mentor (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Custom Notes / Remarks feedback */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan Tambahan / Evaluasi Tajwid</label>
              <textarea
                placeholder="Contoh: Ada sedikit makhraj yang perlu disempurnakan di ayat 16."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-sm border border-blue-700 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simpan Setoran Hafalan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Log Registry of Submissions (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1 uppercase tracking-tight">Daftar Setoran Terbaru</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">Log aktivitas riwayat setoran hafalan harian yang telah terverifikasi</p>
          </div>

          <div className="overflow-y-auto max-h-[500px] custom-scrollbar space-y-3 pr-2 flex-1">
            {setoranList.map((setoran) => (
              <div
                key={setoran.id}
                className="p-3.5 bg-slate-50 rounded-sm border border-slate-200 hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-sm border shrink-0 ${
                    setoran.type === 'Hafalan Baru' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  }`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {setoran.santriName}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">
                      {setoran.halaqahName}
                    </span>
                    <p className="text-[11px] text-slate-700 font-medium mt-2">
                      {setoran.type}: <span className="text-slate-900 font-bold">{setoran.surah}</span> (Ayat {setoran.verseRange})
                    </p>
                    {setoran.notes && (
                      <p className="text-[10px] text-slate-500 italic bg-white p-2 rounded-sm border border-slate-200 mt-2">
                        "{setoran.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-200 pt-2.5 md:pt-0 gap-2">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Volume</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">{setoran.pageCount} Halaman</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Nilai:</span>
                    <span className="text-xs font-bold bg-blue-50 text-[#0060df] px-2.5 py-1 border border-blue-200 rounded-sm font-mono">
                      {setoran.score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
