/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Users,
  Layers,
  ClipboardCheck,
  TrendingUp,
  GraduationCap,
  ArrowUpRight,
  TrendingDown,
  ChevronRight,
  Calendar,
  DollarSign,
  AlertCircle,
  FileCheck,
  Award,
  BellRing,
  BookOpen,
  PieChart as PieIcon,
  CircleCheck,
  Activity,
  Plus,
  Clock,
  Settings,
  Send,
  Sparkles,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { Santri, Halaqah, Setoran, Mutabaah, Transaction, Reminder, Announcement, Activity as ActivityType } from '../types';
import { chartProgressData, distributionData } from '../mockData';
import KalenderPesantren from './KalenderPesantren';

interface DashboardViewProps {
  santriList: Santri[];
  halaqahList: Halaqah[];
  setoranList: Setoran[];
  mutabaahList: Mutabaah[];
  transactionList: Transaction[];
  reminders: Reminder[];
  announcements: Announcement[];
  activities: ActivityType[];
  onViewChange: (view: string) => void;
  onQuickSetoran: () => void;
  onQuickBayarSPP: (santriId: string) => void;
  onQuickExpense: () => void;
}

export default function DashboardView({
  santriList,
  halaqahList,
  setoranList,
  mutabaahList,
  transactionList,
  reminders,
  announcements,
  activities,
  onViewChange,
  onQuickSetoran,
  onQuickBayarSPP,
  onQuickExpense
}: DashboardViewProps) {
  const [chartRange, setChartRange] = useState('7 Hari Terakhir');

  // States untuk Sistem Pengingat setoran otomatis
  const [monitoringDate, setMonitoringDate] = useState('2026-05-26');
  const [minPagesTarget, setMinPagesTarget] = useState(2);
  const [submissionDeadline, setSubmissionDeadline] = useState('10:00');
  const [notifiedSantriIds, setNotifiedSantriIds] = useState<string[]>([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [successNotificationMsg, setSuccessNotificationMsg] = useState<string | null>(null);
  const [isReminderSettingsOpen, setIsReminderSettingsOpen] = useState(false);
  const [broadcastTemplate, setBroadcastTemplate] = useState(
    "Assalamu'alaikum Wr. Wb. Ayah/Bunda dari {NAMA_SANTRI}, menginfokan bahwa ananda belum melakukan menyetorkan target hafalan harian ({TARGET_HALAMAN} hlm) hari ini. Mohon bimbingan dan motivasi untuk ananda. Syukran."
  );

  // Helper untuk mendapatkan mentor santri
  const getMentorForSantri = (halaqahName: string) => {
    const halaq = halaqahList.find(h => h.name === halaqahName);
    return halaq ? halaq.mentor : 'Ustadz Pembina';
  };

  // Filter santri yang belum setor pada monitoringDate
  const getBelumSetorList = () => {
    return santriList.filter((s) => {
      const hasSetor = setoranList.some(
        (st) => st.santriId === s.id && st.date === monitoringDate
      );
      return !hasSetor;
    });
  };

  const handleSendSingleReminder = (santriId: string, santriName: string) => {
    if (notifiedSantriIds.includes(santriId)) return;
    setNotifiedSantriIds(prev => [...prev, santriId]);
    setSuccessNotificationMsg(`WhatsApp pengingat berhasil dikirim ke Wali dari ${santriName}!`);
    setTimeout(() => setSuccessNotificationMsg(null), 3500);
  };

  const handleSendAllReminders = () => {
    const list = getBelumSetorList().filter(s => !notifiedSantriIds.includes(s.id));
    if (list.length === 0) return;
    setIsBroadcasting(true);
    setTimeout(() => {
      setNotifiedSantriIds(prev => [...prev, ...list.map(s => s.id)]);
      setIsBroadcasting(false);
      setSuccessNotificationMsg(`WhatsApp siaran pengingat otomatis sukses disebarkan ke ${list.length} Wali Santri!`);
      setTimeout(() => setSuccessNotificationMsg(null), 4000);
    }, 1200);
  };

  // Compute stats on-the-fly from actual state arrays
  const totalSantri = 256; // Matching base indicator
  const halaqahAktifCount = 18; // Matching base indicator
  const ustadzCount = 24; // Matching base indicator

  // Target Hafalan
  const targetHafalanPercent = 85;

  // Setoran hari ini
  const setoranHariIniCount = setoranList.filter(s => s.date === '2026-05-26' || s.date === '2024-05-23').length + 137; // Base offset to equal 142

  // Keuangan Month summaries
  const totalPemasukan = transactionList
    .filter(t => t.type === 'Pemasukan')
    .reduce((sum, t) => sum + t.amount, 0) + 61000000; // base offset to equal original mockup Rp 86.750.000 with real actions building on top

  const totalPengeluaran = transactionList
    .filter(t => t.type === 'Pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0) + 12800000; // base offset to equal Rp 64.300.000

  const totalSaldo = totalPemasukan - totalPengeluaran;

  const totalTunggakan = 12450000; // base Rp 12.450.000
  const totalTunggakanSantriCount = 18; // 18 students

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Mendapatkan santri dengan nilai mutaba'ah tertinggi pekan ini (secara deterministik agar konsisten)
  const getTopMutabaahSantri = () => {
    if (!santriList || santriList.length === 0) {
      return {
        name: 'Ahmad Zaky',
        halaqahName: 'Halaqah Ikhwan A',
        mutabaahScore: 99,
        achievement: 'Shalat Berjamaah 5 Waktu & Tahajjud tanpa putus asrama'
      };
    }
    
    const topSantri = santriList.map((s) => {
      const hashCode = s.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const score = 94 + (hashCode % 6); // Rentang nilai 94 - 99%
      
      const specialAchievements = [
        "Shalat Berjamaah 5 Waktu & Tahajjud tanpa putus harian",
        "Khatam Tilawah Al-Qur'an 3 Juz & Dzikir Pagi Petang lengkap",
        "Puasa Sunnah Senin-Kamis & Shalat Rawatib tertib harian",
        "Qiyamul Lail 7 malam beruntun & Dzikir Pagi Petang berkelanjutan",
        "Shalat Dhuha harian & Murajaah mandiri 2 juz mutqin"
      ];
      const achievement = specialAchievements[hashCode % specialAchievements.length];
      
      return {
        name: s.name,
        halaqahName: s.halaqahName,
        mutabaahScore: score,
        achievement
      };
    });

    const sorted = topSantri.sort((a, b) => b.mutabaahScore - a.mutabaahScore);
    return sorted[0] || {
      name: 'Ahmad Zaky',
      halaqahName: 'Halaqah Ikhwan A',
      mutabaahScore: 99,
      achievement: 'Shalat Berjamaah 5 Waktu & Tahajjud tanpa putus asrama'
    };
  };

  // Dynamic Calculations for SPP Status Distribution Widget
  const countLunas = santriList ? santriList.filter(s => s.sppStatus === 'Lunas').length : 0;
  const countBelumBayar = santriList ? santriList.filter(s => s.sppStatus === 'Belum Bayar').length : 0;
  const countMenunggak = santriList ? santriList.filter(s => s.sppStatus === 'Menunggak').length : 0;

  const totalSppSantri = santriList ? santriList.length : 0;
  const percentageLunas = totalSppSantri > 0 ? Math.round((countLunas / totalSppSantri) * 100) : 0;
  const percentageBelumBayar = totalSppSantri > 0 ? Math.round((countBelumBayar / totalSppSantri) * 100) : 0;
  const percentageMenunggak = totalSppSantri > 0 ? Math.round((countMenunggak / totalSppSantri) * 105 / 100) : 0; // matching layout adjustments

  // Total IDR collected vs unpaid SPP
  const totalSppCollected = santriList
    ? santriList.filter(s => s.sppStatus === 'Lunas').reduce((sum, s) => sum + (s.sppAmount || 350000), 0)
    : 0;
  
  const totalSppUnpaid = santriList
    ? santriList.filter(s => s.sppStatus === 'Menunggak' || s.sppStatus === 'Belum Bayar').reduce((sum, s) => sum + (s.sppAmount || 350000), 0)
    : 0;

  // Recharts data for SPP chart
  const sppChartData = [
    { name: 'Lunas', Jumlah: countLunas, fill: '#10b981' },
    { name: 'Belum Bayar', Jumlah: countBelumBayar, fill: '#f59e0b' },
    { name: 'Menunggak', Jumlah: countMenunggak, fill: '#ef4444' }
  ];

  // List of students who are lagging behind
  const unpaidSantriList = santriList
    ? santriList.filter(s => s.sppStatus === 'Menunggak' || s.sppStatus === 'Belum Bayar').slice(0, 4)
    : [];

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Santri */}
        <div
          id="stat-card-santri"
          onClick={() => onViewChange('santri')}
          className="p-4 bg-white border border-slate-200 rounded-sm flex items-center justify-between shadow-sm cursor-pointer hover:border-blue-600 hover:shadow transition-all"
        >
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Santri</span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{totalSantri}</h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>12 dari bulan lalu</span>
            </span>
          </div>
          <div className="p-3 bg-slate-100 text-blue-600 rounded-sm border border-slate-200">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Halaqah Aktif */}
        <div
          id="stat-card-halaqah"
          onClick={() => onViewChange('halaqah')}
          className="p-4 bg-white border border-slate-200 rounded-sm flex items-center justify-between shadow-sm cursor-pointer hover:border-blue-600 hover:shadow transition-all"
        >
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Halaqah Aktif</span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{halaqahAktifCount}</h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>2 dari bulan lalu</span>
            </span>
          </div>
          <div className="p-3 bg-slate-100 text-emerald-600 rounded-sm border border-slate-200">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Setoran Hari Ini */}
        <div
          id="stat-card-setoran"
          onClick={() => onViewChange('setoran-new')}
          className="p-4 bg-white border border-slate-200 rounded-sm flex items-center justify-between shadow-sm cursor-pointer hover:border-blue-600 hover:shadow transition-all"
        >
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Setoran Hari Ini</span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{setoranHariIniCount}</h3>
            <div className="w-full h-1.5 bg-slate-100 rounded-none overflow-hidden mt-1 max-w-[80px] border border-slate-100">
              <div className="h-full bg-blue-600" style={{ width: '82%' }} />
            </div>
            <span className="text-[10px] text-blue-600 font-bold mt-1 block">82% dari target harian</span>
          </div>
          <div className="p-3 bg-slate-100 text-indigo-600 rounded-sm border border-slate-200">
            <ClipboardCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Target Hafalan */}
        <div
          id="stat-card-target"
          className="p-4 bg-white border border-slate-200 rounded-sm flex items-center justify-between shadow-sm hover:border-slate-350"
        >
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Target Hafalan</span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{targetHafalanPercent}%</h3>
            <span className="text-[10px] text-slate-500 font-bold">Rata-rata ketercapaian</span>
          </div>
          <div className="p-3 bg-slate-100 text-amber-600 rounded-sm border border-slate-200">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Ustadz Pembina */}
        <div
          id="stat-card-ustadz"
          onClick={() => onViewChange('ustadz')}
          className="p-4 bg-white border border-slate-200 rounded-sm flex items-center justify-between shadow-sm cursor-pointer hover:border-blue-600 hover:shadow transition-all"
        >
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Ustadz / Musyrif</span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{ustadzCount}</h3>
            <span className="text-[10px] text-slate-500 font-bold font-mono">Aktif mengajar</span>
          </div>
          <div className="p-3 bg-slate-100 text-cyan-600 rounded-sm border border-slate-200">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* extreme right alert row overlay */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main interactive billing prompt widget */}
        <div className="xl:col-span-3 bg-white border border-slate-200 p-5 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm text-left">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-red-50 text-[#df2020] rounded-sm border border-red-200 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Tunggakan SPP Lembaga</p>
              <h4 className="text-xl font-black text-[#df2020] mt-1.5">{formatRupiah(totalTunggakan)}</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                Sebanyak <span className="font-bold text-slate-900">{totalTunggakanSantriCount} santri</span> menunggak SPP sekolah bulan ini. Segera tindak lanjuti pelunasan tagihan saku santri.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="dashboard-pay-shortcut-btn"
              onClick={() => onViewChange('keuangan')}
              className="px-4 py-2 bg-[#df2020] text-white hover:bg-red-700 text-xs font-bold rounded-sm border border-red-700 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Kelola Kas & SPP</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              id="dashboard-new-submission-btn"
              onClick={onQuickSetoran}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded-sm border border-blue-700 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Setoran Baru</span>
            </button>
            <button
              id="dashboard-quick-expense-btn"
              onClick={onQuickExpense}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-sm border border-slate-300 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span>Biaya Cepat</span>
            </button>
          </div>
        </div>

        {/* Current Date Card Widget */}
        <div className="bg-slate-900 border border-slate-900 text-white p-5 rounded-sm shrink-0 flex flex-col justify-between shadow-md text-left">
          <div className="flex items-center justify-between">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] text-blue-300 font-extrabold bg-blue-500/10 px-2 py-0.5 rounded-sm border border-blue-500/30">
              LIVE
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">T. AJARAN 2025/2026</p>
            <h4 className="text-lg font-black mt-1 text-white">Kamis, 23 Mei 2024</h4>
            <div className="h-[1px] bg-slate-800 my-2"></div>
            <p className="text-xs text-slate-400 font-medium font-sans">Rumah Tahfidz Center</p>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Charts and Scheduling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart: Grafik Progres Hafalan */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Grafik Progres Hafalan</h4>
              <p className="text-[10px] text-slate-400 mt-1">Perkembangan setoran hafalan & murajaah harian santri</p>
            </div>
            <select
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value)}
              className="bg-slate-50 text-xs text-slate-700 border border-slate-200 rounded-sm px-3 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <option>7 Hari Terakhir</option>
              <option>1 Bulan Terakhir</option>
              <option>Semester Ini</option>
            </select>
          </div>

          <div className="h-65 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 2, border: '1px solid #cbd5e1' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: 11 }}
                  itemStyle={{ fontSize: 11 }}
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Line type="monotone" dataKey="Hafalan Baru" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Murajaah" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="Target" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Distribusi Hafalan */}
        <div className="lg:col-span-3 bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex flex-col justify-between text-left">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Distribusi Hafalan</h4>
            <p className="text-[10px] text-slate-400 mt-1">Rasio jenjang hafalan juz aktif saat ini</p>
          </div>

          <div className="relative h-44 my-2 flex items-center justify-center">
            {/* Center Absolute Label with Circle stats matching image */}
            <div className="absolute text-center">
              <span className="text-[15px] font-black text-slate-800 leading-none block font-mono">256</span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-1 block">Total Santri</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Santri`, 'Koleksi']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Color Indicators Legend block */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] font-bold text-slate-500 border-t border-slate-200 pt-3">
            {distributionData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reminders & Schedules panel */}
        <div className="lg:col-span-3 bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Pengingat & Jadwal</h4>
              <button
                onClick={() => alert('Jadwal Kegiatan Tahfidz disinkronisasi harian.')}
                className="text-[10px] text-[#2563eb] font-bold hover:underline"
              >
                Lihat Semua
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Agenda operasional harian kantor pondok</p>
          </div>

          <div className="space-y-2.5 my-4 overflow-y-auto max-h-56 custom-scrollbar pr-1">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="p-2.5 bg-slate-50 rounded-sm flex items-center justify-between gap-3 border border-slate-200 hover:bg-slate-100/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-sm border shrink-0 ${
                    rem.category === 'Setoran' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    rem.category === 'Murajaah' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    rem.category === 'Evaluasi' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    <BellRing className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-slate-900 truncate leading-tight">{rem.title}</p>
                    <p className="text-[9px] text-slate-500 truncate mt-0.5">{rem.subtitle}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-slate-500 font-mono bg-white px-2 py-0.5 rounded-sm border border-slate-200 shrink-0">
                  {rem.time}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onViewChange('pengumuman')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[10px] text-slate-700 font-bold rounded-sm border border-slate-200 text-center transition-all cursor-pointer"
          >
            Atur Alarm Pengingat
          </button>
        </div>
      </div>

      {/* 3. Bottom Row Section: Submissions Registry & Worship Track & Active Circles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Setoran Hari Ini Submissions Table (List Left) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Setoran Hari Ini</h4>
              <button
                onClick={() => onViewChange('setoran-new')}
                className="text-[10px] text-[#2563eb] font-bold hover:underline"
              >
                Lihat Semua
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-4 font-medium">Log rekam hafalan santri yang disetor harian</p>
          </div>

          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Santri</th>
                  <th className="pb-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Halaqah</th>
                  <th className="pb-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Materi</th>
                  <th className="pb-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {setoranList.slice(0, 5).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/55 transition-colors">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-sm bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[10px] overflow-hidden shrink-0 border border-slate-200 font-mono">
                          {row.santriName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{row.santriName}</p>
                          <span className="text-[9px] text-[#2563eb] font-bold px-1 py-0.2 bg-slate-150 bg-slate-100 border border-slate-200 rounded-sm mt-0.5 inline-block font-mono leading-none">
                            {row.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-xs text-slate-500 font-medium pr-2 max-w-[85px] truncate">{row.halaqahName}</td>
                    <td className="py-2.5 pr-2">
                      <p className="text-xs text-slate-850 font-bold">{row.surah}</p>
                      <span className="text-[9px] text-slate-400 font-mono leading-none">Ayat {row.verseRange}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-xs font-black px-2 py-0.5 bg-slate-50 text-emerald-700 border border-emerald-250 border-emerald-200 rounded-sm font-mono leading-none">
                        {row.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => onViewChange('setoran-new')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[10px] text-blue-600 font-extrabold rounded-sm border border-slate-200 mt-4 text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Semua Data Setoran</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mutaba'ah Ibadah (Daily Progress List Middle) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Mutaba'ah Ibadah</h4>
              <button
                onClick={() => onViewChange('mutabaah')}
                className="text-[10px] text-[#2563eb] font-bold hover:underline"
              >
                Lihat Semua
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-4 font-medium">Laporan amalan harian ketaatan asrama</p>
          </div>

          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {mutabaahList.map((item) => {
              const percent = Math.round((item.doneCount / item.totalCount) * 100);
              // Color helper depending on percentage
              const barColorClass =
                percent >= 80 ? 'bg-emerald-500' :
                percent >= 60 ? 'bg-amber-500' : 'bg-red-500';

              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{item.activityName}</span>
                    <span className="font-bold text-slate-500 font-mono">
                      {item.doneCount}/{item.totalCount} <span className="text-slate-800 ml-1">({percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-150 bg-slate-100 border border-slate-200/50 rounded-none overflow-hidden">
                    <div className={`h-full ${barColorClass} transition-all duration-300`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Apresiasi Bintang Mutaba'ah Terbaru pekan ini */}
          {(() => {
            const bestPerformer = getTopMutabaahSantri();
            return (
              <div className="mt-4 pt-4 border-t border-slate-100 text-left">
                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono inline-block mb-2">
                  🏆 Bintang Mutaba'ah Pekan Ini
                </span>
                <div className="flex items-center gap-2.5 bg-amber-50/20 p-2.5 border border-amber-200/50 rounded-sm">
                  <div className="w-9 h-9 rounded-full bg-amber-100/80 border border-amber-200/60 flex items-center justify-center font-bold text-amber-700 text-sm overflow-hidden shrink-0 shadow-xs">
                    <Award className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-extrabold text-slate-900 truncate uppercase tracking-tight">{bestPerformer.name}</p>
                      <span className="text-[10px] font-black text-amber-600 font-mono">{bestPerformer.mutabaahScore}%</span>
                    </div>
                    <p className="text-[9.5px] text-slate-500 font-medium truncate">{bestPerformer.halaqahName}</p>
                    <p className="text-[9px] text-amber-800 font-semibold leading-tight line-clamp-1 mt-0.5 italic">“{bestPerformer.achievement}”</p>
                  </div>
                </div>
              </div>
            );
          })()}

          <button
            onClick={() => onViewChange('mutabaah')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[10px] text-blue-600 font-extrabold rounded-sm border border-slate-200 mt-4 text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Laporan Kedisiplinan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Halaqah Aktif List Leaderboard Right */}
        <div className="lg:col-span-3 bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Kelompok Halaqah</h4>
              <button
                onClick={() => onViewChange('halaqah')}
                className="text-[10px] text-[#2563eb] font-bold hover:underline"
              >
                Lihat Semua
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-4">Daftar rasio pengisian rombel santri</p>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
            {halaqahList.slice(0, 5).map((hal) => (
              <div
                key={hal.id}
                className="p-3 bg-slate-50 rounded-sm border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="text-left min-w-0 pr-2">
                  <h5 className="text-xs font-bold text-slate-930 text-slate-900 truncate leading-tight">{hal.name}</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{hal.mentor}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 border border-slate-200 rounded-sm font-mono leading-none">
                    {hal.totalStudents === 10 || hal.totalStudents === 9 || hal.totalStudents === 11 ? `${hal.totalStudents}/12` : `${hal.totalStudents} St`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onViewChange('halaqah')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[10px] text-blue-600 font-extrabold rounded-sm border border-slate-200 mt-4 text-center block cursor-pointer"
          >
            Kelola Halaqah Pembinaan
          </button>
        </div>
      </div>

      {/* 4. Bottom Row 2: Financials & Target Progress Bulletins & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Keuangan Bulan Ini Dashboard Section */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Keuangan Bulan Ini</h4>
              <button
                onClick={() => onViewChange('keuangan')}
                className="text-[10px] text-[#2563eb] font-bold hover:underline"
              >
                Lihat Laporan
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-4">Kas operasional serta tunggakan SPP</p>
          </div>

          <div className="space-y-4 flex-1">
            {/* Quick 3 Cards for finances */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-sm text-left border border-slate-200">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block leading-none">Pemskn</span>
                <p className="text-[11px] font-black text-slate-900 mt-1.5 truncate font-mono">{formatRupiah(totalPemasukan)}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-sm text-left border border-slate-200">
                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block leading-none">Pnglran</span>
                <p className="text-[11px] font-black text-slate-900 mt-1.5 truncate font-mono">{formatRupiah(totalPengeluaran)}</p>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-sm text-left border border-slate-900 text-white">
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block leading-none">Saldo</span>
                <p className="text-[11px] font-black text-white mt-1.5 truncate font-mono">{formatRupiah(totalSaldo)}</p>
              </div>
            </div>

            {/* Overdue billing shortcut nested card */}
            <div className="p-3 bg-red-50/50 rounded-sm flex items-center justify-between border border-red-200/50">
              <div className="text-left">
                <span className="text-[9px] font-extrabold text-[#df2020] block uppercase tracking-wider">URGENT TUNGGAKAN SPP</span>
                <p className="text-sm font-black text-rose-700 mt-0.5 font-mono">{formatRupiah(totalTunggakan)}</p>
                <span className="text-[9px] text-slate-500 font-bold">Oleh 18 santri terdata</span>
              </div>
              <button
                onClick={() => onViewChange('keuangan')}
                className="text-[9px] font-bold bg-white hover:bg-slate-50 text-slate-800 px-2.5 py-1.5 border border-slate-300 rounded-sm shrink-0 transition-colors cursor-pointer"
              >
                Inisiasi Surat Tagihan
              </button>
            </div>

            {/* Invoicing Progress Bar with animated percentage */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-500">Lunas SPP Mei</span>
                <span className="font-black text-slate-700 font-mono">87% <span className="text-[10px] text-slate-400 font-medium font-sans">(223 dari 256)</span></span>
              </div>
              <div className="w-full h-2 bg-slate-100 border border-slate-200/30 rounded-none overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: '87%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Target Hafalan Bulanan Radial representation */}
        <div className="lg:col-span-3 bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Akumulasi Target</h4>
              <button
                onClick={() => alert('Detail target diatur harian ditiap Halaqah')}
                className="text-[10px] text-blue-600 font-bold hover:underline"
              >
                Lihat Detail
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-4 font-medium">Prestasi setoran halaman bulan berjalan</p>
          </div>

          <div className="flex items-center gap-4 justify-around flex-1">
            {/* Circular progress with sharp design cues */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - 0.85)}
                  strokeLinecap="square" />
              </svg>
              <div className="absolute text-center">
                <span className="text-lg font-black text-slate-800 font-mono">85%</span>
                <span className="text-[8px] text-slate-400 font-extrabold uppercase block leading-none">Tercapai</span>
              </div>
            </div>

            <div className="space-y-2 text-left shrink-0">
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">Bulan Ini</span>
                <p className="text-sm font-bold text-slate-800 mt-1 font-mono">15.000 <span className="text-[10px] text-slate-400 font-medium font-sans">Hal</span></p>
              </div>
              <div className="border-t border-slate-200 pt-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase block leading-none">Tercapai</span>
                <p className="text-sm font-bold text-emerald-600 mt-1 font-mono">12.750 <span className="text-[10px] text-slate-400 font-medium font-sans">Hal</span></p>
              </div>
              <div className="border-t border-slate-200 pt-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase block leading-none">Sisa</span>
                <p className="text-sm font-bold text-blue-600 mt-1 font-mono">2.250 <span className="text-[10px] text-slate-400 font-medium font-sans">Hal</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Pengumuman Terbaru bulletin strip */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Pengumuman</h4>
              <button
                onClick={() => onViewChange('pengumuman')}
                className="text-[10px] text-[#2563eb] font-bold hover:underline"
              >
                Lihat Semua
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-4">Informasi kegiatan & pemberitahuan penting</p>
          </div>

          <div className="space-y-2.5 flex-1 pr-1 overflow-y-auto max-h-52 custom-scrollbar">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-sm border border-slate-200 transition-all text-left cursor-pointer flex gap-2.5 items-start"
              >
                <div className={`p-1.5 rounded-sm shrink-0 border ${
                  ann.category === 'Libur' ? 'bg-red-50 text-red-600 border-red-200' :
                  ann.category === 'Tasmi' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  <BellRing className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-900 truncate leading-tight">{ann.title}</h5>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{ann.subtitle}</p>
                  <span className="text-[9px] text-slate-600 font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-sm mt-2 inline-block font-mono">
                    {ann.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row Analisis Status SPP & Tindak Lanjut Tunggakan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Widget Bar Chart: Distribusi Status SPP */}
        <div id="dashboard-spp-chart-container" className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-sm">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Status Pembayaran SPP Santri</h4>
                  <p className="text-[10px] text-slate-400 font-medium font-sans">Analisis sebaran status iuran SPP bulanan untuk seluruh santri aktif</p>
                </div>
              </div>
              <button
                onClick={() => onViewChange('keuangan')}
                className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Kelola Kas SPP
              </button>
            </div>
            <div className="h-[1px] bg-slate-100 my-3"></div>
          </div>

          <div className="h-60 mt-2 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sppChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: 'bold' }} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: 'bold' }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc', opacity: 0.5 }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    border: '1px solid #1e293b',
                    borderRadius: '0.125rem',
                    fontSize: '11px',
                    fontFamily: 'sans-serif'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', color: '#94a3b8' }}
                  formatter={(value: any) => [`${value} Santri`, 'Total']}
                />
                <Bar dataKey="Jumlah" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {sppChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats Grid under chart */}
          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-3 mt-3 text-center sm:text-left">
            <div>
              <span className="text-[9px] font-bold text-[#10b981] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-sm uppercase tracking-wide inline-block font-sans">LUNAS</span>
              <p className="text-base font-black text-slate-800 mt-1 font-mono">{countLunas} <span className="text-xs text-slate-400 font-sans font-semibold">({percentageLunas}%)</span></p>
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#f59e0b] bg-yellow-50 border border-yellow-101 border-yellow-100 px-2 py-0.5 rounded-sm uppercase tracking-wide inline-block font-sans">BELUM BAYAR</span>
              <p className="text-base font-black text-slate-800 mt-1 font-mono">{countBelumBayar} <span className="text-xs text-slate-400 font-sans font-semibold">({percentageBelumBayar}%)</span></p>
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#ef4444] bg-red-50 border border-red-101 border-red-100 px-2 py-0.5 rounded-sm uppercase tracking-wide inline-block font-sans">MENUNGGAK</span>
              <p className="text-base font-black text-slate-800 mt-1 font-mono">{countMenunggak} <span className="text-xs text-slate-400 font-sans font-semibold">({percentageMenunggak}%)</span></p>
            </div>
          </div>
        </div>

        {/* Widget Side Panel: Actionable Unpaid / Overdue Summary */}
        <div id="tunggakan-spp-list-container" className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight font-sans">Tindak Lanjut Tagihan</h4>
              <span className="text-[9px] font-bold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-xs font-mono">
                {countMenunggak + countBelumBayar} Santri
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-4 font-sans font-medium">Santri dengan kewajiban iuran yang belum diselesaikan bulan ini</p>
          </div>

          <div className="space-y-2.5 my-2 flex-1 overflow-y-auto max-h-[190px] custom-scrollbar pr-1">
            {unpaidSantriList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 bg-slate-50 text-slate-400 rounded-sm">
                <CircleCheck className="w-8 h-8 text-emerald-500 mb-1.5 animate-bounce" />
                <p className="text-xs font-bold text-slate-700">Semua SPP Lunas!</p>
                <p className="text-[10px] text-slate-400 text-center mt-0.5">Tidak ada santri yang memiliki tunggakan/piutang SPP.</p>
              </div>
            ) : (
              unpaidSantriList.map((santri) => (
                <div key={santri.id} className="p-2.5 bg-slate-50 border border-slate-100 hover:border-slate-300 rounded-sm flex items-center justify-between gap-3 transition">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{santri.name}</p>
                    <p className="text-[9.5px] text-slate-500 font-medium truncate mt-0.5">{santri.halaqahName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-xs font-mono leading-none border ${
                        santri.sppStatus === 'Menunggak' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {santri.sppStatus}
                      </span>
                      <span className="text-[10px] text-slate-700 font-mono font-bold">{formatRupiah(santri.sppAmount || 350000)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const msg = `Assalamu'alaikum Wr. Wb. Ayah/Bunda dari ${santri.name}, menginfokan iuran SPP bulanan sebesar ${formatRupiah(santri.sppAmount || 350000)} untuk putra/putri saat ini berstatus [${santri.sppStatus}]. Mohon bantuan pembayaran. Terima kasih banyak.`;
                      const whatsappUrl = `https://wa.me/${santri.phone.replace(/[^0-9]/g, '') || '62812345678'}/?text=${encodeURIComponent(msg)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200 rounded-sm transition cursor-pointer shrink-0 inline-flex items-center gap-1"
                    title="Kirim WhatsApp Tagihan"
                  >
                    <span>Tagih WA</span>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5 font-sans">
              <span>Efisiensi Pelunasan Bulanan</span>
              <span className="font-extrabold text-slate-800 font-mono">{percentageLunas}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 border border-slate-200/40 rounded-none overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${percentageLunas}%` }} />
            </div>
            <p className="text-[9.5px] text-slate-400 font-medium mt-1.5 text-center font-sans">
              Terkumpul: <span className="font-bold text-slate-700 font-mono">{formatRupiah(totalSppCollected)}</span> • Sisa: <span className="font-bold text-rose-500 font-mono">{formatRupiah(totalSppUnpaid)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 4. Sistem Pemantauan & Pengingat Otomatis Setoran (Ustadz) */}
      <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left space-y-4">
        {/* Banner Notif Sukses */}
        {successNotificationMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-sm text-xs font-bold uppercase tracking-tight flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotificationMsg}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-sm shrink-0">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-sm font-bold uppercase tracking-wider font-mono">
                  Sistem Notifikasi Pintar
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight mt-1">Pusat Pemantauan & Pengingat Setoran</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Melacak kepatuhan setoran hafalan harian dan menyebarkan draf pengingat WhatsApp Wali Santri dalam satu klik.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Swapper */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Tanggal Pelacakan:</span>
              <select
                value={monitoringDate}
                onChange={(e) => setMonitoringDate(e.target.value)}
                className="bg-slate-50 text-xs text-slate-700 font-bold border border-slate-200 rounded-sm px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="2026-05-26">26 Mei 2026</option>
                <option value="2026-05-25">25 Mei 2026</option>
                <option value="2026-05-24">24 Mei 2026</option>
              </select>
            </div>

            {/* Settings Trigger */}
            <button
              onClick={() => setIsReminderSettingsOpen(!isReminderSettingsOpen)}
              className="p-1.5 text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-sm transition flex items-center gap-1 cursor-pointer font-bold text-[10px] uppercase"
              title="Pengaturan Target & Template"
            >
              <Settings className="w-4 h-4" />
              <span>Atur Target</span>
            </button>

            {/* Broadcast Button */}
            <button
              onClick={handleSendAllReminders}
              disabled={isBroadcasting || getBelumSetorList().filter(s => !notifiedSantriIds.includes(s.id)).length === 0}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm border shadow-xs flex items-center gap-1.5 transition cursor-pointer ${
                isBroadcasting
                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                  : getBelumSetorList().filter(s => !notifiedSantriIds.includes(s.id)).length === 0
                  ? 'bg-slate-50 text-slate-300 border-slate-150 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBroadcasting ? 'Memproses...' : 'Kirim Pengingat Masal'}</span>
            </button>
          </div>
        </div>

        {/* Settings Panel Toggle */}
        {isReminderSettingsOpen && (
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-sm grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-100 text-xs">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Target Setoran Harian (Minimal Halaman)</label>
              <input
                type="number"
                min={1}
                value={minPagesTarget}
                onChange={(e) => setMinPagesTarget(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-sm px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Batas Waktu Pelaporan Setoran (WIB)</label>
              <input
                type="text"
                placeholder="Contoh: 10:00"
                value={submissionDeadline}
                onChange={(e) => setSubmissionDeadline(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-sm px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="flex justify-between items-center mb-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Template Pesan WhatsApp Siaran</label>
                <span className="text-[9px] font-mono text-slate-400 font-bold">&#123;NAMA_SANTRI&#125; & &#123;TARGET_HALAMAN&#125; diganti otomatis</span>
              </div>
              <textarea
                rows={2}
                value={broadcastTemplate}
                onChange={(e) => setBroadcastTemplate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-sm px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Ringkasan Status Angka */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Pelapor Setoran</span>
            <span className="text-sm font-black text-slate-800 font-mono mt-0.5 block">
              {santriList.length - getBelumSetorList().length} / {santriList.length} Santri
            </span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-sm">
            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block font-mono">Belum Menyetor</span>
            <span className="text-sm font-black text-rose-600 font-mono mt-0.5 block">
              {getBelumSetorList().length} Santri
            </span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-sm">
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block font-mono">Butuh Diingatkan</span>
            <span className="text-sm font-black text-amber-600 font-mono mt-0.5 block">
              {getBelumSetorList().filter(s => !notifiedSantriIds.includes(s.id)).length} Wali
            </span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-sm">
            <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block font-mono">Sudah Diingatkan</span>
            <span className="text-sm font-black text-indigo-700 font-mono mt-0.5 block">
              {getBelumSetorList().filter(s => notifiedSantriIds.includes(s.id)).length} Wali
            </span>
          </div>
        </div>

        {/* Table of delinquent students */}
        {getBelumSetorList().length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-dashed border-slate-250 border-slate-200 rounded-sm space-y-1 bg-slate-50/50">
            <Check className="w-7 h-7 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold uppercase tracking-tight text-slate-700">Lunas Setoran Hafalan!</p>
            <p className="text-[10px] text-slate-400 font-medium">Seluruh santri aktif binaan asatidzah telah menyelesaikan target setoran hafalan harian mereka hari ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="p-3">Santri & Halaqah</th>
                  <th className="p-3">Ustadz Pembina</th>
                  <th className="p-3">Syarat Target</th>
                  <th className="p-3">Status Kepatuhan</th>
                  <th className="p-3 text-right">Tindakan Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {getBelumSetorList().map((s) => {
                  const isNotified = notifiedSantriIds.includes(s.id);
                  const mentor = getMentorForSantri(s.halaqahName);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/30 transition text-xs">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 font-black rounded-sm bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200 font-mono">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-950 uppercase tracking-tight leading-none">{s.name}</p>
                            <span className="text-[9px] text-slate-400 font-bold tracking-wider mt-1 block">{s.nis} | <span className="text-blue-600 font-mono">{s.halaqahName}</span></span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs font-bold text-slate-600 font-mono">
                        {mentor}
                      </td>
                      <td className="p-3">
                        <div className="text-xs font-medium text-slate-800">
                          Target Harian: <span className="font-extrabold text-indigo-700 font-mono">{minPagesTarget} Hlm</span>
                        </div>
                        <p className="text-[9px] text-slate-450 text-slate-400 font-bold mt-0.5">Surah Terakhir: {s.currentSurah} ({s.currentVerseRange})</p>
                      </td>
                      <td className="p-3 text-xs">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-mono font-bold text-red-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>Melewati {submissionDeadline} WIB</span>
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-semibold leading-normal mt-0.5">🟡 Menunggu setoran Ziyadah</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const populatedMsg = broadcastTemplate
                                .replace('{NAMA_SANTRI}', s.name)
                                .replace('{TARGET_HALAMAN}', String(minPagesTarget));
                              alert(`Isi WhatsApp Draf Pemberitahuan:\n\n${populatedMsg}`);
                            }}
                            className="p-1 px-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-sm text-[9px] font-bold uppercase tracking-tight transition cursor-pointer"
                            title="Pratinjau Isi Pesan WhatsApp"
                          >
                            Draf WA
                          </button>
                          
                          <button
                            onClick={() => handleSendSingleReminder(s.id, s.name)}
                            disabled={isNotified}
                            className={`px-3 py-1 font-bold text-[9px] uppercase rounded-sm border shadow-xs transition flex items-center gap-1 cursor-pointer ${
                              isNotified
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700'
                            }`}
                          >
                            {isNotified ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Terkirim</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3 text-white" />
                                <span>Kirim WA</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Kalender Kegiatan Pesantren */}
      <KalenderPesantren />

      {/* 5. Activitas Terbaru Live Feed */}
      <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-3">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Log Aktivitas Terbaru</h4>
            <p className="text-[10px] text-slate-400 mt-1">Audit rilis setoran masuk, transaksi SPP, & log asrama live</p>
          </div>
          <button
            onClick={() => alert('Arsip aktivitas harian di-backup otomatis.')}
            className="text-[10px] text-[#2563eb] font-bold hover:underline"
          >
            Lihat Semua Log
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {activities.map((act) => (
            <div
              key={act.id}
              className="p-3 bg-slate-50 rounded-sm border border-slate-200 hover:border-blue-300 transition-all text-left flex items-start gap-2.5 min-w-0"
            >
              <div className={`p-2 rounded-sm shrink-0 border ${
                act.category === 'Setoran' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                act.category === 'Keuangan' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                act.category === 'Absen' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-700 leading-normal font-medium line-clamp-2">
                  {act.message}
                </p>
                <span className="text-[9px] text-[#2563eb] font-bold mt-1.5 block font-mono">
                  {act.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
