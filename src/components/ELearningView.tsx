/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Volume2,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  Sparkles,
  BookMarked,
  Play,
  Pause,
  Clock,
  ExternalLink,
  Award
} from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

export default function ELearningView() {
  const [activeTab, setActiveTab] = useState<'materi' | 'audio' | 'quiz'>('materi');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Simulated audio player state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({
    'aud-1': 35,
    'aud-2': 0,
    'aud-3': 12,
  });

  const handleTogglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      setSuccessMsg(`Simulasi memutar audio latihan tilawah makhraj...`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // Tajweed Quiz State
  const quizQuestions: Question[] = [
    {
      id: 1,
      text: "Apabila ada Nun Sukun (نْ) atau Tanwin bertemu dengan huruf Ba (ب), hukum bacaannya adalah...",
      options: ["Isyba'", "Iqlab / Qalb", "Izhar Halqi", "Idgham Bighunnah"],
      correctIdx: 1,
      explanation: "Hukum Iqlab mengubah bunyi Nun sukun/Tanwin menjadi Mim (م) disertai dengungan saat bertemu huruf Ba."
    },
    {
      id: 2,
      text: "Manakah di bawah ini kelompok huruf yang termasuk ke dalam Al-Qalqalah?",
      options: ["ق - ط - ب - ج - د", "ء - هـ - ع - ح - غ", "ي - ن - م - و", "ف - ج - ر - ا - ن"],
      correctIdx: 0,
      explanation: "Huruf Qalqalah disingkat 'Baju Di Toko' yaitu Qaf (ق), Tha (ط), Ba (ب), Jeem (ج), dan Dal (د)."
    },
    {
      id: 3,
      text: "Berapakah panjang bacaan untuk hukum Mad Jaiz Mufasil secara umum saat membaca tartil lisan?",
      options: ["1 Harakat saja", "6 Harakat wajib", "2 sampai 5 Harakat", "Tidak boleh dipanjangkan sama sekali"],
      correctIdx: 2,
      explanation: "Mad Jaiz Munfasil dihukumi boleh dibaca sepanjang 2, 4, atau 5 harakat secara opsional."
    },
    {
      id: 4,
      text: "Jika menjumpai tanda waqaf berupa huruf jim kecil (ج) di atas ayat Al-Qur'an, posisi kita...",
      options: ["Harus lurus menyambung", "Dilarang keras berhenti", "Harus berhenti sepenuhnya", "Boleh berhenti, boleh menyambung (Waqaf Jaiz)"],
      correctIdx: 3,
      explanation: "Tanda Waqaf Jaiz (ج) memberikan pilihan yang setara bagi pembaca untuk berhenti atau melaraskan nafas dilanjutkan."
    },
    {
      id: 5,
      text: "Hukum Mim sukun (مْ) bertemu huruf selain Mim dan Ba dinamakan...",
      options: ["Ikhfa Syafawi", "Idgham Syamsiyah", "Izhar Syafawi", "Izhar Mutamatsilain"],
      correctIdx: 2,
      explanation: "Izhar Syafawi adalah membunyikan Mim sukun dengan jelas saat bertemu dengan huruf hijaiyah selain Mim (م) dan Ba (ب)."
    }
  ];

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answeredWrong, setAnsweredWrong] = useState<boolean[]>([]);

  const handleOptionSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedOptionIdx(optionIdx);
  };

  const handleNextQuestion = () => {
    setIsSubmitted(false);
    setSelectedOptionIdx(null);
    if (currentQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIdx === null || isSubmitted) return;
    
    setIsSubmitted(true);
    const correct = selectedOptionIdx === quizQuestions[currentQuestionIdx].correctIdx;
    if (correct) {
      setScore(prev => prev + (100 / quizQuestions.length));
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setIsSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  // Learning Resources mock
  const learningResources = [
    { id: 'res-1', title: 'Panduan Praktis Nun Sukun & Tanwin', docType: 'PDF Manual', desc: 'Metode cepat menguasai Izhar, Idgham Bighunnah, Idgham Bilaghunnah, Iqlab, dan Ikhfa.', length: '12 halaman', color: 'border-blue-200' },
    { id: 'res-2', title: 'Peta Artikulatoris Makharijul Huruf Lengkap', docType: 'E-Poster Infografis', desc: 'Gambar detail letak keluarnya huruf tenggorokan, lidah, bibir, rongga mulut, dan hidung.', length: 'Katalog Visual', color: 'border-indigo-205' },
    { id: 'res-3', title: 'Hukum Mad & Cabang Pembagiannya', docType: 'Ringkasan Slide Kuliah', desc: 'Sistematika lengkap 14 macam Mad Far’i lengkap dengan contoh-contoh lafadznya di Al-Qur\'an.', length: '18 slide', color: 'border-purple-200' },
  ];

  // Sound cues drills
  const soundDrills = [
    { id: 'aud-1', surah: 'Latihan Huruf Lahawiyah (ق, ك)', reader: 'Syeikh Husari (Simulasi)', duration: '02:45', notes: 'Perhatikan kedalaman suara huruf Qaf di pangkal lidah.' },
    { id: 'aud-2', surah: 'Latihan Ghunnah & Idgham', reader: 'Ust. Abu Rabbani (Simulasi)', duration: '03:10', notes: 'Fokus pada dengung merasuk ke hidung selama 3 harakat.' },
    { id: 'aud-3', surah: 'Makna Waqaf Lazim & Mamnu’', reader: 'Dr. Ahmad Kamil (Simulasi)', duration: '05:20', notes: 'Praktik pemotongan nafas secara aman di kalimat panjang.' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="elearning-page-title" className="text-xl font-black text-slate-900 uppercase tracking-tight">E-Learning Tahfidz & Tajwid</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">PORTAL MATERI VIDEO, AUDIO MAKHRAJ LISAN & UJI MANDIRI TAJWID MULTIPILIH</p>
        </div>

        {/* Quick Tabs Menu Bar */}
        <div className="inline-flex rounded-sm border border-slate-200 bg-white p-1">
          <button
            onClick={() => setActiveTab('materi')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'materi' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Materi & Cheat-Sheet
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'audio' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Audio Drills
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Uji Mandiri (Quiz)
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase rounded-sm animate-in slide-in-from-top-4 duration-150 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-600 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Visual Panels Rendering */}
      {activeTab === 'materi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: General Tajwid Rules Cheat sheet */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-sm shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <BookMarked className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Kamus Mini Kaidah Ilmu Tajwid</h3>
            </div>
            
            <div className="space-y-4">
              {/* Category 1: Nun mati */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black font-mono text-indigo-600 uppercase tracking-widest block">1. Hukum Nun Sukun (نْ) & Tanwin (ــًــٍــٌ)</span>
                <p className="text-xs text-slate-500 font-medium">Memiliki 4 hukum dasar yang wajib dikaji pelafalannya:</p>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1.5">
                  <div className="bg-slate-50 p-2.5 border border-slate-200 rounded-sm">
                    <span className="font-extrabold text-slate-800">Izhar Halqi</span>
                    <p className="text-[10.5px] text-slate-500 mt-1">Dibaca jelas, tanpa mendengung. Bertemu: ء, هـ, ع, ح, غ, خ.</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 border border-slate-200 rounded-sm">
                    <span className="font-extrabold text-slate-800">Idgham Bighunnah</span>
                    <p className="text-[10.5px] text-slate-500 mt-1">Melebur seraya mendengung. Bertemu: ي, ن, م, و.</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 border border-slate-200 rounded-sm">
                    <span className="font-extrabold text-slate-800">Iqlab</span>
                    <p className="text-[10.5px] text-slate-500 mt-1">Mengganti bunyi Nun mjd Mim. Bertemu: ب.</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 border border-slate-200 rounded-sm">
                    <span className="font-extrabold text-slate-805">Ikhfa Haqiqi</span>
                    <p className="text-[10.5px] text-slate-550 mt-1">Menyamarkan suara ke huruf berikut. Sisa 15 huruf hijaiyah.</p>
                  </div>
                </div>
              </div>

              {/* Category 2: Mim Mati */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black font-mono text-indigo-600 uppercase tracking-widest block">2. Hukum Mim Sukun (مْ)</span>
                <p className="text-xs text-slate-500 font-medium font-sans">Terbagi menjadi 3 hukum dasar saat lisan berinteraksi:</p>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="bg-slate-50 p-2 border border-slate-200 rounded-sm">
                    <span className="font-extrabold text-slate-800 text-[11px] block">Ikhfa Syafawi</span>
                    <p className="text-[10px] text-slate-400 mt-1">Menyamarkan dengung samar. Bertemu: ب.</p>
                  </div>
                  <div className="bg-slate-50 p-2 border border-slate-200 rounded-sm">
                    <span className="font-extrabold text-slate-800 text-[11px] block">Idgham Mimi</span>
                    <p className="text-[10px] text-slate-400 mt-1">Melebur dengung tebal. Bertemu: م.</p>
                  </div>
                  <div className="bg-slate-50 p-2 border border-slate-200 rounded-sm">
                    <span className="font-extrabold text-slate-805 text-[11px] block">Izhar Syafawi</span>
                    <p className="text-[10px] text-slate-400 mt-1">Dibaca jelas tegas lurus. Bertemu selain م, ب.</p>
                  </div>
                </div>
              </div>

              {/* Category 3: Qalqalah */}
              <div className="space-y-2">
                <span className="text-[10px] font-black font-mono text-indigo-600 uppercase tracking-widest block">3. Pemantulan Suara (Al-Qalqalah)</span>
                <p className="text-xs text-slate-500 font-medium">Bunyi memantul ketika huruf qalqalah mati/sukun di tengah atau akhir ayat:</p>
                <div className="p-3 bg-indigo-50/40 text-xs border border-indigo-100 rounded-sm flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-slate-900 block font-sans">Huruf Qalqalah: (ق, ط, ب, ج, د)</span>
                    <span className="text-[10px] text-indigo-705 text-indigo-750 block mt-1 font-semibold text-indigo-600">Terbagi atas: Qalqalah Sugra (kecil di tengah) & Qalqalah Kubra (besar akibat waqaf).</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Download resources library lists */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-sm shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Katalog Dokumen Belajar</h3>
            </div>
            <p className="text-xs text-slate-500">Materi rujukan kurikulum, lembar PDF waqaf, dan cetak lembar evaluasi harian santri.</p>

            <div className="space-y-3 pt-2">
              {learningResources.map((res) => (
                <div key={res.id} className="p-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-sm transition text-left space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9.5px]/none font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-1 rounded-xs uppercase font-mono">{res.docType}</span>
                    <span className="text-[10px] text-slate-450 font-mono font-bold text-slate-405 text-slate-400">{res.length}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-950">{res.title}</h4>
                  <p className="text-[10.5px] leading-relaxed text-slate-500 font-medium">{res.desc}</p>
                  
                  <div className="pt-1.5">
                    <button
                      onClick={() => alert(`Mengunduh file panduan ${res.title}...`)}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 font-mono uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>UNDUH MATERI LENGKAP</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Audio Drills Tab */}
      {activeTab === 'audio' && (
        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2 text-left">
            <Volume2 className="w-5 h-5 text-indigo-700" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight font-sans">Koleksi Simulasi Audio Latihan</h3>
              <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">TERAPI KELANCARAN MAKHRAJ LISAN</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Gunakan contoh pelafalan tartil di bawah ini sebagai latihan mendiri siswa di kamar atau asrama santri.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {soundDrills.map((drill) => {
              const isActivePlaying = playingId === drill.id;
              return (
                <div key={drill.id} className="bg-slate-50 border border-slate-200 p-5 rounded-sm hover:border-slate-300 transition text-left flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">PREVIEW DRILLS</span>
                      <span className="text-[10px] font-bold text-indigo-600 font-mono inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{drill.duration}</span>
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 pt-1.5">{drill.surah}</h4>
                    <p className="text-[10.5px] text-slate-400 font-bold">Qari: {drill.reader}</p>
                    <p className="text-[10.5px] leading-relaxed italic text-slate-500 mt-2">"{drill.notes}"</p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 mt-4 flex items-center justify-between">
                    {/* Simulated visual waveform */}
                    <div className="flex items-end gap-1.5 h-6 shrink-0 flex-1 pr-6">
                      <div className={`w-1 bg-indigo-200 rounded-sm transition-all ${isActivePlaying ? 'h-6 animate-pulse' : 'h-2'}`} />
                      <div className={`w-1 bg-indigo-300 rounded-sm transition-all ${isActivePlaying ? 'h-4 animate-pulse duration-500' : 'h-3'}`} />
                      <div className={`w-1 bg-indigo-400 rounded-sm transition-all ${isActivePlaying ? 'h-5 animate-pulse duration-700' : 'h-1'}`} />
                      <div className={`w-1 bg-indigo-300 rounded-sm transition-all ${isActivePlaying ? 'h-3 animate-pulse duration-300' : 'h-2'}`} />
                      <div className={`w-1 bg-indigo-200 rounded-sm transition-all ${isActivePlaying ? 'h-5 animate-pulse duration-1000' : 'h-2'}`} />
                    </div>

                    <button
                      onClick={() => handleTogglePlay(drill.id)}
                      className={`p-2 rounded-full cursor-pointer transition shadow-xs ${
                        isActivePlaying 
                          ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isActivePlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MCQ Tajwid Self-Assessment Quiz */}
      {activeTab === 'quiz' && (
        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
            <div className="p-2 bg-indigo-50 text-indigo-650 text-indigo-650 text-indigo-600 border border-indigo-100 rounded-sm shrink-0">
              <Award className="w-5 h-5 animate-spin duration-1000" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-905 text-slate-900 uppercase tracking-tight">Evaluasi Teori Tajwid Mandiri</h3>
              <p className="text-[10px] text-slate-400 font-bold font-mono mt-0.5">UJI PEMAHAMAN KAIDAH QUR'AN</p>
            </div>
          </div>

          {!quizFinished ? (
            <div className="space-y-6">
              {/* Progress pointer */}
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                <span className="font-mono">SOAL {currentQuestionIdx + 1} DARI {quizQuestions.length}</span>
                <span>Progres: {Math.round(((currentQuestionIdx) / quizQuestions.length) * 100)}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300" 
                  style={{ width: `${((currentQuestionIdx + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question text */}
              <h4 className="text-xs font-black text-slate-900 leading-relaxed bg-slate-50 p-4 border border-slate-205 border-slate-200 rounded-sm">
                "{quizQuestions[currentQuestionIdx].text}"
              </h4>

              {/* Options lists */}
              <div className="space-y-2">
                {quizQuestions[currentQuestionIdx].options.map((opt, oIdx) => {
                  const isSelected = selectedOptionIdx === oIdx;
                  const isCorrect = oIdx === quizQuestions[currentQuestionIdx].correctIdx;
                  
                  let optStyle = 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
                  if (isSelected) optStyle = 'border-indigo-605 border-indigo-600 bg-indigo-50/40 text-indigo-900 font-black';
                  
                  if (isSubmitted) {
                    if (isCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isSelected) {
                      optStyle = 'border-rose-300 bg-rose-50 text-rose-900';
                    } else {
                      optStyle = 'border-slate-150 bg-white text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleOptionSelect(oIdx)}
                      disabled={isSubmitted}
                      className={`w-full p-3 border rounded-sm text-xs font-bold text-left transition flex items-center justify-between cursor-pointer ${optStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 font-bold flex items-center justify-center font-mono shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      
                      {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-605 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Action area */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-white">
                <div>
                  {isSubmitted && (
                    <div className="text-[11px] leading-relaxed text-slate-505 text-slate-500 italic max-w-sm">
                      <span className="font-bold text-slate-700 not-italic uppercase block mb-0.5">Penjelasan Hukum:</span>
                      "{quizQuestions[currentQuestionIdx].explanation}"
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {!isSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedOptionIdx === null}
                      className={`px-5 py-2 rounded-sm text-xs font-bold font-mono transition inline-flex items-center gap-1.5 ${
                        selectedOptionIdx === null 
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white cursor-pointer shadow-xs'
                      }`}
                    >
                      <span>KUNCI JAWABAN</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white font-bold font-mono text-xs rounded-sm shadow-xs transition cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>{currentQuestionIdx < quizQuestions.length - 1 ? 'SOAL BERIKUTNYA' : 'LIHAT SKOR AKHIR'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-sm flex items-center justify-center border border-indigo-100 mx-auto">
                <Award className="w-8 h-8 animate-bounce" />
              </div>
              
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Hasil Penilaian Mandiri</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-1">TAJWID & TARTIL THEORY SCORECARD</p>
              </div>

              <div className="inline-block bg-slate-50 p-6 border border-slate-200 rounded-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Skor Akhir Teori</span>
                <p className={`text-4xl font-mono font-black mt-1 ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {score} / 100
                </p>
                <span className="text-[10.5px]/none text-slate-400 mt-2 block font-sans">
                  {score >= 80 ? 'Predikat: Mumtaz (Istimewa)' : score >= 60 ? 'Predikat: Jayyid (Baik/Harus Murajaah)' : 'Predikat: Dhaif (Mundur / Belajar Lanjut)'}
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetQuiz}
                  className="px-5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-bold border border-slate-200 bg-white rounded-sm text-xs font-mono transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ULANGI DIAGNOSTIK</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
