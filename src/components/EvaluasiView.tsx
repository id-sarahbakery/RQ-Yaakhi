/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Filter,
  GraduationCap,
  Plus,
  Search,
  Sparkles,
  Trash,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  CheckCircle
} from 'lucide-react';
import { Santri, Ustadz } from '../types';

interface ExamRecord {
  id: string;
  santriId: string;
  santriName: string;
  halaqahName: string;
  examType: string;
  juzType: string;
  score: number;
  status: 'Lulus (Sangat Baik)' | 'Lulus (Cukup)' | 'Mengulang';
  testerName: string;
  date: string;
  notes?: string;
}

interface EvaluasiViewProps {
  santriList: Santri[];
  ustadzList: Ustadz[];
  onAddActivity: (msg: string, cat: 'Setoran' | 'Absen' | 'Keuangan' | 'Sistem') => void;
}

export default function EvaluasiView({
  santriList,
  ustadzList,
  onAddActivity
}: EvaluasiViewProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load local exam records
  const [exams, setExams] = useState<ExamRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_exams');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default mock exam records
    return [
      {
        id: 'ex_1',
        santriId: 's1',
        santriName: 'Ahmad Zaky',
        halaqahName: 'Halaqah Ikhwan A',
        examType: "Tasmi' Sekali Duduk (1 Juz)",
        juzType: 'Juz 30',
        score: 96,
        status: 'Lulus (Sangat Baik)',
        testerName: 'Ust. Muhammad F.',
        date: '2026-05-24',
        notes: 'Sangat mengalir lisan, tajwid istimewa'
      },
      {
        id: 'ex_2',
        santriId: 's3',
        santriName: 'Aisyah Humaira',
        halaqahName: 'Halaqah Akhwat A',
        examType: 'Ujian Akhir Semester',
        juzType: 'Juz 29',
        score: 88,
        status: 'Lulus (Cukup)',
        testerName: 'Ustzh. Aisyah',
        date: '2026-05-22',
        notes: 'Ada sedikit catatan di surah Al-Mursalat'
      },
      {
        id: 'ex_3',
        santriId: 's6',
        santriName: 'Fajar Nugraha',
        halaqahName: 'Halaqah Ikhwan B',
        examType: 'Ujian Naik Juz',
        juzType: 'Juz 30',
        score: 65,
        status: 'Mengulang',
        testerName: 'Ust. Abdullah',
        date: '2026-05-20',
        notes: 'Butuh murajaah intensif bagian tengah Juz Amma'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('pesantren_exams', JSON.stringify(exams));
  }, [exams]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHalaqah, setSelectedHalaqah] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Input states for form
  const [selectedSantriId, setSelectedSantriId] = useState(santriList[0]?.id || '');
  const [selectedTesterId, setSelectedTesterId] = useState(ustadzList[0]?.id || '');
  const [examType, setExamType] = useState("Tasmi' Sekali Duduk (1 Juz)");
  const [juzType, setJuzType] = useState('Juz 30');
  const [score, setScore] = useState(90);
  const [status, setStatus] = useState<'Lulus (Sangat Baik)' | 'Lulus (Cukup)' | 'Mengulang'>('Lulus (Sangat Baik)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Handle addition of Exam Record
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = santriList.find(s => s.id === selectedSantriId);
    const tester = ustadzList.find(u => u.id === selectedTesterId);
    if (!student || !tester) return;

    const newRecord: ExamRecord = {
      id: `ex_${Date.now()}`,
      santriId: student.id,
      santriName: student.name,
      halaqahName: student.halaqahName,
      examType,
      juzType,
      score: Number(score),
      status,
      testerName: tester.name,
      date,
      notes: notes || undefined
    };

    setExams(prev => [newRecord, ...prev]);
    onAddActivity(`Sertifikasi/Ujian: ${student.name} menempuh ${examType} (${juzType}) dgn Nilai ${score}`, 'Sistem');

    setSuccessMessage(`Hasil ujian ${student.name} untuk ${examType} berhasil disimpan!`);
    setTimeout(() => setSuccessMessage(null), 4000);

    // Reset fields
    setNotes('');
    setScore(90);
  };

  const handleDeleteExam = (id: string) => {
    const record = exams.find(ex => ex.id === id);
    if (!record) return;
    setExams(prev => prev.filter(ex => ex.id !== id));
    onAddActivity(`Ujian ${record.santriName} (${record.examType}) dihapus`, 'Sistem');
  };

  // Aggregated calculations
  const totalExams = exams.length;
  const passedCount = exams.filter(ex => ex.status.startsWith('Lulus')).length;
  const passRate = totalExams > 0 ? Math.round((passedCount / totalExams) * 100) : 0;
  const averageExamScore = totalExams > 0 ? Math.round(exams.reduce((acc, c) => acc + c.score, 0) / totalExams) : 0;

  // Vulnerable Santri detection (averageScore < 80 OR monthlyAchievedPages < monthlyTargetPages * 0.5)
  const vulnerableSantri = santriList.filter(s => s.averageScore < 80 || s.monthlyAchievedPages < (s.monthlyTargetPages * 0.4));

  // Filter exams
  const filteredExams = exams.filter(record => {
    const matchesSearch = record.santriName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.examType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.juzType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHalaqah = selectedHalaqah === 'Semua' || record.halaqahName === selectedHalaqah;
    const matchesStatus = selectedStatus === 'Semua' || record.status === selectedStatus;

    return matchesSearch && matchesHalaqah && matchesStatus;
  });

  const uniqueHalaqahs = Array.from(new Set(santriList.map(s => s.halaqahName)));

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Block */}
      <div>
        <h2 id="evaluasi-page-title" className="text-xl font-black text-slate-900 uppercase tracking-tight">Evaluasi & Sertifikasi Hafalan</h2>
        <p className="text-xs text-slate-500 font-mono mt-1">LOG PENGUJIAN SEMESTER, TASMI' AKBAR & DIAGNOSIS KELENGKAPAN TARGET AKADEMIK</p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-805 text-emerald-800 rounded-sm flex items-center gap-3 border border-emerald-200 animate-in slide-in-from-top-4 duration-150">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-tight">{successMessage}</span>
        </div>
      )}

      {/* 2. Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Ujian Tercatat</p>
            <p className="text-2xl font-black text-slate-950 font-mono mt-0.5">{totalExams}</p>
            <span className="text-[10px] text-slate-500 block">Sertifikasi & Tes Kelayakan</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-605 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Tingkat Kelulusan</p>
            <p className="text-2xl font-black text-emerald-600 font-mono mt-0.5">{passRate}%</p>
            <span className="text-[10px] text-slate-500 block">Lulus Ketentuan Hafalan</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Rata-Rata Nilai Ujian</p>
            <p className="text-2xl font-black text-amber-500 font-mono mt-0.5">{averageExamScore}</p>
            <span className="text-[10px] text-slate-500 block">Indeks Ketepatan Mutu</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Santri Rentan (Pedampingan)</p>
            <p className="text-2xl font-black text-rose-600 font-mono mt-0.5">{vulnerableSantri.length}</p>
            <span className="text-[10px] text-slate-500 block">Nilai Rendah / Macet Target</span>
          </div>
        </div>
      </div>

      {/* 3. Main layout panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Form and Vulnerability Alert Column (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Form Create Exam Record */}
          <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-sm">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Catat Hasil Ujian & Tasmi'</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">Input dokumentasi ujian kelayakan, naik juz, ujian semester, atau program tasmi' akbar lisan.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Santri selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mahasantri Peserta</label>
                <select
                  value={selectedSantriId}
                  onChange={(e) => setSelectedSantriId(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-700 font-bold border border-slate-200 rounded-sm px-3 py-2.5 focus:bg-white focus:outline-none"
                >
                  {santriList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.nis} - {s.halaqahName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam type and Juz type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori Ujian</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-705 text-slate-700 font-bold border border-slate-200 rounded-sm px-2.5 py-2 focus:bg-white focus:outline-none"
                  >
                    <option value="Tasmi' Sekali Duduk (1 Juz)">Tasmi' (1 Juz)</option>
                    <option value="Tasmi' Sekali Duduk (5 Juz)">Tasmi' (5 Juz)</option>
                    <option value="Ujian Naik Juz">Ujian Naik Juz</option>
                    <option value="Ujian Akhir Semester">Ujian Semester</option>
                    <option value="Sertifikasi Kelulusan">Sertifikasi Akhir</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Materi Ujian</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Juz 30 / Juz 1-5"
                    value={juzType}
                    onChange={(e) => setJuzType(e.target.value)}
                    className="w-full bg-slate-50 text-xs border border-slate-200 rounded-sm px-3 py-2.5 focus:bg-white focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Score and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skor Ujian (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full bg-slate-50 text-xs border border-slate-200 rounded-sm px-3 py-2.5 focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hasil / Predikat</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 text-xs text-slate-705 text-slate-700 font-bold border border-slate-200 rounded-sm px-2.5 py-2 focus:bg-white focus:outline-none"
                  >
                    <option value="Lulus (Sangat Baik)">Lulus (Sangat Baik)</option>
                    <option value="Lulus (Cukup)">Lulus (Cukup)</option>
                    <option value="Mengulang">Mengulang</option>
                  </select>
                </div>
              </div>

              {/* Examiner and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ustadz Penguji</label>
                  <select
                    value={selectedTesterId}
                    onChange={(e) => setSelectedTesterId(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-707 text-slate-700 font-bold border border-slate-200 rounded-sm px-2 py-2.5 focus:bg-white"
                  >
                    {ustadzList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tanggal Ujian</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 text-xs border border-slate-200 rounded-sm px-3 py-2.5 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan Tambahan Penguji</label>
                <textarea
                  placeholder="Contoh: Sangat percaya diri, intonasi makhraj mantap. Perlu sedikit merapikan waqaf."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 text-xs border border-slate-200 rounded-sm px-3 py-2 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-sm border border-indigo-700 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simpan Rekapitulasi Kelulusan</span>
              </button>
            </form>
          </div>

          {/* Vulnerable Santri Monitor Alert Panel */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-sm shadow-sm text-left">
            <h4 className="text-xs font-extrabold text-red-650 text-red-700 uppercase tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-550 text-red-500 shrink-0" />
              <span>Sinyal Pendampingan Santri</span>
            </h4>
            <p className="text-[10.5px] text-slate-500 mt-1.5 mb-4">
              Santri terdekteksi kurang lancar (nilai harian di bawah 80) atau progres halaman per bulan melambat di bawah 45% target.
            </p>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              {vulnerableSantri.length === 0 ? (
                <div className="p-4 bg-white border rounded-sm border-slate-150 text-center text-[11px] text-slate-400 font-bold uppercase">
                  Semua santri melampaui standar mutu!
                </div>
              ) : (
                vulnerableSantri.map((s, idx) => {
                  const targetPercent = s.monthlyTargetPages > 0 
                    ? Math.round((s.monthlyAchievedPages / s.monthlyTargetPages) * 100) 
                    : 0;
                  return (
                    <div key={idx} className="bg-white border border-slate-200/80 p-3 rounded-sm flex items-center justify-between gap-3 hover:border-slate-300 transition text-[11px]">
                      <div>
                        <span className="font-extrabold text-slate-900 block">{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">{s.halaqahName}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold">Rerata: <span className="text-red-600 font-black font-mono">{s.averageScore}</span></span>
                        <span className="text-[9px] font-bold text-slate-500 font-mono">Pencapaian: {targetPercent}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Registry & Filters Column (7 columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-sm shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1 uppercase tracking-tight">Daftar Hasil Ujian Resmi</h3>
              <p className="text-xs text-slate-500">Rekaman sertifikasi tasmi', naik juz, dan ujian harian yang divalidasi dewan ustadz.</p>
            </div>

            {/* In-view filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari ujian / santri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 text-[11px] pl-8 pr-2 py-2 border border-slate-200 rounded-sm focus:outline-none focus:bg-white font-medium"
                />
              </div>

              <div>
                <select
                  value={selectedHalaqah}
                  onChange={(e) => setSelectedHalaqah(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2 py-2 text-[11px] font-bold text-slate-600 focus:outline-none"
                >
                  <option value="Semua">Semua Halaqah</option>
                  {uniqueHalaqahs.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2 py-2 text-[11px] font-bold text-slate-600"
                >
                  <option value="Semua">Semua Kelulusan</option>
                  <option value="Lulus (Sangat Baik)">Sangat Baik</option>
                  <option value="Lulus (Cukup)">Cukup</option>
                  <option value="Mengulang">Mengulang</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table display for high fidelity */}
          <div className="overflow-y-auto max-h-[540px] custom-scrollbar mt-4 pr-1 flex-1 space-y-3">
            {filteredExams.length === 0 ? (
              <div className="p-12 text-center rounded-sm border border-dashed border-slate-200">
                <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[10px]">Belum ada data ujian yang sesuai</p>
              </div>
            ) : (
                filteredExams.map((record) => {
                  const statusColors = 
                    record.status === 'Lulus (Sangat Baik)' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                    record.status === 'Lulus (Cukup)' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    'bg-rose-50 border-rose-200 text-rose-700';

                  return (
                    <div key={record.id} className="p-4 bg-slate-50 border border-slate-200 hover:border-slate-300 transition rounded-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 sm:p-2.5 bg-white border border-slate-200 font-mono font-bold text-xs text-indigo-600 rounded-sm shrink-0">
                          {record.santriName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-black text-slate-900 truncate">{record.santriName}</h4>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs border shrink-0 ${statusColors}`}>
                              {record.status}
                            </span>
                          </div>
                          
                          <span className="text-[9px] text-slate-500 font-bold block mt-1 font-mono uppercase">
                            {record.halaqahName} • PENGUJI: {record.testerName}
                          </span>

                          <div className="mt-3 text-[11px] flex items-center gap-2.5">
                            <span className="font-bold text-slate-800 bg-white border border-slate-200/80 px-1.5 py-0.5 rounded-sm">{record.examType}</span>
                            <span className="text-slate-400 font-black font-mono">{record.juzType}</span>
                          </div>

                          {record.notes && (
                            <p className="text-[10.5px] italic text-slate-500 mt-2 bg-white p-2 border border-slate-155 rounded-sm border-slate-200">
                              "{record.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-200 pt-3 md:pt-0 gap-3">
                        <div className="text-left md:text-right">
                          <div className="flex items-center gap-1 text-[9.5px] text-slate-400 font-bold uppercase font-mono">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{record.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2.5">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Skor:</span>
                            <span className="text-xs font-black bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-xs font-mono">
                              {record.score}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm('Yakin ingin menghapus rekaman hasil ujian ini?')) {
                              handleDeleteExam(record.id);
                            }
                          }}
                          className="p-1 px-1.5 text-slate-350 hover:text-red-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-sm transition cursor-pointer"
                          title="Hapus Rekaman Ujian"
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
