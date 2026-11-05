import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Eye,
  Filter,
  Search,
  User,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import {
  SuratMasuk,
  Disposisi,
  UserProfile,
  TindakLanjut,
} from '../types';
import { storeService } from '../lib/supabase';

interface DisposisiViewProps {
  currentUser: UserProfile;
  suratMasukList: SuratMasuk[];
  disposisiList: Disposisi[];
  tindakLanjutList: TindakLanjut[];
  onOpenDisposisiModal: (surat: SuratMasuk) => void;
  onPrintDisposisi: (surat: SuratMasuk, disposisi: Disposisi) => void;
  onNavigateTab: (tab: string) => void;
}

export const DisposisiView: React.FC<DisposisiViewProps> = ({
  currentUser,
  suratMasukList,
  disposisiList,
  tindakLanjutList,
  onOpenDisposisiModal,
  onPrintDisposisi,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'perlu' | 'riwayat'>('perlu');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Letters that need disposition (Baru Diterima or Menunggu Disposisi)
  const lettersNeedingDisposisi = suratMasukList.filter(
    (s) => s.status === 'Baru Diterima' || s.status === 'Menunggu Disposisi'
  );

  // Filtered Disposisi list
  const filteredDisposisi = disposisiList.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      d.noAgendaSurat.toLowerCase().includes(q) ||
      d.perihalSurat.toLowerCase().includes(q) ||
      d.catatanKepalaSekolah.toLowerCase().includes(q) ||
      d.ditujukanKepada.some((staff) => staff.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Disposisi & Instruksi Kepala Sekolah
            </h2>
            <p className="text-xs text-slate-500">
              Kewenangan Kepala Sekolah dalam memberikan arahan dan penugasan tindak lanjut
            </p>
          </div>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('perlu')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'perlu'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Perlu Didisposisi ({lettersNeedingDisposisi.length})
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'riwayat'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Disposisi ({disposisiList.length})
          </button>
        </div>
      </div>

      {activeTab === 'perlu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span>Daftar surat masuk yang belum memiliki lembar disposisi pimpinan</span>
            <span className="font-bold text-amber-700">
              {lettersNeedingDisposisi.length} Surat Menunggu Disposisi
            </span>
          </div>

          {lettersNeedingDisposisi.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">
                Semua Surat Masuk Sudah Didisposisikan!
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tidak ada surat yang tertunda. Anda dapat melihat perkembangan pelaksanaan pada menu Tindak Lanjut.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lettersNeedingDisposisi.map((surat) => (
                <div
                  key={surat.id}
                  className="bg-white rounded-2xl border border-amber-200 p-5 shadow-2xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {surat.noAgenda}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        surat.sifat === 'Segera'
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : surat.sifat === 'Penting'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {surat.sifat}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {surat.perihal}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      Dari: <strong className="text-slate-800">{surat.asalSurat}</strong>
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                    {surat.ringkasanIsi || 'Tidak ada catatan ringkasan khusus.'}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">
                      Diterima: {surat.tanggalDiterima}
                    </span>

                    {currentUser.role === 'kepala_sekolah' || currentUser.role === 'super_admin' ? (
                      <button
                        onClick={() => onOpenDisposisiModal(surat)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-colors cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Beri Disposisi</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Menunggu disposisi Kepala Sekolah
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'riwayat' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari agenda, perihal, pelaksana..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
              >
                <option value="all">Semua Status Disposisi</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* List of Disposisi Cards */}
          <div className="space-y-3">
            {filteredDisposisi.map((disp) => {
              const surat = suratMasukList.find((s) => s.id === disp.suratMasukId);
              const relatedTL = tindakLanjutList.filter((t) => t.disposisiId === disp.id);

              return (
                <div
                  key={disp.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">
                        {disp.noAgendaSurat}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-slate-600">
                        Tgl Disposisi: {disp.tanggalDisposisi}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          disp.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-blue-50 text-blue-700 border-blue-300'
                        }`}
                      >
                        Status: {disp.status}
                      </span>

                      {surat && (
                        <button
                          onClick={() => onPrintDisposisi(surat, disp)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors cursor-pointer"
                          title="Cetak Lembar Disposisi"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600" />
                          <span>Cetak</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{disp.perihalSurat}</h4>
                    {surat && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Asal: <strong className="text-slate-700">{surat.asalSurat}</strong> | No Surat: <strong className="font-mono">{surat.noSuratPengirim}</strong>
                      </p>
                    )}
                  </div>

                  {/* Instruksi Pill Tags */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Instruksi Kepala Sekolah:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {disp.instruksi.map((ins, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium"
                        >
                          ✓ {ins}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Catatan Khusus */}
                  {disp.catatanKepalaSekolah && (
                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-sans">
                      <strong className="text-slate-900 block text-[11px] mb-0.5">Catatan Khusus:</strong>
                      {disp.catatanKepalaSekolah}
                    </div>
                  )}

                  {/* Ditujukan Kepada & Batas Waktu */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Diteruskan / Ditugaskan Kepada:</span>
                      <strong className="text-slate-900">{disp.ditujukanKepada.join(', ')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tenggat / Batas Waktu:</span>
                      <strong className="text-red-700 font-mono">{disp.batasWaktu || 'Segera'}</strong>
                    </div>
                  </div>

                  {/* Progress Tindak Lanjut link */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      Tercatat <strong>{relatedTL.length}</strong> laporan tindak lanjut
                    </span>

                    <button
                      onClick={() => onNavigateTab('tindak_lanjut')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Lihat Perkembangan Tindak Lanjut</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
