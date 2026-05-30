/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Santri, Halaqah, Ustadz, Setoran, Mutabaah, Transaction, Reminder, Announcement, Activity } from './types';

export const initialHalaqahs: Halaqah[] = [
  { id: 'h1', name: 'Halaqah Ikhwan A', mentor: 'Ust. Muhammad F.', gender: 'Ikhwan', totalStudents: 10, targetHafalan: 'Juz 30' },
  { id: 'h2', name: 'Halaqah Akhwat A', mentor: 'Ustzh. Aisyah', gender: 'Akhwat', totalStudents: 9, targetHafalan: 'Juz 29 - 30' },
  { id: 'h3', name: 'Halaqah Ikhwan B', mentor: 'Ust. Abdullah', gender: 'Ikhwan', totalStudents: 11, targetHafalan: 'Juz 28 - 30' },
  { id: 'h4', name: 'Halaqah Akhwat B', mentor: 'Ustzh. Fatimah', gender: 'Akhwat', totalStudents: 10, targetHafalan: 'Juz 29 - 30' },
  { id: 'h5', name: 'Halaqah Ikhwan C', mentor: 'Ust. Khalid', gender: 'Ikhwan', totalStudents: 12, targetHafalan: 'Juz 1 - 5' },
  { id: 'h6', name: 'Halaqah Akhwat C', mentor: 'Ustzh. Khadijah', gender: 'Akhwat', totalStudents: 12, targetHafalan: 'Juz 1 - 5' },
  { id: 'h7', name: 'Halaqah Abu Bakar', mentor: 'Ust. Ali', gender: 'Ikhwan', totalStudents: 15, targetHafalan: 'Juz 30' },
  { id: 'h8', name: 'Halaqah Umar bin Khattab', mentor: 'Ust. Utsman', gender: 'Ikhwan', totalStudents: 14, targetHafalan: 'Juz 29 - 30' },
  { id: 'h9', name: 'Halaqah Usman bin Affan', mentor: 'Ust. Hamzah', gender: 'Ikhwan', totalStudents: 13, targetHafalan: 'Juz 28' },
  { id: 'h10', name: 'Halaqah Ali bin Abi Thalib', mentor: 'Ust. Zubair', gender: 'Ikhwan', totalStudents: 12, targetHafalan: 'Juz 27' },
  { id: 'h11', name: 'Halaqah Khadijah Al-Kubra', mentor: 'Ustzh. Sarah', gender: 'Akhwat', totalStudents: 15, targetHafalan: 'Juz 30' },
  { id: 'h12', name: 'Halaqah Aisyah Humaira', mentor: 'Ustzh. Aminah', gender: 'Akhwat', totalStudents: 16, targetHafalan: 'Juz 29' },
  { id: 'h13', name: 'Halaqah Fatima Az-Zahra', mentor: 'Ustzh. Maryam', gender: 'Akhwat', totalStudents: 15, targetHafalan: 'Juz 28' },
  { id: 'h14', name: 'Halaqah Safiyyah', mentor: 'Ustzh. Zainab', gender: 'Akhwat', totalStudents: 14, targetHafalan: 'Juz 27' },
  { id: 'h15', name: 'Halaqah Bilal bin Rabah', mentor: 'Ust. Talhah', gender: 'Ikhwan', totalStudents: 15, targetHafalan: 'Juz 25 - 26' },
  { id: 'h16', name: 'Halaqah Salman Al-Farisi', mentor: 'Ust. Sa\'ad', gender: 'Ikhwan', totalStudents: 14, targetHafalan: 'Juz 20 - 24' },
  { id: 'h17', name: 'Halaqah Mu\'adz bin Jabal', mentor: 'Ust. Yaqub', gender: 'Ikhwan', totalStudents: 15, targetHafalan: 'Juz 15 - 19' },
  { id: 'h18', name: 'Halaqah Sumayyah', mentor: 'Ustzh. Asma', gender: 'Akhwat', totalStudents: 14, targetHafalan: 'Juz 10 - 14' }
];

export const initialUstadz: Ustadz[] = [
  { id: 'u1', name: 'Ust. Muhammad F.', role: 'Ustadz', phone: '081234567890', specialization: 'Tahfidz Al-Qur\'an, Tajwid', status: 'Aktif', halaqahName: 'Halaqah Ikhwan A' },
  { id: 'u2', name: 'Ustzh. Aisyah', role: 'Ustadzah', phone: '081234567891', specialization: 'Tahfidz Al-Qur\'an, Tarjamah', status: 'Aktif', halaqahName: 'Halaqah Akhwat A' },
  { id: 'u3', name: 'Ust. Abdullah', role: 'Ustadz', phone: '081234567892', specialization: 'Tahsin, Qiraah', status: 'Aktif', halaqahName: 'Halaqah Ikhwan B' },
  { id: 'u4', name: 'Ustzh. Fatimah', role: 'Ustadzah', phone: '081234567893', specialization: 'Tajwid, Tahfidz Balita', status: 'Aktif', halaqahName: 'Halaqah Akhwat B' },
  { id: 'u5', name: 'Ust. Khalid', role: 'Ustadz', phone: '081234567894', specialization: 'Hafalan Intensif', status: 'Aktif', halaqahName: 'Halaqah Ikhwan C' },
  { id: 'u6', name: 'Ustzh. Khadijah', role: 'Ustadzah', phone: '081234567895', specialization: 'Tahfidz, Aqidah', status: 'Aktif', halaqahName: 'Halaqah Akhwat C' },
  { id: 'u7', name: 'Ust. Ali', role: 'Ustadz', phone: '081234567896', specialization: 'Tahsin, Tajwid', status: 'Aktif', halaqahName: 'Halaqah Abu Bakar' },
  { id: 'u8', name: 'Ust. Utsman', role: 'Ustadz', phone: '081234567897', specialization: 'Tahfidz Anak', status: 'Aktif', halaqahName: 'Halaqah Umar bin Khattab' },
  { id: 'u9', name: 'Ust. Hamzah', role: 'Ustadz', phone: '081234567898', specialization: 'Kaidah Tajwid', status: 'Aktif', halaqahName: 'Halaqah Usman bin Affan' },
  { id: 'u10', name: 'Ust. Zubair', role: 'Ustadz', phone: '081234567899', specialization: 'Kiraah Sab\'ah', status: 'Aktif', halaqahName: 'Halaqah Ali bin Abi Thalib' }
];

export const initialSantri: Santri[] = [
  {
    id: 's1',
    nis: 'SN001',
    name: 'Ahmad Zaky',
    gender: 'Ikhwan',
    halaqahId: 'h1',
    halaqahName: 'Halaqah Ikhwan A',
    currentSurah: 'Al-Baqarah',
    currentVerseRange: '25-26',
    averageScore: 92,
    memorizedPages: 180,
    monthlyTargetPages: 30,
    monthlyAchievedPages: 26,
    sppStatus: 'Lunas',
    sppAmount: 350000,
    phone: '082187654321',
    joinDate: '2023-01-10'
  },
  {
    id: 's2',
    nis: 'SN002',
    name: 'Khalid Al-Farizi',
    gender: 'Ikhwan',
    halaqahId: 'h1',
    halaqahName: 'Halaqah Ikhwan A',
    currentSurah: 'Al-Baqarah',
    currentVerseRange: '27-29',
    averageScore: 88,
    memorizedPages: 165,
    monthlyTargetPages: 30,
    monthlyAchievedPages: 24,
    sppStatus: 'Lunas',
    sppAmount: 350000,
    phone: '082187654322',
    joinDate: '2023-01-15'
  },
  {
    id: 's3',
    nis: 'SN003',
    name: 'Aisyah Humaira',
    gender: 'Akhwat',
    halaqahId: 'h2',
    halaqahName: 'Halaqah Akhwat A',
    currentSurah: 'An-Nisa',
    currentVerseRange: '1-4',
    averageScore: 90,
    memorizedPages: 220,
    monthlyTargetPages: 40,
    monthlyAchievedPages: 35,
    sppStatus: 'Lunas',
    sppAmount: 350000,
    phone: '082187654323',
    joinDate: '2023-02-01'
  },
  {
    id: 's4',
    nis: 'SN004',
    name: 'Fatimah Azzahra',
    gender: 'Akhwat',
    halaqahId: 'h2',
    halaqahName: 'Halaqah Akhwat A',
    currentSurah: 'An-Nisa',
    currentVerseRange: '5-7',
    averageScore: 85,
    memorizedPages: 210,
    monthlyTargetPages: 40,
    monthlyAchievedPages: 32,
    sppStatus: 'Menunggak',
    sppAmount: 350000,
    phone: '082187654324',
    joinDate: '2023-02-05'
  },
  {
    id: 's5',
    nis: 'SN005',
    name: 'Rizky Maulana',
    gender: 'Ikhwan',
    halaqahId: 'h3',
    halaqahName: 'Halaqah Ikhwan B',
    currentSurah: 'Ali Imran',
    currentVerseRange: '1-2',
    averageScore: 87,
    memorizedPages: 140,
    monthlyTargetPages: 30,
    monthlyAchievedPages: 22,
    sppStatus: 'Lunas',
    sppAmount: 350000,
    phone: '082187654325',
    joinDate: '2023-03-01'
  },
  {
    id: 's6',
    nis: 'SN006',
    name: 'Muhammad Al-Fatih',
    gender: 'Ikhwan',
    halaqahId: 'h1',
    halaqahName: 'Halaqah Ikhwan A',
    currentSurah: 'Al-Baqarah',
    currentVerseRange: '1-10',
    averageScore: 94,
    memorizedPages: 195,
    monthlyTargetPages: 30,
    monthlyAchievedPages: 28,
    sppStatus: 'Lunas',
    sppAmount: 350000,
    phone: '082111112222',
    joinDate: '2023-01-10'
  },
  {
    id: 's7',
    nis: 'SN007',
    name: 'Budi Santoso',
    gender: 'Ikhwan',
    halaqahId: 'h3',
    halaqahName: 'Halaqah Ikhwan B',
    currentSurah: 'Juz Amma',
    currentVerseRange: 'An-Naba 1-10',
    averageScore: 81,
    memorizedPages: 25,
    monthlyTargetPages: 15,
    monthlyAchievedPages: 12,
    sppStatus: 'Lunas', // Just paid
    sppAmount: 350000,
    phone: '082122223333',
    joinDate: '2024-01-05'
  },
  {
    id: 's8',
    nis: 'SN008',
    name: 'Najwa Shihab',
    gender: 'Akhwat',
    halaqahId: 'h4',
    halaqahName: 'Halaqah Akhwat B',
    currentSurah: 'Yasin',
    currentVerseRange: '1-15',
    averageScore: 91,
    memorizedPages: 110,
    monthlyTargetPages: 25,
    monthlyAchievedPages: 21,
    sppStatus: 'Menunggak',
    sppAmount: 350000,
    phone: '082133334444',
    joinDate: '2023-08-10'
  }
];

// We can dynamically pad or simulate remaining students up to 256 for display fidelity,
// while keeping editing active on these structural santris.
// We will also structure other collections to seamlessly match.

export const initialSetorans: Setoran[] = [
  { id: 'st1', santriId: 's1', santriName: 'Ahmad Zaky', halaqahName: 'Halaqah Ikhwan A', date: '2026-05-26', type: 'Hafalan Baru', surah: 'Al-Baqarah', verseRange: '25-26', pageCount: 2, score: 92, notes: 'Lancar, tajwid bagus' },
  { id: 'st2', santriId: 's2', santriName: 'Khalid Al-Farizi', halaqahName: 'Halaqah Ikhwan A', date: '2026-05-26', type: 'Hafalan Baru', surah: 'Al-Baqarah', verseRange: '27-29', pageCount: 3, score: 88, notes: 'Ada 2 kali salah harakat' },
  { id: 'st3', santriId: 's3', santriName: 'Aisyah Humaira', halaqahName: 'Halaqah Akhwat A', date: '2026-05-26', type: 'Murajaah', surah: 'An-Nisa', verseRange: '1-4', pageCount: 4, score: 90, notes: 'Murajaah mutqin' },
  { id: 'st4', santriId: 's4', santriName: 'Fatimah Azzahra', halaqahName: 'Halaqah Akhwat A', date: '2026-05-26', type: 'Murajaah', surah: 'An-Nisa', verseRange: '5-7', pageCount: 3, score: 85, notes: 'Perlu diulang bagian makhraj' },
  { id: 'st5', santriId: 's5', santriName: 'Rizky Maulana', halaqahName: 'Halaqah Ikhwan B', date: '2026-05-26', type: 'Hafalan Baru', surah: 'Ali Imran', verseRange: '1-2', pageCount: 2, score: 87, notes: 'Sangat baik' }
];

export const initialMutabaah: Mutabaah[] = [
  { id: 'm1', activityName: 'Shalat Jamaah', doneCount: 224, totalCount: 256 },
  { id: 'm2', activityName: 'Qiyamul Lail', doneCount: 156, totalCount: 256 },
  { id: 'm3', activityName: 'Tilawah Al-Qur\'an', doneCount: 198, totalCount: 256 },
  { id: 'm4', activityName: 'Dzikir Pagi & Petang', doneCount: 210, totalCount: 256 },
  { id: 'm5', activityName: 'Puasa Sunnah', doneCount: 98, totalCount: 256 }
];

export const initialTransactions: Transaction[] = [
  { id: 't1', date: '2026-05-26', type: 'Pemasukan', category: 'SPP', amount: 350000, targetName: 'Budi Santoso - SPP Mei', notes: 'Pembayaran SPP via transfer' },
  { id: 't2', date: '2026-05-25', type: 'Pemasukan', category: 'Donasi', amount: 25000000, targetName: 'Hamba Allah - Donasi Pembangunan', notes: 'Donasi pembangunan gedung lantai 2' },
  { id: 't3', date: '2026-05-24', type: 'Pemasukan', category: 'SPP', amount: 61000000, targetName: 'Akumulasi SPP 174 Santri', notes: 'Penerimaan SPP gelombang 1' },
  { id: 't4', date: '2026-05-22', type: 'Pengeluaran', category: 'Gaji Ustadz', amount: 48000000, targetName: 'Gaji 24 Ustadz & Musyrif', notes: 'Honor mengajar bulan Mei' },
  { id: 't5', date: '2026-05-21', type: 'Pengeluaran', category: 'Operasional', amount: 3500000, targetName: 'PLN & PDAM Bulanan', notes: 'Tagihan listrik dan air asrama' },
  { id: 't6', date: '2026-05-20', type: 'Pengeluaran', category: 'Sarana Prasarana', amount: 12800000, targetName: 'Pembelian Al-Qur\'an Hafalan', notes: 'Kitab suci Al-Qur\'an Tikrar 100 pcs' }
];

export const initialReminders: Reminder[] = [
  { id: 'r1', time: '08:00', title: 'Setoran Hafalan', subtitle: '42 santri belum setor hari ini', category: 'Setoran' },
  { id: 'r2', time: '10:00', title: 'Murajaah Terjadwal', subtitle: 'Juz 1 - 5 untuk 18 santri', category: 'Murajaah' },
  { id: 'r3', time: '13:00', title: 'Evaluasi Tahsin', subtitle: '8 santri jadwal evaluasi', category: 'Evaluasi' },
  { id: 'r4', time: '19:30', title: 'Rapat Bulanan', subtitle: 'Rapat evaluasi program', category: 'Rapat' }
];

export const initialAnnouncements: Announcement[] = [
  { id: 'a1', title: 'Libur Idul Adha 1445 H', subtitle: 'Libur kegiatan belajar mengajar dimulai tanggal 15 sd 18 Juni 2024', date: '2 hari lalu', category: 'Libur' },
  { id: 'a2', title: 'Tasmi\' Akbar Semester 1', subtitle: 'Akan dilaksanakan pada 15 Juni 2024 di Aula Masjid Jami\' Al-Ikhlas', date: '3 hari lalu', category: 'Tasmi' },
  { id: 'a3', title: 'Penerimaan Santri Baru', subtitle: 'Gelombang 2 dibuka mulai 1 - 30 Juni 2024 secara online maupun offline', date: '1 minggu lalu', category: 'Pendaftaran' }
];

export const initialActivities: Activity[] = [
  { id: 'ac1', message: 'Ahmad Zaky setor 2 halaman (Juz 3: Al-Baqarah 25-26)', timeAgo: '5 menit lalu', category: 'Setoran' },
  { id: 'ac2', message: 'Khaid Al-Farizi Absen masuk (07:15 WIB)', timeAgo: '10 menit lalu', category: 'Absen' },
  { id: 'ac3', message: 'Aisyah Humaira setor murajaah (Juz 4: Al-Fatihah)', timeAgo: '20 menit lalu', category: 'Setoran' },
  { id: 'ac4', message: 'Pembayaran SPP oleh Budi Santoso Rp 350.000', timeAgo: '1 jam lalu', category: 'Keuangan' }
];

// Hardcoded Chart stats for Grafik Progres Hafalan (Last 7 Days)
export const chartProgressData = [
  { name: 'Sen', 'Hafalan Baru': 18, Murajaah: 12, Target: 30 },
  { name: 'Sel', 'Hafalan Baru': 28, Murajaah: 20, Target: 30 },
  { name: 'Rab', 'Hafalan Baru': 29, Murajaah: 25, Target: 30 },
  { name: 'Kam', 'Hafalan Baru': 38, Murajaah: 29, Target: 30 },
  { name: 'Jum', 'Hafalan Baru': 42, Murajaah: 28, Target: 30 },
  { name: 'Sab', 'Hafalan Baru': 41, Murajaah: 32, Target: 30 },
  { name: 'Min', 'Hafalan Baru': 50, Murajaah: 41, Target: 30 }
];

// Distribution data for "Distribusi Hafalan Santri" Donut chart
export const distributionData = [
  { name: 'Juz 30 (26.6%)', value: 68, color: '#3b82f6' }, // Blue
  { name: 'Juz 29 - 20 (28.1%)', value: 72, color: '#10b981' }, // Green
  { name: 'Juz 19 - 10 (25.0%)', value: 64, color: '#8b5cf6' }, // Purple
  { name: 'Juz 9 - 1 (15.6%)', value: 40, color: '#f59e0b' }, // Orange
  { name: 'Belum Mulai (4.7%)', value: 12, color: '#ef4444' } // Red
];

import { MurajaahSession, TahsinSession } from './types';

export const initialMurajaahSessions: MurajaahSession[] = [
  {
    id: 'm_1',
    santriId: 's1',
    santriName: 'Ahmad Zaky',
    halaqahName: 'Halaqah Ikhwan A',
    ustadzName: 'Ust. Muhammad F.',
    date: '2026-05-27',
    surah: 'Al-Mulk',
    verseRange: '1-30',
    smoothness: 'Mutqin (Sangat Lancar)',
    score: 95,
    notes: 'Lafadz makhraj sangat mantap dan lancar tanpa terbata-bata.'
  },
  {
    id: 'm_2',
    santriId: 's2',
    santriName: 'Khalid Al-Farizi',
    halaqahName: 'Halaqah Ikhwan A',
    ustadzName: 'Ust. Muhammad F.',
    date: '2026-05-27',
    surah: 'Ar-Rahman',
    verseRange: '1-40',
    smoothness: 'Lancar',
    score: 87,
    notes: 'Lancar, ada 1-2 perbaikan di waqaf wal ibtida.'
  },
  {
    id: 'm_3',
    santriId: 's3',
    santriName: 'Aisyah Humaira',
    halaqahName: 'Halaqah Akhwat A',
    ustadzName: 'Ustzh. Aisyah',
    date: '2026-05-26',
    surah: 'Al-Waqi\'ah',
    verseRange: '1-96',
    smoothness: 'Mutqin (Sangat Lancar)',
    score: 94,
    notes: 'Sangat baik, nafasnya panjang dan stabil.'
  },
  {
    id: 'm_4',
    santriId: 's4',
    santriName: 'Fatimah Azzahra',
    halaqahName: 'Halaqah Akhwat A',
    ustadzName: 'Ustzh. Aisyah',
    date: '2026-05-25',
    surah: 'Yasin',
    verseRange: '1-50',
    smoothness: 'Cukup',
    score: 75,
    notes: 'Kurang fokus di tengah surah, perlu sering di-ulang kembali mandiri.'
  }
];

export const initialTahsinSessions: TahsinSession[] = [
  {
    id: 't_1',
    santriId: 's1',
    santriName: 'Ahmad Zaky',
    halaqahName: 'Halaqah Ikhwan A',
    ustadzName: 'Ust. Abdullah',
    date: '2026-05-27',
    surah: 'Al-Fatihah',
    verseRange: '1-7',
    makhrajScore: 92,
    tajwidScore: 90,
    fluencyScore: 95,
    notes: 'Pengucapan huruf Dhod (Riyadhah lisan) sudah sangat pas.'
  },
  {
    id: 't_2',
    santriId: 's5',
    santriName: 'Rizky Maulana',
    halaqahName: 'Halaqah Ikhwan B',
    ustadzName: 'Ust. Abdullah',
    date: '2026-05-26',
    surah: 'Ad-Duha',
    verseRange: '1-11',
    makhrajScore: 82,
    tajwidScore: 85,
    fluencyScore: 80,
    notes: 'Hati-hati pengucapan mad thabii jangan terlalu panjang (lebih dari 2 harakat).'
  },
  {
    id: 't_3',
    santriId: 's8',
    santriName: 'Najwa Shihab',
    halaqahName: 'Halaqah Akhwat B',
    ustadzName: 'Ustzh. Fatimah',
    date: '2026-05-25',
    surah: 'Al-Kahf',
    verseRange: '1-10',
    makhrajScore: 95,
    tajwidScore: 92,
    fluencyScore: 90,
    notes: 'Hukum-hukum Idgham dan Ikhfa sudah sangat halus dan dengung yang proporsional.'
  }
];

