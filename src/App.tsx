/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// View modules
import DashboardView from './components/DashboardView';
import SantriView from './components/SantriView';
import HalaqahView from './components/HalaqahView';
import SetoranView from './components/SetoranView';
import KeuanganView from './components/KeuanganView';
import MutabaahView from './components/MutabaahView';
import UstadzView from './components/UstadzView';
import SettingsView from './components/SettingsView';
import AbsensiView from './components/AbsensiView';
import MurajaahView from './components/MurajaahView';
import TahsinView from './components/TahsinView';
import EvaluasiView from './components/EvaluasiView';
import PimpinanView from './components/PimpinanView';
import ELearningView from './components/ELearningView';
import PengumumanView from './components/PengumumanView';

// Models & Initial Data
import { 
  Santri, 
  Halaqah, 
  Ustadz, 
  Setoran, 
  Mutabaah, 
  Transaction, 
  Reminder, 
  Announcement, 
  Activity,
  MurajaahSession,
  TahsinSession
} from './types';
import {
  initialHalaqahs,
  initialUstadz,
  initialSantri,
  initialSetorans,
  initialMutabaah,
  initialTransactions,
  initialReminders,
  initialAnnouncements,
  initialActivities,
  initialMurajaahSessions,
  initialTahsinSessions
} from './mockData';

// Visual placeholder indicators
import { Sparkles, Construction, ChevronLeft, LayoutDashboard, Plus } from 'lucide-react';

export default function App() {
  // Navigation states
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dark/Light Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('pesantren_theme');
      return (saved === 'dark' || saved === 'light') ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    localStorage.setItem('pesantren_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Primary database states with localStorage persistence
  const [santriList, setSantriList] = useState<Santri[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_santriList');
      return saved ? JSON.parse(saved) : initialSantri;
    } catch {
      return initialSantri;
    }
  });

  const [halaqahList, setHalaqahList] = useState<Halaqah[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_halaqahList');
      return saved ? JSON.parse(saved) : initialHalaqahs;
    } catch {
      return initialHalaqahs;
    }
  });

  const [ustadzList, setUstadzList] = useState<Ustadz[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_ustadzList');
      return saved ? JSON.parse(saved) : initialUstadz;
    } catch {
      return initialUstadz;
    }
  });

  const [setoranList, setSetoranList] = useState<Setoran[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_setoranList');
      return saved ? JSON.parse(saved) : initialSetorans;
    } catch {
      return initialSetorans;
    }
  });

  const [mutabaahList, setMutabaahList] = useState<Mutabaah[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_mutabaahList');
      return saved ? JSON.parse(saved) : initialMutabaah;
    } catch {
      return initialMutabaah;
    }
  });

  const [transactionList, setTransactionList] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_transactionList');
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_reminders');
      return saved ? JSON.parse(saved) : initialReminders;
    } catch {
      return initialReminders;
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_announcements');
      return saved ? JSON.parse(saved) : initialAnnouncements;
    } catch {
      return initialAnnouncements;
    }
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_activities');
      return saved ? JSON.parse(saved) : initialActivities;
    } catch {
      return initialActivities;
    }
  });

  const [murajaahList, setMurajaahList] = useState<MurajaahSession[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_murajaahList');
      return saved ? JSON.parse(saved) : initialMurajaahSessions;
    } catch {
      return initialMurajaahSessions;
    }
  });

  const [tahsinList, setTahsinList] = useState<TahsinSession[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_tahsinList');
      return saved ? JSON.parse(saved) : initialTahsinSessions;
    } catch {
      return initialTahsinSessions;
    }
  });

  // Automatically persist any states to localStorage on state variation
  useEffect(() => {
    localStorage.setItem('pesantren_santriList', JSON.stringify(santriList));
  }, [santriList]);

  useEffect(() => {
    localStorage.setItem('pesantren_halaqahList', JSON.stringify(halaqahList));
  }, [halaqahList]);

  useEffect(() => {
    localStorage.setItem('pesantren_ustadzList', JSON.stringify(ustadzList));
  }, [ustadzList]);

  useEffect(() => {
    localStorage.setItem('pesantren_setoranList', JSON.stringify(setoranList));
  }, [setoranList]);

  useEffect(() => {
    localStorage.setItem('pesantren_mutabaahList', JSON.stringify(mutabaahList));
  }, [mutabaahList]);

  useEffect(() => {
    localStorage.setItem('pesantren_transactionList', JSON.stringify(transactionList));
  }, [transactionList]);

  useEffect(() => {
    localStorage.setItem('pesantren_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('pesantren_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('pesantren_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('pesantren_murajaahList', JSON.stringify(murajaahList));
  }, [murajaahList]);

  useEffect(() => {
    localStorage.setItem('pesantren_tahsinList', JSON.stringify(tahsinList));
  }, [tahsinList]);

  // Preset state for quick keuangan modal entries
  const [keuanganPreset, setKeuanganPreset] = useState<{
    type: 'Pemasukan' | 'Pengeluaran';
    category: any;
    isOpen: boolean;
  } | null>(null);

  // 1. Core State Handlers
  const handleAddSantri = (newSantri: Omit<Santri, 'id'>) => {
    const freshId = `s_${Date.now()}`;
    const student: Santri = { ...newSantri, id: freshId };

    setSantriList(prev => [student, ...prev]);

    // Update students count inside the designated Halaqah
    setHalaqahList(prev =>
      prev.map(h => h.id === student.halaqahId ? { ...h, totalStudents: h.totalStudents + 1 } : h)
    );

    // Push into stream
    handlePushActivity(`Santri Baru ${student.name} berhasil didaftarkan di ${student.halaqahName}.`, 'Sistem');
  };

  const handleUpdateSantri = (id: string, updated: Partial<Santri>) => {
    setSantriList(prev =>
      prev.map(s => s.id === id ? { ...s, ...updated } : s)
    );
  };

  const handleDeleteSantri = (id: string) => {
    const student = santriList.find(s => s.id === id);
    if (!student) return;

    setSantriList(prev => prev.filter(s => s.id !== id));

    // Decrement students count inside Halaqah
    setHalaqahList(prev =>
      prev.map(h => h.id === student.halaqahId ? { ...h, totalStudents: Math.max(0, h.totalStudents - 1) } : h)
    );

    handlePushActivity(`Santri ${student.name} dikeluarkan dari rombel.`, 'Sistem');
  };

  const handleAddHalaqah = (newHalaqah: Omit<Halaqah, 'id'>) => {
    const freshId = `h_${Date.now()}`;
    const circle: Halaqah = { ...newHalaqah, id: freshId };
    setHalaqahList(prev => [...prev, circle]);

    handlePushActivity(`Halaqah baru "${circle.name}" binaan ${circle.mentor} dibuka.`, 'Sistem');
  };

  const handleDeleteHalaqah = (id: string) => {
    const hal = halaqahList.find(h => h.id === id);
    if (hal) {
      setHalaqahList(prev => prev.filter(h => h.id !== id));
      handlePushActivity(`Halaqah ${hal.name} dihapus.`, 'Sistem');
    }
  };

  const handleAddTransaction = (newTrans: Omit<Transaction, 'id'>) => {
    const trans: Transaction = {
      ...newTrans,
      id: `t_${Date.now()}`
    };
    setTransactionList(prev => [trans, ...prev]);

    handlePushActivity(
      `Keuangan: Pembukuan ${trans.type} ${trans.category} senilai Rp ${trans.amount.toLocaleString('id-ID')} dicatatkan.`,
      'Keuangan'
    );
  };

  const handleAddSetoran = (newSetoran: Omit<Setoran, 'id'>) => {
    const freshId = `st_${Date.now()}`;
    const setoran: Setoran = { ...newSetoran, id: freshId };

    setSetoranList(prev => [setoran, ...prev]);

    // Update targeted student's current memorization marker programmatically
    setSantriList(prev =>
      prev.map(s => {
        if (s.id === setoran.santriId) {
          const nextAchieved = s.monthlyAchievedPages + setoran.pageCount;
          return {
            ...s,
            currentSurah: setoran.surah,
            currentVerseRange: setoran.verseRange,
            memorizedPages: s.memorizedPages + setoran.pageCount,
            monthlyAchievedPages: nextAchieved,
            averageScore: Math.round((s.averageScore + setoran.score) / 2)
          };
        }
        return s;
      })
    );

    // Push into stream
    handlePushActivity(
      `${setoran.santriName} menyetorkan ${setoran.type} ${setoran.surah} ${setoran.verseRange} (Volume: ${setoran.pageCount} hlm)`,
      'Setoran'
    );
  };

  const handleUpdateMutabaah = (id: string, doneCount: number) => {
    setMutabaahList(prev =>
      prev.map(m => m.id === id ? { ...m, doneCount } : m)
    );
  };

  const handleAddUstadz = (newUstadz: Omit<Ustadz, 'id'>) => {
    const freshId = `u_${Date.now()}`;
    const ustadz: Ustadz = { ...newUstadz, id: freshId };
    setUstadzList(prev => [...prev, ustadz]);

    handlePushActivity(`Daftar Pembina: ${ustadz.name} ditunjuk mengajar di asrama perdana.`, 'Sistem');
  };

  // Helper to push a fresh transaction message into recent log updates
  const handlePushActivity = (message: string, category: 'Setoran' | 'Absen' | 'Keuangan' | 'Sistem') => {
    const act: Activity = {
      id: `ac_${Date.now()}`,
      message,
      timeAgo: 'Baru saja',
      category
    };
    setActivities(prev => [act, ...prev]);
  };

  const handleAddMurajaah = (newMurajaah: Omit<MurajaahSession, 'id'>) => {
    const session: MurajaahSession = {
      ...newMurajaah,
      id: `m_${Date.now()}`
    };
    setMurajaahList(prev => [session, ...prev]);

    // Update student's values
    setSantriList(prev => 
      prev.map(s => s.id === session.santriId ? {
        ...s,
        currentSurah: session.surah,
        currentVerseRange: session.verseRange,
        averageScore: Math.round((s.averageScore + session.score) / 2)
      } : s)
    );

    handlePushActivity(`${session.santriName} mengevaluasi Murajaah ${session.surah} (Nilai: ${session.score})`, 'Setoran');
  };

  const handleDeleteMurajaah = (id: string) => {
    setMurajaahList(prev => prev.filter(m => m.id !== id));
  };

  const handleAddTahsin = (newTahsin: Omit<TahsinSession, 'id'>) => {
    const session: TahsinSession = {
      ...newTahsin,
      id: `t_${Date.now()}`
    };
    setTahsinList(prev => [session, ...prev]);

    const averageComp = Math.round((session.makhrajScore + session.tajwidScore + session.fluencyScore) / 3);
    // Update student's values
    setSantriList(prev => 
      prev.map(s => s.id === session.santriId ? {
        ...s,
        currentSurah: session.surah,
        currentVerseRange: session.verseRange,
        averageScore: Math.round((s.averageScore + averageComp) / 2)
      } : s)
    );

    handlePushActivity(`${session.santriName} mengevaluasi Tahsin ${session.surah} (Avg: ${averageComp})`, 'Setoran');
  };

  const handleDeleteTahsin = (id: string) => {
    setTahsinList(prev => prev.filter(t => t.id !== id));
  };

  const handleAddAnnouncement = (newAnn: Omit<Announcement, 'id'>) => {
    const ann: Announcement = {
      ...newAnn,
      id: `a_${Date.now()}`
    };
    setAnnouncements(prev => [ann, ...prev]);
    handlePushActivity(`Pengumuman baru diterbitkan: "${ann.title}"`, 'Sistem');
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // System parameters Reset & Inject
  const handleResetData = () => {
    localStorage.removeItem('pesantren_santriList');
    localStorage.removeItem('pesantren_halaqahList');
    localStorage.removeItem('pesantren_ustadzList');
    localStorage.removeItem('pesantren_setoranList');
    localStorage.removeItem('pesantren_mutabaahList');
    localStorage.removeItem('pesantren_transactionList');
    localStorage.removeItem('pesantren_reminders');
    localStorage.removeItem('pesantren_announcements');
    localStorage.removeItem('pesantren_activities');
    localStorage.removeItem('pesantren_savedLogs');
    localStorage.removeItem('pesantren_murajaahList');
    localStorage.removeItem('pesantren_tahsinList');

    setSantriList(initialSantri);
    setHalaqahList(initialHalaqahs);
    setUstadzList(initialUstadz);
    setSetoranList(initialSetorans);
    setMutabaahList(initialMutabaah);
    setTransactionList(initialTransactions);
    setReminders(initialReminders);
    setAnnouncements(initialAnnouncements);
    setActivities(initialActivities);
    setMurajaahList(initialMurajaahSessions);
    setTahsinList(initialTahsinSessions);
    setCurrentView('dashboard');
  };

  const handleInjectDummyData = () => {
    const generatedSantri: Santri[] = Array.from({ length: 10 }).map((_, idx) => {
      const idxSuffix = idx + 10;
      const isBoy = idx % 2 === 0;
      return {
        id: `s_dummy_${idx}`,
        nis: `SN0${idxSuffix}`,
        name: isBoy ? `Simulasi Santri G-${idxSuffix}` : `Simulasi Santriwati G-${idxSuffix}`,
        gender: isBoy ? 'Ikhwan' : 'Akhwat',
        halaqahId: isBoy ? 'h1' : 'h2',
        halaqahName: isBoy ? 'Halaqah Ikhwan A' : 'Halaqah Akhwat A',
        currentSurah: 'Al-Mulk',
        currentVerseRange: '1-5',
        averageScore: 92,
        memorizedPages: 35,
        monthlyTargetPages: 30,
        monthlyAchievedPages: 12,
        sppStatus: idx % 3 === 0 ? 'Menunggak' : 'Lunas',
        sppAmount: 350000,
        phone: '0812-7000-8000',
        joinDate: '2026-05-15'
      };
    });

    setSantriList(prev => [...generatedSantri, ...prev]);

    // Post sample finances harian
    const simulatedTrans: Transaction = {
      id: `t_dummy_${Date.now()}`,
      date: '2026-05-26',
      type: 'Pemasukan',
      category: 'Donasi',
      amount: 15000000,
      targetName: 'Donatur Tetap - Wakaf Buku Tahfidz',
      notes: 'Wakaf donasi penyediaan kitab dan asrama perdana'
    };
    setTransactionList(prev => [simulatedTrans, ...prev]);

    handlePushActivity('Pusat data berhasil merekrut 10 santri simulasi baru harian!', 'Sistem');
  };

  // 2. View Routing Renderer
  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            santriList={santriList}
            halaqahList={halaqahList}
            setoranList={setoranList}
            mutabaahList={mutabaahList}
            transactionList={transactionList}
            reminders={reminders}
            announcements={announcements}
            activities={activities}
            onViewChange={setCurrentView}
            onQuickSetoran={() => setCurrentView('setoran-new')}
            onQuickBayarSPP={(stId) => {
              const student = santriList.find(s => s.id === stId);
              if (student) handleUpdateSantri(stId, { sppStatus: 'Lunas' });
            }}
            onQuickExpense={() => {
              setKeuanganPreset({
                type: 'Pengeluaran',
                category: 'Operasional',
                isOpen: true
              });
              setCurrentView('keuangan');
            }}
          />
        );
      case 'santri':
        return (
          <SantriView
            santriList={santriList}
            halaqahList={halaqahList}
            onAddSantri={handleAddSantri}
            onUpdateSantri={handleUpdateSantri}
            onDeleteSantri={handleDeleteSantri}
            searchQuery={searchQuery}
          />
        );
      case 'halaqah':
        return (
          <HalaqahView
            halaqahList={halaqahList}
            santriList={santriList}
            ustadzList={ustadzList}
            onAddHalaqah={handleAddHalaqah}
            onDeleteHalaqah={handleDeleteHalaqah}
          />
        );
      case 'setoran-new':
        return (
          <SetoranView
            setoranList={setoranList}
            santriList={santriList}
            onAddSetoran={handleAddSetoran}
          />
        );
      case 'keuangan':
        return (
          <KeuanganView
            transactionList={transactionList}
            santriList={santriList}
            onAddTransaction={handleAddTransaction}
            onUpdateSantri={handleUpdateSantri}
            presetTransaction={keuanganPreset}
            onClearPreset={() => setKeuanganPreset(null)}
          />
        );
      case 'mutabaah':
        return (
          <MutabaahView
            mutabaahList={mutabaahList}
            onUpdateMutabaah={handleUpdateMutabaah}
          />
        );
      case 'murajaah':
        return (
          <MurajaahView
            santriList={santriList}
            ustadzList={ustadzList}
            murajaahList={murajaahList}
            onAddMurajaah={handleAddMurajaah}
            onDeleteMurajaah={handleDeleteMurajaah}
          />
        );
      case 'tahsin':
        return (
          <TahsinView
            santriList={santriList}
            ustadzList={ustadzList}
            tahsinList={tahsinList}
            onAddTahsin={handleAddTahsin}
            onDeleteTahsin={handleDeleteTahsin}
          />
        );
      case 'absensi':
        return (
          <AbsensiView
            santriList={santriList}
            halaqahList={halaqahList}
            onAddActivity={handlePushActivity}
          />
        );
      case 'ustadz':
      case 'sdm':
        return (
          <UstadzView
            ustadzList={ustadzList}
            onAddUstadz={handleAddUstadz}
          />
        );
      case 'evaluasi':
        return (
          <EvaluasiView
            santriList={santriList}
            ustadzList={ustadzList}
            onAddActivity={handlePushActivity}
          />
        );
      case 'laporan':
      case 'pimpinan':
        return (
          <PimpinanView
            santriList={santriList}
            halaqahList={halaqahList}
            ustadzList={ustadzList}
            transactionList={transactionList}
            activities={activities}
          />
        );
      case 'e-learning':
        return (
          <ELearningView />
        );
      case 'pengumuman':
        return (
          <PengumumanView
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
          />
        );
      case 'pengaturan':
        return (
          <SettingsView
            onResetData={handleResetData}
            onInjectDummyData={handleInjectDummyData}
          />
        );
      default:
        // Elegant structural boundary card to handle unrequested/extended menu clicks gracefully
        return (
          <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-center max-w-xl mx-auto space-y-6 my-12 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
              <Construction className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">Modul Terintegrasi Sedang Dikonfigurasi</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Modul halaman <span className="font-bold text-slate-800">"{currentView}"</span> sedang disiapkan dilingkungan server asrama. Menu ini berada dilinguar cakupan spesifikasi dasar visual utama.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 mx-auto transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Kembali ke Dashboard Utama</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Dynamic header */}
        <Header
          currentView={currentView}
          onViewChange={setCurrentView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSidebarOpen={setSidebarOpen}
          theme={theme}
          onThemeToggle={handleToggleTheme}
        />

        {/* Content viewport area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
