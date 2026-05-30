/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraduationCap, Phone, Sparkles, CheckCircle2, UserPlus, X, Heart, Settings } from 'lucide-react';
import { Ustadz } from '../types';

interface UstadzViewProps {
  ustadzList: Ustadz[];
  onAddUstadz: (ustadz: Omit<Ustadz, 'id'>) => void;
}

export default function UstadzView({ ustadzList, onAddUstadz }: UstadzViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    role: 'Ustadz' as 'Musyrif' | 'Ustadz' | 'Ustadzah',
    phone: '',
    specialization: 'Tahfidz Al-Qur\'an',
    halaqahName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAddUstadz({
      name: formData.name,
      role: formData.role,
      phone: formData.phone || '0812-xxxx-xxxx',
      specialization: formData.specialization,
      halaqahName: formData.halaqahName || undefined,
      status: 'Aktif'
    });

    setSuccess(`Guru Pembina ${formData.name} berhasil ditambahkan!`);
    setTimeout(() => setSuccess(null), 3000);

    setIsAddOpen(false);
    setFormData({
      name: '',
      role: 'Ustadz',
      phone: '',
      specialization: 'Tahfidz Al-Qur\'an',
      halaqahName: ''
    });
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-sm flex items-center gap-3 border border-emerald-200 text-left">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold font-sans uppercase tracking-tight">{success}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">Roster Ustadz & Pembina Halaqah</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Daftar tenaga pengajar, musyrif, asrama perdana, dan ustadzah tahfidzul qur'an</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-sm border border-blue-700 shadow-sm flex items-center gap-2 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pembina Baru</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ustadzList.map((ust) => (
          <div key={ust.id} className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                  ust.role === 'Musyrif' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                  ust.role === 'Ustadz' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {ust.role}
                </span>
                <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider font-mono">
                  {ust.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">{ust.name}</h4>
                {ust.halaqahName && (
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight mt-1">Mengajar: {ust.halaqahName}</p>
                )}
              </div>

              {/* Specs detail list */}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Keahlian: {ust.specialization}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>WA: {ust.phone}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff popup modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm w-full max-w-md shadow-2xl border border-slate-350 overflow-hidden text-left">
            {/* Modal Head */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Tambah Guru Pembina</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">Daftarkan musyrif asrama atau ustadzah baru</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-sm border border-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ust. Abdurrahman Yusuf, Lc"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peran / Jabatan Akademik</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Musyrif' | 'Ustadz' | 'Ustadzah' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none"
                >
                  <option value="Ustadz">Ustadz (Guru Pembimbing Putra)</option>
                  <option value="Ustadzah">Ustadzah (Guru Pembimbing Putri)</option>
                  <option value="Musyrif">Musyrif (Pendamping Asrama)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spesialisasi Pembelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tajwid, Qiraah Sab'ah, Tahfidz Balita"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor HP Aktif (Wali WA)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Halaqah Ditugaskan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Halaqah Abu Bakar"
                  value={formData.halaqahName}
                  onChange={(e) => setFormData({ ...formData, halaqahName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 font-bold border border-slate-200 rounded-sm transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-sm border border-blue-700 shadow-sm transition cursor-pointer"
                >
                  Daftarkan Pembina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
