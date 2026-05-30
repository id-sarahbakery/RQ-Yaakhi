/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Menu, Search, Bell, ChevronDown, User, LogOut, Settings, HelpCircle, BadgeInfo, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function Header({
  currentView,
  onViewChange,
  searchQuery,
  setSearchQuery,
  setSidebarOpen,
  theme,
  onThemeToggle
}: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Map view IDs to clean humanized headers
  const getHeaderDetails = (view: string) => {
    switch (view) {
      case 'dashboard':
        return { title: 'Dashboard', desc: 'Ringkasan aktivitas dan perkembangan lembaga' };
      case 'santri':
        return { title: 'Data Santri', desc: 'Manajemen data lengkap, progres, & rekam SPP santri' };
      case 'halaqah':
        return { title: 'Halaqah Aktif', desc: 'Kelompok belajar hafalan & pembagian ustadz pembina' };
      case 'ustadz':
      case 'sdm':
        return { title: 'SDM / Ustadz & Musyrif', desc: 'Manajemen tenaga pengajar & pembina halaqah' };
      case 'setoran-new':
        return { title: 'Setoran Hafalan', desc: 'Input setoran hafalan & murajaah terbaru harian' };
      case 'keuangan':
        return { title: 'Laporan Keuangan', desc: 'Pemasukan SPP, donasi masjid, & pengeluaran operasional' };
      case 'mutabaah':
        return { title: 'Mutaba\'ah Ibadah', desc: 'Pantau kedisiplinan ibadah harian santri' };
      case 'absensi':
        return { title: 'Absensi Santri', desc: 'Daftar kehadiran harian santri di halaqah masing-masing' };
      case 'pengaturan':
        return { title: 'Sistem Informasi', desc: 'Konfigurasi parameter sistem, kuota, & basis data' };
      default:
        // Capitalize and format
        const cleanName = view.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { title: cleanName, desc: `Kelola modul ${cleanName} lembaga secara responsif` };
    }
  };

  const details = getHeaderDetails(currentView);

  const mockAlerts = [
    { id: 1, title: 'Menunggak Pembayaran', text: 'Spp Fatimah Azzahra menunggak 1 bulan', time: '10 mnt lalu' },
    { id: 2, title: 'Setoran Belum Selesai', text: '42 santri belum menyetor hafalan hari ini', time: '1 jam lalu' },
    { id: 3, title: 'Request Cuti', text: 'Ustzh. Sarah mengajukan cuti mengajar', time: '1 hari lalu' }
  ];

  return (
    <header
      id="top-header"
      className="sticky top-0 bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 z-30"
    >
      {/* Search Bar / Menu Button */}
      <div className="flex items-center gap-4 flex-1">
        <button
          id="toggle-sidebar-btn"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-sm border border-slate-200"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Page Breadcrumbs (Hidden on ultra small screens) */}
        <div id="header-breadcrumbs" className="hidden md:flex items-center gap-3 text-left mr-4">
          <h2 className="text-base font-extrabold text-slate-900 leading-none tracking-tight">
            {details.title}
          </h2>
          <div className="h-4 w-[1px] bg-slate-300"></div>
          <span className="text-xs text-slate-500 font-medium">
            {details.desc}
          </span>
        </div>

        {/* Global Action Search Input */}
        <div className="relative max-w-sm w-full hidden sm:block">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Cari santri, setoran, halaqah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 border border-slate-200 rounded-sm focus:bg-white focus:border-blue-600 focus:outline-none transition-all duration-155"
          />
        </div>
      </div>

      {/* Right Column Utilities */}
      <div className="flex items-center gap-4">
        {/* Urgent System Notice banner */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-800 text-[11px] rounded-sm font-semibold border border-amber-200">
          <BadgeInfo className="w-3.5 h-3.5 text-amber-600" />
          <span>Tunggakan SPP: 18 santri belum lunas.</span>
        </div>

        {/* System Date Display */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-400 text-xs font-semibold px-2 font-mono">
          <span>Kamis, 23 Mei 2024</span>
        </div>

        {/* Theme Toggle Button (Light/Dark Mode switch) */}
        <button
          type="button"
          id="toggle-theme-btn"
          onClick={onThemeToggle}
          className="p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center"
          title={theme === 'dark' ? 'Aktifkan Mode Terang (Light Mode)' : 'Aktifkan Mode Gelap (Dark Mode)'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-500 animate-[spin_8s_linear_infinite]" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            id="bell-notification-btn"
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setProfileOpen(false);
            }}
            className="relative p-2 hover:bg-slate-50 rounded-sm border border-slate-200 text-slate-600 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-[-4px] right-[-4px] w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center rounded-sm">
              12
            </span>
          </button>

          {notificationOpen && (
            <div
              id="notification-dropdown"
              className="absolute right-0 mt-2 w-80 bg-white rounded-sm shadow-xl border border-slate-200 overflow-hidden py-1 z-40 animate-in fade-in slide-in-from-top-3 duration-100"
            >
              <div className="p-3 border-b border-slate-250 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold text-slate-800">Notifikasi</span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline">
                  Tandai semua dibaca
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {mockAlerts.map(alert => (
                  <div key={alert.id} className="p-3 hover:bg-slate-50 border-b border-slate-100 text-left cursor-pointer transition-colors">
                    <p className="text-xs font-bold text-slate-900">{alert.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{alert.text}</p>
                    <span className="text-[9px] text-slate-400 font-semibold mt-1 inline-block">{alert.time}</span>
                  </div>
                ))}
              </div>
              <div
                className="p-2 border-t border-slate-200 text-center bg-slate-50/30"
                onClick={() => {
                  onViewChange('pengumuman');
                  setNotificationOpen(false);
                }}
              >
                <button className="text-[11px] text-blue-600 font-bold hover:underline">
                  Lihat Semua Pengumuman
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Account Avatar Trigger */}
        <div className="relative">
          <button
            id="profile-dropdown-btn"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 px-2.5 hover:bg-slate-50 rounded-sm border border-slate-200 transition-all text-left bg-white"
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256"
              alt="Admin Avatar"
              className="w-7 h-7 rounded-sm object-cover border border-slate-300"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-none">Admin Utama</p>
              <p className="text-[9px] text-slate-400 font-bold mt-1">Super Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div
              id="profile-dropdown-menu"
              className="absolute right-0 mt-2 w-56 bg-white rounded-sm shadow-xl border border-slate-200 overflow-hidden py-1 z-40 animate-in fade-in slide-in-from-top-3 duration-100"
            >
              <div className="p-3 border-b border-slate-200 text-left bg-slate-50/50">
                <p className="text-xs font-bold text-slate-900">id.sarahbakery@gmail.com</p>
                <p className="text-[9px] text-indigo-600 font-semibold mt-0.5">ID: 1b8350d4-6353</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    onViewChange('pengaturan');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-55 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Pengaturan Sistem</span>
                </button>
                <button
                  onClick={() => {
                    onViewChange('santri');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profil Santri</span>
                </button>
                <button
                  onClick={() => {
                    alert('Meluncurkan panduan sistem terintegrasi');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Pusat Bantuan</span>
                </button>
              </div>
              <div className="border-t border-slate-200 py-1">
                <button
                  onClick={() => alert('Sistem diamankan. Ini adalah mode demonstrasi.')}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-xs text-[#df2020] hover:bg-red-50/50 font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun (Demo)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
