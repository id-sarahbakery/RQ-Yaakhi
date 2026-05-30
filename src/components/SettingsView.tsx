/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Save, RefreshCw, BadgeInfo, HelpCircle } from 'lucide-react';

interface SettingsViewProps {
  onResetData: () => void;
  onInjectDummyData: () => void;
}

export default function SettingsView({ onResetData, onInjectDummyData }: SettingsViewProps) {
  const [appName, setAppName] = useState('Rumah Tahfidz - Sistem Terintegrasi');
  const [address, setAddress] = useState('Jl. Al-Ikhlas No. 12, Kel. Qur\'an City, Jakarta Barat');
  const [currency, setCurrency] = useState('IDR (Rupiah)');
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('Pengaturan sistem berhasil diperbarui secara lokal!');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-sm flex items-center gap-3 border border-emerald-200 text-left">
          <BadgeInfo className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold font-sans uppercase tracking-tight">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* General Options input form (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white p-6 border border-slate-200 rounded-sm shadow-sm space-y-4 text-left">
          <div className="flex items-center gap-2.5 mb-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Konfigurasi Lembaga</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Sesuaikan nama madrasah yayasan dan alamat pengiriman SPP</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lembaga (Sistem Terintegrasi)</label>
            <input
              type="text"
              required
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Kantor Yayasan / Pesantren</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mata Uang Acuan Finansial</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none"
            >
              <option>IDR (Rupiah)</option>
              <option>USD (United States Dollar)</option>
              <option>SAR (Saudi Arabian Riyal)</option>
            </select>
          </div>

          {/* Save button */}
          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-sm border border-slate-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>

        {/* Database Management Tools (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 border border-slate-200 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-2 bg-red-50 text-red-650 border border-red-200 rounded-sm">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#df2020] uppercase tracking-tight">Utilitas Basis Data</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Mengatur parameter simulasi database lokal harian</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Reset database button */}
              <div className="p-3 bg-red-50/40 rounded-sm border border-red-200">
                <h4 className="text-xs font-bold text-rose-800 uppercase tracking-tight text-[10px]">Kembalikan Data Ke Setelan Awal</h4>
                <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">Menghapus seluruh perubahan modifikasi dan mereset data siswa dan kasir ke setelan pabrik.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin mereset seluruh database lokal? Tindakan ini tidak dapat dibatalkan.')) {
                      onResetData();
                      alert('Seluruh data berhasil di-reset kembali!');
                    }
                  }}
                  className="mt-3 px-3.5 py-1.5 bg-[#df2020] text-white hover:bg-red-700 text-xs font-bold rounded-sm border border-red-700 shadow-sm transition cursor-pointer"
                >
                  Reset Basis Data
                </button>
              </div>

              {/* Inject dummy simulations */}
              <div className="p-3 bg-blue-50/40 rounded-sm border border-blue-200">
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-tight text-[10px]">Injeksi Data Penerimaan Otomatis</h4>
                <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">Gunakan untuk merekrut 10 santri, posting beberapa donasi pelunasan SPP, serta membuat setoran hafalan acak.</p>
                <button
                  type="button"
                  onClick={() => {
                    onInjectDummyData();
                    alert('Data simulasi acak sukses diposting to database harian!');
                  }}
                  className="mt-3 px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded-sm border border-blue-700 shadow-sm transition cursor-pointer"
                >
                  Injeksi Amunisi Data
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-4 border-t border-slate-100 mt-6 md:mt-0">
            <HelpCircle className="w-4 h-4 text-slate-300" />
            <span>Versi Kontrol: v1.0.4 - Build OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
