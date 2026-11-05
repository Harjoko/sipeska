import React from 'react';
import {
  Printer,
  X,
  CheckSquare,
  Square,
  CheckCircle2,
  Download,
  School,
} from 'lucide-react';
import { SuratMasuk, Disposisi, SuratKeluar } from '../types';
import { storeService } from '../lib/supabase';
import { SchoolLogo } from './SchoolLogo';

export type PrintDocumentType =
  | 'lembar_disposisi'
  | 'surat_keluar'
  | 'agenda_masuk'
  | 'agenda_keluar';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: PrintDocumentType;
  suratMasuk?: SuratMasuk;
  disposisi?: Disposisi;
  suratKeluar?: SuratKeluar;
  customData?: any;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  documentType,
  suratMasuk,
  disposisi,
  suratKeluar,
  customData,
}) => {
  if (!isOpen) return null;

  const school = storeService.getSchoolProfile();

  const handleTriggerPrint = () => {
    window.print();
  };

  const allTargetStaff = [
    'Budi Santoso, A.Md. (Tata Usaha)',
    'Bendahara BOS SDN 1 Keden',
    'Operator Sekolah / Dapodik',
    'Siti Rahmawati, S.Pd. (Koord. Kurikulum)',
    'Bambang Setiawan, S.Pd.Jas. (PJOK / Kesiswaan)',
    'Guru Pendidikan Agama Islam (PAI)',
    'Dewan Guru Kelas 1 s.d. 6',
    'Pengurus Komite Sekolah',
  ];

  const allInstructions = [
    'Tindak lanjuti segera',
    'Hadiri / Wakilkan',
    'Pelajari & laporkan',
    'Untuk diketahui / arsip',
    'Siapkan bahan / jawaban',
    'Koordinasikan dengan guru terkait',
    'Sosialisasikan pada rapat dewan guru',
    'Jadwalkan dalam agenda sekolah',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:h-auto print:rounded-none">
        {/* Modal Top Control Bar (Hidden on actual print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Pratinjau Dokumen Cetak Resmi — SDN 1 Keden
              </h3>
              <p className="text-[11px] text-slate-400">
                Format standar A4 / F4 resmi pemerintahan Kabupaten Klaten
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-200/60 print:p-0 print:bg-white print:overflow-visible">
          <div className="max-w-[800px] mx-auto bg-white p-8 sm:p-12 shadow-xl border border-slate-300 font-serif text-slate-900 print:shadow-none print:border-none print:p-0 print:max-w-none">
            {/* OFFICIAL KOP SURAT SDN 1 KEDEN */}
            <div className="flex items-center justify-between border-b-4 border-double border-black pb-3 mb-5">
              <div className="w-20 flex justify-center shrink-0">
                <SchoolLogo size="lg" customUrl={school.logoUrl} />
              </div>

              <div className="flex-1 text-center px-2">
                <h4 className="text-xs sm:text-sm font-bold tracking-wider uppercase font-sans">
                  {school.kopHeaderBaris1}
                </h4>
                <h3 className="text-sm sm:text-base font-bold tracking-wide uppercase font-sans">
                  {school.kopHeaderBaris2}
                </h3>
                <h4 className="text-xs sm:text-sm font-bold tracking-wider uppercase font-sans">
                  {school.kopHeaderBaris3}
                </h4>
                <h2 className="text-base sm:text-lg font-black tracking-tight uppercase font-sans text-blue-950">
                  {school.namaSekolah}
                </h2>
                <p className="text-[10px] sm:text-[11px] font-sans text-slate-700 leading-tight mt-0.5">
                  Alamat: {school.alamat}, Kec. {school.kecamatan}, Kab. Klaten, Jawa Tengah {school.kodePos}
                </p>
                <p className="text-[10px] font-sans text-slate-600 leading-tight">
                  Website: {school.website} | Email: {school.email} | NSS: {school.nss} | NPSN: {school.npsn}
                </p>
              </div>

              <div className="w-20 flex justify-center shrink-0 text-center font-sans text-[9px] text-slate-400">
                <div className="border border-slate-300 rounded p-1">
                  <p className="font-bold text-slate-800">SIPESKA</p>
                  <p>Arsip Digital</p>
                </div>
              </div>
            </div>

            {/* DOCUMENT BODY BASED ON TYPE */}

            {/* 1. LEMBAR DISPOSISI KEPALA SEKOLAH */}
            {documentType === 'lembar_disposisi' && suratMasuk && (
              <div className="space-y-4 text-xs font-sans">
                <div className="text-center py-1">
                  <h3 className="text-sm sm:text-base font-bold underline uppercase tracking-wider">
                    LEMBAR DISPOSISI KEPALA SEKOLAH
                  </h3>
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                    No. Agenda: {suratMasuk.noAgenda} &nbsp;|&nbsp; Klasifikasi: {suratMasuk.kodeKlasifikasi}
                  </p>
                </div>

                {/* Surat Details Table */}
                <div className="border-2 border-black divide-y-2 divide-black">
                  <div className="grid grid-cols-2 divide-x-2 divide-black">
                    <div className="p-2 space-y-1">
                      <p className="text-[11px]">
                        <strong>Surat Dari :</strong> {suratMasuk.asalSurat}
                      </p>
                      <p className="text-[11px]">
                        <strong>No. Surat :</strong> <span className="font-mono">{suratMasuk.noSuratPengirim}</span>
                      </p>
                      <p className="text-[11px]">
                        <strong>Tgl. Surat :</strong> {suratMasuk.tanggalSurat}
                      </p>
                    </div>
                    <div className="p-2 space-y-1">
                      <p className="text-[11px]">
                        <strong>Diterima Tgl :</strong> {suratMasuk.tanggalDiterima}
                      </p>
                      <p className="text-[11px]">
                        <strong>No. Agenda :</strong> <span className="font-mono font-bold">{suratMasuk.noAgenda}</span>
                      </p>
                      <p className="text-[11px]">
                        <strong>Sifat Surat :</strong> [ {suratMasuk.sifat} ]
                      </p>
                    </div>
                  </div>

                  <div className="p-2">
                    <p className="text-[11px]">
                      <strong>Perihal :</strong> {suratMasuk.perihal}
                    </p>
                  </div>

                  {/* Diteruskan Kepada & Instruksi Split */}
                  <div className="grid grid-cols-2 divide-x-2 divide-black">
                    {/* Kolom Diteruskan Kepada */}
                    <div className="p-2 space-y-1.5">
                      <p className="font-bold text-[11px] uppercase border-b border-black pb-1">
                        DITERUSKAN KEPADA :
                      </p>
                      <div className="space-y-1 text-[11px]">
                        {allTargetStaff.map((staff) => {
                          const isChecked = disposisi?.ditujukanKepada.some((s) =>
                            s.toLowerCase().includes(staff.toLowerCase()) || staff.toLowerCase().includes(s.toLowerCase())
                          );
                          return (
                            <div key={staff} className="flex items-start gap-1.5">
                              <span className="font-mono font-bold mt-0.5">
                                [ {isChecked ? '✓' : ' '} ]
                              </span>
                              <span className={isChecked ? 'font-bold text-black' : 'text-slate-700'}>
                                {staff}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Kolom Disposisi / Instruksi Kepala Sekolah */}
                    <div className="p-2 space-y-1.5">
                      <p className="font-bold text-[11px] uppercase border-b border-black pb-1">
                        DISPOSISI / INSTRUKSI :
                      </p>
                      <div className="space-y-1 text-[11px]">
                        {allInstructions.map((inst) => {
                          const isChecked = disposisi?.instruksi.some((i) =>
                            i.toLowerCase().includes(inst.toLowerCase())
                          );
                          return (
                            <div key={inst} className="flex items-start gap-1.5">
                              <span className="font-mono font-bold mt-0.5">
                                [ {isChecked ? '✓' : ' '} ]
                              </span>
                              <span className={isChecked ? 'font-bold text-black' : 'text-slate-700'}>
                                {inst}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Catatan Khusus Pimpinan */}
                  <div className="p-3 min-h-[90px]">
                    <p className="font-bold text-[11px] uppercase mb-1">
                      CATATAN / PETUNJUK KHUSUS KEPALA SEKOLAH :
                    </p>
                    <p className="text-xs leading-relaxed text-slate-800 italic">
                      {disposisi?.catatanKepalaSekolah
                        ? `"${disposisi.catatanKepalaSekolah}"`
                        : '..................................................................................................................................................................................................................................................................................................................'}
                    </p>
                    <div className="mt-3 text-[11px] text-right">
                      <strong>Tenggat Waktu :</strong> {disposisi?.batasWaktu || 'Segera'}
                    </div>
                  </div>
                </div>

                {/* Signature Box */}
                <div className="pt-6 flex justify-end">
                  <div className="w-72 text-center space-y-1 text-xs">
                    <p>Klaten, {disposisi?.tanggalDisposisi || new Date().toISOString().split('T')[0]}</p>
                    <p className="font-bold">Kepala SD Negeri 1 Keden</p>
                    <div className="h-16 flex items-center justify-center">
                      <div className="border border-slate-300 rounded p-1 text-[10px] text-slate-500 font-sans">
                        [ Tanda Tangan & Cap Sekolah ]
                      </div>
                    </div>
                    <p className="font-bold underline text-slate-950">
                      {school.kepalaSekolah}
                    </p>
                    <p className="text-[11px] font-mono">NIP. {school.nipKepalaSekolah}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SURAT KELUAR RESMI BER-KOP */}
            {documentType === 'surat_keluar' && suratKeluar && (
              <div className="space-y-4 text-xs font-sans">
                <div className="flex justify-between font-sans text-xs">
                  <div className="space-y-0.5">
                    <p>Nomor &nbsp;: <strong className="font-mono">{suratKeluar.noSurat}</strong></p>
                    <p>Sifat &nbsp;&nbsp;&nbsp;: {suratKeluar.sifat}</p>
                    <p>Lamp. &nbsp;&nbsp;: {suratKeluar.lampiranInfo || '-'}</p>
                    <p>Perihal : <strong className="underline">{suratKeluar.perihal}</strong></p>
                  </div>
                  <div className="text-right">
                    <p>Klaten, {suratKeluar.tanggalSurat}</p>
                    <div className="mt-3 text-left">
                      <p>Kepada Yth :</p>
                      <p className="font-bold text-slate-900">{suratKeluar.tujuanSurat}</p>
                      <p className="text-slate-600">{suratKeluar.alamatTujuan || 'di Tempat'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 font-sans text-xs leading-relaxed text-justify space-y-3">
                  <p>Dengan hormat,</p>
                  <p className="indent-8">
                    {suratKeluar.ringkasanIsi ||
                      'Bersama dengan surat ini kami sampaikan agenda pelaksanaan dan koordinasi administrasi pendidikan di lingkungan SD Negeri 1 Keden untuk menjadi perhatian dan pedoman bersama.'}
                  </p>
                  <p className="indent-8">
                    Demikian surat ini kami sampaikan, atas perhatian dan kerjasama yang baik disampaikan terima kasih.
                  </p>
                </div>

                <div className="pt-10 flex justify-end">
                  <div className="w-72 text-center space-y-1 text-xs">
                    <p>Kepala SD Negeri 1 Keden</p>
                    <div className="h-16 flex items-center justify-center">
                      <div className="border border-emerald-500 rounded p-1 text-[10px] text-emerald-800 font-bold bg-emerald-50">
                        TERVERIFIKASI DIGITAL — SIPESKA
                      </div>
                    </div>
                    <p className="font-bold underline text-slate-950">
                      {suratKeluar.penandatanganNama}
                    </p>
                    <p className="text-[11px] font-mono">NIP. {suratKeluar.penandatanganNip}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. BUKU AGENDA PERSURATAN */}
            {(documentType === 'agenda_masuk' || documentType === 'agenda_keluar') && customData && (
              <div className="space-y-4 text-xs font-sans">
                <div className="text-center py-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider underline">
                    {customData.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Periode: {customData.periodText} &nbsp;|&nbsp; Satuan Pendidikan: {school.namaSekolah}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-2 border-black border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-black font-bold uppercase text-center">
                        <th className="p-2 border-r border-black w-8">No</th>
                        <th className="p-2 border-r border-black">No. Agenda</th>
                        <th className="p-2 border-r border-black">
                          {documentType === 'agenda_masuk' ? 'No. Surat Asli' : 'No. Surat Resmi'}
                        </th>
                        <th className="p-2 border-r border-black">Tgl Surat</th>
                        <th className="p-2 border-r border-black">
                          {documentType === 'agenda_masuk' ? 'Asal Pengirim' : 'Dikirim Kepada'}
                        </th>
                        <th className="p-2 border-r border-black">Perihal</th>
                        <th className="p-2 border-r border-black">Sifat</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-black">
                      {customData.items.map((item: any, idx: number) => (
                        <tr key={item.id} className="divide-x border-black">
                          <td className="p-1.5 text-center font-mono font-bold">{idx + 1}</td>
                          <td className="p-1.5 font-mono font-bold">{item.noAgenda || item.noAgendaKeluar}</td>
                          <td className="p-1.5 font-mono">{item.noSuratPengirim || item.noSurat}</td>
                          <td className="p-1.5 whitespace-nowrap">{item.tanggalSurat}</td>
                          <td className="p-1.5 font-semibold">{item.asalSurat || item.tujuanSurat}</td>
                          <td className="p-1.5">{item.perihal}</td>
                          <td className="p-1.5 text-center">{item.sifat}</td>
                          <td className="p-1.5 text-center font-semibold">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-8 flex justify-between text-xs">
                  <div className="text-center w-64 space-y-1">
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala SD Negeri 1 Keden</p>
                    <div className="h-14" />
                    <p className="font-bold underline">{school.kepalaSekolah}</p>
                    <p className="text-[10px] font-mono">NIP. {school.nipKepalaSekolah}</p>
                  </div>

                  <div className="text-center w-64 space-y-1">
                    <p>Klaten, {new Date().toISOString().split('T')[0]}</p>
                    <p className="font-bold">Pengadministrasi Persuratan / TU</p>
                    <div className="h-14" />
                    <p className="font-bold underline">Budi Santoso, A.Md.</p>
                    <p className="text-[10px] font-mono">NIP. 19850620 200902 1 003</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
