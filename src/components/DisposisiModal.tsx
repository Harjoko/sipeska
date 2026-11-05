import React, { useState } from 'react';
import {
  FileCheck2,
  Calendar,
  Clock,
  UserCheck,
  CheckSquare,
  Printer,
  X,
  AlertCircle,
} from 'lucide-react';
import { SuratMasuk, SuratSifat, Disposisi } from '../types';
import { storeService } from '../lib/supabase';

interface DisposisiModalProps {
  surat: SuratMasuk;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (disposisi: Disposisi) => void;
  onPrintDirect?: (surat: SuratMasuk, disposisi: Disposisi) => void;
}

export const DisposisiModal: React.FC<DisposisiModalProps> = ({
  surat,
  isOpen,
  onClose,
  onSuccess,
  onPrintDirect,
}) => {
  const currentUser = storeService.getCurrentUser();
  const school = storeService.getSchoolProfile();

  const standardInstructions = [
    'Tindak lanjuti segera',
    'Hadiri / Wakilkan',
    'Pelajari & buat telaahan / laporan',
    'Untuk diketahui / arsip',
    'Siapkan bahan / naskah jawaban',
    'Koordinasikan dengan rekan guru / staf',
    'Sosialisasikan pada rapat dewan guru',
    'Jadwalkan dalam agenda sekolah',
  ];

  const targetStaffList = [
    'Budi Santoso, A.Md. (Tata Usaha)',
    'Bendahara BOS SDN 1 Keden',
    'Operator Sekolah / Dapodik',
    'Siti Rahmawati, S.Pd. (Koord. Kurikulum & Guru Kls 5)',
    'Bambang Setiawan, S.Pd.Jas. (Guru PJOK / Kesiswaan)',
    'Guru Pendidikan Agama Islam (PAI)',
    'Dewan Guru Kelas 1 s.d. 6',
    'Pengurus Komite SDN 1 Keden',
  ];

  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([
    'Tindak lanjuti segera',
  ]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([
    'Budi Santoso, A.Md. (Tata Usaha)',
  ]);
  const [batasWaktu, setBatasWaktu] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [sifatDisposisi, setSifatDisposisi] = useState<SuratSifat>(surat.sifat);
  const [catatan, setCatatan] = useState<string>('');

  if (!isOpen) return null;

  const toggleInstruction = (inst: string) => {
    setSelectedInstructions((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst]
    );
  };

  const toggleStaff = (staff: string) => {
    setSelectedStaff((prev) =>
      prev.includes(staff) ? prev.filter((s) => s !== staff) : [...prev, staff]
    );
  };

  const handleSubmit = (e: React.FormEvent, thenPrint = false) => {
    e.preventDefault();
    if (selectedInstructions.length === 0) {
      alert('Pilih minimal satu instruksi disposisi.');
      return;
    }
    if (selectedStaff.length === 0) {
      alert('Pilih minimal satu pelaksana / guru yang ditugaskan.');
      return;
    }

    const newDisp = storeService.addDisposisi({
      suratMasukId: surat.id,
      noAgendaSurat: surat.noAgenda,
      perihalSurat: surat.perihal,
      tanggalDisposisi: new Date().toISOString().split('T')[0],
      batasWaktu: batasWaktu || undefined,
      sifatDisposisi: sifatDisposisi,
      instruksi: selectedInstructions,
      catatanKepalaSekolah: catatan,
      ditujukanKepada: selectedStaff,
      status: 'Dalam Proses',
      createdByName: currentUser.fullName,
    });

    onSuccess(newDisp);
    if (thenPrint && onPrintDirect) {
      onPrintDirect(surat, newDisp);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shadow-xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Form Disposisi Kepala Sekolah
              </h3>
              <p className="text-xs text-slate-500">
                Kepala Sekolah: {school.kepalaSekolah}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Letter Summary Card */}
        <div className="p-4 mx-6 mt-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-blue-700">{surat.noAgenda}</span>
            <span className="font-semibold text-slate-600">Diterima: {surat.tanggalDiterima}</span>
          </div>
          <p className="font-bold text-slate-900 text-sm">{surat.perihal}</p>
          <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200">
            <span>Dari: <strong className="text-slate-700">{surat.asalSurat}</strong></span>
            <span>No Surat: <strong className="font-mono text-slate-700">{surat.noSuratPengirim}</strong></span>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-5">
          {/* Sifat Disposisi & Batas Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sifat Disposisi
              </label>
              <select
                value={sifatDisposisi}
                onChange={(e) => setSifatDisposisi(e.target.value as SuratSifat)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Segera">Segera</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Batas Waktu Penyelesaian (Tenggat)
              </label>
              <input
                type="date"
                value={batasWaktu}
                onChange={(e) => setBatasWaktu(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Instruksi Pilihan Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Instruksi / Arahan Kepala Sekolah <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {standardInstructions.map((inst) => {
                const checked = selectedInstructions.includes(inst);
                return (
                  <div
                    key={inst}
                    onClick={() => toggleInstruction(inst)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      checked
                        ? 'bg-amber-50/80 border-amber-400 text-amber-950 font-semibold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="rounded text-amber-600 focus:ring-amber-500 pointer-events-none"
                    />
                    <span>{inst}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ditujukan Kepada Guru / Pelaksana */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Diteruskan / Ditugaskan Kepada <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {targetStaffList.map((staff) => {
                const checked = selectedStaff.includes(staff);
                return (
                  <div
                    key={staff}
                    onClick={() => toggleStaff(staff)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      checked
                        ? 'bg-blue-50 border-blue-400 text-blue-950 font-semibold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                    />
                    <span className="truncate">{staff}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catatan Khusus */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan & Petunjuk Khusus Kepala Sekolah
            </label>
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Koordinasikan berkas SPJ dengan bendahara BOS, pastikan selesai sebelum tanggal 10 November."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>

            <div className="flex items-center gap-2">
              {onPrintDirect && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Simpan & Cetak Lembar</span>
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all cursor-pointer"
              >
                Kirim Disposisi Sekarang
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
