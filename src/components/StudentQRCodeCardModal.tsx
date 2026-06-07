/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Printer, 
  Download, 
  Palette, 
  Sparkles, 
  FileText,
  Check,
  QrCode,
  MapPin,
  Heart,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Santri } from '../types';

interface StudentQRCodeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  santri: Santri | null;
}

type CardTheme = 'emerald' | 'charcoal' | 'deepsea' | 'gold';

export default function StudentQRCodeCardModal({
  isOpen,
  onClose,
  santri
}: StudentQRCodeCardModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('emerald');
  const [showBackSide, setShowBackSide] = useState<boolean>(false);

  if (!isOpen || !santri) return null;

  // Configuration for design styles based on selectedTheme
  const themeStyles = {
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900',
      accentText: 'text-emerald-400',
      accentBg: 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'border-emerald-500 bg-emerald-950 text-emerald-300',
      ribbon: 'from-emerald-600 to-teal-700',
      iconColor: 'bg-emerald-500 text-slate-900',
      primaryHex: '#047857'
    },
    charcoal: {
      bg: 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950',
      accentText: 'text-sky-400',
      accentBg: 'bg-sky-500/10 border-sky-500/20',
      badge: 'border-sky-500 bg-slate-900 text-sky-300',
      ribbon: 'from-slate-700 to-slate-900',
      iconColor: 'bg-sky-400 text-slate-900',
      primaryHex: '#0f172a'
    },
    deepsea: {
      bg: 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-950',
      accentText: 'text-violet-400',
      accentBg: 'bg-violet-500/10 border-violet-500/20',
      badge: 'border-violet-500 bg-indigo-950 text-violet-300',
      ribbon: 'from-indigo-600 to-violet-700',
      iconColor: 'bg-violet-500 text-slate-900',
      primaryHex: '#312e81'
    },
    gold: {
      bg: 'bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950',
      accentText: 'text-amber-400',
      accentBg: 'bg-amber-500/10 border-amber-500/20',
      badge: 'border-amber-500 bg-stone-950 text-amber-300',
      ribbon: 'from-amber-600 to-amber-850',
      iconColor: 'bg-amber-500 text-slate-900',
      primaryHex: '#78350f'
    }
  };

  const activeStyle = themeStyles[selectedTheme];
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(santri.nis)}`;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;

    // Build standalone HTML printable page
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kartu Absensi - ${santri.name}</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              background-color: #f8fafc;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
                margin: 0;
              }
              .no-print {
                display: none !important;
              }
              .print-container {
                box-shadow: none !important;
                border: none !important;
              }
            }

            .print-container {
              display: flex;
              gap: 30px;
              flex-wrap: wrap;
              justify-content: center;
            }

            .card {
              width: 340px;
              height: 215px;
              border-radius: 12px;
              color: #ffffff;
              overflow: hidden;
              position: relative;
              font-family: system-ui, -apple-system, sans-serif;
              box-shadow: 0 4px 15px rgba(0,0,0,0.15);
              border: 1px solid rgba(255,255,255,0.1);
              box-sizing: border-box;
            }

            /* Emerald Theme */
            .card.theme-emerald {
              background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
            }
            /* Charcoal Theme */
            .card.theme-charcoal {
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            }
            /* Deepsea Theme */
            .card.theme-deepsea {
              background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%);
            }
            /* Gold Theme */
            .card.theme-gold {
              background: linear-gradient(135deg, #78350f 0%, #1c1917 100%);
            }

            .card-pattern {
              position: absolute;
              inset: 0;
              background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0);
              background-size: 12px 12px;
              opacity: 0.6;
              pointer-events: none;
            }

            .card-layout {
              display: flex;
              height: 100%;
              padding: 16px;
              box-sizing: border-box;
            }

            .card-left {
              flex: 1.3;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding-right: 8px;
            }

            .card-right {
              flex: 0.9;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border-left: 1px dashed rgba(255,255,255,0.15);
              padding-left: 14px;
            }

            .header-sec {
              margin-bottom: 8px;
            }

            .avatar-icon {
              font-size: 26px;
              margin-bottom: 2px;
            }

            .subtitle-badge {
              font-size: 7px;
              font-weight: 800;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              color: rgba(255,255,255,0.6);
            }

            .title-branding {
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #f8fafc;
              margin: 2px 0 0px 0;
            }

            .divider {
              width: 25px;
              height: 2px;
              background-color: #38bdf8;
              margin-top: 4px;
            }
            .theme-emerald .divider { background-color: #34d399; }
            .theme-charcoal .divider { background-color: #38bdf8; }
            .theme-deepsea .divider { background-color: #a78bfa; }
            .theme-gold .divider { background-color: #fbbf24; }

            .student-info {
              margin-top: auto;
            }

            .student-name {
              font-size: 11.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              margin-bottom: 2px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 180px;
            }

            .student-meta {
              font-size: 9px;
              font-weight: 600;
              color: #94a3b8;
              margin: 1px 0;
            }

            .student-nis {
              font-family: monospace;
              font-size: 10px;
              font-weight: 800;
              background-color: rgba(0, 0, 0, 0.2);
              padding: 2px 6px;
              border-radius: 4px;
              display: inline-block;
              margin-top: 4px;
            }
            .theme-emerald .student-nis { color: #34d399; }
            .theme-charcoal .student-nis { color: #38bdf8; }
            .theme-deepsea .student-nis { color: #a78bfa; }
            .theme-gold .student-nis { color: #fbbf24; }

            .qr-wrapper {
              background: #ffffff;
              padding: 6px;
              border-radius: 6px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.15);
            }

            .qr-code-img {
              width: 92px;
              height: 92px;
              display: block;
            }

            .instruction-text {
              font-size: 7.5px;
              font-weight: bold;
              color: #cbd5e1;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              margin-top: 8px;
              text-align: center;
              font-family: monospace;
            }

            /* Back Side Card styling */
            .card-back {
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
              padding: 16px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-sizing: border-box;
            }
            .card-back.theme-emerald {
              background: linear-gradient(135deg, #022c22 0%, #0f172a 100%);
            }
            .card-back.theme-deepsea {
              background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
            }
            .card-back.theme-gold {
              background: linear-gradient(135deg, #1c1917 0%, #0f172a 100%);
            }

            .back-rules {
              font-size: 8px;
              color: #cbd5e1;
              line-height: 1.4;
              margin: 0;
              padding-left: 12px;
            }
            .back-rules li {
              margin-bottom: 3.5px;
            }

            .back-header {
              font-size: 10px;
              font-weight: 800;
              color: #ffffff;
              text-align: center;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .action-panel {
              margin-top: 30px;
              text-align: center;
            }

            .print-btn {
              padding: 10px 24px;
              background-color: #2563eb;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 13px;
              font-weight: bold;
              cursor: pointer;
              transition: background-color 0.15s;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .print-btn:hover {
              background-color: #1d4ed8;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <!-- FRONT SIDE -->
            <div class="card theme-${selectedTheme}">
              <div class="card-pattern"></div>
              <div class="card-layout">
                <div class="card-left">
                  <div class="header-sec">
                    <div class="avatar-icon">${santri.gender === 'Ikhwan' ? '👦' : '👧'}</div>
                    <div class="subtitle-badge">KARTU ABSENSI DIGITAL</div>
                    <div class="title-branding">RUMAH TAHFIDZ</div>
                    <div class="divider"></div>
                  </div>
                  <div class="student-info">
                    <div class="student-name">${santri.name}</div>
                    <div class="student-meta">${santri.halaqahName}</div>
                    <div class="student-meta" style="font-size: 8px; color: rgba(255,255,255,0.4);">Gender: ${santri.gender} | Gabung: ${santri.joinDate || '-'}</div>
                    <div class="student-nis">${santri.nis}</div>
                  </div>
                </div>
                <div class="card-right">
                  <div class="qr-wrapper">
                    <img src="${qrUrl}" class="qr-code-img" />
                  </div>
                  <div class="instruction-text">MARKING SENSOR QR</div>
                </div>
              </div>
            </div>

            <!-- BACK SIDE -->
            <div class="card card-back theme-${selectedTheme}">
              <div class="card-pattern"></div>
              <div class="back-header">ATURAN PENGGUNAAN KARTU</div>
              <ol class="back-rules">
                <li>Kartu ini adalah alat verifikasi resmi kehadiran harian santri secara mandiri.</li>
                <li>Harap letakkan kartu ini sedekat mungkin ke arah sensor kamera saat melakukan absensi harian.</li>
                <li>Apabila kartu rusak, patah, atau hilang, segera lapor ke admin atau ustadz pembimbing halaqah untuk pencetakan ulang.</li>
                <li>Kartu ini tidak dapat dipindahtangankan kepada santri lainnya.</li>
              </ol>
              <div style="border-top: 1px solid rgba(255,255,255,0.1); pt: 6px; text-align: center; font-size: 8px; color: #94a3b8; font-family: monospace; padding-top: 6px;">
                Sistem Terintegrasi &bull; Rumah Tahfidz App
              </div>
            </div>
          </div>

          <div class="action-panel no-print">
            <button class="print-btn" onclick="window.print()">Cetak Kartu Sekarang</button>
            <p style="margin-top: 8px; font-size: 11px; color: #64748b;">Gunakan pilihan "Potrait" atau simpan sebagai PDF dari dialog cetak browser Anda.</p>
          </div>

          <script>
            // Automatically prompt the printer window
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
        id="qr-modal-overlay"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border border-slate-300 rounded-sm w-full max-w-xl shadow-2xl overflow-hidden text-left"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500 rounded-xs text-white">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider font-mono">Kartu Digital & QR Code Santri</h4>
                <p className="text-[10px] text-blue-200 font-mono uppercase mt-0.5">Rumah Tahfidz Identity Card Creator</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 px-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm border border-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick theme selector and state settings */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
            {/* Theme switcher */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Pilih Tema Kartu</span>
              <div className="flex gap-1.5">
                {(['emerald', 'charcoal', 'deepsea', 'gold'] as CardTheme[]).map((thm) => (
                  <button
                    key={thm}
                    type="button"
                    onClick={() => setSelectedTheme(thm)}
                    className={`w-5 h-5 rounded-full border relative transition-all ${
                      thm === 'emerald' ? 'bg-emerald-700' :
                      thm === 'charcoal' ? 'bg-slate-800' :
                      thm === 'deepsea' ? 'bg-indigo-900' : 'bg-amber-800'
                    } ${selectedTheme === thm ? 'ring-2 ring-blue-600 border-white scale-110' : 'border-slate-300'}`}
                    title={thm.toUpperCase()}
                  >
                    {selectedTheme === thm && (
                      <Check className="w-3 h-3 text-white absolute inset-0 m-auto font-black" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Front / Back indicator */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Simulasi Sisi Kartu</span>
              <div className="flex bg-slate-200 p-0.5 rounded-sm text-[10px] font-bold font-mono">
                <button
                  type="button"
                  onClick={() => setShowBackSide(false)}
                  className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${!showBackSide ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  DEPAN (FRONT)
                </button>
                <button
                  type="button"
                  onClick={() => setShowBackSide(true)}
                  className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${showBackSide ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  BELAKANG (BACK)
                </button>
              </div>
            </div>
          </div>

          {/* Card Preview Stage */}
          <div className="p-8 bg-slate-100 flex flex-col items-center justify-center space-y-4">
            <AnimatePresence mode="wait">
              {!showBackSide ? (
                /* Card Front */
                <motion.div 
                  key="front"
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 90, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`w-[340px] h-[215px] rounded-xl shadow-xl overflow-hidden relative border border-white/10 text-white ${activeStyle.bg}`}
                >
                  {/* Subtle Grid Dot Accent Overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:12px_12px] opacity-60 pointer-events-none" />
                  
                  {/* Card Structure Layout */}
                  <div className="p-4 flex h-full box-border">
                    {/* Left detailed panel */}
                    <div className="flex-1.3 flex flex-col justify-between pr-2 text-left z-10">
                      <div>
                        <div className="text-2xl mb-1">{santri.gender === 'Ikhwan' ? '👦' : '👧'}</div>
                        <span className="text-[7.5px] font-extrabold tracking-widest text-white/50 uppercase block font-mono">KARTU ABSENSI DIGITAL</span>
                        <h4 className="text-xs font-black tracking-wide uppercase mt-0.5">RUMAH TAHFIDZ</h4>
                        <div className={`w-6 h-0.5 mt-1.5 rounded-full ${
                          selectedTheme === 'emerald' ? 'bg-emerald-400' :
                          selectedTheme === 'charcoal' ? 'bg-sky-400' :
                          selectedTheme === 'deepsea' ? 'bg-violet-400' : 'bg-amber-400'
                        }`} />
                      </div>

                      <div className="mt-auto">
                        <p className="text-[11.5px] font-black uppercase text-white tracking-tight truncate max-w-[170px]" title={santri.name}>
                          {santri.name}
                        </p>
                        <p className="text-[8.5px] text-slate-350">{santri.halaqahName}</p>
                        <span className={`text-[9.5px] font-bold font-mono px-2 py-0.5 rounded-sm inline-block mt-2 ${activeStyle.badge} border border-white/10`}>
                          {santri.nis}
                        </span>
                      </div>
                    </div>

                    {/* Right QR side */}
                    <div className="flex-0.9 flex flex-col items-center justify-center pl-3 border-l border-white/10 border-dashed text-center z-10">
                      <div className="bg-white p-1.5 rounded-lg shadow-lg">
                        <img 
                          referrerPolicy="no-referrer"
                          src={qrUrl}
                          alt={`QR Code ${santri.nis}`}
                          className="w-20 h-20 block"
                        />
                      </div>
                      <span className="text-[7.5px] font-mono tracking-wider font-extrabold text-slate-300 mt-2 block uppercase">
                        SENSING SYSTEM
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Card Back */
                <motion.div 
                  key="back"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`w-[340px] h-[215px] rounded-xl shadow-xl overflow-hidden p-4 relative border border-white/10 text-white flex flex-col justify-between ${activeStyle.bg}`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:12px_12px] opacity-60 pointer-events-none" />
                  
                  <div className="z-10 text-left">
                    <span className="text-[10px] font-black tracking-widest uppercase block mb-2 font-mono text-center border-b border-white/10 pb-1.5">
                      KEBIJAKAN KARTU MAHASANTRI
                    </span>
                    <ol className="list-decimal list-inside text-[8.5px] leading-relaxed text-slate-300 space-y-1.5 font-medium">
                      <li>Kartu wajib dibawa setiap hari untuk presensi.</li>
                      <li>Scan dilakukan mandiri di loket QR sebelum masuk.</li>
                      <li>Jagalah kebersihan dan keutuhan permukaan QR code.</li>
                      <li>Laporkan ke ustadz apabila kartu rusak / hilang.</li>
                    </ol>
                  </div>

                  <div className="z-10 text-center border-t border-white/10 pt-2 flex items-center justify-between text-[7px] font-mono text-slate-400">
                    <span>SISTEM TERPADU RUMAH TAHFIDZ</span>
                    <span>INTEGRATION SYSTEM</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint */}
            <p className="text-[10.5px] text-slate-500 font-sans leading-normal text-center max-w-[340px]">
              Kartu ini dirancang dengan dimensi berstandar ISO CR-80 yang cocok dimasukkan ke saku plastik gantung.
            </p>
          </div>

          {/* Quick instructions guide */}
          <div className="p-5 border-t border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="flex gap-2.5 items-start">
              <div className="p-1 bg-blue-50 text-blue-600 rounded-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800">Verifikasi Terintegrasi</h5>
                <p className="text-slate-500 text-[10.5px] leading-relaxed mt-0.5">NIS <span className="font-mono font-bold text-slate-700">{santri.nis}</span> disandikan langsung ke dalam QR code sehingga scanner dapat mengenali santri secara instan tanpa internet.</p>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <div className="p-1 bg-yellow-50 text-yellow-600 rounded-sm">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800">Cetak Kertas tebal/PVC</h5>
                <p className="text-slate-500 text-[10.5px] leading-relaxed mt-0.5">Cetak menggunakan printer kertas kartu tebal atau kertas berkualitas foto, lalu gunakan mesin lamination untuk hasil akhir yang kaku dan mengkilap.</p>
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-sm border border-slate-300 transition cursor-pointer"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-sm border border-blue-700 shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu ({santri.name})</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
