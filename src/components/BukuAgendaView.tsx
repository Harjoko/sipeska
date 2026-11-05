import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Printer,
  Download,
  Calendar,
  Filter,
  FileText,
  Inbox,
  Send,
  FileCheck2,
} from 'lucide-react';
import {
  SuratMasuk,
  SuratKeluar,
  Disposisi,
  UserProfile,
} from '../types';
import { storeService } from '../lib/supabase';

interface BukuAgendaViewProps {
  currentUser: UserProfile;
  suratMasukList: SuratMasuk[];
  suratKeluarList: SuratKeluar[];
  disposisiList: Disposisi[];
  onPrintDisposisi: (surat: SuratMasuk, disposisi?: Disposisi) => void;
  onPrintCustomDocument: (type: 'agenda_masuk' | 'agenda_keluar', data: any) => void;
}

export const BukuAgendaView: React.FC<BukuAgendaViewProps> = ({
  currentUser,
  suratMasukList,
  suratKeluarList,
  disposisiList,
  onPrintDisposisi,
  onPrintCustomDocument,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [activeTab, setActiveTab] = useState<'masuk' | 'keluar' | 'lembar_disposisi'>('masuk');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedSuratForDisp, setSelectedSuratForDisp] = useState<string>('');

  const school = storeService.getSchoolProfile();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  // Filtered Agenda Masuk
  const filteredAgendaMasuk = useMemo(() => {
    return suratMasukList.filter((item) => {
      const d = new Date(item.tanggalDiterima);
      const matchYear = d.getFullYear() === selectedYear;
      const matchMonth = selectedMonth === 'all' || d.getMonth() + 1 === Number(selectedMonth);
      return matchYear && matchMonth;
    });
  }, [suratMasukList, selectedYear, selectedMonth]);

  // Filtered Agenda Keluar
  const filteredAgendaKeluar = useMemo(() => {
    return suratKeluarList.filter((item) => {
      const d = new Date(item.tanggalSurat);
      const matchYear = d.getFullYear() === selectedYear;
      const matchMonth = selectedMonth === 'all' || d.getMonth() + 1 === Number(selectedMonth);
      return matchYear && matchMonth;
    });
  }, [suratKeluarList, selectedYear, selectedMonth]);

  // Export CSV
  const handleExportCSV = () => {
    if (activeTab === 'masuk') {
      const headers = ['No Urut', 'No Agenda', 'No Surat Asal', 'Tgl Surat', 'Tgl Terima', 'Asal Surat', 'Perihal', 'Sifat', 'Status'];
      const rows = filteredAgendaMasuk.map((s, idx) => [
        idx + 1,
        `"${s.noAgenda}"`,
        `"${s.noSuratPengirim}"`,
        s.tanggalSurat,
        s.tanggalDiterima,
        `"${s.asalSurat}"`,
        `"${s.perihal}"`,
        s.sifat,
        s.status,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `buku_agenda_surat_masuk_sdn1keden_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['No Urut', 'No Agenda Keluar', 'No Surat', 'Tgl Surat', 'Tujuan', 'Perihal', 'Sifat', 'Penandatangan', 'Status'];
      const rows = filteredAgendaKeluar.map((s, idx) => [
        idx + 1,
        `"${s.noAgendaKeluar}"`,
        `"${s.noSurat}"`,
        s.tanggalSurat,
        `"${s.tujuanSurat}"`,
        `"${s.perihal}"`,
        s.sifat,
        `"${s.penandatanganNama}"`,
        s.status,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `buku_agenda_surat_keluar_sdn1keden_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintAgenda = () => {
    if (activeTab === 'masuk') {
      onPrintCustomDocument('agenda_masuk', {
        title: `BUKU AGENDA SURAT MASUK TAHUN ${selectedYear}`,
        periodText: selectedMonth === 'all' ? `Tahun ${selectedYear}` : `Bulan ${monthNames[Number(selectedMonth) - 1]} ${selectedYear}`,
        items: filteredAgendaMasuk,
      });
    } else if (activeTab === 'keluar') {
      onPrintCustomDocument('agenda_keluar', {
        title: `BUKU AGENDA SURAT KELUAR TAHUN ${selectedYear}`,
        periodText: selectedMonth === 'all' ? `Tahun ${selectedYear}` : `Bulan ${monthNames[Number(selectedMonth) - 1]} ${selectedYear}`,
        items: filteredAgendaKeluar,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Buku Agenda Persuratan & Laporan Cetak
            </h2>
            <p className="text-xs text-slate-500">
              Dokumentasi arsip resmi SD Negeri 1 Keden siap cetak dan ekspor
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('masuk')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'masuk'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agenda Surat Masuk
          </button>
          <button
            onClick={() => setActiveTab('keluar')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'keluar'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agenda Surat Keluar
          </button>
          <button
            onClick={() => setActiveTab('lembar_disposisi')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'lembar_disposisi'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lembar Disposisi
          </button>
        </div>
      </div>

      {activeTab !== 'lembar_disposisi' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Periode:</span>
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
            >
              <option value="all">Sepanjang Tahun ({selectedYear})</option>
              {monthNames.map((name, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  Bulan {name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
            >
              <option value={currentYear}>{currentYear}</option>
              <option value={currentYear - 1}>{currentYear - 1}</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handlePrintAgenda}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Buku Agenda Resmi</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: AGENDA SURAT MASUK TABLE */}
      {activeTab === 'masuk' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Buku Agenda Surat Masuk — {school.namaSekolah}
              </h3>
              <p className="text-[11px] text-slate-500">
                Tahun Anggaran {selectedYear} ({filteredAgendaMasuk.length} Surat)
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Formulir Administrasi Persuratan Standar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-300 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-center border-r border-slate-200 w-12">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">No. Agenda</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Tgl Terima</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Asal Surat</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">No. & Tgl Surat Asli</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Perihal</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Sifat</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Disposisi Kepala Sekolah</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {filteredAgendaMasuk.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada data surat masuk pada periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredAgendaMasuk.map((s, idx) => {
                    const disp = disposisiList.find((d) => d.suratMasukId === s.id);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center border-r border-slate-200 font-mono font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold text-blue-700 whitespace-nowrap">
                          {s.noAgenda}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                          {s.tanggalDiterima}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-semibold max-w-[150px] truncate">
                          {s.asalSurat}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <p className="font-mono font-semibold">{s.noSuratPengirim}</p>
                          <p className="text-[10px] text-slate-400">{s.tanggalSurat}</p>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 max-w-[200px]">
                          {s.perihal}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 font-semibold">
                            {s.sifat}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 max-w-[180px]">
                          {disp ? (
                            <div>
                              <p className="font-semibold text-amber-900 truncate">
                                Ditujukan: {disp.ditujukanKepada.join(', ')}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {disp.instruksi[0]}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Belum didisposisi</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-700">
                          {s.status}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AGENDA SURAT KELUAR TABLE */}
      {activeTab === 'keluar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Buku Agenda Surat Keluar — {school.namaSekolah}
              </h3>
              <p className="text-[11px] text-slate-500">
                Tahun Anggaran {selectedYear} ({filteredAgendaKeluar.length} Surat)
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Formulir Administrasi Persuratan Standar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-300 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-center border-r border-slate-200 w-12">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">No. Agenda</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Nomor Surat Resmi</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Tgl Surat</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Dikirim Kepada (Tujuan)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Perihal</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Sifat</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Penandatangan</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {filteredAgendaKeluar.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada data surat keluar pada periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredAgendaKeluar.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center border-r border-slate-200 font-mono font-bold">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-slate-600 whitespace-nowrap">
                        {s.noAgendaKeluar}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold text-purple-800 whitespace-nowrap">
                        {s.noSurat}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        {s.tanggalSurat}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-semibold max-w-[180px] truncate">
                        {s.tujuanSurat}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 max-w-[220px]">
                        {s.perihal}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 font-semibold">
                          {s.sifat}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        {s.penandatanganNama}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-700">
                        {s.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CETAK LEMBAR DISPOSISI */}
      {activeTab === 'lembar_disposisi' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="max-w-xl space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Cetak Format Lembar Disposisi Resmi
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pilih surat masuk dari daftar untuk mencetak Lembar Disposisi lengkap ber-KOP resmi SD Negeri 1 Keden (Klaten) yang memuat rincian surat, checklist arahan kepala sekolah, serta lembar tanda tangan.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Surat Masuk:
              </label>
              <select
                value={selectedSuratForDisp}
                onChange={(e) => setSelectedSuratForDisp(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                <option value="">-- Pilih Surat Masuk untuk Dicetak --</option>
                {suratMasukList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.noAgenda} — {s.asalSurat} ({s.perihal.substring(0, 50)}...)
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                disabled={!selectedSuratForDisp}
                onClick={() => {
                  const targetSurat = suratMasukList.find((s) => s.id === selectedSuratForDisp);
                  if (targetSurat) {
                    const disp = disposisiList.find((d) => d.suratMasukId === targetSurat.id);
                    onPrintDisposisi(targetSurat, disp);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white shadow-md cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Buka & Cetak Lembar Disposisi Terpilih</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
