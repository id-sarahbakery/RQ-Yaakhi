/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  User,
  Award,
  ChevronRight,
  BookOpen,
  Filter,
  Users,
  Smile,
  X,
  Sparkles,
  TrendingUp,
  Trash
} from 'lucide-react';
import { Halaqah, Santri, Ustadz, Gender } from '../types';

interface HalaqahViewProps {
  halaqahList: Halaqah[];
  santriList: Santri[];
  ustadzList: Ustadz[];
  onAddHalaqah: (hal: Omit<Halaqah, 'id'>) => void;
  onDeleteHalaqah: (id: string) => void;
}

export default function HalaqahView({
  halaqahList,
  santriList,
  ustadzList,
  onAddHalaqah,
  onDeleteHalaqah
}: HalaqahViewProps) {
  const [selectedHalaqahId, setSelectedHalaqahId] = useState<string>(halaqahList[0]?.id || '');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('Semua');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Performance modal state
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [perfHalaqahId, setPerfHalaqahId] = useState<string>('');

  // Form states to create a new Halaqah
  const [formData, setFormData] = useState({
    name: '',
    mentorId: ustadzList[0]?.id || '',
    gender: 'Ikhwan' as Gender,
    targetHafalan: 'Juz 30'
  });

  const selectedHalaqah = halaqahList.find(h => h.id === selectedHalaqahId);
  const enrolledStudents = santriList.filter(s => s.halaqahId === selectedHalaqahId);

  // Helper to construct performance data for a Halaqah
  const getHalaqahPerformanceData = (halId: string) => {
    const hal = halaqahList.find(h => h.id === halId);
    if (!hal) return null;

    const students = santriList.filter(s => s.halaqahId === halId);
    
    const totalStudents = students.length;
    const totalPagesMemorized = students.reduce((sum, s) => sum + s.memorizedPages, 0);
    const avgScore = totalStudents > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.averageScore, 0) / totalStudents)
      : 0;
    
    const totalTargetPages = students.reduce((sum, s) => sum + s.monthlyTargetPages, 0);
    const totalAchievedPages = students.reduce((sum, s) => sum + s.monthlyAchievedPages, 0);
    const targetAchievementRate = totalTargetPages > 0
      ? Math.round((totalAchievedPages / totalTargetPages) * 100)
      : 0;

    // Filter top performers based on high average Score
    const topPerformers = [...students]
      .sort((a, b) => b.averageScore - a.averageScore || b.monthlyAchievedPages - a.monthlyAchievedPages)
      .slice(0, 3);

    // Filter pending targets based on incomplete monthlyTargetPages
    const pendingTargets = students.map(s => {
      const remainingPages = s.monthlyTargetPages - s.monthlyAchievedPages;
      return {
        student: s,
        remainingPages: remainingPages > 0 ? remainingPages : 0
      };
    }).filter(item => item.remainingPages > 0);

    return {
      halaqah: hal,
      totalStudents,
      totalPagesMemorized,
      avgScore,
      targetAchievementRate,
      topPerformers,
      pendingTargets
    };
  };

  // Filter groups to display
  const filteredHalaqahs = halaqahList.filter((h) => {
    if (selectedGenderFilter === 'Semua') return true;
    return h.gender === selectedGenderFilter;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const matchedMentor = ustadzList.find(u => u.id === formData.mentorId);
    const mentorName = matchedMentor ? matchedMentor.name : 'Ustadz Belum Ditunjuk';

    onAddHalaqah({
      name: formData.name,
      mentor: mentorName,
      gender: formData.gender,
      totalStudents: 0,
      targetHafalan: formData.targetHafalan
    });

    setIsAddOpen(false);
    setFormData({
      name: '',
      mentorId: ustadzList[0]?.id || '',
      gender: 'Ikhwan',
      targetHafalan: 'Juz 30'
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header directory card */}
      <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">Kelompok Halaqah Aktif</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Pembagian kelompok belajar (rombel) tahfidz terintegrasi dengan pembina masing-masing</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex bg-slate-50 p-1 border border-slate-200 rounded-sm">
            <button
              onClick={() => setSelectedGenderFilter('Semua')}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-all cursor-pointer ${
                selectedGenderFilter === 'Semua' ? 'bg-white text-slate-800 border border-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua Gender
            </button>
            <button
              onClick={() => setSelectedGenderFilter('Ikhwan')}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-all cursor-pointer ${
                selectedGenderFilter === 'Ikhwan' ? 'bg-white text-blue-600 border border-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ikhwan
            </button>
            <button
              onClick={() => setSelectedGenderFilter('Akhwat')}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-all cursor-pointer ${
                selectedGenderFilter === 'Akhwat' ? 'bg-white text-rose-500 border border-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Akhwat
            </button>
          </div>
          <button
            id="new-halaqah-btn"
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded-sm border border-blue-700 shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Halaqah</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive grid content splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Grid of cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHalaqahs.map((hal) => {
              const studentsCount = santriList.filter(s => s.halaqahId === hal.id).length;
              const isSelected = selectedHalaqahId === hal.id;

              return (
                <div
                  key={hal.id}
                  onClick={() => {
                    setSelectedHalaqahId(hal.id);
                    setPerfHalaqahId(hal.id);
                    setIsPerformanceModalOpen(true);
                  }}
                  className={`p-5 rounded-sm border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-600/10 hover:shadow-lg'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-sm border ${
                      hal.gender === 'Ikhwan'
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'bg-rose-50 text-rose-500 border-rose-200'
                    }`}>
                      {hal.gender}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200 font-mono">
                        {studentsCount} Santri
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Apakah Anda yakin ingin menghapus halaqah ${hal.name}?`)) {
                            onDeleteHalaqah(hal.id);
                            if (selectedHalaqahId === hal.id) setSelectedHalaqahId('');
                          }
                        }}
                        className="p-1 text-slate-350 hover:text-red-500 hover:bg-red-50 rounded-sm border border-transparent hover:border-red-200 transition"
                        title="Hapus Halaqah"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 tracking-tight">{hal.name}</h4>

                  {/* Mentor indicator */}
                  <div className="mt-4 flex items-center gap-2.5 text-xs text-slate-600 font-bold border-t border-slate-200 pt-3">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-slate-400 block leading-none uppercase tracking-wider">Pembina</span>
                      <span className="truncate block mt-1">{hal.mentor}</span>
                    </div>
                  </div>

                  {/* Target Hafalan indicator */}
                  <div className="mt-2 flex items-center gap-2.5 text-xs text-slate-600 font-bold border-t border-slate-100 pt-2">
                    <Award className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-slate-400 block leading-none uppercase tracking-wider">Target</span>
                      <span className="truncate block mt-1">{hal.targetHafalan}</span>
                    </div>
                  </div>

                  {/* Performance Analysis Indicator */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-blue-600 uppercase tracking-wider font-mono">
                    <span>Analisis Performa</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected Halaqah student list details */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex flex-col justify-between self-start">
          {selectedHalaqah ? (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-sm uppercase tracking-wider">
                  Detail Rombel
                </span>
                <h4 className="text-base font-black text-slate-900 mt-2">{selectedHalaqah.name}</h4>
                <p className="text-xs text-slate-500 mt-1">Dibina oleh <span className="font-bold text-slate-800">{selectedHalaqah.mentor}</span></p>
              </div>

              {/* Stat block */}
              <div className="grid grid-cols-2 gap-3 pb-3">
                <div className="p-3 bg-slate-50 rounded-sm text-left border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Jumlah Murid</span>
                  <span className="text-base font-black text-slate-805 text-slate-800 h-8 flex items-end font-mono">{enrolledStudents.length} Santri</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-sm text-left border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Level Target</span>
                  <span className="text-xs font-bold text-slate-805 text-slate-850 h-8 flex items-end truncate" title={selectedHalaqah.targetHafalan}>
                    {selectedHalaqah.targetHafalan}
                  </span>
                </div>
              </div>

              {/* Student breakdown list */}
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Daftar Santri Enrolled</h5>
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
                  {enrolledStudents.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-bold">
                      <Smile className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <span>Belum ada murid di kelas halaqah ini</span>
                    </div>
                  ) : (
                    enrolledStudents.map((student) => (
                      <div key={student.id} className="p-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-between gap-3 transition">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-sm bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-slate-700 shrink-0 font-mono">
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0 text-left">
                            <p className="text-xs font-bold text-slate-900 truncate">{student.name}</p>
                            <span className="text-[9px] text-[#2563eb] font-bold block font-mono">{student.nis}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100">
                            Hlm {student.memorizedPages}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-bold uppercase text-xs">
              <Layers className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <span>Silakan pilih salah satu halaqah untuk melihat detail</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Add Halaqah Popup Model */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-white rounded-sm w-full max-w-md shadow-2xl border border-slate-350 overflow-hidden text-left">
            {/* Modal Head */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Tambah Kelompok Halaqah</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">FORMULIR KELAS ROMBEL BARU</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-sm border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Halaqah</label>
                <input
                   type="text"
                   required
                   placeholder="Contoh: Halaqah Ikhwan C"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Guru Pembina (Ustadz / Ustadzah)</label>
                <select
                  value={formData.mentorId}
                  onChange={(e) => setFormData({ ...formData, mentorId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  {ustadzList.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.name} ({mentor.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender / Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="Ikhwan">Ikhwan</option>
                    <option value="Akhwat">Akhwat</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Halaqah</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Juz 30"
                    value={formData.targetHafalan}
                    onChange={(e) => setFormData({ ...formData, targetHafalan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 font-bold rounded-sm border border-slate-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-sm border border-blue-700 shadow-sm transition cursor-pointer"
                >
                  Buat Halaqah Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Halaqah Performance and Analytics Model */}
      {isPerformanceModalOpen && (() => {
        const perfData = getHalaqahPerformanceData(perfHalaqahId);
        if (!perfData) return null;

        const {
          halaqah,
          totalStudents,
          totalPagesMemorized,
          avgScore,
          targetAchievementRate,
          topPerformers,
          pendingTargets
        } = perfData;

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-sm w-full max-w-2xl shadow-2xl border border-slate-350 overflow-hidden text-left flex flex-col max-h-[90vh]">
              {/* Modal Head */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-sm">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-950 uppercase tracking-tight">{halaqah.name}</h4>
                    <p className="text-[10px] text-slate-500 font-extrabold font-mono mt-0.5 uppercase tracking-wide">
                      REKAP PERFORMA & TARGET BULANAN | PEMBINA: {halaqah.mentor}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPerformanceModalOpen(false)}
                  className="p-1 px-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-sm border border-slate-200 text-xs font-bold font-mono transition flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Tutup</span>
                </button>
              </div>

              {/* Scrollable Contents */}
              <div className="p-5 overflow-y-auto space-y-6 custom-scrollbar text-xs">
                
                {/* 1. Summary of Recent Performance Grid */}
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
                    📊 Ringkasan Performa Kelompok
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-sm">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Total Santri</span>
                      <span className="text-sm font-black text-slate-800 font-mono mt-1 block">{totalStudents} Santri</span>
                    </div>
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-sm">
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block font-mono">Aparatur Hafalan</span>
                      <span className="text-sm font-black text-blue-700 font-mono mt-1 block">{totalPagesMemorized} Halaman</span>
                    </div>
                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-sm">
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block font-mono">Nilai Rata-rata</span>
                      <span className="text-sm font-black text-emerald-700 font-mono mt-1 block">{avgScore}%</span>
                    </div>
                    <div className="p-3 bg-indigo-50/55 border border-indigo-100 rounded-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-650 text-indigo-600 uppercase tracking-wider block font-mono">Selesai Target</span>
                        <span className="text-sm font-black text-indigo-700 font-mono block">{targetAchievementRate}%</span>
                      </div>
                      <div className="w-full bg-indigo-100 h-1 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(targetAchievementRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Top Performing Santri */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      🏆 Bintang Halaqah (Terbaik Pekan Ini)
                    </h5>
                    <span className="text-[8px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider font-mono">
                      Peringkat Tertinggi
                    </span>
                  </div>
                  
                  {topPerformers.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-sm font-mono uppercase">
                      Belum terdapat anggota santri aktif terdaftar.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {topPerformers.map((student, index) => {
                        const rankMedals = ['🥇', '🥈', '🥉'];
                        return (
                          <div key={student.id} className="p-3 bg-amber-50/15 border border-amber-200/40 rounded-sm text-left flex flex-col justify-between shadow-xs">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-base font-bold">{rankMedals[index] || '⭐'}</span>
                                <span className="text-[10px] font-black text-amber-700 font-mono bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-xs">
                                  {student.averageScore}%
                                </span>
                              </div>
                              <p className="text-xs font-extrabold text-slate-900 mt-2 truncate uppercase tracking-tight">{student.name}</p>
                              <p className="text-[9px] text-slate-400 font-mono font-bold mt-0.5">{student.nis}</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-amber-200/30 flex items-center justify-between text-[9.5px] text-slate-500 font-bold font-mono">
                              <span>Setoran Bulanan:</span>
                              <span className="font-black text-slate-900">{student.monthlyAchievedPages} / {student.monthlyTargetPages} hlm</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Pending Setoran Targets */}
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
                    📋 Sisa Target Setoran Bulanan Anggota (Pending)
                  </h5>
                  
                  {pendingTargets.length === 0 ? (
                    <div className="p-8 text-center text-emerald-800 bg-emerald-50 border border-dashed border-emerald-200 rounded-sm space-y-1">
                      <Sparkles className="w-5 h-5 text-emerald-600 mx-auto animate-bounce" />
                      <p className="font-extrabold uppercase tracking-wide text-xs">Seluruh Santri Lunas Target!</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Luar biasa! Seluruh santri di halaqah ini telah melampaui atau sukses menyelesaikan target bulanan mereka.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-sm divide-y divide-slate-100 overflow-hidden bg-white max-h-[220px] overflow-y-auto custom-scrollbar">
                      {pendingTargets.map(({ student, remainingPages }) => {
                        const progressPercentage = student.monthlyTargetPages > 0
                          ? Math.round((student.monthlyAchievedPages / student.monthlyTargetPages) * 100)
                          : 0;

                        return (
                          <div key={student.id} className="p-3 hover:bg-slate-50/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-extrabold text-slate-900 uppercase tracking-tight truncate">{student.name}</p>
                                <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-sm border font-mono ${
                                  remainingPages > 3
                                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  Kurang {remainingPages} Hlm
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-400 font-bold block mt-0.5">
                                NIS: {student.nis} | Surah Terakhir: <span className="font-mono text-blue-600">{student.currentSurah} ({student.currentVerseRange})</span>
                              </p>
                            </div>
                            
                            {/* Progres setoran */}
                            <div className="w-full sm:w-44 shrink-0 flex items-center">
                              <div className="w-full">
                                <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-550 text-slate-500 font-mono mb-0.5">
                                  <span>{student.monthlyAchievedPages} / {student.monthlyTargetPages} Hlm</span>
                                  <span>{progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Modal footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[9.5px] text-slate-400 font-extrabold font-mono uppercase tracking-wide">PENGUKURAN KUALITAS SHUFUF TAHFIDZ</span>
                <button
                  type="button"
                  onClick={() => setIsPerformanceModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold rounded-sm transition cursor-pointer font-mono uppercase tracking-wide"
                >
                  Selesai Meninjau
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
