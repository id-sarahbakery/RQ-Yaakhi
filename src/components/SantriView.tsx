/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  UserPlus,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Phone,
  Calendar,
  X,
  CreditCard,
  FileSpreadsheet,
  Award,
  ChevronRight,
  BookOpen,
  Trash,
  Sliders,
  Sparkles,
  Brain
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as ChartTooltip
} from 'recharts';
import { Santri, Halaqah, SppStatus, Gender } from '../types';
import AttendanceHistoryModal from './AttendanceHistoryModal';

interface SantriViewProps {
  santriList: Santri[];
  halaqahList: Halaqah[];
  onAddSantri: (santri: Omit<Santri, 'id'>) => void;
  onUpdateSantri: (id: string, updated: Partial<Santri>) => void;
  onDeleteSantri: (id: string) => void;
  searchQuery: string;
}

export default function SantriView({
  santriList,
  halaqahList,
  onAddSantri,
  onUpdateSantri,
  onDeleteSantri,
  searchQuery: externalSearchQuery
}: SantriViewProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('Semua');
  const [selectedHalaqah, setSelectedHalaqah] = useState<string>('Semua');
  const [selectedSpp, setSelectedSpp] = useState<string>('Semua');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedSantriForHistory, setSelectedSantriForHistory] = useState<Santri | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sub-tabs for student directory vs proficiency visualization
  const [activeSubTab, setActiveSubTab] = useState<'daftar' | 'progres'>('daftar');
  const [selectedProgresSantriId, setSelectedProgresSantriId] = useState<string>('');

  // Local state for interactive proficiency scores (Tajwid, Makhraj, Fluency, etc)
  const [proficiencies, setProficiencies] = useState<Record<string, {
    tajwid: number;
    makhraj: number;
    fluency: number;
    fashahah: number;
    ghunnah: number;
    adab: number;
  }>>(() => {
    try {
      const saved = localStorage.getItem('pesantren_santri_proficiencies');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Automatically persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('pesantren_santri_proficiencies', JSON.stringify(proficiencies));
  }, [proficiencies]);

  // Set initial selected student if empty
  useEffect(() => {
    if (!selectedProgresSantriId && santriList.length > 0) {
      setSelectedProgresSantriId(santriList[0].id);
    }
  }, [santriList, selectedProgresSantriId]);

  // Read or generate proficiencies for the student
  const getStudentProficiency = (studentId: string, studentAvgScore: number) => {
    if (proficiencies[studentId]) {
      return proficiencies[studentId];
    }
    const scoreBase = studentAvgScore || 85;
    const charCodeSum = studentId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const offsetTajwid = (charCodeSum % 7) - 3;
    const offsetMakhraj = ((charCodeSum >> 1) % 7) - 3;
    const offsetFluency = ((charCodeSum >> 2) % 7) - 3;
    const offsetFashahah = ((charCodeSum >> 3) % 7) - 3;
    const offsetGhunnah = ((charCodeSum >> 4) % 7) - 3;
    const offsetAdab = ((charCodeSum >> 5) % 5) - 1;

    return {
      tajwid: Math.max(60, Math.min(100, scoreBase + offsetTajwid)),
      makhraj: Math.max(60, Math.min(100, scoreBase + offsetMakhraj)),
      fluency: Math.max(60, Math.min(100, scoreBase + offsetFluency)),
      fashahah: Math.max(60, Math.min(100, scoreBase + offsetFashahah)),
      ghunnah: Math.max(60, Math.min(100, scoreBase + offsetGhunnah)),
      adab: Math.max(65, Math.min(100, scoreBase + offsetAdab))
    };
  };

  // Adjust a specific aspect and recalculate/save to state and parent average score
  const handleUpdateProficiency = (studentId: string, aspect: string, val: number) => {
    // Find base average from santri to feed into generator if blank
    const matchSantri = santriList.find(s => s.id === studentId);
    const baseAvg = matchSantri ? matchSantri.averageScore : 88;
    const current = getStudentProficiency(studentId, baseAvg);
    
    const updatedAspects = {
      ...current,
      [aspect]: val
    };

    setProficiencies(prev => ({
      ...prev,
      [studentId]: updatedAspects
    }));

    const newAverage = Math.round(
      (updatedAspects.tajwid + 
       updatedAspects.makhraj + 
       updatedAspects.fluency + 
       updatedAspects.fashahah + 
       updatedAspects.ghunnah + 
       updatedAspects.adab) / 6
    );

    onUpdateSantri(studentId, { averageScore: newAverage });
  };

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Ikhwan' as Gender,
    halaqahId: halaqahList[0]?.id || '',
    phone: '',
    targetPages: 30,
    sppStatus: 'Belum Bayar' as SppStatus,
    sppAmount: 350000,
    currentSurah: 'Al-Baqarah',
    currentVerseRange: '1-10'
  });

  // Effective search combining header query & directory internal search bar
  const query = internalSearchQuery || externalSearchQuery;

  // Filter students
  const filteredSantri = santriList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.nis.toLowerCase().includes(query.toLowerCase()) ||
      s.currentSurah.toLowerCase().includes(query.toLowerCase());

    const matchesGender = selectedGender === 'Semua' || s.gender === selectedGender;
    const matchesHalaqah = selectedHalaqah === 'Semua' || s.halaqahId === selectedHalaqah;
    const matchesSpp = selectedSpp === 'Semua' || s.sppStatus === selectedSpp;

    return matchesSearch && matchesGender && matchesHalaqah && matchesSpp;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const matchedHalaqah = halaqahList.find(h => h.id === formData.halaqahId);
    const halaqahName = matchedHalaqah ? matchedHalaqah.name : 'Belum Ditentukan';

    onAddSantri({
      nis: `SN${Math.floor(100 + Math.random() * 900)}`, // Generate simple NIS suffix
      name: formData.name,
      gender: formData.gender,
      halaqahId: formData.halaqahId,
      halaqahName: halaqahName,
      currentSurah: formData.currentSurah,
      currentVerseRange: formData.currentVerseRange,
      averageScore: 90,
      memorizedPages: 12,
      monthlyTargetPages: Number(formData.targetPages),
      monthlyAchievedPages: 0,
      sppStatus: formData.sppStatus,
      sppAmount: Number(formData.sppAmount),
      phone: formData.phone || '0821-xxxx-xxxx',
      joinDate: new Date().toISOString().split('T')[0]
    });

    setIsAddOpen(false);
    setFormData({
      name: '',
      gender: 'Ikhwan',
      halaqahId: halaqahList[0]?.id || '',
      phone: '',
      targetPages: 30,
      sppStatus: 'Belum Bayar',
      sppAmount: 350000,
      currentSurah: 'Al-Baqarah',
      currentVerseRange: '1-10'
    });
  };

  const toggleSppStatus = (santri: Santri) => {
    let nextStatus: SppStatus = 'Lunas';
    if (santri.sppStatus === 'Lunas') {
      nextStatus = 'Menunggak';
    } else if (santri.sppStatus === 'Menunggak') {
      nextStatus = 'Belum Bayar';
    } else {
      nextStatus = 'Lunas';
    }
    onUpdateSantri(santri.id, { sppStatus: nextStatus });
  };

  const handleIncrementPages = (santri: Santri) => {
    const nextAchieved = santri.monthlyAchievedPages + 2;
    onUpdateSantri(santri.id, {
      monthlyAchievedPages: nextAchieved,
      memorizedPages: santri.memorizedPages + 2
    });
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header directory card */}
      <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">Portal Santri Aktif</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Daftar lengkap santri Rumah Tahfidz dengan pelacakan target hafalan dan SPP harian</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => alert('Fitur ekspor excel santri berhasil dipicu.')}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-sm border border-slate-200 flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor XLS</span>
          </button>
          <button
            id="register-santri-btn"
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded-sm shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftarkan Santri Baru</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('daftar')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'daftar'
              ? 'border-blue-600 text-blue-600 font-extrabold bg-blue-50/10'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>Daftar Direktori Santri</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('progres');
            if (!selectedProgresSantriId && santriList.length > 0) {
              setSelectedProgresSantriId(santriList[0].id);
            }
          }}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'progres'
              ? 'border-blue-600 text-blue-600 font-extrabold bg-blue-50/10'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Brain className="w-4 h-4 shrink-0 text-blue-500" />
          <span>Progres Tahfidz (Radar Profisiensi)</span>
        </button>
      </div>

      {activeSubTab === 'daftar' && (
        <>
          {/* 2. Interactive Filters Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-sm border border-slate-200 shadow-sm text-left">
            {/* Search Input Box */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                id="santri-tab-search"
                type="text"
                placeholder="Cari santri berdasarkan nama / NIS..."
                value={internalSearchQuery}
                onChange={(e) => setInternalSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2.5 border border-slate-200 rounded-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>

            {/* Gender Filter */}
            <div className="relative">
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-705 text-slate-700 font-bold border border-slate-200 rounded-sm px-3 py-2.5 focus:bg-white focus:border-blue-600 focus:outline-none"
              >
                <option value="Semua">Semua Gender</option>
                <option value="Ikhwan">Ikhwan</option>
                <option value="Akhwat">Akhwat</option>
              </select>
            </div>

            {/* Halaqah Filter */}
            <div className="relative">
              <select
                value={selectedHalaqah}
                onChange={(e) => setSelectedHalaqah(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-705 text-slate-700 font-bold border border-slate-200 rounded-sm px-3 py-2.5 focus:bg-white focus:border-blue-600 focus:outline-none"
              >
                <option value="Semua">Semua Halaqah</option>
                {halaqahList.map((hal) => (
                  <option key={hal.id} value={hal.id}>
                    {hal.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SPP Payment Status Filter */}
            <div className="relative">
              <select
                value={selectedSpp}
                onChange={(e) => setSelectedSpp(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-705 text-slate-700 font-bold border border-slate-200 rounded-sm px-3 py-2.5 focus:bg-white focus:border-blue-600 focus:outline-none"
              >
                <option value="Semua">Semua Status SPP</option>
                <option value="Lunas">Lunas</option>
                <option value="Menunggak">Menunggak</option>
                <option value="Belum Bayar">Belum Bayar</option>
              </select>
            </div>
          </div>

          {/* 3. Main Student Data Table */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm text-left overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">NIS & Nama Lengkap</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">Kelas Halaqah</th>
                    <th className="p-4">Surah Terakhir</th>
                    <th className="p-4">Target Hafalan</th>
                    <th className="p-4">Kontak Wali</th>
                    <th className="p-4 text-center">Status SPP</th>
                    <th className="p-4 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSantri.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                        <UserPlus className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider">Tidak ada santri yang sesuai kriteria pencarian</span>
                      </td>
                    </tr>
                  ) : (
                    filteredSantri.map((santri) => {
                      const percent = Math.min(100, Math.round((santri.monthlyAchievedPages / santri.monthlyTargetPages) * 100));

                      return (
                        <tr key={santri.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* NIS & Name */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-sm flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 font-mono ${
                                santri.gender === 'Ikhwan' ? 'bg-slate-100 text-blue-600' : 'bg-slate-100 text-rose-500'
                              }`}>
                                {santri.name.charAt(0)}
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProgresSantriId(santri.id);
                                    setActiveSubTab('progres');
                                  }}
                                  className="text-xs font-bold text-slate-900 leading-none hover:text-blue-600 hover:underline cursor-pointer text-left focus:outline-none"
                                  title="Lihat Detail Progres Tahfidz"
                                >
                                  {santri.name}
                                </button>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-mono font-bold inline-block mt-1">
                                    {santri.nis}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Gender */}
                          <td className="p-4">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border ${
                              santri.gender === 'Ikhwan'
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-rose-50 text-rose-500 border-rose-200'
                            }`}>
                              {santri.gender}
                            </span>
                          </td>

                          {/* Halaqah Name */}
                          <td className="p-4 text-xs font-bold text-slate-600">
                            {santri.halaqahName}
                          </td>

                          {/* Current Surah */}
                          <td className="p-4">
                            <p className="text-xs font-bold text-slate-800">{santri.currentSurah}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ayat {santri.currentVerseRange}
                            </span>
                          </td>

                          {/* Target Hafalan (Progress bar) */}
                          <td className="p-4 max-w-[180px]">
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-emerald-600">{santri.monthlyAchievedPages} / {santri.monthlyTargetPages} Hlm</span>
                                <span className="font-bold text-slate-400">{percent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-105 bg-slate-100 rounded-none overflow-hidden border border-slate-200/50">
                                <div className="h-full bg-emerald-500 rounded-none animate-all" style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          </td>

                          {/* Wali Contact */}
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold font-mono">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{santri.phone}</span>
                            </div>
                          </td>

                          {/* SPP Payment Status */}
                          <td className="p-4">
                            <button
                              onClick={() => toggleSppStatus(santri)}
                              className={`w-full text-left md:text-center text-[10px] font-bold py-1.5 px-2.5 rounded-sm border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                santri.sppStatus === 'Lunas'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50'
                                  : santri.sppStatus === 'Menunggak'
                                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-rose-100/50'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50'
                              }`}
                              title="Klik untuk mengubah status pembayaran"
                            >
                              {santri.sppStatus === 'Lunas' ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${santri.sppStatus === 'Menunggak' ? 'text-red-600' : 'text-amber-600'}`} />
                              )}
                              <span>{santri.sppStatus}</span>
                            </button>
                          </td>

                          {/* Quick incremental tools & Delete */}
                          <td className="p-4">
                            <div className="flex items-center gap-2 justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSantriForHistory(santri);
                                  setIsHistoryOpen(true);
                                }}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-sm text-[10px] font-bold flex items-center gap-1 border border-blue-200 transition cursor-pointer"
                                title="Lihat Riwayat Absensi Kehadiran"
                              >
                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                <span>Absen</span>
                              </button>
                              <button
                                onClick={() => handleIncrementPages(santri)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-sm text-[10px] font-bold flex items-center gap-0.5 border border-slate-200 transition"
                                title="Tambah 2 halaman hafalan tercapai"
                              >
                                <span>+2 Hlm</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus santri ${santri.name}?`)) {
                                    onDeleteSantri(santri.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-sm border border-transparent hover:border-red-200 transition"
                                title="Hapus Santri"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Add Student Popup Modal overlay */}
          {isAddOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
              <div className="bg-white rounded-sm w-full max-w-lg shadow-2xl border border-slate-350 overflow-hidden text-left">
                {/* Modal Head */}
                <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Pendaftaran Santri Baru</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">FORMULIR PENDAFTARAN MAHASANTRI</p>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap Santri</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Muhammad Umar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>

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
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori Rombel Halaqah</label>
                      <select
                        value={formData.halaqahId}
                        onChange={(e) => setFormData({ ...formData, halaqahId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none focus:border-blue-600"
                      >
                        {halaqahList.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} ({h.mentor})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor HP Wali (WhatsApp)</label>
                      <input
                        type="text"
                        placeholder="Contoh: 0821-1234-5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Halaman / Bln</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.targetPages}
                        onChange={(e) => setFormData({ ...formData, targetPages: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SPP Bulanan (Rupiah)</label>
                      <input
                        type="number"
                        value={formData.sppAmount}
                        onChange={(e) => setFormData({ ...formData, sppAmount: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status SPP Awal</label>
                      <select
                        value={formData.sppStatus}
                        onChange={(e) => setFormData({ ...formData, sppStatus: e.target.value as SppStatus })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none focus:border-blue-600"
                      >
                        <option value="Belum Bayar">Belum Bayar</option>
                        <option value="Lunas">Lunas</option>
                        <option value="Menunggak">Menunggak</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Surah Mulai</label>
                      <input
                        type="text"
                        value={formData.currentSurah}
                        onChange={(e) => setFormData({ ...formData, currentSurah: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rentang Ayat Mulai</label>
                      <input
                        type="text"
                        value={formData.currentVerseRange}
                        onChange={(e) => setFormData({ ...formData, currentVerseRange: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
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
                      Simpan & Daftarkan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {activeSubTab === 'progres' && (() => {
        const student = santriList.find(s => s.id === selectedProgresSantriId) || santriList[0];
        if (!student) {
          return (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-sm bg-white text-slate-400">
              <Brain className="w-12 h-12 mx-auto text-slate-350 mb-3" />
              <p className="text-sm font-bold uppercase tracking-wider text-slate-700">Tidak ada santri terdaftar</p>
              <p className="text-xs text-slate-450 mt-1">Daftarkan santri baru terlebih dahulu di tab direktori santri.</p>
            </div>
          );
        }

        const sidebarSearchQuery = internalSearchQuery.toLowerCase();
        const sidebarStudents = santriList.filter(s => 
          s.name.toLowerCase().includes(sidebarSearchQuery) || 
          s.nis.toLowerCase().includes(sidebarSearchQuery)
        );

        const scores = getStudentProficiency(student.id, student.averageScore);

        const chartData = [
          { subject: 'Tajwid', A: scores.tajwid, fullMark: 100 },
          { subject: 'Makhraj', A: scores.makhraj, fullMark: 100 },
          { subject: 'Kelancaran', A: scores.fluency, fullMark: 100 },
          { subject: 'Fashahah', A: scores.fashahah, fullMark: 100 },
          { subject: 'Ghunnah & Sifat', A: scores.ghunnah, fullMark: 100 },
          { subject: 'Adab & Fokus', A: scores.adab, fullMark: 100 }
        ];

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start animate-in fade-in duration-200">
            {/* Sidebar List Selector (span 4) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-sm shadow-sm p-4 h-[580px] flex flex-col">
              <div className="border-b border-slate-100 pb-3 mb-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">Pilih Santri</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">DAFTAR MAHASANTRI AKTIF ({sidebarStudents.length})</p>
                
                <div className="relative mt-2.5">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Sering nama / NIS..."
                    value={internalSearchQuery}
                    onChange={(e) => setInternalSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 text-[11px] pl-8 pr-3 py-2 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Scrollable List */}
              <div className="overflow-y-auto flex-1 custom-scrollbar space-y-1 pr-1">
                {sidebarStudents.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">Tidak ada hasil cocok</p>
                ) : (
                  sidebarStudents.map((s) => {
                    const isSelected = s.id === student.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedProgresSantriId(s.id)}
                        className={`w-full text-left p-2.5 rounded-sm flex items-center justify-between gap-3 transition-colors border cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/55 border-blue-200 text-blue-900 font-bold'
                            : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <p className="text-xs truncate font-bold">{s.name}</p>
                          <p className="text-[9.5px] text-slate-400 mt-0.5 font-mono">{s.nis} • {s.halaqahName}</p>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-xs border ${
                          s.averageScore >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {s.averageScore}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Proficiency Dashboard Details (span 8) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col min-h-[580px]">
              {/* Profile Bar Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-sm flex items-center justify-center font-black text-sm shrink-0 border border-slate-200 font-mono ${
                    student.gender === 'Ikhwan' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight">{student.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      NIS: {student.nis} • Kategori: {student.halaqahName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left sm:text-right">
                  <div className="border-l sm:border-l-0 sm:border-r border-slate-200 pl-4 sm:pl-0 pr-0 sm:pr-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nilai Tahfidz Rata-rata</span>
                    <span className="text-lg font-black text-emerald-600 font-mono">{student.averageScore}</span>
                    <span className="text-[9px] text-slate-500 block font-medium mt-0.5">Predikat: {
                      student.averageScore >= 90 ? 'Mumtaz' : student.averageScore >= 80 ? 'Jayyid Jiddan' : 'Jayyid'
                    }</span>
                  </div>
                </div>
              </div>

              {/* Core Panels Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Left col: Radar Chart Panel */}
                <div className="space-y-4">
                  <div className="border border-slate-150 rounded-sm bg-slate-50/50 p-4">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4 font-mono">
                      Radar Grafik Kompetensi Mahasantri
                    </h5>

                    <div className="h-60 w-full flex items-center justify-center text-[10px] font-sans">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                          <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                          <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} 
                          />
                          <PolarRadiusAxis 
                            angle={30} 
                            domain={[0, 100]} 
                            tick={{ fill: '#94a3b8', fontSize: 8 }} 
                          />
                          <Radar
                            name={student.name}
                            dataKey="A"
                            stroke="#2563eb"
                            fill="#3b82f6"
                            fillOpacity={0.35}
                          />
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 text-white px-2 py-1.5 rounded-xs text-[10px] border border-slate-800 shadow-xl font-bold font-mono">
                                    <p className="text-slate-350">{payload[0].name}</p>
                                    <p className="text-sky-300 mt-0.5">{payload[0].payload.subject}: {payload[0].value}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Quick Metadata Stats card */}
                  <div className="p-4 rounded-sm border border-slate-100 bg-emerald-50/20 text-emerald-900 grid grid-cols-2 gap-3 text-left">
                    <div>
                      <span className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider block">Hafalan Terakhir</span>
                      <span className="text-xs font-extrabold text-slate-800 block mt-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        {student.currentSurah}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Ayat {student.currentVerseRange}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider block">Halaman Terkumpul</span>
                      <span className="text-xs font-extrabold text-slate-800 block mt-1 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-500" />
                        {student.memorizedPages} Hlm
                      </span>
                      <span className="text-[9px] text-emerald-600 font-bold block mt-0.5 font-mono">Pencapaian: {student.monthlyAchievedPages} hlm</span>
                    </div>
                  </div>
                </div>

                {/* Right col: Sliders & Grade Control */}
                <div className="space-y-4 text-left">
                  <div className="border border-slate-200 rounded-sm p-4 bg-white space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Sliders className="w-4 h-4 text-blue-500" />
                      <h5 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                        Atur Penilaian & Indikator
                      </h5>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      {/* Tajwid Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                          <span>1. Tajwid & Ahkam Al-Mad</span>
                          <span className="font-mono text-blue-600">{scores.tajwid}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="50"
                            max="100"
                            value={scores.tajwid}
                            onChange={(e) => handleUpdateProficiency(student.id, 'tajwid', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                      </div>

                      {/* Makhraj Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                          <span>2. Makhraj (Tempat Keluar Huruf)</span>
                          <span className="font-mono text-blue-600">{scores.makhraj}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="50"
                            max="100"
                            value={scores.makhraj}
                            onChange={(e) => handleUpdateProficiency(student.id, 'makhraj', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                      </div>

                      {/* Kelancaran Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                          <span>3. Kelancaran (Fashahah Waqf/Ibtida)</span>
                          <span className="font-mono text-blue-600">{scores.fluency}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="50"
                            max="100"
                            value={scores.fluency}
                            onChange={(e) => handleUpdateProficiency(student.id, 'fluency', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                      </div>

                      {/* Fashahah Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                          <span>4. Pelafalan & Lagu (Sifat Huruf)</span>
                          <span className="font-mono text-blue-600">{scores.fashahah}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="50"
                            max="100"
                            value={scores.fashahah}
                            onChange={(e) => handleUpdateProficiency(student.id, 'fashahah', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                      </div>

                      {/* Ghunnah Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                          <span>5. Ghunnah & Dengung</span>
                          <span className="font-mono text-blue-600">{scores.ghunnah}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="50"
                            max="100"
                            value={scores.ghunnah}
                            onChange={(e) => handleUpdateProficiency(student.id, 'ghunnah', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                      </div>

                      {/* Adab Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                          <span>6. Adab, Disiplin & Fokus</span>
                          <span className="font-mono text-blue-600">{scores.adab}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="50"
                            max="100"
                            value={scores.adab}
                            onChange={(e) => handleUpdateProficiency(student.id, 'adab', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback suggestion banner */}
                  <div className="border border-blue-100 bg-blue-50/50 p-4 rounded-sm text-left">
                    <div className="flex items-center gap-2 mb-2 text-blue-900 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-orange-500 shrink-0 animate-pulse" />
                      <span>Rekomendasi Feedback Pembimbing</span>
                    </div>
                    <p className="text-[11px] text-slate-605 text-slate-600 font-medium leading-relaxed font-sans">
                      {scores.fluency < 80 
                        ? 'Siswa memiliki kejelasan tajwid yang bagus namun membutuhkan murajaah rutin 1 lembar sehari untuk menguatkan kelancaran sambung ayat.' 
                        : scores.tajwid < 80
                        ? 'Kelancaran setoran sangat baik. Disarankan ustadz lebih memperhatikan ghunnah tersembunyi dan makhraj huruf istila.'
                        : 'Perfomance setoran Mumtaz! Pertahankan konsistensi setoran dan dorong untuk memulai tadabbur makna ayat.'
                      }
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      <AttendanceHistoryModal
        santri={selectedSantriForHistory}
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          setSelectedSantriForHistory(null);
        }}
      />
    </div>
  );
}
