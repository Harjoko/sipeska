import React, { useState } from 'react';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  Plus,
  Paperclip,
  UploadCloud,
  FileCheck2,
  Calendar,
  AlertCircle,
  X,
  User,
} from 'lucide-react';
import {
  SuratMasuk,
  Disposisi,
  TindakLanjut,
  UserProfile,
} from '../types';
import { storeService } from '../lib/supabase';

interface TindakLanjutViewProps {
  currentUser: UserProfile;
  suratMasukList: SuratMasuk[];
  disposisiList: Disposisi[];
  tindakLanjutList: TindakLanjut[];
}

export const TindakLanjutView: React.FC<TindakLanjutViewProps> = ({
  currentUser,
  suratMasukList,
  disposisiList,
  tindakLanjutList,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDisposisi, setSelectedDisposisi] = useState<Disposisi | null>(null);

  const [formData, setFormData] = useState({
    uraian: '',
    statusAkhir: 'Selesai' as 'Dalam Proses' | 'Selesai',
    buktiFileName: 'laporan_pelaksanaan_tugas.pdf',
    tanggal: new Date().toISOString().split('T')[0],
  });

  const handleOpenModal = (disp: Disposisi) => {
    setSelectedDisposisi(disp);
    setFormData({
      uraian: '',
      statusAkhir: 'Selesai',
      buktiFileName: 'laporan_pelaksanaan_tugas.pdf',
      tanggal: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisposisi) return;
    if (!formData.uraian.trim()) {
      alert('Mohon isi uraian tindak lanjut pelaksanaan.');
      return;
    }

    storeService.addTindakLanjut({
      disposisiId: selectedDisposisi.id,
      suratMasukId: selectedDisposisi.suratMasukId,
      pelaksanaId: currentUser.id,
      pelaksanaNama: currentUser.fullName,
      pelaksanaJabatan: currentUser.jabatan,
      tanggalTindakLanjut: formData.tanggal,
      uraianTindakLanjut: formData.uraian,
      buktiFileName: formData.buktiFileName,
      statusAkhir: formData.statusAkhir,
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tindak Lanjut & Pelaksanaan Instruksi
            </h2>
            <p className="text-xs text-slate-500">
              Pencatatan realisasi disposisi oleh dewan guru dan tenaga kependidikan SDN 1 Keden
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            Login sebagai: <strong className="text-blue-700">{currentUser.fullName}</strong>
          </span>
        </div>
      </div>

      {/* Disposisi Cards Requiring Follow-Up */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-amber-600" />
          <span>Disposisi yang Perlu Ditindaklanjuti</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disposisiList.map((disp) => {
            const surat = suratMasukList.find((s) => s.id === disp.suratMasukId);
            const tlItems = tindakLanjutList.filter((t) => t.disposisiId === disp.id);
            const isCompleted = disp.status === 'Selesai';

            // Check if current user is named or matching role
            const isAssigned =
              disp.ditujukanKepada.some(
                (target) =>
                  target.toLowerCase().includes(currentUser.fullName.toLowerCase()) ||
                  target.toLowerCase().includes(currentUser.jabatan.toLowerCase()) ||
                  (currentUser.role === 'guru' && target.toLowerCase().includes('guru')) ||
                  (currentUser.role === 'tata_usaha' && target.toLowerCase().includes('tata usaha'))
              ) || currentUser.role === 'super_admin';

            return (
              <div
                key={disp.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-3 transition-all ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isAssigned
                    ? 'border-blue-300 ring-2 ring-blue-500/10'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {disp.noAgendaSurat}
                    </span>
                    {isAssigned && (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-100 text-blue-800">
                        Ditugaskan ke Anda
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {disp.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{disp.perihalSurat}</h4>
                  {surat && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Asal: {surat.asalSurat} | Tenggat:{' '}
                      <strong className="text-red-700 font-mono">{disp.batasWaktu || 'Segera'}</strong>
                    </p>
                  )}
                </div>

                {/* Catatan Kepala Sekolah */}
                <div className="text-xs text-slate-700 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900 block text-[10px] mb-0.5">
                    Arahan Kepala Sekolah:
                  </span>
                  <p className="line-clamp-2">{disp.catatanKepalaSekolah || disp.instruksi.join(', ')}</p>
                </div>

                {/* Existing follow-up reports */}
                {tlItems.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Riwayat Tindak Lanjut ({tlItems.length}):
                    </span>
                    {tlItems.map((tl) => (
                      <div
                        key={tl.id}
                        className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800">
                          <span>{tl.pelaksanaNama}</span>
                          <span className="text-slate-400 font-mono">{tl.tanggalTindakLanjut}</span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{tl.uraianTindakLanjut}</p>
                        {tl.buktiFileName && (
                          <div className="text-[10px] text-blue-600 flex items-center gap-1 font-mono">
                            <Paperclip className="w-3 h-3" />
                            <span>{tl.buktiFileName}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Ditujukan: {disp.ditujukanKepada.join(', ')}
                  </span>

                  <button
                    onClick={() => handleOpenModal(disp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Isi Tindak Lanjut</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: INPUT TINDAK LANJUT */}
      {showModal && selectedDisposisi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                  <ListTodo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Form Tindak Lanjut Disposisi
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDisposisi.noAgendaSurat} — {selectedDisposisi.perihalSurat}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pelaksana
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.fullName}
                    className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Uraian Tindak Lanjut */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Uraian Hasil Tindak Lanjut / Catatan Penyelesaian <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.uraian}
                  onChange={(e) => setFormData({ ...formData, uraian: e.target.value })}
                  placeholder="Jelaskan langkah penyelesaian yang telah dilakukan, koordinasi yang telah dijalankan, atau dokumen yang telah disiapkan..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Status Akhir */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Penyelesaian
                </label>
                <select
                  value={formData.statusAkhir}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      statusAkhir: e.target.value as 'Dalam Proses' | 'Selesai',
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Selesai">Selesai (Tuntas Dilaksanakan)</option>
                  <option value="Dalam Proses">Dalam Proses (Masih Berjalan)</option>
                </select>
              </div>

              {/* Unggah Bukti / Dokumen Pendukung */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Unggah Dokumen Bukti / Foto Pendukung (Opsional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs">
                    <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                    <span>Pilih Berkas Bukti</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, buktiFileName: file.name });
                        }
                      }}
                    />
                  </label>
                  <span className="text-xs text-slate-600 font-mono">
                    {formData.buktiFileName}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer"
                >
                  Simpan Laporan Tindak Lanjut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
