/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Gender = 'Ikhwan' | 'Akhwat';
export type SppStatus = 'Lunas' | 'Menunggak' | 'Belum Bayar';
export type SetoranType = 'Hafalan Baru' | 'Murajaah';
export type TransactionType = 'Pemasukan' | 'Pengeluaran';
export type TransactionCategory = 'SPP' | 'Donasi' | 'Gaji Ustadz' | 'Operasional' | 'Sarana Prasarana';

export interface Santri {
  id: string;
  nis: string;
  name: string;
  gender: Gender;
  halaqahId: string;
  halaqahName: string;
  currentSurah: string;
  currentVerseRange: string;
  averageScore: number;
  memorizedPages: number;
  monthlyTargetPages: number;
  monthlyAchievedPages: number;
  sppStatus: SppStatus;
  sppAmount: number;
  phone: string;
  joinDate: string;
}

export interface Halaqah {
  id: string;
  name: string;
  mentor: string;
  gender: Gender;
  totalStudents: number;
  targetHafalan: string;
}

export interface Ustadz {
  id: string;
  name: string;
  role: 'Musyrif' | 'Ustadz' | 'Ustadzah';
  phone: string;
  specialization: string;
  halaqahName?: string;
  status: 'Aktif' | 'Cuti';
}

export interface Setoran {
  id: string;
  santriId: string;
  santriName: string;
  halaqahName: string;
  date: string;
  type: SetoranType;
  surah: string;
  verseRange: string;
  pageCount: number;
  score: number; // 0 - 100
  notes?: string;
}

export interface Mutabaah {
  id: string;
  activityName: string;
  doneCount: number;
  totalCount: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  targetName: string;
  notes?: string;
}

export interface Reminder {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  category: 'Setoran' | 'Murajaah' | 'Evaluasi' | 'Rapat' | 'Lainnya';
}

export interface Announcement {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  category: 'Libur' | 'Tasmi' | 'Pendaftaran' | 'Umum';
}

export interface Activity {
  id: string;
  message: string;
  timeAgo: string;
  category: 'Setoran' | 'Absen' | 'Keuangan' | 'Sistem';
}

export interface Attendance {
  id: string;
  date: string;
  santriId: string;
  santriName: string;
  halaqahName: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
}

export interface MurajaahSession {
  id: string;
  santriId: string;
  santriName: string;
  halaqahName: string;
  ustadzName: string;
  date: string;
  surah: string;
  verseRange: string;
  smoothness: 'Mutqin (Sangat Lancar)' | 'Lancar' | 'Cukup' | 'Kurang (Perlu Ulang)';
  score: number;
  notes?: string;
}

export interface TahsinSession {
  id: string;
  santriId: string;
  santriName: string;
  halaqahName: string;
  ustadzName: string;
  date: string;
  surah: string;
  verseRange: string;
  makhrajScore: number;
  tajwidScore: number;
  fluencyScore: number;
  notes?: string;
}

export interface DashboardStats {
  totalSantri: number;
  totalSantriTrend: number; // e.g. +12
  halaqahAktif: number;
  halaqahAktifTrend: number; // e.g. +2
  setoranHariIniCount: number;
  setoranHariIniPercent: number; // e.g. 82% of daily target
  targetHafalanPercent: number; // e.g. 85%
  ustadzCount: number;
  ustadzAktifCount: number;
  sppTunggakanTotal: number;
  sppTunggakanSantriCount: number;
}
