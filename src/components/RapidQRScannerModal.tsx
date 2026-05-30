/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  QrCode, 
  Check, 
  AlertCircle, 
  Video, 
  Users, 
  Clock, 
  Plus, 
  History,
  Barcode,
  Volume2,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { Santri, Halaqah } from '../types';
import QRScanner from './QRScanner';

interface RapidQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  santriList: Santri[];
  halaqahList: Halaqah[];
  attendance: Record<string, { status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa'; notes: string }>;
  setAttendance: React.Dispatch<React.SetStateAction<Record<string, { status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa'; notes: string }>>>;
  selectedDate: string;
  onAddActivity: (message: string, category: 'Setoran' | 'Absen' | 'Keuangan' | 'Sistem') => void;
}

interface ScanLog {
  id: string;
  santriName: string;
  nis: string;
  halaqahName: string;
  time: string;
  status: 'sukses' | 'duplikat' | 'error';
  message: string;
}

interface PendingScan {
  id: string;
  studentId: string;
  nis: string;
  name: string;
  halaqahName: string;
  time: string;
  date: string;
}

export default function RapidQRScannerModal({
  isOpen,
  onClose,
  santriList,
  halaqahList,
  attendance,
  setAttendance,
  selectedDate,
  onAddActivity
}: RapidQRScannerModalProps) {
  const [sessionLogs, setSessionLogs] = useState<ScanLog[]>([]);
  const [lastScannedStudent, setLastScannedStudent] = useState<Santri | null>(null);
  const [scanStatus, setScanStatus] = useState<{ type: 'sukses' | 'duplikat' | 'error'; message: string } | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  });
  const [pendingQueue, setPendingQueue] = useState<PendingScan[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_offline_qr_queue');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Keep track of physically connected states
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Play crisp high-key beep for scan success
  const playBeep = () => {
    if (isAudioMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // crisp high B chord
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('Web Audio API blocked or unsupported', e);
    }
  };

  // Play lower buzz beep for warnings/errors
  const playErrorBeep = () => {
    if (isAudioMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // low warning vibration
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn('Web Audio API blocked or unsupported', e);
    }
  };

  const syncOfflineQueue = (forcedQueue?: PendingScan[]) => {
    const queueToSync = forcedQueue || pendingQueue;
    if (queueToSync.length === 0) return;

    if (isOffline) {
      setScanStatus({
        type: 'error',
        message: 'Koneksi masih offline. Aktifkan koneksi internet terlebih dahulu untuk sinkronisasi.'
      });
      playErrorBeep();
      return;
    }

    // Process all pending scans
    const newAttendanceUpdates: Record<string, { status: 'Hadir'; notes: string }> = {};
    const timestampSync = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    queueToSync.forEach(item => {
      // 1. Update memory
      newAttendanceUpdates[item.studentId] = {
        status: 'Hadir',
        notes: `Hadir Mandiri via QR Scan (Offline Sync ${timestampSync}, Scan: ${item.time})`
      };

      // 2. Sync to localStorage history for the calendar
      try {
        const historyKey = `pesantren_attendance_history_${item.studentId}`;
        const savedHistory = localStorage.getItem(historyKey);
        const historyObj = savedHistory ? JSON.parse(savedHistory) : {};
        historyObj[item.date] = {
          status: 'Hadir',
          notes: `Hadir Mandiri via QR Scan (Offline Sync ${timestampSync}, Scan: ${item.time})`
        };
        localStorage.setItem(historyKey, JSON.stringify(historyObj));
      } catch (e) {
        console.warn('Failed to sync check-in to student calendar:', e);
      }

      // 3. Log real-time audit activity feed
      onAddActivity(`Rapid QR Scan (Sync Offline): ${item.name} (${item.nis}) hadir pada tanggal ${item.date}`, 'Absen');
    });

    // Update parent state
    setAttendance(prev => ({
      ...prev,
      ...newAttendanceUpdates
    }));

    // Update notification
    playBeep();
    setScanStatus({
      type: 'sukses',
      message: `Berhasil sinkronisasi ${queueToSync.length} data presensi tertunda ke server!`
    });

    // Clear queue
    setPendingQueue([]);
    localStorage.removeItem('pesantren_offline_qr_queue');
  };

  const handleStudentCheckIn = (nisOrId: string) => {
    const rawVal = nisOrId.trim();
    if (!rawVal) return;

    // Search for student in master list
    const student = santriList.find(s => s.nis === rawVal || s.id === rawVal);
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (!student) {
      playErrorBeep();
      setScanStatus({
        type: 'error',
        message: `Nomor Kartu / NIS "${rawVal}" tidak terdaftar.`
      });
      setLastScannedStudent(null);
      setSessionLogs(prev => [
        {
          id: `log_${Date.now()}`,
          santriName: 'Tidak Dikenal',
          nis: rawVal,
          halaqahName: '-',
          time: timestamp,
          status: 'error',
          message: `NIS "${rawVal}" tidak ditemukan.`
        },
        ...prev
      ]);
      return;
    }

    // Check if duplicate scan in this specific React parent state for today or in offline queue
    const isAlreadyInQueue = pendingQueue.some(item => item.studentId === student.id);
    const currentStatus = attendance[student.id]?.status;
    const currentNotes = attendance[student.id]?.notes;
    
    if (isAlreadyInQueue || (currentStatus === 'Hadir' && currentNotes && currentNotes.includes('QR Scan'))) {
      playErrorBeep();
      setScanStatus({
        type: 'duplikat',
        message: `Santri ${student.name} (${student.nis}) sudah terekam presensi via QR Scan.`
      });
      setLastScannedStudent(student);
      setSessionLogs(prev => [
        {
          id: `log_${Date.now()}`,
          santriName: student.name,
          nis: student.nis,
          halaqahName: student.halaqahName || 'Lainnya',
          time: timestamp,
          status: 'duplikat',
          message: isAlreadyInQueue ? 'Sudah terdaftar dalam antrean offline' : 'Duplikasi scan.'
        },
        ...prev
      ]);
      return;
    }

    if (isOffline) {
      // Offline mode: store in local storage offline queue!
      playBeep();
      const newPending: PendingScan = {
        id: `pending_${Date.now()}_${student.id}`,
        studentId: student.id,
        nis: student.nis,
        name: student.name,
        halaqahName: student.halaqahName || 'Lainnya',
        time: timestamp,
        date: selectedDate
      };

      const updatedQueue = [...pendingQueue, newPending];
      setPendingQueue(updatedQueue);
      localStorage.setItem('pesantren_offline_qr_queue', JSON.stringify(updatedQueue));

      setScanStatus({
        type: 'sukses',
        message: `Koneksi Offline. Presensi ${student.name} disimpan sementara dalam antrean offline!`
      });
      setLastScannedStudent(student);
      setSessionLogs(prev => [
        {
          id: `log_${Date.now()}`,
          santriName: student.name,
          nis: student.nis,
          halaqahName: student.halaqahName || 'Lainnya',
          time: timestamp,
          status: 'sukses',
          message: 'Disimpan sementara (Offline Queue).'
        },
        ...prev
      ]);
      return;
    }

    // Success check-in!
    playBeep();
    
    // 1. Update the parent attendance block state
    setAttendance(prev => ({
      ...prev,
      [student.id]: {
        status: 'Hadir',
        notes: `Hadir Mandiri via QR Scan Cepat (${timestamp})`
      }
    }));

    // 2. Sync directly to student's persistent history log in localStorage
    try {
      const historyKey = `pesantren_attendance_history_${student.id}`;
      const savedHistory = localStorage.getItem(historyKey);
      const historyObj = savedHistory ? JSON.parse(savedHistory) : {};
      historyObj[selectedDate] = {
        status: 'Hadir',
        notes: `Hadir Mandiri via QR Scan Cepat (${timestamp})`
      };
      localStorage.setItem(historyKey, JSON.stringify(historyObj));
    } catch (e) {
      console.warn('Failed to sync check-in to student calendar:', e);
    }

    // 3. Log real-time audit activity feed
    onAddActivity(`Rapid QR Scan: ${student.name} (${student.nis}) hadir pada tanggal ${selectedDate}`, 'Absen');

    // Update modal UI outputs
    setScanStatus({
      type: 'sukses',
      message: `Presensi ${student.name} berhasil direkam sebagai Hadir!`
    });
    setLastScannedStudent(student);
    setSessionLogs(prev => [
      {
        id: `log_${Date.now()}`,
        santriName: student.name,
        nis: student.nis,
        halaqahName: student.halaqahName || 'Lainnya',
        time: timestamp,
        status: 'sukses',
        message: 'Presensi Hadir sukses.'
      },
      ...prev
    ]);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput) return;
    handleStudentCheckIn(manualInput);
    setManualInput('');
  };

  const clearSessionLogs = () => {
    setSessionLogs([]);
    setLastScannedStudent(null);
    setScanStatus(null);
  };

  // Auto-clear notification toast after 4 seconds
  useEffect(() => {
    if (scanStatus) {
      const timer = setTimeout(() => {
        setScanStatus(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [scanStatus]);

  // Handle automatic syncing of the offline queue on coming back online
  useEffect(() => {
    if (!isOffline && pendingQueue.length > 0) {
      const timer = setTimeout(() => {
        syncOfflineQueue();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOffline, pendingQueue]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
        id="rapid-scan-overlay"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border border-slate-300 rounded-sm w-full max-w-4xl shadow-2xl overflow-hidden text-left my-8"
        >
          {/* Header Title */}
          <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-sky-500 rounded-xs text-slate-900 shadow-sm">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider font-mono">Perekaman Absensi Cepat via QR</h4>
                <p className="text-[10px] text-sky-200 font-mono mt-0.5 uppercase">Ubah Kehadiran Roster Harian Mandiri Secara Instan</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Online / Offline simulated toggle */}
              <button
                type="button"
                onClick={() => setIsOffline(!isOffline)}
                className={`p-1.5 border rounded-sm transition flex items-center gap-1.5 text-[10px] uppercase font-bold font-mono cursor-pointer ${
                  isOffline 
                    ? 'bg-rose-950/60 border-rose-800/40 text-rose-300 hover:bg-rose-900' 
                    : 'bg-emerald-950/60 border-emerald-800/40 text-emerald-300 hover:bg-emerald-900'
                }`}
                title={isOffline ? "Simulasikan Koneksi Online" : "Simulasikan Koneksi Offline"}
              >
                {isOffline ? <WifiOff className="w-3.5 h-3.5 animate-pulse text-rose-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isOffline ? 'Offline' : 'Online'}</span>
              </button>

              {/* Sound Toggler */}
              <button
                type="button"
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`p-1.5 border rounded-sm transition flex items-center gap-1.5 text-[10px] uppercase font-bold font-mono cursor-pointer ${
                  isAudioMuted 
                    ? 'bg-slate-800 border-slate-700 text-slate-400' 
                    : 'bg-sky-950/60 border-sky-805/40 text-sky-300 hover:bg-sky-950'
                }`}
                title={isAudioMuted ? "Aktifkan beeper suara" : "Matikan beeper suara"}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isAudioMuted ? 'Muted' : 'Sound On'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1 px-1.5 text-slate-400 hover:text-white hover:bg-slate-850 rounded-sm border border-slate-755 transition cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Left Column: Live Camera & Scanner (Col span 7) */}
            <div className="md:col-span-7 p-5 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xs text-slate-650 space-y-1">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-sky-500" />
                  <span>Kamera Sensor Aktif</span>
                </p>
                <p className="text-[10.5px] leading-relaxed">
                  Arahkan QR-Code / NIS pada kamera perangkat. Pastikan pencahayaan cukup dan kartu tegak lurus berada di kotak pemanduan.
                </p>
              </div>

              {/* The Live Scanner Frame */}
              <div className="border border-slate-200 p-1.5 bg-slate-50 rounded-sm">
                <QRScanner 
                  onScanSuccess={(code) => {
                    handleStudentCheckIn(code);
                  }}
                  onScanFailure={(msg) => {
                    console.debug('Rapid scanner noise:', msg);
                  }}
                />
              </div>

              {/* Manual NIS Backup form */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-sm">
                <form onSubmit={handleManualSubmit}>
                  <label htmlFor="manual-rapid-input" className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Atau Input Manual (Bila Sensor Bermasalah)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Barcode className="absolute left-3 top-2.5 w-4 h-4 text-slate-450" />
                      <input
                        id="manual-rapid-input"
                        type="text"
                        placeholder="Ketik NIS Santri (Contoh: 26001)"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-sm pl-9 pr-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:border-slate-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!manualInput}
                      className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-sm hover:bg-slate-800 cursor-pointer transition disabled:opacity-50 flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Input NIS</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Scanned Statistics & Logs (Col span 5) */}
            <div className="md:col-span-5 p-5 flex flex-col justify-between space-y-4">
              
              {/* Target Date Descriptor */}
              <div className="bg-slate-900 text-white p-3.5 rounded-sm flex items-center justify-between shadow-md">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold tracking-widest uppercase text-slate-400 font-mono">TANGGAL PROTOKOL ABSEN</span>
                  <div className="text-xs font-black uppercase font-mono text-sky-400">
                    {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <Users className="w-5 h-5 text-slate-400" />
              </div>

              {/* Offline Queue Information & Actions */}
              {pendingQueue.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-sm space-y-2 shadow-sm animate-fade-in text-[11px] leading-relaxed">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <WifiOff className="w-4 h-4 text-amber-650 animate-pulse shrink-0" />
                      <span className="text-[10px] font-black uppercase text-amber-850 font-mono tracking-wider">Antrean Offline ({pendingQueue.length})</span>
                    </div>
                    {isOffline ? (
                      <span className="text-[8px] font-mono font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-xs uppercase"> ऑफलाइन / Offline</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => syncOfflineQueue()}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white text-[9.5px] font-bold rounded-xs cursor-pointer transition flex items-center gap-1 uppercase font-mono shadow-xs active:scale-95"
                      >
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>SINKRONISASI</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-amber-800 font-sans">
                    {isOffline 
                      ? "Data disimpan sementara di browser Anda. Klik tombol 'Online' di kanan atas untuk mensimulasikan kembali jaringan dan memicu sinkronisasi otomatis."
                      : "Koneksi terdeteksi aktif kembali! Klik tombol sinkronisasi atau tunggu penyerapan otomatis selesai dalam beberapa detik."
                    }
                  </p>
                  
                  {/* Miniature list of pending scans */}
                  <div className="max-h-24 overflow-y-auto border border-amber-200/60 rounded-xs bg-white/60 p-1.5 space-y-1 divide-y divide-amber-100 custom-scrollbar">
                    {pendingQueue.map((item, idx) => (
                      <div key={item.id} className={`text-[9.5px] font-mono flex items-center justify-between text-amber-900 ${idx > 0 ? 'pt-1' : ''}`}>
                        <span className="truncate max-w-[150px] font-bold">👦 {item.name}</span>
                        <span className="text-slate-500 font-bold">{item.nis} &bull; {item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Status Flash Notification Overlay */}
              <div className="min-h-[142px]">
                <AnimatePresence mode="wait">
                  {scanStatus ? (
                    <motion.div
                      key={scanStatus.message}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`p-4 border rounded-sm ${
                        scanStatus.type === 'sukses' 
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-900 shadow-sm' 
                          : scanStatus.type === 'duplikat'
                          ? 'bg-amber-50 border-amber-250 text-amber-900 shadow-sm'
                          : 'bg-rose-50 border-rose-250 text-rose-900 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {scanStatus.type === 'sukses' && <Check className="w-5 h-5 text-emerald-600 bg-emerald-100 rounded-full p-0.5 shrink-0" />}
                          {scanStatus.type === 'duplikat' && <AlertCircle className="w-5 h-5 text-amber-600 bg-amber-100 rounded-full p-0.5 shrink-0" />}
                          {scanStatus.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-605 bg-rose-100 rounded-full p-0.5 shrink-0" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-wider font-mono">
                            {scanStatus.type === 'sukses' && 'CHECK-IN BERHASIL'}
                            {scanStatus.type === 'duplikat' && 'DATA ABSEN DUPLIKAT'}
                            {scanStatus.type === 'error' && 'KESALAHAN PEMINDAIAN'}
                          </p>
                          
                          {lastScannedStudent && (
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="text-lg">{lastScannedStudent.gender === 'Ikhwan' ? '👦' : '👧'}</span>
                              <div className="truncate">
                                <p className="text-xs font-black uppercase truncate text-slate-900 tracking-tight">{lastScannedStudent.name}</p>
                                <p className="text-[9px] text-slate-500 font-mono">NIS: {lastScannedStudent.nis} • {lastScannedStudent.halaqahName}</p>
                              </div>
                            </div>
                          )}

                          <p className="text-[10.5px] font-medium leading-relaxed mt-1.5 text-slate-700">
                            {scanStatus.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-8 border border-dashed border-slate-200 bg-slate-50/50 rounded-sm text-center flex flex-col items-center justify-center h-full text-slate-400 space-y-1">
                      <QrCode className="w-6 h-6 text-slate-300" />
                      <p className="text-xs font-bold text-slate-650 uppercase">Menunggu Scan Lensa</p>
                      <p className="text-[9.5px] text-slate-400 max-w-[210px] mx-auto leading-normal">
                        Tempelkan QR code siswa pada kamera untuk mencatatkan absensi secara cepat.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Feed: Session Logs inside current stream */}
              <div className="flex-1 flex flex-col min-h-[180px] max-h-[220px]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest font-mono">Antrean Scan Sesi Ini</span>
                  </div>
                  {sessionLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSessionLogs}
                      className="text-[9px] font-bold uppercase tracking-wider text-rose-600 hover:text-rose-800 transition cursor-pointer"
                    >
                      Reset Log
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {sessionLogs.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-slate-400">
                      Belum ada siswa yang terekam dalam sesi scan instan ini.
                    </div>
                  ) : (
                    sessionLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className={`p-2 border rounded-xs flex items-center justify-between gap-3 text-xs leading-normal ${
                          log.status === 'sukses'
                            ? 'bg-emerald-50/40 border-emerald-100'
                            : log.status === 'duplikat'
                            ? 'bg-amber-50/40 border-amber-100'
                            : 'bg-rose-50/40 border-rose-100'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-800 uppercase tracking-tight truncate">{log.santriName}</span>
                            <span className="text-[9.2px] text-slate-400 font-mono font-medium truncate">({log.nis})</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{log.halaqahName} • {log.message}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1 bg-white/80 border p-0.5 px-1.5 rounded-sm shadow-xs">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-[9.5px] font-mono font-bold text-slate-600">{log.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Total Summary Footer of session Scan */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm text-[10.5px] flex items-center justify-between text-left">
                <span className="font-medium text-slate-600 font-sans">
                  Siswa Terekam Sesi Ini:
                </span>
                <span className="font-mono font-black text-slate-900 bg-white border border-slate-300 px-2.5 py-0.5 rounded-sm shadow-xs">
                  {sessionLogs.filter(l => l.status === 'sukses').length} BARU
                </span>
              </div>

            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-mono">
            <span className="text-[8.5px] text-slate-400 font-bold uppercase">
              RUMAH TAHFIDZ AUTOMATED QR MARKING CENTER
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-sm border border-slate-300 shadow-sm cursor-pointer transition uppercase"
            >
              Selesai & Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
