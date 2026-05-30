/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Award,
  Coffee,
  Plus,
  Clock,
  MapPin,
  Tag,
  X,
  User,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export interface PesantrenEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // Optional end date for multi-day events
  time: string;
  location: string;
  mentor: string;
  category: 'Tasmi' | 'Ujian' | 'Libur';
  description: string;
}

export default function KalenderPesantren() {
  // Initial pre-populated structured schedules
  const [events, setEvents] = useState<PesantrenEvent[]>([
    {
      id: 'ev_1',
      title: 'Tasmi\' Akbar Juz 30 Sekali Duduk',
      date: '2026-05-12',
      time: '08:00 - 11:30 WIB',
      location: 'Masjid Jami\' Pesantren',
      mentor: 'Ustadz Hamzah Abdul Malik',
      category: 'Tasmi',
      description: 'Penyimakan hafalan Juz 30 oleh santri Ahmad Syakir di hadapan seluruh asatidzah dan santri.'
    },
    {
      id: 'ev_2',
      title: 'Tasmi\' Bil Ghaib 5 Juz (Juz 1-5)',
      date: '2026-05-20',
      time: '13:00 - 15:30 WIB',
      location: 'Aula Gedung Tahfidz Lt. 2',
      mentor: 'Ustadz Luqman Nur Hakim',
      category: 'Tasmi',
      description: 'Setoran sekali duduk juz 1 sampai dengan juz 5 oleh santriwati Raihana Azzahra.'
    },
    {
      id: 'ev_3',
      title: 'Ujian Tasmi\' Kelayakan Sanad Juz 29',
      date: '2026-05-25',
      time: '07:30 - 09:30 WIB',
      location: 'Saung Halaqah B-3',
      mentor: 'Ustadz Rahmat Hidayat',
      category: 'Ujian',
      description: 'Ujian kelayakan pelafalan dan tajwid makhraj sebelum mendapatkan sanad hafalan Juz 29.'
    },
    {
      id: 'ev_4',
      title: 'Evaluasi & Ujian Tahfidz Semester Genap',
      date: '2026-05-26',
      endDate: '2026-05-28',
      time: '07:00 - selesai WIB',
      location: 'Masing-masing Halaqah',
      mentor: 'Masing-masing Pembina',
      category: 'Ujian',
      description: 'Penilaian serentak pencapaian hafalan, kelancaran mutqin, dan tartil hafalan semester genap.'
    },
    {
      id: 'ev_5',
      title: 'Libur Hari Raya Idul Adha 1447 H',
      date: '2026-05-28',
      endDate: '2026-05-31',
      time: 'Sepanjang Hari',
      location: 'Kediaman Masing-masing Santri',
      mentor: 'Panitia Pengasuhan Kesantrian',
      category: 'Libur',
      description: 'Santri diperkenankan pulang ke rumah wali santri masing-masing untuk melaksanakan ibadah Idul Adha bersama keluarga.'
    },
    {
      id: 'ev_6',
      title: 'Tasmi\' Akbar Khotmil Qur\'an 30 Juz',
      date: '2026-06-03',
      time: '06:00 - 18:00 WIB',
      location: 'Masjid Utama Pesantren',
      mentor: 'K.H. Abdurrahman Wahid, Lc.',
      category: 'Tasmi',
      description: 'Acara puncak wisuda puncak tasmi\' 30 juz sekali duduk nonstop oleh wisudawan berprestasi.'
    },
    {
      id: 'ev_7',
      title: 'Ujian Komprehensif Skala Nasional',
      date: '2026-06-08',
      time: '08:00 - 12:00 WIB',
      location: 'Laboratorium & Aula Utama',
      mentor: 'Tim Penguji Pusat Kemenag',
      category: 'Ujian',
      description: 'Ujian standarisasi mutu kelulusan materi diniyyah dan tahfidz secara nasional.'
    },
    {
      id: 'ev_8',
      title: 'Libur Akhir Tahun Ajaran Pondok',
      date: '2026-06-15',
      endDate: '2026-06-25',
      time: 'Sepanjang Hari',
      location: 'Lembaga Ponpes Center',
      mentor: 'Keluarga Besar Yayasan',
      category: 'Libur',
      description: 'Masa libur panjang kenaikan kelas dan tahun ajaran baru sebelum penyambutan santri tahun ajaran berikutnya.'
    }
  ]);

  // Calendar State
  // Default centered in May 2026 (based on current app date)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(4); // 4 = May in 0-indexed JS, but let's manage clearly as 1-12. Let's use 0-indexed (0=Jan, 4=May, 5=Jun)
  
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-05-26');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'Semua' | 'Tasmi' | 'Ujian' | 'Libur'>('Semua');
  
  // Custom Add Event Dialogue Modal State
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('2026-05-27');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('08:00 - 10:00 WIB');
  const [newLocation, setNewLocation] = useState<string>('Masjid Jami\' Pesantren');
  const [newMentor, setNewMentor] = useState<string>('Ustadz Hamzah');
  const [newCategory, setNewCategory] = useState<'Tasmi' | 'Ujian' | 'Libur'>('Tasmi');
  const [newDesc, setNewDesc] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  const monthsList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Handler calendar navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate days array for grid
  const getDaysInMonth = (year: number, month: number) => {
    // day of week for the 1st of that month
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday ...
    // total days in this month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // adjust calendar grid offset (we start weeks on Monday for elegant localized boarding school style)
    // Sunday (0) becomes 6, Monday (1) becomes 0, etc.
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const days: ({ isEmpty: boolean; dateNum?: number; dateStr?: string })[] = [];
    
    // pre-fill empty calendar slots
    for (let i = 0; i < startOffset; i++) {
      days.push({ isEmpty: true });
    }
    
    // fill actual month days
    for (let d = 1; d <= totalDays; d++) {
      const dayStr = d < 10 ? `0${d}` : `${d}`;
      const monthStr = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      days.push({
        isEmpty: false,
        dateNum: d,
        dateStr
      });
    }
    
    return days;
  };

  const gridDays = getDaysInMonth(currentYear, currentMonth);

  // Checks if a given date string is covered by an event
  const getEventsForDate = (dateStr: string) => {
    return events.filter(e => {
      if (e.date === dateStr) return true;
      if (e.endDate) {
        // Multi-day event coverage check
        return dateStr >= e.date && dateStr <= e.endDate;
      }
      return false;
    });
  };

  // Add simulated event submission
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const freshEvent: PesantrenEvent = {
      id: `ev_${Date.now()}`,
      title: newTitle,
      date: newDate,
      endDate: newEndDate || undefined,
      time: newTime,
      location: newLocation,
      mentor: newMentor,
      category: newCategory,
      description: newDesc || 'Tidak ada deskripsi tambahan.'
    };

    setEvents(prev => [...prev, freshEvent]);
    setIsAddOpen(false);
    
    // Reset fields
    setNewTitle('');
    setNewDate('2026-05-27');
    setNewEndDate('');
    setNewTime('08:00 - 10:00 WIB');
    setNewLocation('Masjid Jami\' Pesantren');
    setNewMentor('Ustadz Hamzah');
    setNewCategory('Tasmi');
    setNewDesc('');

    setNotification(`Jadwal "${freshEvent.title}" berhasil ditambahkan ke dalam sistem kalender.`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter events according to general list selection
  const filteredEvents = events.filter((e) => {
    const matchesCategory = activeCategoryFilter === 'Semua' || e.category === activeCategoryFilter;
    return matchesCategory;
  });

  // Events belonging to the selected date specifically
  const daySpecificEvents = getEventsForDate(selectedDateStr);

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden text-left">
      {/* 1. Header panel */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Kalender Kegiatan Pesantren</h4>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Jadwal Tasmi' hafalan, ujian kompetensi tahfidz harian, dan kalender libur operasional pondok</p>
        </div>
        
        {/* Actions Button */}
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 py-1.5 bg-blue-650 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-sm border border-blue-700 shadow-sm flex items-center gap-1.5 shrink-0 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Kegiatan</span>
        </button>
      </div>

      {notification && (
        <div className="mx-5 mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-sm text-xs font-bold uppercase tracking-tight flex items-center gap-2 animate-in fade-in duration-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Filters & Quick category toggle */}
      <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center gap-2 bg-white">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mr-1">Filter Agenda:</span>
        <button
          onClick={() => setActiveCategoryFilter('Semua')}
          className={`px-3 py-1 text-[10px] font-bold rounded-sm border transition uppercase ${
            activeCategoryFilter === 'Semua'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setActiveCategoryFilter('Tasmi')}
          className={`px-3 py-1 text-[10px] font-bold rounded-sm border transition uppercase flex items-center gap-1 ${
            activeCategoryFilter === 'Tasmi'
              ? 'bg-blue-650 bg-blue-600 text-white border-blue-700'
              : 'bg-blue-50/50 text-blue-700 border-blue-200 hover:bg-blue-50'
          }`}
        >
          <BookOpen className="w-3 h-3" />
          <span>Tasmi' Hafalan</span>
        </button>
        <button
          onClick={() => setActiveCategoryFilter('Ujian')}
          className={`px-3 py-1 text-[10px] font-bold rounded-sm border transition uppercase flex items-center gap-1 ${
            activeCategoryFilter === 'Ujian'
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-amber-50/50 text-amber-700 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <Award className="w-3 h-3" />
          <span>Ujian Tahfidz</span>
        </button>
        <button
          onClick={() => setActiveCategoryFilter('Libur')}
          className={`px-3 py-1 text-[10px] font-bold rounded-sm border transition uppercase flex items-center gap-1 ${
            activeCategoryFilter === 'Libur'
              ? 'bg-rose-500 text-white border-rose-600'
              : 'bg-rose-50/50 text-rose-700 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <Coffee className="w-3 h-3" />
          <span>Hari Libur</span>
        </button>
      </div>

      {/* 3. Main Split View Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white">
        
        {/* Left Side: Modern Interactive Calendar Month Grid (col-span-5) */}
        <div className="lg:col-span-5 p-5 flex flex-col justify-self-stretch select-none">
          {/* Month Navigation Control Header */}
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">
              {monthsList[currentMonth]} {currentYear}
            </h5>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-sm cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-sm cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday indicator labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            <div>Sen</div>
            <div>Sel</div>
            <div>Rab</div>
            <div>Kam</div>
            <div>Jum</div>
            <div>Sab</div>
            <div className="text-rose-600">Ahd</div>
          </div>

          {/* Monthly dates grid */}
          <div className="grid grid-cols-7 gap-1">
            {gridDays.map((day, idx) => {
              if (day.isEmpty || !day.dateStr) {
                return (
                  <div key={`empty-${idx}`} className="aspect-square bg-slate-50/40 rounded-sm border border-transparent" />
                );
              }

              const dateStr = day.dateStr;
              const dateEvents = getEventsForDate(dateStr);
              const isSelected = selectedDateStr === dateStr;
              const isToday = dateStr === '2026-05-27'; // Visual placeholder for system May 2026 current day

              // Check what event categories exist on this day to render dot indicators
              const hasTasmi = dateEvents.some(e => e.category === 'Tasmi');
              const hasUjian = dateEvents.some(e => e.category === 'Ujian');
              const hasLibur = dateEvents.some(e => e.category === 'Libur');

              return (
                <button
                  key={`day-${day.dateNum}`}
                  type="button"
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`aspect-square rounded-sm border flex flex-col items-center justify-between p-1 transition-all relative focus:outline-none cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 border-blue-700 text-white shadow-sm font-black'
                      : isToday
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-extrabold ring-1 ring-blue-500/10'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {/* Day Number Label */}
                  <span className="text-[11px] font-mono leading-none font-bold self-start mt-0.5 ml-0.5">{day.dateNum}</span>
                  
                  {/* Category dot indicator loops */}
                  <div className="flex gap-0.5 pb-0.5 justify-center w-full">
                    {hasTasmi && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                    )}
                    {hasUjian && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`} />
                    )}
                    {hasLibur && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tip / helper key */}
          <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-[9px] font-bold text-slate-400 border-t border-slate-100 pt-3 self-stretch font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Tasmi
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Ujian Tahfidz
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Hari Libur
            </span>
          </div>
        </div>

        {/* Middle Area: Selected Date Specific Events Details (col-span-3) */}
        <div className="lg:col-span-3 p-5 flex flex-col justify-between text-left">
          <div>
            <div className="border-b border-slate-100 pb-2 mb-3">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Agenda Terseleksi</span>
              <h5 className="text-[11px] font-extrabold text-[#2563eb] mt-0.5 uppercase tracking-wide">
                Tanggal: {selectedDateStr.split('-').reverse().join('/')}
              </h5>
            </div>

            {daySpecificEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-1 bg-slate-50/50 border border-dashed border-slate-200 rounded-sm p-3">
                <AlertCircle className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-[10px] uppercase font-bold text-slate-500">Kosong</p>
                <p className="text-[9px] text-slate-400 leading-normal">Tidak ada agenda operasional khusus terjadwal pada tanggal ini.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {daySpecificEvents.map((e) => {
                  const badgeClasses = 
                    e.category === 'Tasmi' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    e.category === 'Ujian' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-rose-50 border-rose-200 text-rose-700';

                  return (
                    <div key={e.id} className="p-3 bg-slate-55 bg-slate-50 rounded-sm border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-xs border font-mono ${badgeClasses}`}>
                          {e.category === 'Tasmi' ? "TASMI'" : e.category === 'Ujian' ? 'UJIAN TAHFIDZ' : 'HARI LIBUR'}
                        </span>
                      </div>
                      
                      <h6 className="font-extrabold text-slate-900 uppercase tracking-tight text-[11px]">{e.title}</h6>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{e.description}</p>
                      
                      <div className="pt-2 text-[9px] text-slate-500 space-y-1.5 font-sans font-medium border-t border-slate-200/50">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-450 text-slate-400 shrink-0" />
                          <span>{e.time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{e.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">PJ: {e.mentor}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[9px] font-extrabold uppercase text-slate-400 flex items-center gap-1 tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Agenda Selalu Diupdate</span>
          </div>
        </div>

        {/* Right Area: General Upcoming Structured Schedules List (col-span-4) */}
        <div className="lg:col-span-4 p-5 flex flex-col justify-between text-left">
          <div>
            <div className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Log Rencana Program</span>
                <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide mt-0.5">Daftar Agenda Teratur</h5>
              </div>
              <span className="text-[9px] font-bold bg-slate-100 px-2 py-0.5 text-slate-600 rounded-sm border font-mono">
                {filteredEvents.length} Rencana
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <p>Tidak ada kegiatan yang terdaftar untuk filter ini.</p>
                </div>
              ) : (
                filteredEvents.map((item) => {
                  const cardBorderColorClass =
                    item.category === 'Tasmi' ? 'hover:border-blue-405 border-l-4 border-l-blue-500' :
                    item.category === 'Ujian' ? 'hover:border-amber-400 border-l-4 border-l-amber-500' :
                    'hover:border-rose-400 border-l-4 border-l-rose-500';

                  const dateParts = item.date.split('-');
                  let formattedBriefDate = item.date;
                  if (dateParts.length === 3) {
                    const monthsBrief = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                    const day = parseInt(dateParts[2], 10);
                    const parsedMonth = parseInt(dateParts[1], 10);
                    formattedBriefDate = `${day} ${monthsBrief[parsedMonth - 1] || ''}`;
                    if (item.endDate) {
                      const eParts = item.endDate.split('-');
                      if (eParts.length === 3) {
                        const eday = parseInt(eParts[2], 10);
                        formattedBriefDate += ` - ${eday} ${monthsBrief[parsedMonth - 1] || ''}`;
                      }
                    }
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDateStr(item.date)}
                      className={`p-3 bg-slate-50 border border-slate-200 rounded-sm hover:bg-slate-100/60 cursor-pointer transition flex items-start gap-3 text-xs justify-between ${cardBorderColorClass}`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] text-[#2563eb] font-bold font-mono">{formattedBriefDate}</span>
                          <span className="text-[8px] text-slate-400 font-medium font-sans flex items-center gap-0.5">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[90px]">{item.time}</span>
                          </span>
                        </div>
                        <h6 className="font-extrabold text-slate-900 uppercase truncate tracking-tight">{item.title}</h6>
                        <p className="text-[10px] text-slate-500 truncate font-medium">{item.location}</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDateStr(item.date);
                        }}
                        className="text-[9px] font-extrabold text-[#2563eb] bg-white border border-slate-200 hover:bg-blue-50 px-2 py-1 rounded-sm shadow-xs shrink-0 cursor-pointer self-center"
                      >
                        Lihat →
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <p className="text-[9px] text-slate-400 mt-3 italic font-medium">Klik pada salah satu agenda di atas untuk menampilkan detail kegiatan di panel tengah.</p>
        </div>
      </div>

      {/* 4. Usulkan Agenda Baru Modal form container */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm shadow flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-white rounded-sm w-full max-w-lg shadow-2xl border border-slate-350 overflow-hidden text-left flex flex-col">
            
            {/* Modal Head */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[9px] text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-xs font-bold uppercase tracking-wider font-mono">
                  Sistem Agenda Pondok
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight mt-1">
                  Tambah Agenda Kegiatan Baru
                </h4>
                <p className="text-[10px] text-slate-505 text-slate-500 mt-0.5 font-medium leading-none">Inisialisasi kegiatan Tasmi', ujian hafalan atau jadwal libur santri</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-sm border border-slate-200 cursor-pointer focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Judul / Nama Kegiatan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Tasmi' Akbar Juz 15 Sekali Duduk"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                {/* End Date (Optional) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Selesai (Opsional)</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Category Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori Program</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2.5 py-2 text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="Tasmi">Tasmi' Hafalan</option>
                    <option value="Ujian">Ujian Tahfidz</option>
                    <option value="Libur">Hari Libur Pondok</option>
                  </select>
                </div>

                {/* Time range */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alokasi Waktu Jam</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 08:00 - 11:30 WIB atau Seharian"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi / Tempat Pelaksanaan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Masjid Jami'"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Mentor Person in charge */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penanggung Jawab (PJ)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ustadz Rahmat"
                    value={newMentor}
                    onChange={(e) => setNewMentor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deskripsi Kegiatan Lengkap</label>
                  <textarea
                    rows={3}
                    placeholder="Ketik ulasan, susunan syuruk, syarat ketetapan kegiatan..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit panel buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-white">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs text-slate-605 text-slate-600 bg-slate-50 hover:bg-slate-100 font-bold border border-slate-200 rounded-sm transition cursor-pointer"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-sm border border-blue-750 border-blue-700 shadow-sm transition cursor-pointer"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
