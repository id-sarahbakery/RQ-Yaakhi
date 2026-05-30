/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  RotateCw, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Power, 
  Video, 
  VideoOff,
  Image as ImageIcon
} from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (errorMessage: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanFailure }: QRScannerProps) {
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [scannerMode, setScannerMode] = useState<'camera' | 'file'>('camera');
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState<string | null>(null);

  const qrCodeInstanceRef = useRef<Html5Qrcode | null>(null);
  const viewFinderId = 'qr-reader-container';

  // Request cameras on mount, if supported
  useEffect(() => {
    // We only access camera list if scanner mode is 'camera'
    if (scannerMode === 'camera') {
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length > 0) {
            setCameras(devices);
            setSelectedCameraId(devices[0].id);
          } else {
            setCameraError('No camera devices detected. Try file upload mode.');
          }
        })
        .catch((err) => {
          console.warn('Failed to get cameras:', err);
          setCameraError('Permissions not granted or camera list unavailable.');
        });
    }

    return () => {
      // Clean up scanner on unmount
      if (qrCodeInstanceRef.current && qrCodeInstanceRef.current.isScanning) {
        qrCodeInstanceRef.current.stop().catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, [scannerMode]);

  // Restart scanning if selected camera changes or status toggles
  const startCamera = async (cameraId: string) => {
    if (!cameraId) return;
    setLoading(true);
    setCameraError(null);

    // Stop current scanner if already scanning
    if (qrCodeInstanceRef.current && qrCodeInstanceRef.current.isScanning) {
      try {
        await qrCodeInstanceRef.current.stop();
      } catch (err) {
        console.error('Stop error:', err);
      }
    }

    try {
      const html5QrCode = new Html5Qrcode(viewFinderId);
      qrCodeInstanceRef.current = html5QrCode;

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          // Success Callback
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Failure callback is very verbose in html5-qrcode, so we only pass to props when explicitly needed
          if (onScanFailure) {
            onScanFailure(errorMessage);
          }
        }
      );

      setScannerActive(true);
    } catch (err: any) {
      console.error('Failed to start camera scan:', err);
      setCameraError(err?.message || 'Gagal tersambung dengan kamera aktif. Pastikan perizinan kamera diperbolehkan.');
      setScannerActive(false);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = async () => {
    if (qrCodeInstanceRef.current && qrCodeInstanceRef.current.isScanning) {
      try {
        setLoading(true);
        await qrCodeInstanceRef.current.stop();
        setScannerActive(false);
      } catch (err) {
        console.error('Error stopping camera:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Trigger scanning when toggling power or changing camera
  const handleToggleScanner = () => {
    if (scannerActive) {
      stopCamera();
    } else {
      if (selectedCameraId) {
        startCamera(selectedCameraId);
      } else {
        setCameraError('Pilih kamera terlebih dahulu.');
      }
    }
  };

  // Scan from uploaded file
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setFileError(null);
    setFileSuccess(null);
    setLoading(true);

    const html5QrCode = new Html5Qrcode(viewFinderId + '-file-dummy');
    
    html5QrCode.scanFile(file, true)
      .then((decodedText) => {
        setFileSuccess(`QR Code ditemukan & dibaca!`);
        onScanSuccess(decodedText);
        setLoading(false);
      })
      .catch((err) => {
        console.error('File scan error:', err);
        setFileError('Gagal mendeteksi / membaca QR Code pada file gambar ini. Coba gambar lain yang lebih jelas.');
        setLoading(false);
      });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Scanner Mode Switch Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-sm border border-slate-200">
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setScannerMode('camera');
          }}
          className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors rounded-xs cursor-pointer flex items-center justify-center gap-1.5 ${
            scannerMode === 'camera'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Kamera Aktif (Live)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setScannerMode('file');
          }}
          className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors rounded-xs cursor-pointer flex items-center justify-center gap-1.5 ${
            scannerMode === 'file'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File QR (Fallback)</span>
        </button>
      </div>

      {scannerMode === 'camera' ? (
        <div className="space-y-3">
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between text-left">
            <div className="flex-1 max-w-xs">
              <select
                id="camera-select-dropdown"
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  if (scannerActive) {
                    startCamera(e.target.value);
                  }
                }}
                disabled={cameras.length === 0}
                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2 py-1 text-xs font-semibold focus:outline-none focus:bg-white"
              >
                {cameras.length === 0 ? (
                  <option value="">Tidak ada kamera terdeteksi</option>
                ) : (
                  cameras.map((c, idx) => (
                    <option key={c.deviceId} value={c.deviceId}>
                      {c.label || `Kamera ${idx + 1}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex gap-2 shrink-0">
              {cameras.length > 0 && (
                <button
                  type="button"
                  id="start-stop-cam-btn"
                  onClick={handleToggleScanner}
                  disabled={loading}
                  className={`px-3 py-1 text-xs font-bold rounded-sm border flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
                    scannerActive
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {scannerActive ? (
                    <>
                      <VideoOff className="w-3.5 h-3.5" />
                      <span>Matikan Kamera</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-3.5 h-3.5" />
                      <span>Nyalakan Kamera</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Camera Viewfinder Box */}
          <div className="relative border border-slate-200 rounded-sm overflow-hidden bg-slate-900 min-h-[280px] flex items-center justify-center">
            {/* Viewfinder brackets */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-sky-400 z-10"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-sky-400 z-10"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-sky-400 z-10"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-sky-400 z-10"></div>

            {/* Scanning Laser Line decoration */}
            {scannerActive && !loading && (
              <div id="scanning-laser-line" className="absolute left-0 right-0 h-0.5 bg-sky-400/80 shadow-[0_0_8px_#38bdf8] animate-bounce top-1/2 z-10 pointer-events-none"></div>
            )}

            {/* The Actual HTML5-Qrcode Camera Element */}
            <div 
              id={viewFinderId} 
              className={`w-full max-w-[320px] aspect-square overflow-hidden bg-transparent z-0 ${
                !scannerActive ? 'hidden' : 'block'
              }`}
            />

            {/* Standby & Loading states visuals */}
            {!scannerActive && (
              <div className="p-6 text-center space-y-3 z-10">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white mx-auto border border-white/20">
                  <Camera className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Status Lensa Pemindai</p>
                  <p className="text-xs text-slate-300 font-medium max-w-xs mt-1">
                    Silakan klik tombol "Nyalakan Kamera" untuk mulai melakukan scanning absensi santri secara otomatis.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-slate-950/80 z-20 flex flex-col items-center justify-center space-y-2">
                <RotateCw className="w-6 h-6 text-sky-400 animate-spin" />
                <p className="text-[10px] font-bold text-sky-300 tracking-tight font-mono uppercase">Menghubungkan sensor...</p>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 bg-slate-950/90 z-20 p-6 flex flex-col items-center justify-center text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono">Kamera Tidak Tersedia</p>
                <p className="text-xs text-slate-300 max-w-xs leading-normal">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => setScannerMode('file')}
                  className="mt-2 px-3 py-1 bg-white text-slate-900 border font-bold text-[10px] uppercase rounded-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Gunakan Upload File Gambar
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* File input fallback scanner */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-sm p-6 text-center transition-all duration-150 min-h-[220px] flex flex-col items-center justify-center space-y-3 cursor-pointer ${
              dragActive 
                ? 'border-sky-500 bg-sky-50/20' 
                : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
            }`}
            onClick={() => document.getElementById('file-qr-input')?.click()}
          >
            <input
              type="file"
              id="file-qr-input"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="p-3.5 bg-white border border-slate-200 rounded-sm shadow-xs text-slate-500 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-8 h-8 text-slate-600" />
            </div>

            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Upload Foto Kartu Santri</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs">
                Seret file gambar di sini, atau klik untuk memilih file dari komputer atau galeri smartphone Anda.
              </p>
            </div>

            {loading && (
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-sky-600 font-bold bg-white px-2 py-0.5 border border-sky-100 rounded-sm shadow-xs">
                <RotateCw className="w-3 h-3 animate-spin text-sky-500" />
                <span>MENDENYUTKAN FILE...</span>
              </div>
            )}
          </div>

          {/* Invisible Element required by html5-qrcode for file scanning buffer */}
          <div id={viewFinderId + '-file-dummy'} className="hidden" />

          {fileError && (
            <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-sm text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {fileSuccess && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-sm text-xs font-bold uppercase tracking-tight flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{fileSuccess}</span>
            </div>
          )}
        </div>
      )}

      {/* Manual instructional hint */}
      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-sm text-left">
        <span className="text-[9px] font-bold text-blue-800 uppercase tracking-wider font-mono block">Petunjuk Kiosk QR :</span>
        <p className="text-[10.5px] text-slate-650 mt-1 leading-normal font-medium">
          Setiap kartu santri memiliki QR code unik berbasis NIS (Nomor Induk Santri). Pemindaian akan mencatat kehadiran instan dan menampilkan notifikasi visual serta suara beeper sukses secara real-time.
        </p>
      </div>
    </div>
  );
}
