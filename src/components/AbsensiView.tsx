/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Calendar,
  Search,
  Filter,
  Users,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Save,
  HelpCircle,
  FileCheck,
  ChevronRight,
  ClipboardList,
  X,
  TrendingUp,
  QrCode,
  Smartphone,
  Tv,
  CheckCircle2,
  Lock,
  RefreshCw,
  Video,
  Laptop
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';
import { Santri, Halaqah } from '../types';
import QRScanner from './QRScanner';
import RapidQRScannerModal from './RapidQRScannerModal';

interface AbsensiViewProps {
  santriList: Santri[];
  halaqahList: Halaqah[];
  onAddActivity: (message: string, category: 'Setoran' | 'Absen' | 'Keuangan' | 'Sistem') => void;
}

interface AttendanceState {
  [santriId: string]: {
    status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
    notes: string;
  };
}

interface SavedLog {
  id: string;
  date: string;
  halaqahName: string;
  presentCount: number;
  totalCount: number;
  rate: number;
}

export default function AbsensiView({ santriList, halaqahList, onAddActivity }: AbsensiViewProps) {
  const [selectedHalaqah, setSelectedHalaqah] = useState<string>('Semua');
  const [selectedGender, setSelectedGender] = useState<string>('Semua');
  const [selectedDate, setSelectedDate] = useState<string>('2026-05-26');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mode switcher: 'roster' (standard), 'qrcode' (automated kiosk check-in), or 'weekly_summary' (7-day report)
  const [activeMode, setActiveMode] = useState<'roster' | 'qrcode' | 'weekly_summary'>('roster');
  const [expandedHalaqahReport, setExpandedHalaqahReport] = useState<Record<string, boolean>>({});

  // QR Check-in states
  const [selectedQRHalaqah, setSelectedQRHalaqah] = useState<string>('Semua');
  const [manualNIS, setManualNIS] = useState<string>('');
  const [scanLogs, setScanLogs] = useState<Array<{ id: string, santriName: string, nis: string, halaqah: string, time: string }>>([]);
  const [scanSuccessToast, setScanSuccessToast] = useState<{ name: string, nis: string, halaqah: string, image?: string } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [simulateType, setSimulateType] = useState<'scan' | 'manual'>('scan');
  const [selectedSantriForSim, setSelectedSantriForSim] = useState<string>('');
  const [isRapidScanOpen, setIsRapidScanOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Update current digital clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // crisp high note
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('Web Audio API blocked or unsupported', e);
    }
  };

  const playErrorBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // lower buzz
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn('Web Audio API blocked or unsupported', e);
    }
  };

  const handleStudentCheckIn = (nisOrId: string) => {
    setScanError(null);
    if (!nisOrId) {
      setScanError('Harap tentukan NIS atau pilih Santri terlebih dahulu!');
      playErrorBeep();
      return;
    }

    const santri = santriList.find(s => s.nis === nisOrId || s.id === nisOrId);
    if (!santri) {
      setScanError(`Kartu Santri/NIS "${nisOrId}" tidak ditemukan dalam database.`);
      playErrorBeep();
      return;
    }

    // Validate if student is in target class
    if (selectedQRHalaqah !== 'Semua' && santri.halaqahId !== selectedQRHalaqah) {
      setScanError(`Ditolak: ${santri.name} terdaftar pada ${santri.halaqahName || 'Halaqah lain'}, bukan ${halaqahList.find(h => h.id === selectedQRHalaqah)?.name || 'Halaqah ini'}.`);
      playErrorBeep();
      return;
    }

    const currentStatus = attendance[santri.id]?.status;
    const currentNotes = attendance[santri.id]?.notes;
    if (currentStatus === 'Hadir' && currentNotes && currentNotes.includes('QR Scan')) {
      setScanError(`Duplikat: ${santri.name} sudah melakukan check-in sebelumnya.`);
      playErrorBeep();
      return;
    }

    // Mark as present with dynamic QR time indicator
    const checkedTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setAttendance(prev => ({
      ...prev,
      [santri.id]: {
        status: 'Hadir',
        notes: `Hadir Mandiri via QR Scan (${checkedTime})`
      }
    }));

    // Sync directly to student's live calendar history
    try {
      const historyKey = `pesantren_attendance_history_${santri.id}`;
      const savedHistory = localStorage.getItem(historyKey);
      let historyObj = savedHistory ? JSON.parse(savedHistory) : {};
      historyObj[selectedDate] = {
        status: 'Hadir',
        notes: `Hadir Mandiri via QR Scan (${checkedTime})`
      };
      localStorage.setItem(historyKey, JSON.stringify(historyObj));
    } catch (e) {
      console.warn('Failed to sync check-in to calendar:', e);
    }

    // Trigger double electronic click/beep
    playBeep();

    setScanSuccessToast({
      name: santri.name,
      nis: santri.nis,
      halaqah: santri.halaqahName || 'Lainnya',
      image: santri.gender === 'Ikhwan' ? '👦' : '👧'
    });

    const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setScanLogs(prev => [
      {
        id: `scan_${Date.now()}`,
        santriName: santri.name,
        nis: santri.nis,
        halaqah: santri.halaqahName || 'Lainnya',
        time: timestamp
      },
      ...prev
    ]);

    setManualNIS('');
    setSelectedSantriForSim('');

    // Clear success banner auto-fade
    setTimeout(() => {
      setScanSuccessToast(null);
    }, 4500);
  };
  
  // Initialize student attendance states
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Historical saved attendance logs list with localStorage persistence
  const [savedLogs, setSavedLogs] = useState<SavedLog[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_savedLogs');
      const defaultLogs = [
        { id: 'al_p1', date: '2026-05-20', halaqahName: 'Semua Kelas', presentCount: 28, totalCount: 30, rate: 93 },
        { id: 'al_p2', date: '2026-05-21', halaqahName: 'Semua Kelas', presentCount: 29, totalCount: 30, rate: 97 },
        { id: 'al_p3', date: '2026-05-22', halaqahName: 'Semua Kelas', presentCount: 27, totalCount: 30, rate: 90 },
        { id: 'al_p4', date: '2026-05-23', halaqahName: 'Semua Kelas', presentCount: 30, totalCount: 30, rate: 100 },
        { id: 'al_p5', date: '2026-05-24', halaqahName: 'Semua Kelas', presentCount: 26, totalCount: 30, rate: 87 },
        { id: 'al_1', date: '2026-05-25', halaqahName: 'Halaqah Ikhwan A', presentCount: 9, totalCount: 10, rate: 90 },
        { id: 'al_2', date: '2026-05-25', halaqahName: 'Halaqah Akhwat A', presentCount: 9, totalCount: 9, rate: 100 },
        { id: 'al_3', date: '2026-05-25', halaqahName: 'Halaqah Ikhwan B', presentCount: 10, totalCount: 11, rate: 91 }
      ];
      return saved ? JSON.parse(saved) : defaultLogs;
    } catch {
      return [
        { id: 'al_p1', date: '2026-05-20', halaqahName: 'Semua Kelas', presentCount: 28, totalCount: 30, rate: 93 },
        { id: 'al_p2', date: '2026-05-21', halaqahName: 'Semua Kelas', presentCount: 29, totalCount: 30, rate: 97 },
        { id: 'al_p3', date: '2026-05-22', halaqahName: 'Semua Kelas', presentCount: 27, totalCount: 30, rate: 90 },
        { id: 'al_p4', date: '2026-05-23', halaqahName: 'Semua Kelas', presentCount: 30, totalCount: 30, rate: 100 },
        { id: 'al_p5', date: '2026-05-24', halaqahName: 'Semua Kelas', presentCount: 26, totalCount: 30, rate: 87 },
        { id: 'al_1', date: '2026-05-25', halaqahName: 'Halaqah Ikhwan A', presentCount: 9, totalCount: 10, rate: 90 },
        { id: 'al_2', date: '2026-05-25', halaqahName: 'Halaqah Akhwat A', presentCount: 9, totalCount: 9, rate: 100 },
        { id: 'al_3', date: '2026-05-25', halaqahName: 'Halaqah Ikhwan B', presentCount: 10, totalCount: 11, rate: 91 }
      ];
    }
  });

  useEffect(() => {
    localStorage.setItem('pesantren_savedLogs', JSON.stringify(savedLogs));
  }, [savedLogs]);

  // Aggregating saved logs by date to compute the daily overall attendance rate for the chart
  const getChartData = () => {
    const grouped: { [date: string]: { present: number; total: number } } = {};
    
    savedLogs.forEach((log) => {
      if (!grouped[log.date]) {
        grouped[log.date] = { present: 0, total: 0 };
      }
      grouped[log.date].present += log.presentCount;
      grouped[log.date].total += log.totalCount;
    });

    const data = Object.keys(grouped).map((date) => {
      const g = grouped[date];
      const rate = g.total > 0 ? Math.round((g.present / g.total) * 100) : 0;
      
      const dateParts = date.split('-');
      let label = date;
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[2], 10);
        const monthNum = parseInt(dateParts[1], 10);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        label = `${day} ${months[monthNum - 1] || ''}`;
      }

      return {
        date,
        label,
        rate,
        present: g.present,
        total: g.total
      };
    });

    return data.sort((a, b) => a.date.localeCompare(b.date));
  };

  const [selectedSantriForHistory, setSelectedSantriForHistory] = useState<Santri | null>(null);

  // Helper to generate a deterministic 7-day attendance history based on student ID
  const generate7DayHistory = (santriId: string) => {
    const dates = [
      '2026-05-20',
      '2026-05-21',
      '2026-05-22',
      '2026-05-23',
      '2026-05-24',
      '2026-05-25',
      '2026-05-26'
    ];

    const getSeed = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    };

    const seed = getSeed(santriId);

    return dates.map((date, idx) => {
      const val = (seed + idx * 11) % 15;
      let status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' = 'Hadir';
      let notes = 'Hadir tepat waktu, menyimak dengan khusyuk.';

      if (val === 2) {
        status = 'Izin';
        notes = 'Izin keluarga: Menjenguk keluarga luar kota';
      } else if (val === 5) {
        status = 'Sakit';
        notes = 'Mengalami demam tinggi / flu';
      } else if (val === 11) {
        status = 'Alpa';
        notes = 'Terlambat masuk kelas halaqah tanpa kabar';
      }

      // Sync with today's chosen roster state in real-time if available
      if (date === selectedDate && attendance[santriId]) {
        status = attendance[santriId].status;
        notes = attendance[santriId].notes || (status === 'Hadir' ? 'Hadir tepat waktu' : `Dilaporkan ${status}`);
      }

      return { date, status, notes };
    }).reverse(); // Latest dates first
  };

  // Populate dynamic default attendance states when student list changes, preserving already set states
  useEffect(() => {
    setAttendance((prev) => {
      const updated: AttendanceState = { ...prev };
      santriList.forEach((s) => {
        if (!updated[s.id]) {
          updated[s.id] = {
            status: 'Hadir',
            notes: ''
          };
        }
      });
      return updated;
    });
  }, [santriList]);

  // Modify direct status
  const handleStatusChange = (santriId: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa') => {
    setAttendance((prev) => ({
      ...prev,
      [santriId]: {
        ...prev[santriId],
        status
      }
    }));

    try {
      const historyKey = `pesantren_attendance_history_${santriId}`;
      const savedHistory = localStorage.getItem(historyKey);
      let historyObj = savedHistory ? JSON.parse(savedHistory) : {};
      historyObj[selectedDate] = {
        status,
        notes: `Diperbarui manual oleh pembimbing kelas`
      };
      localStorage.setItem(historyKey, JSON.stringify(historyObj));
    } catch (e) {
      console.warn('Failed to sync status change to calendar:', e);
    }
  };

  // Modify notes
  const handleNoteChange = (santriId: string, notes: string) => {
    setAttendance((prev) => ({
      ...prev,
      [santriId]: {
        ...prev[santriId],
        notes
      }
    }));
  };

  // Mark all filtered students as Present
  const handleMarkAllPresent = () => {
    const updated = { ...attendance };
    const filtered = getFilteredStudents();
    filtered.forEach((s) => {
      updated[s.id] = {
        ...updated[s.id],
        status: 'Hadir'
      };

      try {
        const historyKey = `pesantren_attendance_history_${s.id}`;
        const savedHistory = localStorage.getItem(historyKey);
        let historyObj = savedHistory ? JSON.parse(savedHistory) : {};
        historyObj[selectedDate] = {
          status: 'Hadir',
          notes: 'Ditandai Hadir Berjamaah KBM'
        };
        localStorage.setItem(historyKey, JSON.stringify(historyObj));
      } catch (e) {
        console.warn('Failed to sync mark all present:', e);
      }
    });
    setAttendance(updated);
    
    setSuccessMsg('Seluruh santri terpilih ditandai HADIR!');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  // Filter strategy
  const getFilteredStudents = () => {
    return santriList.filter((s) => {
      const matchesHalaqah = selectedHalaqah === 'Semua' || s.halaqahId === selectedHalaqah;
      const matchesGender = selectedGender === 'Semua' || s.gender === selectedGender;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.nis.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesHalaqah && matchesGender && matchesSearch;
    });
  };

  const filteredStudents = getFilteredStudents();

  // Compute stats on-the-fly for filtered roster
  const stats = filteredStudents.reduce(
    (acc, s) => {
      const state = attendance[s.id] || { status: 'Hadir', notes: '' };
      acc[state.status] += 1;
      return acc;
    },
    { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0 }
  );

  const totalFiltered = filteredStudents.length;
  const attendanceRate = totalFiltered > 0 ? Math.round((stats.Hadir / totalFiltered) * 100) : 0;

  // Handle Form Submit (Lock entry)
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalFiltered === 0) return;

    const halaqahLabel = selectedHalaqah === 'Semua' ? 'Seluruh Halaqah' : halaqahList.find(h => h.id === selectedHalaqah)?.name || 'Halaqah';
    
    // Log target activity
    const summaryMsg = `Absen ${halaqahLabel}: ${stats.Hadir} Hadir, ${stats.Izin} Izin, ${stats.Sakit} Sakit, ${stats.Alpa} Alpa (Tingkat Kehadiran: ${attendanceRate}%)`;
    onAddActivity(summaryMsg, 'Absen');

    // Add into logs list
    const newLog: SavedLog = {
      id: `al_${Date.now()}`,
      date: selectedDate,
      halaqahName: halaqahLabel,
      presentCount: stats.Hadir,
      totalCount: totalFiltered,
      rate: attendanceRate
    };

    setSavedLogs((prev) => [newLog, ...prev]);

    setSuccessMsg(`Data Absensi ${halaqahLabel} tanggal ${selectedDate} sukses direkam & disinkronisasikan ke asrama center.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">Presensi & Kedisiplinan Santri</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Sistem perekaman absensi harian, ketidakhadiran syar'i (izin/sakit), maupun ketidakhadiran tanpa keterangan (alpa)</p>
        </div>
        <div className="flex items-center gap-2">
          {activeMode === 'roster' && (
            <>
              <button
                type="button"
                onClick={() => setIsRapidScanOpen(true)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-sm border border-sky-700 shadow-sm flex items-center gap-2 transition cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-white" />
                <span>Scan QR Cepat</span>
              </button>
              <button
                onClick={handleMarkAllPresent}
                disabled={totalFiltered === 0}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-sm border border-slate-200 shadow-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Tandai Hadir Semua</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Elegant Nav Pills for Roster vs QR Check-in vs Weekly Summary */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-sm shadow-sm gap-1">
        <button
          type="button"
          onClick={() => setActiveMode('roster')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-sm cursor-pointer ${
            activeMode === 'roster'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-500" />
          <span>Roster Absensi Manual</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('qrcode')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-sm cursor-pointer ${
            activeMode === 'qrcode'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50'
          }`}
        >
          <QrCode className="w-4 h-4 text-sky-500" />
          <span>QR Code & Check-in Mandiri</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('weekly_summary')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-sm cursor-pointer ${
            activeMode === 'weekly_summary'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <span>Ringkasan Mingguan</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-sm text-left text-xs font-bold uppercase tracking-tight animate-in fade-in duration-100 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {activeMode === 'roster' && (
        <>
          {/* 2. Top Stats Widget Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Roster */}
        <div className="p-4 bg-white border border-slate-200 rounded-sm text-left shadow-sm">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Santri Terfilter</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 leading-none">{totalFiltered}</span>
            <span className="text-xs text-slate-400 font-bold font-mono">anak</span>
          </div>
        </div>

        {/* Present (Hadir) */}
        <div className="p-4 bg-white border border-slate-200 border-l-4 border-l-emerald-500 rounded-sm text-left shadow-sm">
          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Hadir</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-700 leading-none">{stats.Hadir}</span>
            <span className="text-[10px] text-emerald-500 font-bold font-mono">
              ({totalFiltered > 0 ? Math.round((stats.Hadir / totalFiltered) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Izin */}
        <div className="p-4 bg-white border border-slate-200 border-l-4 border-l-blue-500 rounded-sm text-left shadow-sm">
          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Izin</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-blue-700 leading-none">{stats.Izin}</span>
            <span className="text-[10px] text-blue-500 font-bold font-mono">
              ({totalFiltered > 0 ? Math.round((stats.Izin / totalFiltered) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Sakit */}
        <div className="p-4 bg-white border border-slate-200 border-l-4 border-l-amber-500 rounded-sm text-left shadow-sm">
          <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Sakit</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-700 leading-none">{stats.Sakit}</span>
            <span className="text-[10px] text-amber-500 font-bold font-mono">
              ({totalFiltered > 0 ? Math.round((stats.Sakit / totalFiltered) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Alpa */}
        <div className="p-4 bg-white border border-slate-200 border-l-4 border-l-rose-500 rounded-sm text-left shadow-sm col-span-2 md:col-span-1">
          <p className="text-[9px] font-bold text-rose-600 uppercase tracking-wider">Alpa (Absen)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-rose-700 leading-none">{stats.Alpa}</span>
            <span className="text-[10px] text-rose-500 font-bold font-mono">
              ({totalFiltered > 0 ? Math.round((stats.Alpa / totalFiltered) * 100) : 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filters panel Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-sm border border-slate-200 shadow-sm text-left">
        {/* Date Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Tanggal Presensi</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-1.5 text-xs font-bold focus:bg-white focus:outline-none"
          />
        </div>

        {/* Halaqah filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Halaqah Kelas</label>
          <select
            value={selectedHalaqah}
            onChange={(e) => setSelectedHalaqah(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2.5 py-1.5 text-xs font-bold focus:bg-white focus:outline-none"
          >
            <option value="Semua">Semua Rombel Halaqah</option>
            {halaqahList.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.mentor})
              </option>
            ))}
          </select>
        </div>

        {/* Gender filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sektor Santri</label>
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2.5 py-1.5 text-xs font-bold focus:bg-white focus:outline-none"
          >
            <option value="Semua">Semua (Ikhwan & Akhwat)</option>
            <option value="Ikhwan">Khusus Ikhwan (Putra)</option>
            <option value="Akhwat">Khusus Akhwat (Putri)</option>
          </select>
        </div>

        {/* Search bar */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cari Nama / NIS</label>
          <div className="relative">
            <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Ketik kata kunci pencarian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-8 pr-3 py-1.5 text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Progress tracking gauge */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm shadow-inner text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Present Rate Gauge</span>
          <h4 className="text-sm font-extrabold text-slate-800">
            Rasio Kehadiran Terkini: <span className="text-blue-600 font-mono">{attendanceRate}%</span>
          </h4>
        </div>
        <div className="flex-1 max-w-sm w-full h-3 bg-slate-200 rounded-none overflow-hidden border border-slate-300">
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${attendanceRate}%` }} />
        </div>
      </div>

      {/* Main Roster Layout Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table/Roster (Col span 8) */}
        <form onSubmit={handleSaveAttendance} className="lg:col-span-8 bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden text-left">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Roster Absensi Santri</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Ubah status presensi masing-masing santri di bawah</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider bg-slate-100 border px-2 py-0.5 rounded-sm">
              {filteredStudents.length} Santri Terpilih
            </span>
          </div>

          <div className="overflow-x-auto">
            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold uppercase">Santri Tidak Ditemukan</p>
                <p className="text-[11px] text-slate-400 leading-normal">Sesuaikan parameter filter di atas atau ubah teks kata kunci pencarian Anda.</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none text-left">
                    <th className="py-3 px-4">Nama Santri (NIS)</th>
                    <th className="py-3 px-4">Halaqah</th>
                    <th className="py-3 px-4 text-center">Status Kehadiran</th>
                    <th className="py-3 px-4">Catatan Khusus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((santri) => {
                    const statusState = attendance[santri.id] || { status: 'Hadir', notes: '' };
                    return (
                      <tr key={santri.id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="py-3 px-4 font-medium">
                          <button
                            type="button"
                            onClick={() => setSelectedSantriForHistory(santri)}
                            className="text-left group cursor-pointer focus:outline-none block w-full focus:ring-1 focus:ring-blue-100 p-0.5 rounded-sm"
                          >
                            <div className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight flex items-center gap-1.5">
                              <span>{santri.name}</span>
                              <span className="text-[8px] bg-blue-50 border border-blue-200 text-blue-700 font-mono px-1 py-0.2 select-none opacity-0 group-hover:opacity-100 transition duration-150 rounded-xs">
                                RIWAYAT
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono group-hover:text-slate-500 transition-colors">
                              {santri.nis} • {santri.gender} <span className="text-blue-500 underline group-hover:text-blue-600 font-sans ml-1 text-[9px] font-bold">Detail →</span>
                            </div>
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200 font-bold uppercase text-[9px] text-slate-700 tracking-wider">
                            {santri.halaqahName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* HADIR */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(santri.id, 'Hadir')}
                              className={`w-12 py-1 text-[10px] font-bold rounded-sm border transition-all uppercase ${
                                statusState.status === 'Hadir'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                                  : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              Hadir
                            </button>

                            {/* IZIN */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(santri.id, 'Izin')}
                              className={`w-12 py-1 text-[10px] font-bold rounded-sm border transition-all uppercase ${
                                statusState.status === 'Izin'
                                  ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                                  : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              Izin
                            </button>

                            {/* SAKIT */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(santri.id, 'Sakit')}
                              className={`w-12 py-1 text-[10px] font-bold rounded-sm border transition-all uppercase ${
                                statusState.status === 'Sakit'
                                  ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm'
                                  : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              Sakit
                            </button>

                            {/* ALPA */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(santri.id, 'Alpa')}
                              className={`w-12 py-1 text-[10px] font-bold rounded-sm border transition-all uppercase ${
                                statusState.status === 'Alpa'
                                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
                                  : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              Alpa
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Ketik alasan jika sakit/izin..."
                            value={statusState.notes}
                            onChange={(e) => handleNoteChange(santri.id, e.target.value)}
                            className="w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-sm px-2 py-1 text-[11px] focus:outline-none focus:bg-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Form Actions footer */}
          <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-slate-300" />
              <span>Pastikan data riil sesuai kondisi fisik santri.</span>
            </span>
            <button
              type="submit"
              disabled={filteredStudents.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-sm border border-blue-700 shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Kunci Absensi</span>
            </button>
          </div>
        </form>

        {/* Saved Daily Logs Panel (Col span 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Recharts Weekly Trend Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-indigo-50 text-indigo-650 border border-indigo-200 rounded-sm">
                <TrendingUp className="w-4 h-4 text-indigo-650" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Tren Kehadiran Mingguan</h4>
                <p className="text-[10px] text-slate-400">Grafik perkembangan tingkat kehadiran santri</p>
              </div>
            </div>

            <div className="h-44 w-full mt-2 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={getChartData()}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                    style={{ fontSize: '9px', fontWeight: 'bold', fontFamily: 'monospace' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                    tickFormatter={(v) => `${v}%`}
                    style={{ fontSize: '9px', fontWeight: 'bold', fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-sm shadow-xl border border-slate-800 text-[10px] font-sans">
                            <p className="font-bold text-slate-300 mb-1">{data.date}</p>
                            <div className="space-y-0.5">
                              <p className="font-black text-blue-400">Kehadiran: {data.rate}%</p>
                              <p className="text-slate-400 text-[9px]">Hadir: {data.present} / {data.total} Santri</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-sm">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Riwayat Log Harian</h4>
                <p className="text-[10px] text-slate-400">Daftar kelas yang absensinya telah dikunci</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {savedLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-sm hover:bg-slate-100/60 transition duration-150">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">{log.date}</span>
                      <h5 className="font-extrabold text-xs text-slate-900 uppercase mt-0.5 tracking-tight">{log.halaqahName}</h5>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border uppercase font-mono ${
                      log.rate >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {log.rate}% Hadir
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium font-sans">
                    <span>Hadir: {log.presentCount} / {log.totalCount} Santri</span>
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Terverifikasi</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[9px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Pusat Integrasi Asrama v1.0.4</span>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {activeMode === 'qrcode' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          {/* PEMINDAI KARTU PRESENSI (SCANNER KIOSK) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">KIOSK SCANNER AKTIF EN-AIR</span>
                  </div>
                  <span className="text-[10px] text-sky-600 font-bold bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-sm font-mono">
                    AUTOPILOT MODE
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">PEMINDAI KARTU PRESENSI KIOSK INTERAKTIF</h3>
                <p className="text-[10.5px] text-slate-400 mt-0.5 font-medium">Dekatkan barcode atau QR-Code kartu santri pada kamera atau pemindai hardware</p>
                
                <div className="h-[1px] bg-slate-100 my-4"></div>
              </div>

              {/* Live QR Code Scanner Component */}
              <div className="p-1">
                <QRScanner 
                  onScanSuccess={(code) => {
                    handleStudentCheckIn(code.trim());
                  }}
                  onScanFailure={(msg) => {
                    // Failures happen often during camera movement, so keep it in debug logs
                    console.debug('QR Scan detail:', msg);
                  }}
                />
              </div>

              {/* Toast response feedback nested in frame */}
              <div className="mt-4">
                {scanSuccessToast && (
                  <div className="p-3 bg-emerald-50 text-emerald-850 border border-emerald-200 rounded-sm text-left flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-150">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{scanSuccessToast.image}</span>
                      <div>
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-mono">CHECK-IN SUKSES (HADIR)</div>
                        <p className="text-xs font-black text-slate-900 uppercase mt-0.5 tracking-tight">{scanSuccessToast.name}</p>
                        <p className="text-[9.5px] text-slate-500 font-mono">NIS: {scanSuccessToast.nis} • {scanSuccessToast.halaqah}</p>
                      </div>
                    </div>
                    <span className="p-1 px-2 text-[10px] bg-emerald-600 text-white font-mono font-bold uppercase rounded-sm">BERHASIL</span>
                  </div>
                )}

                {scanError && (
                  <div className="p-3 bg-rose-50 text-rose-850 border border-rose-200 rounded-sm text-left flex items-center gap-2.5 animate-in shake duration-200">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider font-mono">KESALAHAN PEMINDAIAN</div>
                      <p className="text-[11px] font-bold text-slate-900 mt-0.5">{scanError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Sandbox Simulator Panel */}
            <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">SIMULATOR SCAN KARTU</h4>
                  <p className="text-[10px] text-slate-400 font-medium font-sans">Simulasikan penempelan fisik barcode kartu / NIS santri</p>
                </div>
                <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 border rounded-sm">
                  <button
                    type="button"
                    onClick={() => setSimulateType('scan')}
                    className={`px-2 py-1 text-[9px] font-bold rounded-xs transition-colors uppercase cursor-pointer ${
                      simulateType === 'scan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Daftar List
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulateType('manual')}
                    className={`px-2 py-1 text-[9px] font-bold rounded-xs transition-colors uppercase cursor-pointer ${
                      simulateType === 'manual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Input NIS
                  </button>
                </div>
              </div>

              {/* Filter halaqah for simulator list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Batasi Kelas Scanner Kiosk</label>
                  <select
                    value={selectedQRHalaqah}
                    onChange={(e) => setSelectedQRHalaqah(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2.5 py-1 text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="Semua">Kiosk Terbuka (Semua Halaqah)</option>
                    {halaqahList.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {simulateType === 'scan' ? (
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Santri yang Menempelkan Kartu</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedSantriForSim}
                      onChange={(e) => setSelectedSantriForSim(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-sm px-2.5 py-1.5 text-xs font-bold focus:bg-white focus:outline-none"
                    >
                      <option value="">-- Hubungkan Kartu Santri --</option>
                      {santriList
                        .filter(s => selectedQRHalaqah === 'Semua' || s.halaqahId === selectedQRHalaqah)
                        .map(s => (
                          <option key={s.id} value={s.nis}>
                            {s.name} ({s.nis} - {s.halaqahName})
                          </option>
                        ))
                      }
                    </select>
                    <button
                      type="button"
                      onClick={() => handleStudentCheckIn(selectedSantriForSim)}
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-sm border border-sky-700 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tempel Kartu</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Masukkan Kode NIS Manual</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Contoh: 26001, 26002..."
                      value={manualNIS}
                      onChange={(e) => setManualNIS(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleStudentCheckIn(manualNIS);
                        }
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-sm px-2.5 py-1.5 text-xs font-mono font-bold focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleStudentCheckIn(manualNIS)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-sm border border-slate-950 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Laptop className="w-3.5 h-3.5 text-slate-400" />
                      <span>Input NIS</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            {/* Realtime desk-clock and summary widget */}
            <div className="bg-slate-900 border border-slate-950 p-5 rounded-sm shadow-xl text-left text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-5 pointer-events-none">
                <QrCode className="w-48 h-48" />
              </div>
              
              <span className="text-[8px] font-bold bg-white/10 border border-white/20 text-sky-300 px-2 py-0.5 rounded-sm font-mono tracking-widest uppercase">
                JAM KIOSK UTAMA
              </span>
              
              <div className="mt-2.5">
                <div className="text-3xl font-black font-mono tracking-wider animate-pulse select-none">
                  {currentTime}
                </div>
                <p className="text-[10px] text-slate-400 font-medium font-sans mt-0.5">Rabu, 27 Mei 2026 • WIB</p>
              </div>

              <div className="h-[1px] bg-slate-800 my-4"></div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans">Mandiri Scan</p>
                  <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{scanLogs.length} <span className="text-xs font-sans text-slate-500">kali</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans">Koneksi Hardware</p>
                  <p className="text-[10.5px] font-extrabold text-[#10b981] mt-1 uppercase flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>STANDBY</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Riwayat Scan Real-time queue list */}
            <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight font-sans">LOG PEMINDAIAN LIVE</h4>
                  <p className="text-[9.5px] text-slate-400 font-sans font-medium">Arus rekaman kehadiran langsung mandiri</p>
                </div>
                <span className="p-1 text-[9px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-sm font-mono">
                  {scanLogs.length} LOG
                </span>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {scanLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 bg-slate-50 rounded-sm space-y-1.5 font-sans">
                    <RefreshCw className="w-5 h-5 text-slate-300 mx-auto animate-spin" />
                    <p className="text-xs font-bold text-slate-600">Sistem Menunggu Scan...</p>
                    <p className="text-[10px] text-slate-400 leading-normal">Tempelkan barcode/QR atau kartu santri untuk memulai pencatatan.</p>
                  </div>
                ) : (
                  scanLogs.map((log) => (
                    <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-between gap-3 animate-in fade-in duration-150">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 uppercase truncate tracking-tight">{log.santriName}</p>
                        <p className="text-[9.5px] text-slate-500 truncate mt-0.5">
                          NIS: {log.nis} • {log.halaqah}
                        </p>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-sm shrink-0">
                        {log.time}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMode === 'weekly_summary' && (() => {
        const weeklyDates = [
          '2026-05-20',
          '2026-05-21',
          '2026-05-22',
          '2026-05-23',
          '2026-05-24',
          '2026-05-25',
          '2026-05-26'
        ];

        // Filter halaqahs based on general layout filters (gender, search)
        const matchedHalaqahs = halaqahList.filter(h => {
          const matchesGender = selectedGender === 'Semua' || h.gender === selectedGender;
          const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                h.mentor.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesGender && matchesSearch;
        });

        // Map halaqah summary
        const reports = matchedHalaqahs.map(h => {
          const students = santriList.filter(s => s.halaqahId === h.id);
          let hadir = 0;
          let izin = 0;
          let sakit = 0;
          let alpa = 0;

          const studentAbsDetails: Array<{
            studentId: string;
            studentName: string;
            date: string;
            status: 'Izin' | 'Sakit' | 'Alpa';
            notes: string;
          }> = [];

          students.forEach(student => {
            const hist = generate7DayHistory(student.id);
            hist.forEach(day => {
              if (day.status === 'Hadir') {
                hadir++;
              } else {
                if (day.status === 'Izin') izin++;
                else if (day.status === 'Sakit') sakit++;
                else if (day.status === 'Alpa') alpa++;

                studentAbsDetails.push({
                  studentId: student.id,
                  studentName: student.name,
                  date: day.date,
                  status: day.status as 'Izin' | 'Sakit' | 'Alpa',
                  notes: day.notes
                });
              }
            });
          });

          const totalSesi = hadir + izin + sakit + alpa;
          const rate = totalSesi > 0 
            ? Math.round((hadir / totalSesi) * 100)
            : 100;

          return {
            ...h,
            stats: { hadir, izin, sakit, alpa },
            totalSesi,
            rate,
            studentAbsDetails
          };
        });

        // Grand totals across matched halaqah reports
        let totalHadirAll = 0;
        let totalIzinAll = 0;
        let totalSakitAll = 0;
        let totalAlpaAll = 0;

        reports.forEach(r => {
          totalHadirAll += r.stats.hadir;
          totalIzinAll += r.stats.izin;
          totalSakitAll += r.stats.sakit;
          totalAlpaAll += r.stats.alpa;
        });

        const grandAllSesi = totalHadirAll + totalIzinAll + totalSakitAll + totalAlpaAll;
        const cumulativeRate = grandAllSesi > 0 ? Math.round((totalHadirAll / grandAllSesi) * 100) : 100;

        // Best and lowest attendance halaqah
        const sortedHalaqahs = [...reports].sort((a, b) => b.rate - a.rate);
        const bestHalaqah = sortedHalaqahs[0] || null;
        const worstHalaqah = sortedHalaqahs[sortedHalaqahs.length - 1] || null;

        // Recharts stacked horizontal bar data format
        const chartData = reports.map(r => ({
          name: r.name,
          'Hadir (%)': Math.round((r.stats.hadir / (r.totalSesi || 1)) * 100),
          'Izin (%)': Math.round((r.stats.izin / (r.totalSesi || 1)) * 100),
          'Sakit (%)': Math.round((r.stats.sakit / (r.totalSesi || 1)) * 100),
          'Alpa (%)': Math.round((r.stats.alpa / (r.totalSesi || 1)) * 100)
        }));

        const toggleDetails = (id: string) => {
          setExpandedHalaqahReport(prev => ({
            ...prev,
            [id]: !prev[id]
          }));
        };

        return (
          <div className="space-y-6 animate-in fade-in duration-200 text-left">
            
            {/* Filter Indicator Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3 bg-indigo-50 dark:bg-slate-800/40 border border-indigo-150 dark:border-slate-800 p-4 rounded-sm shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-sm shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200 uppercase">Rentang Laporan Kehadiran Mingguan</h4>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium font-mono mt-0.5">20 MEI 2026 - 26 MEI 2026 (7 Hari KBM Terakhir)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 px-2 py-1 rounded-sm">
                    {reports.length} Halaqah Terfilter
                  </span>
                </div>
              </div>
            </div>

            {/* Total Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-xs border-t-4 border-t-emerald-500">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Present Rate Mingguan</p>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-3xl font-black text-slate-900 leading-none">{cumulativeRate}%</span>
                  <span className="text-[10px] text-emerald-600 font-bold font-mono">Sangat Baik</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-xs border-t-4 border-t-sky-500">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Masa Izin Santri</p>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-3xl font-black text-slate-900 leading-none">{totalIzinAll}</span>
                  <span className="text-[10px] text-slate-400 font-bold font-sans">kali izin</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-xs border-t-4 border-t-amber-500">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Masa Sakit Santri</p>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-3xl font-black text-slate-900 leading-none">{totalSakitAll}</span>
                  <span className="text-[10px] text-slate-400 font-bold font-sans">kali sakit</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-xs border-t-4 border-t-rose-500">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Pelanggaran Alpa</p>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-3xl font-black text-slate-900 leading-none">{totalAlpaAll}</span>
                  <span className="text-[10px] text-rose-500 font-bold font-sans">tanpa kabar</span>
                </div>
              </div>
            </div>

            {/* Charts Panel & Dynamic Advice */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Recharts Bar Chart Compare (7 columns) */}
              <div className="lg:col-span-12 xl:col-span-7 bg-white border border-slate-200 p-6 rounded-sm shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Perbandingan Distribusi Kehadiran Per Halaqah</h3>
                  <p className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">ANGKA PERSENTASE DEVIASI MINGGUAN</p>
                </div>

                <div className="h-56 w-full mt-4 text-[10px]">
                  {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 border border-dashed rounded-sm">
                      Tidak ada data grafik yang sesuai filter
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} style={{ fontSize: '9px', fontWeight: 'bold' }} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} style={{ fontSize: '9px', fontWeight: 'bold' }} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Rasio']} />
                        <Legend wrapperStyle={{ fontSize: '9.5px', marginTop: '10px' }} />
                        <Bar dataKey="Hadir (%)" stackId="a" fill="#10b981" />
                        <Bar dataKey="Izin (%)" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="Sakit (%)" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="Alpa (%)" stackId="a" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Dynamic Insights & Executive Recommendations (5 columns) */}
              <div className="lg:col-span-12 xl:col-span-5 bg-white border border-slate-200 p-6 rounded-sm shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Rekomendasi Pembinaan & Disiplin</h3>
                  <p className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">SISTEM MONITOR EVALUASI KBM</p>
                </div>

                <div className="space-y-4 my-4 flex-1">
                  
                  {/* Insight 1: Best Halaqah */}
                  {bestHalaqah && (
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/50 rounded-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] bg-emerald-600 text-white font-bold font-mono px-1.5 py-0.2 rounded-xs uppercase">TERBAIK</span>
                        <h4 className="text-xs font-extrabold text-emerald-950 dark:text-emerald-400 truncate">{bestHalaqah.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Memiliki tingkat kehadiran tertinggi yaitu <strong className="text-emerald-600">{bestHalaqah.rate}%</strong> dibina oleh Ustadz/Ustadzah <strong>{bestHalaqah.mentor}</strong>. Berikan apresiasi kepada kelas ini.
                      </p>
                    </div>
                  )}

                  {/* Insight 2: Evaluasi Absensi */}
                  {worstHalaqah && worstHalaqah.rate < 90 ? (
                    <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-950/50 rounded-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] bg-rose-600 text-white font-bold font-mono px-1.5 py-0.2 rounded-xs uppercase">EVALUASI</span>
                        <h4 className="text-xs font-extrabold text-rose-950 dark:text-rose-400 truncate">{worstHalaqah.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Memiliki tingkat kehadiran terendah <strong className="text-rose-600 font-mono">{worstHalaqah.rate}%</strong> dengan total ketidakhadiran sebanyak <strong>{worstHalaqah.stats.izin + worstHalaqah.stats.sakit + worstHalaqah.stats.alpa}</strong> santri-sesi. Perlu pembinaan intensif dari Musyrif.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-950/55 rounded-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] bg-sky-600 text-white font-bold font-mono px-1.5 py-0.2 rounded-xs uppercase">STABIL</span>
                        <h4 className="text-xs font-extrabold text-sky-950 dark:text-sky-400">Seluruh Halaqah Aman</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Tingkat kehadiran semua rombel berada di atas standar aman ({">"}90%). Teruskan pengawasan harian via Kiosk Scanner.
                      </p>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-sm border border-slate-200 dark:border-slate-800">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Catatan Dewan Pembina:</p>
                    <p className="mt-1 leading-relaxed">
                      Sifat kehadiran yang bersumber dari simulasi 7-hari terpadu sudah dikompilasi dari history log masing-masing santri yang disimpan di LocalStorage browser.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* List breakdown cards */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-850 pb-2">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase">Daftar Rincian Kehadiran Per Halaqah</h4>
                <p className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">DETAIL DOSSIER & ALASAN KETIDAKHADIRAN MINGGUAN</p>
              </div>

              {reports.length === 0 ? (
                <div className="p-12 text-center text-slate-400 uppercase font-black text-xs border border-dashed rounded-sm bg-slate-50/50">
                  Tidak ada kelas halaqah yang cocok dengan filter pencarian
                </div>
              ) : (
                reports.map((hr) => {
                  const isExpanded = !!expandedHalaqahReport[hr.id];
                  let textColor = 'text-emerald-700';
                  let ringBorder = 'border-emerald-200 dark:border-slate-800';
                  let bgTag = 'bg-emerald-50 dark:bg-slate-800/30';

                  if (hr.rate < 90 && hr.rate >= 80) {
                    textColor = 'text-blue-700 dark:text-blue-400';
                    ringBorder = 'border-blue-200 dark:border-slate-800';
                    bgTag = 'bg-blue-50 dark:bg-slate-800/30';
                  } else if (hr.rate < 80) {
                    textColor = 'text-rose-700 dark:text-rose-400';
                    ringBorder = 'border-rose-200 dark:border-slate-800';
                    bgTag = 'bg-rose-50 dark:bg-slate-800/30';
                  }

                  return (
                    <div key={hr.id} className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
                      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/45 dark:bg-slate-900/10 hover:bg-slate-100/50 transition-colors">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9.5px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                              {hr.gender === 'Ikhwan' ? 'Putra / Ikhwan' : 'Putri / Akhwat'}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{hr.name}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 font-sans font-medium">
                            Ustadz Pengampu: <strong className="text-slate-700">{hr.mentor}</strong> • Siswa aktif: <strong>{hr.totalStudents} Santri</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                          <div className="flex gap-1.5 text-[9.5px] font-bold font-mono">
                            <div className="p-1 px-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/20 rounded-sm">
                              {hr.stats.hadir} Hadir
                            </div>
                            <div className="p-1 px-2 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-150 dark:border-blue-950/20 rounded-sm">
                              {hr.stats.izin} Izn
                            </div>
                            <div className="p-1 px-2 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-150 dark:border-amber-950/20 rounded-sm">
                              {hr.stats.sakit} Skt
                            </div>
                            <div className="p-1 px-2 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-150 dark:border-rose-950/20 rounded-sm">
                              {hr.stats.alpa} Alp
                            </div>
                          </div>

                          <div className={`p-2 px-3 rounded-sm border uppercase font-mono font-black text-center text-xs ${bgTag} ${textColor} ${ringBorder} flex items-center gap-2`}>
                            <span className="text-[9px] text-slate-400 font-extrabold">RASIO:</span>
                            <span>{hr.rate}%</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleDetails(hr.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-sm transition flex items-center justify-center gap-1 cursor-pointer text-[10.5px] font-bold font-sans"
                          >
                            <span>{isExpanded ? 'Tutup' : 'Rincian'}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-150 ${isExpanded ? 'rotate-90 text-slate-900' : 'text-slate-400'}`} />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-200 dark:border-slate-800 bg-white p-4 sm:p-5 text-left">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center justify-between border-b dark:border-slate-850 pb-2">
                            <span>Daftar Ketidakhadiran {hr.name} (7 Hari Terjalin)</span>
                            <span className="font-mono bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.2 rounded-sm text-[9px]">
                              {hr.studentAbsDetails.length} Riwayat Tidak Hadir
                            </span>
                          </div>

                          {hr.studentAbsDetails.length === 0 ? (
                            <div className="p-8 text-center text-emerald-600 space-y-1">
                              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                              <p className="text-xs font-black uppercase">Sempurna sepanjang minggu!</p>
                              <p className="text-[11px] text-slate-400 leading-normal">Seluruh santri terhitung hadir 100% pada semua jadwal halaqah.</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-[11px] font-sans">
                                <thead>
                                  <tr className="bg-slate-50 text-[9px] text-slate-400 font-black uppercase tracking-wider border-b dark:border-slate-850 select-none">
                                    <th className="py-2 px-3 text-left">Tanggal</th>
                                    <th className="py-2 px-3 text-left">Nama Santri</th>
                                    <th className="py-2 px-3 text-left">Status</th>
                                    <th className="py-2 px-3 text-left">Sebab / Catatan Absensi</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                  {hr.studentAbsDetails.map((abs, actIdx) => {
                                    let statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
                                    if (abs.status === 'Sakit') statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
                                    else if (abs.status === 'Alpa') statusColor = 'bg-rose-50 text-rose-700 border-rose-200';

                                    return (
                                      <tr key={actIdx} className="hover:bg-slate-50/50">
                                        <td className="py-2.5 px-3 font-mono text-slate-400 font-bold">{abs.date}</td>
                                        <td className="py-2.5 px-3 font-extrabold text-slate-900 uppercase">{abs.studentName}</td>
                                        <td className="py-2.5 px-3">
                                          <span className={`text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 border rounded-xs ${statusColor}`}>
                                            {abs.status}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-650 font-medium italic">{abs.notes || 'Tanpa keterangan tambahan'}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })()}

      {/* Student 7-day Attendance Profile Modal */}
      {selectedSantriForHistory && (() => {
        const history = generate7DayHistory(selectedSantriForHistory.id);
        const totals = history.reduce((acc, h) => {
          acc[h.status] += 1;
          return acc;
        }, { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0 });
        const rate = Math.round((totals.Hadir / 7) * 100);

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
            <div className="bg-white rounded-sm w-full max-w-lg shadow-2xl border border-slate-350 overflow-hidden text-left flex flex-col">
              {/* Modal Head */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <span className="text-[9px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-xs font-bold uppercase tracking-wider font-mono">
                    Profil Kedisiplinan
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight mt-1">
                    {selectedSantriForHistory.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">
                    NIS: {selectedSantriForHistory.nis} • {selectedSantriForHistory.halaqahName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSantriForHistory(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-sm border border-slate-200 cursor-pointer focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                {/* 7-day Highlight rate card */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Rasio Kehadiran 7 Hari Terakhir</span>
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <span className="text-blue-600 font-mono">{rate}%</span>
                      <span className="text-xs text-slate-400 font-semibold font-sans">({totals.Hadir} dari 7 hari)</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold">
                    <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-emerald-700 uppercase tracking-tight">Cukup Baik</span>
                  </div>
                </div>

                {/* Counter row */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-sm">
                    <div className="font-extrabold text-emerald-700 text-sm leading-tight">{totals.Hadir}</div>
                    <div className="text-[9px] text-emerald-500 uppercase tracking-wider font-mono font-bold mt-0.5">Hadir</div>
                  </div>
                  <div className="p-2 bg-blue-50 border border-blue-100 rounded-sm">
                    <div className="font-extrabold text-blue-700 text-sm leading-tight">{totals.Izin}</div>
                    <div className="text-[9px] text-blue-500 uppercase tracking-wider font-mono font-bold mt-0.5">Izin</div>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-100 rounded-sm">
                    <div className="font-extrabold text-amber-700 text-sm leading-tight">{totals.Sakit}</div>
                    <div className="text-[9px] text-amber-500 uppercase tracking-wider font-mono font-bold mt-0.5">Sakit</div>
                  </div>
                  <div className="p-2 bg-rose-50 border border-rose-100 rounded-sm">
                    <div className="font-extrabold text-rose-700 text-sm leading-tight">{totals.Alpa}</div>
                    <div className="text-[9px] text-rose-500 uppercase tracking-wider font-mono font-bold mt-0.5">Alpa</div>
                  </div>
                </div>

                {/* Timeline title */}
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Log Detail Keaktifan (7 Hari Terakhir)</span>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="space-y-3 relative pl-4 border-l-2 border-slate-200">
                    {history.map((day, idx) => {
                      const badgeStyles = 
                        day.status === 'Hadir' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        day.status === 'Izin' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        day.status === 'Sakit' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200';

                      return (
                        <div key={idx} className="relative text-xs text-left pb-1">
                          {/* Timeline dot marker */}
                          <div className={`absolute -left-[22px] top-1.5 w-2 h-2 rounded-full border border-white ${
                            day.status === 'Hadir' ? 'bg-emerald-500' :
                            day.status === 'Izin' ? 'bg-blue-500' :
                            day.status === 'Sakit' ? 'bg-amber-450 bg-amber-500' :
                            'bg-rose-500'
                          }`} />
                          
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-mono text-slate-500 font-bold">{day.date}</span>
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-xs ${badgeStyles}`}>
                              {day.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 font-medium leading-relaxed">{day.notes}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Sistem Autentikasi Wali</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSantriForHistory(null)}
                  className="px-4 py-2 text-xs text-slate-700 bg-white hover:bg-slate-100 font-bold border border-slate-200 rounded-sm shadow-sm transition cursor-pointer"
                >
                  Tutup Profil
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Rapid QR Scanner Modal overlay */}
      <RapidQRScannerModal 
        isOpen={isRapidScanOpen}
        onClose={() => setIsRapidScanOpen(false)}
        santriList={santriList}
        halaqahList={halaqahList}
        attendance={attendance}
        setAttendance={setAttendance}
        selectedDate={selectedDate}
        onAddActivity={onAddActivity}
      />
    </div>
  );
}
