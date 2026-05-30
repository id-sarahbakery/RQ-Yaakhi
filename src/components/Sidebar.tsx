/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  GraduationCap,
  ClipboardList,
  BookOpen,
  CheckSquare,
  Sparkles,
  DollarSign,
  FileText,
  UserCheck,
  Smartphone,
  Bell,
  Settings,
  X,
  BookMarked
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

export default function Sidebar({ currentView, onViewChange, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const menuSections: MenuSection[] = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'AKADEMIK',
      items: [
        { id: 'santri', label: 'Data Santri', icon: Users },
        { id: 'halaqah', label: 'Halaqah', icon: Layers },
        { id: 'ustadz', label: 'Musyrif / Ustadz', icon: GraduationCap },
        { id: 'setoran-new', label: 'Setoran Hafalan', icon: ClipboardList },
        { id: 'murajaah', label: 'Murajaah', icon: BookOpen },
        { id: 'tahsin', label: 'Tahsin & Tajwid', icon: Sparkles },
        { id: 'evaluasi', label: 'Evaluasi', icon: BookMarked }
      ]
    },
    {
      title: 'IBADAH & MUTABA\'AH',
      items: [
        { id: 'mutabaah', label: 'Mutaba\'ah Ibadah', icon: CheckSquare },
        { id: 'absensi', label: 'Absensi Santri', icon: UserCheck }
      ]
    },
    {
      title: 'MANAJEMEN',
      items: [
        { id: 'sdm', label: 'SDM Ustadz', icon: Users },
        { id: 'keuangan', label: 'Keuangan', icon: DollarSign },
        { id: 'laporan', label: 'Pimpinan & Laporan', icon: FileText }
      ]
    },
    {
      title: 'APLIKASI & SISTEM',
      items: [
        { id: 'e-learning', label: 'E-Learning Tahfidz', icon: GraduationCap },
        { id: 'mobile', label: 'Mobile App', icon: Smartphone },
        { id: 'pengumuman', label: 'Pengumuman', icon: Bell },
        { id: 'pengaturan', label: 'Pengaturan', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Background overlay for mobile */}
      {sidebarOpen && (
        <div
          id="sidebar-overlay"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Logo */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center text-white font-bold shrink-0">
              RT
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight text-slate-900 leading-none">RUMAH TAHFIDZ</p>
              <p className="text-[10px] text-slate-400 font-extrabold tracking-wider mt-1.5 uppercase">SISTEM INTEGRASI</p>
            </div>
          </div>
          <button
            id="close-sidebar-btn"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-slate-50 text-slate-500 rounded-sm border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar">
          {menuSections.map((section, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {section.title && (
                <p className="text-[10px] font-bold text-slate-400 tracking-wider px-2 py-1 select-none">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-menu-${item.id}`}
                      onClick={() => {
                        onViewChange(item.id);
                        setSidebarOpen(false); // Close on mobile navigation tap
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-semibold transition-all duration-155 text-left relative ${
                        isActive
                          ? 'bg-slate-100 text-blue-600 border-l-2 border-blue-600'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="absolute right-2.5 w-1 h-3 bg-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Administrator Profile Card */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="p-4 bg-slate-900 text-white rounded-sm flex items-center justify-between gap-3 shadow-md hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
                  alt="Admin Profile"
                  className="w-10 h-10 rounded-sm object-cover border border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-slate-900" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold leading-tight truncate">Super Admin</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">Administrator</p>
              </div>
            </div>
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </aside>
    </>
  );
}
