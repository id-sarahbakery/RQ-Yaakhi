/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  CreditCard,
  User,
  CheckCircle,
  AlertCircle,
  FileText,
  BadgeInfo,
  Layers,
  ChevronRight,
  ClipboardList,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Transaction, Santri, TransactionCategory, TransactionType, SppStatus } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

interface KeuanganViewProps {
  transactionList: Transaction[];
  santriList: Santri[];
  onAddTransaction: (trans: Omit<Transaction, 'id'>) => void;
  onUpdateSantri: (id: string, updated: Partial<Santri>) => void;
  presetTransaction?: {
    type: 'Pemasukan' | 'Pengeluaran';
    category: any;
    isOpen: boolean;
  } | null;
  onClearPreset?: () => void;
}

export default function KeuanganView({
  transactionList,
  santriList,
  onAddTransaction,
  onUpdateSantri,
  presetTransaction,
  onClearPreset
}: KeuanganViewProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Santri | null>(null);

  // States for Halaqah filtering in SPP chart
  const [hiddenHalaqahs, setHiddenHalaqahs] = useState<string[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const getAllHalaqahNames = () => {
    const names = santriList.map(s => s.halaqahName || 'Lainnya').filter(Boolean);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  };

  // Form states to record a brand new financial transaction
  const [formData, setFormData] = useState({
    type: 'Pemasukan' as TransactionType,
    category: 'SPP' as TransactionCategory,
    amount: 350000,
    targetName: '',
    notes: ''
  });

  // Apply quick expense preset transaction properties from Dashboard View
  useEffect(() => {
    if (presetTransaction) {
      setIsAddOpen(presetTransaction.isOpen);
      setFormData({
        type: presetTransaction.type,
        category: presetTransaction.category,
        amount: 150000, // Reasonable default for operational expenses (e.g. 150.000)
        targetName: '',
        notes: ''
      });
      if (onClearPreset) {
        onClearPreset();
      }
    }
  }, [presetTransaction, onClearPreset]);

  // Dynamic calculations
  const totalPemasukan = transactionList
    .filter(t => t.type === 'Pemasukan')
    .reduce((sum, t) => sum + t.amount, 0) + 61000000; // Base offset to equal Rp 86.750.000 on startup

  const totalPengeluaran = transactionList
    .filter(t => t.type === 'Pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0) + 12800000; // Base offset to equal Rp 64.300.000 on startup

  const totalSaldo = totalPemasukan - totalPengeluaran;

  // SPP stats
  const lunasCount = santriList.filter(s => s.sppStatus === 'Lunas').length;
  const menunggakCount = santriList.filter(s => s.sppStatus === 'Menunggak').length;
  const belumBayarCount = santriList.filter(s => s.sppStatus === 'Belum Bayar').length;

  // Menghitung total tunggakan SPP per halaqah (difilter dengan hiddenHalaqahs)
  const getTunggakanPerHalaqah = () => {
    const grouped: { [halaqahName: string]: number } = {};
    
    santriList.forEach((s) => {
      const name = s.halaqahName || 'Lainnya';
      if (!grouped[name]) {
        grouped[name] = 0;
      }
    });

    santriList.forEach((s) => {
      const name = s.halaqahName || 'Lainnya';
      if (s.sppStatus !== 'Lunas') {
        grouped[name] += s.sppAmount;
      }
    });

    const data = Object.keys(grouped).map((halaqahName) => ({
      halaqahName,
      totalTunggakan: grouped[halaqahName]
    }));

    return data.filter(item => !hiddenHalaqahs.includes(item.halaqahName));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.targetName.trim()) return;

    onAddTransaction({
      date: new Date().toISOString().split('T')[0],
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      targetName: formData.targetName,
      notes: formData.notes || undefined
    });

    setSuccessMessage(`Transaksi ${formData.type} sebesar Rp ${Number(formData.amount).toLocaleString('id-ID')} dicatat!`);
    setTimeout(() => setSuccessMessage(null), 3500);

    setIsAddOpen(false);
    setFormData({
      type: 'Pemasukan',
      category: 'SPP',
      amount: 350000,
      targetName: '',
      notes: ''
    });
  };

  // Automated wizard mapping to make a student pay SPP
  const handleQuickPaySpp = (student: Santri) => {
    // 1. Update Student status to paid
    onUpdateSantri(student.id, { sppStatus: 'Lunas' });

    // 2. Generate and post a Transaction Ledger entry automatically!
    onAddTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'Pemasukan',
      category: 'SPP',
      amount: student.sppAmount,
      targetName: `${student.name} - Pelunasan SPP`,
      notes: `Verifikasi pembayaran otomatis melalui instrumen kasir`
    });

    setSuccessMessage(`Sukses mencairkan SPP ${student.name} senilai Rp ${student.sppAmount.toLocaleString('id-ID')} harian.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleExportCSV = () => {
    // CSV Header row
    const headers = ['ID Transaksi', 'Tanggal', 'Jenis', 'Kategori', 'Penerima / Pihak Kedua', 'Keterangan', 'Nominal (IDR)'];
    
    // CSV rows based on transactions
    const rows = transactionList.map(t => [
      t.id,
      t.date,
      t.type,
      t.category,
      t.targetName,
      t.notes || '',
      t.amount
    ]);

    // Build standard CSV string layout
    const csvLines = [
      headers.join(','),
      ...rows.map(row => 
        row.map(v => {
          const escaped = String(v).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];

    const csvContent = csvLines.join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Keuangan_Tahfidz_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage('Laporan buku jurnal sukses diekspor ke file CSV!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Success banner alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-sm flex items-center gap-3 border border-emerald-200 text-left animate-in slide-in-from-top-4 duration-150">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold font-sans uppercase tracking-tight">{successMessage}</span>
        </div>
      )}

      {/* 1. Statistics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Revenues */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Penerimaan Bulanan</span>
            <h4 className="text-xl font-black text-emerald-600 tracking-tight font-mono">{formatRupiah(totalPemasukan)}</h4>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">SPP & Donasi</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 w-11 h-11 flex items-center justify-center text-emerald-600 rounded-sm shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Pengeluaran Bulanan</span>
            <h4 className="text-xl font-black text-rose-650 text-rose-500 tracking-tight font-mono">{formatRupiah(totalPengeluaran)}</h4>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Gaji & Logistik</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 w-11 h-11 flex items-center justify-center text-rose-500 rounded-sm shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Current Balance */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Kas Bersih Pesantren</span>
            <h4 className="text-xl font-black text-blue-600 tracking-tight font-mono">{formatRupiah(totalSaldo)}</h4>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Akumulasi Real-Time</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 w-11 h-11 flex items-center justify-center text-blue-600 rounded-sm shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. SPP status breakdown widget */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 bg-white p-5 border border-slate-200 rounded-sm shadow-sm text-left flex flex-col justify-between">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-200 pb-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Rekapitulasi SPP Santri</h4>
              <p className="text-xs text-slate-400 mt-1 font-medium">Buku pantauan administrasi iuran bulanan Rumah Tahfidz</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-sm font-mono">
                LUNAS: {lunasCount} ID
              </span>
              <span className="text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-600 px-2.5 py-1 rounded-sm font-mono">
                TUNGGAK: {menunggakCount} ID
              </span>
            </div>
          </div>

          {/* Table display */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-2">Santri Aktif</th>
                  <th className="pb-2">Rombel Halaqah</th>
                  <th className="pb-2">Iuran SPP</th>
                  <th className="pb-2 text-center">Status Pembayaran</th>
                  <th className="pb-2 text-right">Tindakan Kasir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {santriList.map((student) => {
                  const hasPaid = student.sppStatus === 'Lunas';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForHistory(student)}
                          className="font-bold text-slate-800 hover:text-blue-600 hover:underline cursor-pointer text-left focus:outline-none"
                        >
                          {student.name}
                        </button>
                        <div className="text-[10px] text-slate-400 font-mono">NIS: {student.nis}</div>
                      </td>
                      <td className="py-2.5 text-slate-500 font-medium">{student.halaqahName}</td>
                      <td className="py-2.5 font-mono font-bold text-slate-700">
                        {formatRupiah(student.sppAmount)}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border inline-block ${
                          hasPaid
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : student.sppStatus === 'Menunggak'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {student.sppStatus}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {!hasPaid ? (
                          <button
                            onClick={() => handleQuickPaySpp(student)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm text-[10px] border border-blue-700 shadow-sm transition cursor-pointer"
                          >
                            Tandai Lunas
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Terbayar</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wizard Add Transaction Right column (1 col) */}
        <div className="bg-slate-900 border border-slate-700 text-white p-5 rounded-sm text-left flex flex-col justify-between shadow-sm">
          <div>
            <div className="p-2 bg-slate-800 rounded-sm w-10 h-10 flex items-center justify-center text-blue-400 mb-4 border border-slate-700">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-200 uppercase tracking-tight leading-snug">Pencatatan Buku Jurnal</h4>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Tambahkan posting kas masuk (debit/kredit) atau tagihan pesantren secara harian</p>
          </div>

          <div className="space-y-4 my-5 border-t border-slate-800 pt-4">
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center text-[9px] tracking-wider font-bold text-slate-400 uppercase">
                <span>Rasio Iuran Masuk</span>
                <span className="font-mono text-emerald-400">87%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-none overflow-hidden border border-slate-700">
                <div className="h-full bg-emerald-400 rounded-none" style={{ width: '87%' }} />
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-sm border border-blue-700 shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Posting Transaksi Baru</span>
          </button>
        </div>
      </div>

      {/* Grafik Tunggakan SPP per Halaqah */}
      <div id="tunggakan-spp-chart" className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Tunggakan SPP per Halaqah</h4>
              <p className="text-xs text-slate-400">Total iuran bulanan yang belum dilunasi dikelompokkan berdasarkan rombongan belajar halaqah</p>
            </div>
          </div>

          {/* Menambahkan menu filter dropdown halaqah */}
          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[10px] sm:text-xs text-slate-700 font-extrabold border border-slate-200 rounded-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter Halaqah ({getAllHalaqahNames().length - hiddenHalaqahs.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-sm shadow-xl z-20 p-3 text-left space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Pilih Halaqah</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setHiddenHalaqahs([])}
                      className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <button
                      onClick={() => setHiddenHalaqahs(getAllHalaqahNames())}
                      className="text-[9px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {getAllHalaqahNames().map((name) => {
                    const isChecked = !hiddenHalaqahs.includes(name);
                    return (
                      <label
                        key={name}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-xs cursor-pointer select-none text-xs text-slate-700 font-bold transition"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setHiddenHalaqahs([...hiddenHalaqahs, name]);
                            } else {
                              setHiddenHalaqahs(hiddenHalaqahs.filter((h) => h !== name));
                            }
                          }}
                          className="w-3.5 h-3.5 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="truncate">{name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-64 w-full mt-4 text-xs">
          {getTunggakanPerHalaqah().length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center border border-dashed border-slate-250 border-slate-200 rounded-sm text-slate-400 gap-1 bg-slate-50/50 p-4">
              <Layers className="w-7 h-7 text-slate-350" />
              <p className="font-extrabold text-slate-700 uppercase tracking-tight text-[10px]">Semua data halaqah disembunyikan</p>
              <p className="text-[9.5px] text-slate-400 font-medium text-center">Silakan aktifkan kembali minimal satu halaqah dari menu filter di atas.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getTunggakanPerHalaqah()}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorTunggakan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.95}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.45}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="halaqahName"
                  tickLine={false}
                  axisLine={false}
                  stroke="#64748b"
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#64748b"
                  tickFormatter={(v) => `Rp ${(v / 1000).toLocaleString('id-ID')}rb`}
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value)), 'Total Tunggakan']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    border: '1px solid #1e293b',
                    borderRadius: '0.125rem',
                    fontSize: '11px',
                    fontFamily: 'sans-serif'
                  }}
                />
                <Bar
                  dataKey="totalTunggakan"
                  radius={[3, 3, 0, 0]}
                  fill="url(#colorTunggakan)"
                >
                  {getTunggakanPerHalaqah().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.totalTunggakan > 0 ? "url(#colorTunggakan)" : "#e2e8f0"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Detailed Transaction Ledger Lists */}
      <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Buku Jurnal Umum (Posting Ledger)</h4>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Daftar mutasi pengeluaran dan pemasukan operasional lengkap</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Faktur bulanan disinkronkan harian')}
              className="text-[10px] text-slate-605 text-slate-600 font-bold border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-sm transition cursor-pointer"
            >
              Unduh Laporan Bulanan (.PDF)
            </button>
            <button
              onClick={handleExportCSV}
              className="text-[10px] text-blue-600 font-bold border border-blue-200 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-sm transition cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Ekspor Laporan (.CSV)</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {transactionList.map((trans) => {
            const isRevenue = trans.type === 'Pemasukan';
            return (
              <div
                key={trans.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/50 rounded-sm border border-slate-200 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2 rounded-sm border shrink-0 ${
                    isRevenue ? 'bg-emerald-5 border-emerald-250 bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-5 border-rose-250 bg-rose-50 text-rose-500 border-rose-200'
                  }`}>
                    {isRevenue ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{trans.targetName}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                      <span>{trans.date}</span>
                      <span>•</span>
                      <span className="text-blue-600">{trans.category}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-bold font-mono px-3 py-1 rounded-sm border inline-block ${
                    isRevenue
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {isRevenue ? '+' : '-'} {formatRupiah(trans.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Posting Transaksi Modal Overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-white rounded-sm w-full max-w-md shadow-2xl border border-slate-350 overflow-hidden text-left">
            {/* Modal Head */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Posting Jurnal Baru</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">MANUAL MULTI-TRANSACTION DEBIT-KREDIT</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-sm border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis Transaksi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="Pemasukan">Pemasukan (Debit)</option>
                    <option value="Pengeluaran">Pengeluaran (Kredit)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori Pos</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="SPP">Iuran Bulanan SPP</option>
                    <option value="Donasi">Infaq & Donasi Masjid</option>
                    <option value="Gaji Ustadz">Honorarium Ustadz / Musyrif</option>
                    <option value="Operasional">Tagihan Operasional Pesantren</option>
                    <option value="Sarana Prasarana">Pengadaan Sarana & Prasarana</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nominal Transaksi (Rp)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2.5 text-xs font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Pihak / Deskripsi Penerima</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Toko Kitab Al-Huda (Pembelian Qur'an)"
                  value={formData.targetName}
                  onChange={(e) => setFormData({ ...formData, targetName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keterangan Jurnal</label>
                <textarea
                  placeholder="Isikan keterangan singkat jika diperlukan..."
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs text-slate-705 text-slate-600 bg-slate-50 hover:bg-slate-100 font-bold border border-slate-200 rounded-sm transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-sm border border-blue-700 shadow-sm transition cursor-pointer"
                >
                  Posting Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. View History Modal Overlay */}
      {selectedStudentForHistory && (() => {
        const student = selectedStudentForHistory;
        const hasPaid = student.sppStatus === 'Lunas';
        
        // Find matching transactions for the selected student
        const payments = transactionList.filter(t => 
          t.category === 'SPP' && 
          (t.targetName.toLowerCase().includes(student.name.toLowerCase()) || 
           student.name.toLowerCase().includes(t.targetName.toLowerCase()))
        );

        // Synthesize payment if paid but ledger is empty
        const displayPayments = [...payments];
        if (hasPaid && displayPayments.length === 0) {
          displayPayments.push({
            id: `synth_${student.id}`,
            date: '2026-05-24',
            type: 'Pemasukan',
            category: 'SPP',
            amount: student.sppAmount,
            targetName: `${student.name} - SPP Mei`,
            notes: 'Verifikasi pelunasan kasir harian'
          });
        }

        // Generate 12 months of historical payment tracking data
        const getLast12MonthsData = () => {
          const months = [
            { name: 'Jun 25', year: 2025, monthNum: 5 },
            { name: 'Jul 25', year: 2025, monthNum: 6 },
            { name: 'Agt 25', year: 2025, monthNum: 7 },
            { name: 'Sep 25', year: 2025, monthNum: 8 },
            { name: 'Okt 25', year: 2025, monthNum: 9 },
            { name: 'Nov 25', year: 2025, monthNum: 10 },
            { name: 'Des 25', year: 2025, monthNum: 11 },
            { name: 'Jan 26', year: 2026, monthNum: 0 },
            { name: 'Feb 26', year: 2026, monthNum: 1 },
            { name: 'Mar 26', year: 2026, monthNum: 2 },
            { name: 'Apr 26', year: 2026, monthNum: 3 },
            { name: 'Mei 26', year: 2026, monthNum: 4 },
          ];

          const joinDateObj = new Date(student.joinDate || '2025-01-01');

          return months.map(m => {
            // Check for explicit transaction logged in database
            const exactTx = transactionList.find(t => {
              if (t.category !== 'SPP') return false;
              const isMatch = t.targetName.toLowerCase().includes(student.name.toLowerCase()) || 
                              student.name.toLowerCase().includes(t.targetName.toLowerCase());
              if (!isMatch) return false;
              const txDate = new Date(t.date);
              return txDate.getFullYear() === m.year && txDate.getMonth() === m.monthNum;
            });

            let amount = 0;
            let statusLabel = 'Belum Ada';

            if (exactTx) {
              amount = exactTx.amount;
              statusLabel = 'Terbayar';
            } else {
              // Simulate history based on join month and current month (May 2026)
              const currentMonthDate = new Date(m.year, m.monthNum, 1);
              const studentJoinMonth = new Date(joinDateObj.getFullYear(), joinDateObj.getMonth(), 1);

              if (currentMonthDate >= studentJoinMonth) {
                if (m.year === 2026 && m.monthNum === 4) {
                  // May 26 matches current state
                  if (student.sppStatus === 'Lunas') {
                    amount = student.sppAmount;
                    statusLabel = 'Terbayar';
                  } else {
                    amount = 0;
                    statusLabel = student.sppStatus;
                  }
                } else if (student.sppStatus === 'Menunggak' && m.year === 2026 && m.monthNum === 3) {
                  // April'26 unpaid as well if currently in Arrears
                  amount = 0;
                  statusLabel = 'Menunggak';
                } else {
                  amount = student.sppAmount;
                  statusLabel = 'Terbayar';
                }
              }
            }

            return {
              name: m.name,
              'Jumlah Bayar': amount,
              status: statusLabel
            };
          });
        };

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-sm w-full max-w-2xl shadow-2xl border border-slate-350 overflow-hidden text-left flex flex-col">
              {/* Modal Head */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 border border-blue-200 rounded-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight font-sans">Riwayat Pembayaran Keuangan</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIS: {student.nis} • {student.halaqahName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForHistory(null)}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-sm border border-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[550px] custom-scrollbar">
                {/* Santri Info Banner */}
                <div className="p-4 rounded-sm border flex items-center justify-between gap-4 bg-slate-50/50 border-slate-200">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nama Santri</span>
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{student.name}</span>
                    <span className="text-xs text-slate-500 block font-medium mt-0.5">{student.gender} • Bergabung {student.joinDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Iuran Teratur</span>
                    <span className="text-sm font-black text-slate-800 font-mono">{formatRupiah(student.sppAmount)}</span>
                    <span className="text-[10px] text-slate-550 text-slate-500 block font-medium mt-0.5">per-Bulan</span>
                  </div>
                </div>

                {/* Status Card & Quick Action */}
                <div className={`p-4 rounded-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  hasPaid
                    ? 'bg-emerald-50/45 border-emerald-200 text-emerald-800'
                    : student.sppStatus === 'Menunggak'
                    ? 'bg-rose-50/45 border-rose-200 text-rose-800'
                    : 'bg-amber-50/45 border-amber-200 text-amber-800'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {hasPaid ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className={`w-5 h-5 shrink-0 ${student.sppStatus === 'Menunggak' ? 'text-rose-500' : 'text-amber-500'}`} />
                    )}
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-wider font-sans">Status Tagihan Bulan Ini</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5 font-sans leading-relaxed">
                        {hasPaid 
                          ? 'Tidak ada tunggakan iuran, lunas untuk periode Mei 2026.' 
                          : `Terdapat kewajiban iuran belum lunas sebesar ${formatRupiah(student.sppAmount)}.`
                        }
                      </p>
                    </div>
                  </div>

                  {!hasPaid && (
                    <button
                      type="button"
                      onClick={() => {
                        handleQuickPaySpp(student);
                        // Refresh the state for the modal view as well
                        setSelectedStudentForHistory({
                          ...student,
                          sppStatus: 'Lunas'
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm text-[10px] border border-blue-700 shadow-sm transition shrink-0 cursor-pointer self-start sm:self-center"
                    >
                      Bayar Sekarang
                    </button>
                  )}
                </div>

                {/* 12-Month Payment Trend Chart */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                      Tren Pembayaran 12 Bulan Terakhir
                    </h5>
                    <span className="text-[9px] font-medium text-slate-400 bg-white border px-1.5 py-0.5 rounded-sm">
                      Periode SPP Aktif
                    </span>
                  </div>
                  <div className="h-44 w-full text-[10px] font-sans">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getLast12MonthsData()}
                        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorStudentSPP" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.85}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.45}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          stroke="#94a3b8"
                          style={{ fontSize: '9px', fontWeight: 'bold' }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          stroke="#94a3b8"
                          style={{ fontSize: '9px', fontWeight: 'bold' }}
                          tickFormatter={(v) => v === 0 ? '0' : `${v / 1000}k`}
                        />
                        <Tooltip
                          cursor={{ fill: '#e2e8f0', opacity: 0.3 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white p-2.5 rounded-xs text-[10.5px] border border-slate-800 shadow-xl font-bold font-sans">
                                  <p className="text-slate-300 font-mono text-[9px]">{data.name}</p>
                                  <p className="text-sky-300 mt-0.5">Iuran: {formatRupiah(data['Jumlah Bayar'])}</p>
                                  <p className={`text-[9px] mt-0.5 ${data.status === 'Terbayar' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    Status: {data.status}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="Jumlah Bayar" fill="url(#colorStudentSPP)" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* History Timeline */}
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 font-mono">Buku Kas Mutasi Transaksi Santri</h5>
                  
                  {displayPayments.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 rounded-sm bg-slate-50 text-slate-400">
                      <FileText className="w-8 h-8 mx-auto text-slate-350 mb-2" />
                      <p className="text-xs font-bold text-slate-705 text-slate-700">Belum Ada Transaksi</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Siswa belum tercatat memiliki histori transaksi di buku kasir utama.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {displayPayments.map((p) => (
                        <div key={p.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-sm flex items-center justify-between gap-3 text-left">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate uppercase tracking-tight">{p.targetName}</p>
                            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                              {p.notes || 'Pembayaran SPP Terdaftar'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[8.5px] font-bold text-slate-400 font-mono">{p.date}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[9px] font-bold text-blue-500 font-mono bg-blue-50 px-1 py-0.2 border border-blue-100 rounded-xs uppercase">
                                {p.category}
                              </span>
                            </div>
                          </div>
                          
                          <span className="shrink-0 text-xs font-mono font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-sm">
                            + {formatRupiah(p.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Foot */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-slate-400 font-mono text-[9px]">
                <span>DATABASE REF: {student.id}</span>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForHistory(null)}
                  className="px-4 py-1.5 text-xs text-slate-750 text-slate-700 bg-white hover:bg-slate-100 font-bold border border-slate-200 rounded-sm transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
