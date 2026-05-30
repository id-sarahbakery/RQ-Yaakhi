/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CheckSquare, Calendar, Sparkles, Smile, RefreshCw, Star } from 'lucide-react';
import { Mutabaah } from '../types';

interface MutabaahViewProps {
  mutabaahList: Mutabaah[];
  onUpdateMutabaah: (id: string, doneCount: number) => void;
}

export default function MutabaahView({ mutabaahList, onUpdateMutabaah }: MutabaahViewProps) {
  const [success, setSuccess] = useState<string | null>(null);

  const handleSliderChange = (id: string, val: number) => {
    onUpdateMutabaah(id, val);
  };

  const handleSimulatePerfect = () => {
    mutabaahList.forEach(m => {
      // Simulate that 90% of students did everything
      onUpdateMutabaah(m.id, Math.floor(m.totalCount * 0.9));
    });
    setSuccess('Kedisiplinan di-generate menjadi 90%+ untuk simulasi hari ini!');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">Mutaba'ah Ibadah Santri (Harian)</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Gunakan panel geser di bawah untuk memperbarui statistik kepatuhan ibadah harian santri berasrama</p>
        </div>
        <button
          onClick={handleSimulatePerfect}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-sm border border-blue-700 shadow-sm flex items-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Simulasi Ibadah Optimal (90%)</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-sm text-left uppercase tracking-tight">
          {success}
        </div>
      )}

      {/* Checklist list map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mutabaahList.map((item) => {
          const percent = Math.round((item.doneCount / item.totalCount) * 100);
          return (
            <div key={item.id} className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-sm">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.activityName}</h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Evaluasi Asrama</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-800 font-mono">{percent}%</span>
                  <span className="text-[9px] text-[#10b981] block font-bold font-mono">
                    {item.doneCount} / {item.totalCount} Santri
                  </span>
                </div>
              </div>

              {/* Slider Controller */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  <span>0 Santri</span>
                  <span>{item.totalCount} Santri</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={item.totalCount}
                  value={item.doneCount}
                  onChange={(e) => handleSliderChange(item.id, Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-none appearance-none cursor-pointer accent-blue-600 focus:outline-none border border-slate-200"
                />
              </div>

              {/* Remarks badge */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Predikat Pencapaian:</span>
                <span className={`font-bold text-[10px] uppercase tracking-tight px-2.5 py-0.5 rounded-sm border ${
                  percent >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  percent >= 60 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                  {percent >= 80 ? 'Sangat Baik (Mumtaz)' :
                   percent >= 60 ? 'Baik (Jayyid)' : 'Kurang (Perlu Perbaikan)'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
