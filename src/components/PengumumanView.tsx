/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Filter,
  Plus,
  Search,
  Trash,
  Sparkles,
  Megaphone,
  CheckCircle2,
  CalendarDays,
  Tag
} from 'lucide-react';
import { Announcement } from '../types';

interface PengumumanViewProps {
  announcements: Announcement[];
  onAddAnnouncement: (newAnn: Omit<Announcement, 'id'>) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export default function PengumumanView({
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement
}: PengumumanViewProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | Announcement['category']>('Semua');

  // Input state for administrative form
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('Umum');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subtitle) return;

    onAddAnnouncement({
      title,
      subtitle,
      date: date || 'Baru saja',
      category
    });

    setSuccessMessage(`Pengumuman "${title}" berhasil dilaunching ke mading pesantren!`);
    setTimeout(() => setSuccessMessage(null), 4000);

    // Reset inputs
    setTitle('');
    setSubtitle('');
    setCategory('Umum');
  };

  // Filtered array
  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ann.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || ann.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header block */}
      <div>
        <h2 id="pengumuman-page-title" className="text-xl font-black text-slate-900 uppercase tracking-tight">Warta & Pengumuman Pesantren</h2>
        <p className="text-xs text-slate-500 font-mono mt-1">SISTEM DISKURSUS BULLETIN DIGITAL, INFORMASI AKADEMIK & MADING AKTIVITAS</p>
      </div>

      {successMessage && (
        <div id="pengumuman-success-banner" className="p-4 bg-emerald-50 text-emerald-805 text-emerald-800 border border-emerald-200 rounded-sm flex items-center gap-3 animate-in slide-in-from-top-4 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-tight">{successMessage}</span>
        </div>
      )}

      {/* 2. Standard visual layout grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Form publisher (5 columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-sm shadow-sm h-fit">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Terbitkan Maklumat Baru</h3>
              <p className="text-[9.5px]/none text-slate-400 font-bold font-mono tracking-wide mt-1.5 uppercase">KONSUL ADMINISTRATOR</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-6 font-medium">Tuliskan pengumuman penting mengenai kBM, iuran asrama, hari libur nasional, atau ujian tasmi'.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Judul Maklumat</label>
              <input
                type="text"
                required
                placeholder="Contoh: Libur Penutupan Akhir Tahun"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-202 text-xs border-slate-200 rounded-sm px-3 py-2.5 focus:bg-white focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            {/* Content / description */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deskripsi Maklumat Detail</label>
              <textarea
                required
                placeholder="Tuliskan detail tempat, hari, jam, instruksi kepulangan, dsb secara rinci di sini."
                rows={4}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-202 text-xs border-slate-200 rounded-sm px-3 py-2 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori Informasi</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 text-xs text-slate-705 text-slate-700 font-bold border border-slate-200 rounded-sm px-2.5 py-2.5 focus:bg-white focus:outline-none"
                >
                  <option value="Umum">Umum</option>
                  <option value="Libur">Libur Kegiatan</option>
                  <option value="Tasmi">Tasmi' Akbar</option>
                  <option value="Pendaftaran">Pendaftaran Baru</option>
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Ditetapkan Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 text-xs border border-slate-200 rounded-sm px-3 py-2.5 focus:bg-white focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Play/Save Action Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-sm border border-blue-700 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Broadcast Pengumuman</span>
            </button>
          </form>
        </div>

        {/* Right Column: Dynamic Notice list (7 columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-sm shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1 uppercase tracking-tight font-sans">Mading Bulletin Board</h3>
              <p className="text-xs text-slate-500 font-medium">Brosur bulletin mading pesantren harian yang dipublish oleh pengurus asrama.</p>
            </div>

            {/* Notice filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kata kunci bulletin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 text-[11px] placeholder-slate-400 pl-8 pr-2 py-2 border border-slate-200 rounded-sm focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2 py-2 text-[11px] font-bold text-slate-600 focus:outline-none"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Libur">Libur Kegiatan</option>
                  <option value="Tasmi">Tasmi' Akbar</option>
                  <option value="Pendaftaran">Pendaftaran</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[440px] custom-scrollbar space-y-4 pr-1 flex-1 mt-4">
            {filteredAnnouncements.length === 0 ? (
              <div className="p-12 text-center rounded-sm border border-dashed border-slate-200">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[10px]">Mading kosong harian</p>
              </div>
            ) : (
              filteredAnnouncements.map((ann) => {
                let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-205 border-slate-200';
                if (ann.category === 'Libur') badgeStyle = 'bg-rose-50 border-rose-200 text-rose-700';
                if (ann.category === 'Tasmi') badgeStyle = 'bg-indigo-50 border-indigo-200 text-indigo-700';
                if (ann.category === 'Pendaftaran') badgeStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700';

                return (
                  <div key={ann.id} className="p-4 bg-slate-50 hover:bg-slate-100/40 border border-slate-200 rounded-sm text-left transition flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-black border uppercase tracking-wider px-2 py-0.5 rounded-xs ${badgeStyle}`}>
                          {ann.category === 'Tasmi' ? "Tasmi' Akbar" : ann.category}
                        </span>
                        
                        <span className="text-[9.5px] font-bold text-slate-400 font-mono uppercase inline-flex items-center gap-1">
                          <CalendarDays className="w-3 h-3 text-slate-350" />
                          <span>{ann.date}</span>
                        </span>
                      </div>

                      <h4 className="text-[12.5px] font-black text-slate-900 leading-snug">{ann.title}</h4>
                      <p className="text-xs leading-relaxed text-slate-600 font-medium font-sans whitespace-pre-wrap">{ann.subtitle}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin mendownload arisip atau menghapus bulletin ini?`)) {
                          onDeleteAnnouncement(ann.id);
                        }
                      }}
                      className="p-1.5 text-slate-350 hover:text-red-500 hover:bg-rose-50 border border-transparent hover:border-rose-250 rounded-sm transition shrink-0 cursor-pointer"
                      title="Hapus Maklumat"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
