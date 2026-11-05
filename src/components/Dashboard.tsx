import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Send,
  FileCheck2,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  Filter,
  PlusCircle,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  SuratMasuk,
  SuratKeluar,
  Disposisi,
  TindakLanjut,
  UserProfile,
} from '../types';
import { storeService } from '../lib/supabase';

interface DashboardProps {
  currentUser: UserProfile;
  suratMasukList: SuratMasuk[];
  suratKeluarList: SuratKeluar[];
  disposisiList: Disposisi[];
  tindakLanjutList: TindakLanjut[];
  onNavigateTab: (tab: string) => void;
  onOpenInputSuratMasuk: () => void;
  onOpenInputSuratKeluar: () => void;
  onOpenDisposisiModal: (surat: SuratMasuk) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  suratMasukList,
  suratKeluarList,
  disposisiList,
  tindakLanjutList,
  onNavigateTab,
  onOpenInputSuratMasuk,
  onOpenInputSuratKeluar,
  onOpenDisposisiModal,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or '1'..'12'

  const school = storeService.getSchoolProfile();
  const activities = storeService.getActivityLogs();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Filtering data based on year and month
  const filteredSuratMasuk = useMemo(() => {
    return suratMasukList.filter((item) => {
      const date = new Date(item.tanggalDiterima);
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const yearMatch = y === selectedYear;
      const monthMatch = selectedMonth === 'all' || m === Number(selectedMonth);
      return yearMatch && monthMatch;
    });
  }, [suratMasukList, selectedYear, selectedMonth]);

  const filteredSuratKeluar = useMemo(() => {
    return suratKeluarList.filter((item) => {
      const date = new Date(item.tanggalSurat);
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const yearMatch = y === selectedYear;
      const monthMatch = selectedMonth === 'all' || m === Number(selectedMonth);
      return yearMatch && monthMatch;
    });
  }, [suratKeluarList, selectedYear, selectedMonth]);

  // Calculations for KPI Cards
  const totalMasuk = filteredSuratMasuk.length;
  const totalKeluar = filteredSuratKeluar.length;

  const masukBulanIni = useMemo(() => {
    return suratMasukList.filter((item) => {
      const d = new Date(item.tanggalDiterima);
      return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
    }).length;
  }, [suratMasukList, currentYear, currentMonth]);

  const keluarBulanIni = useMemo(() => {
    return suratKeluarList.filter((item) => {
      const d = new Date(item.tanggalSurat);
      return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
    }).length;
  }, [suratKeluarList, currentYear, currentMonth]);

  const belumDidisposisikan = useMemo(() => {
    return suratMasukList.filter(
      (s) => s.status === 'Baru Diterima' || s.status === 'Menunggu Disposisi'
    ).length;
  }, [suratMasukList]);

  const menungguTindakLanjut = useMemo(() => {
    return suratMasukList.filter(
      (s) => s.status === 'Sudah Didisposisikan' || s.status === 'Dalam Tindak Lanjut'
    ).length;
  }, [suratMasukList]);

  const selesaiDiproses = useMemo(() => {
    return suratMasukList.filter((s) => s.status === 'Selesai' || s.status === 'Diarsipkan').length;
  }, [suratMasukList]);

  // Letters requiring urgent attention
  const urgentLetters = useMemo(() => {
    return suratMasukList
      .filter((s) => s.sifat === 'Segera' || s.sifat === 'Penting' || s.status === 'Menunggu Disposisi')
      .slice(0, 4);
  }, [suratMasukList]);

  // Monthly stats breakdown for chart
  const monthlyData = useMemo(() => {
    const data = [];
    for (let m = 0; m < 12; m++) {
      const masuk = suratMasukList.filter((s) => {
        const d = new Date(s.tanggalDiterima);
        return d.getFullYear() === selectedYear && d.getMonth() === m;
      }).length;

      const keluar = suratKeluarList.filter((s) => {
        const d = new Date(s.tanggalSurat);
        return d.getFullYear() === selectedYear && d.getMonth() === m;
      }).length;

      data.push({
        monthName: monthNames[m].substring(0, 3),
        fullName: monthNames[m],
        masuk,
        keluar,
        total: masuk + keluar,
      });
    }
    return data;
  }, [suratMasukList, suratKeluarList, selectedYear]);

  const maxMonthlyVal = Math.max(...monthlyData.map((d) => Math.max(d.masuk, d.keluar, 5)));

  return (
    <div className="space-y-6">
      {/* Banner SDN 1 Keden */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f2744] via-[#1a3860] to-[#122842] p-6 text-white shadow-xl border border-blue-900/40">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Informasi Persuratan Digital — SDN 1 Keden</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Selamat Datang, {currentUser.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Anda masuk sebagai <strong className="text-amber-300">{currentUser.jabatan}</strong>. Pantau surat dinas, disposisi kepala sekolah, dan arsip dokumen sekolah secara terpadu.
            </p>
          </div>

          {/* Quick Action Shortcuts depending on role */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            {(currentUser.role === 'super_admin' || currentUser.role === 'tata_usaha') && (
              <button
                onClick={onOpenInputSuratMasuk}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Input Surat Masuk</span>
              </button>
            )}

            {(currentUser.role === 'super_admin' || currentUser.role === 'tata_usaha') && (
              <button
                onClick={onOpenInputSuratKeluar}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Buat Surat Keluar</span>
              </button>
            )}

            {currentUser.role === 'kepala_sekolah' && (
              <button
                onClick={() => onNavigateTab('disposisi')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Disposisikan Surat ({belumDidisposisikan})</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('buku_agenda')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Buku Agenda & Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar (Tahun & Bulan) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter Periode Data Statistik:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Bulan ({selectedYear})</option>
            {monthNames.map((name, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {name}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear - 2}>{currentYear - 2}</option>
          </select>

          {(selectedMonth !== 'all' || selectedYear !== currentYear) && (
            <button
              onClick={() => {
                setSelectedYear(currentYear);
                setSelectedMonth('all');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 7 KPI Statistic Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Surat Masuk */}
        <div
          onClick={() => onNavigateTab('surat_masuk')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Total Surat Masuk</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalMasuk}</span>
            <span className="text-[10px] text-slate-500">arsip</span>
          </div>
          <div className="mt-1 text-[10px] text-blue-600 font-medium">
            {masukBulanIni} surat bulan ini
          </div>
        </div>

        {/* Total Surat Keluar */}
        <div
          onClick={() => onNavigateTab('surat_keluar')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Total Surat Keluar</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalKeluar}</span>
            <span className="text-[10px] text-slate-500">surat</span>
          </div>
          <div className="mt-1 text-[10px] text-purple-600 font-medium">
            {keluarBulanIni} surat bulan ini
          </div>
        </div>

        {/* Surat Masuk Bulan Ini */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Masuk Bulan Ini</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{masukBulanIni}</span>
            <span className="text-[10px] text-slate-500">dokumen</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Periode berjalan</div>
        </div>

        {/* Surat Keluar Bulan Ini */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Keluar Bulan Ini</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600">{keluarBulanIni}</span>
            <span className="text-[10px] text-slate-500">dokumen</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Periode berjalan</div>
        </div>

        {/* Belum Didisposisikan */}
        <div
          onClick={() => onNavigateTab('disposisi')}
          className={`p-4 rounded-xl border shadow-2xs hover:shadow-md transition-all cursor-pointer group ${
            belumDidisposisikan > 0
              ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Belum Didisposisi</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">{belumDidisposisikan}</span>
            <span className="text-[10px] text-amber-800">perlu aksi</span>
          </div>
          <div className="mt-1 text-[10px] text-amber-800 font-semibold">
            Tindak lanjut Kepala Sekolah
          </div>
        </div>

        {/* Menunggu Tindak Lanjut */}
        <div
          onClick={() => onNavigateTab('tindak_lanjut')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Menunggu TL</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-700">{menungguTindakLanjut}</span>
            <span className="text-[10px] text-slate-500">proses</span>
          </div>
          <div className="mt-1 text-[10px] text-sky-600 font-medium">Oleh guru/pelaksana</div>
        </div>

        {/* Selesai Diproses */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Selesai Diproses</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{selesaiDiproses}</span>
            <span className="text-[10px] text-slate-500">arsip</span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-600 font-medium">Tuntas diarsipkan</div>
        </div>
      </div>

      {/* Main Grid: Chart & Urgent Disposisi Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Flow Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Grafik Statistik Persuratan Bulanan ({selectedYear})
              </h2>
              <p className="text-xs text-slate-500">
                Perbandingan volume surat masuk dan surat keluar SDN 1 Keden per bulan
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-blue-600" />
                <span className="text-slate-600">Surat Masuk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-purple-500" />
                <span className="text-slate-600">Surat Keluar</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-1 sm:gap-2 pt-6 px-1 border-b border-slate-100">
            {monthlyData.map((d, index) => {
              const masukHeight = Math.max((d.masuk / maxMonthlyVal) * 100, 4);
              const keluarHeight = Math.max((d.keluar / maxMonthlyVal) * 100, 4);
              const isCurrent = index === currentMonth - 1 && selectedYear === currentYear;

              return (
                <div key={d.monthName} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 max-w-[28px] h-full">
                    {/* Bar Masuk */}
                    <div
                      style={{ height: `${masukHeight}%` }}
                      className="w-1/2 bg-blue-600 hover:bg-blue-700 rounded-t-sm transition-all duration-300 relative group/bar"
                      title={`${d.fullName}: ${d.masuk} Surat Masuk`}
                    >
                      {d.masuk > 0 && (
                        <span className="opacity-0 group-hover/bar:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-slate-900 text-white px-1 rounded transition-opacity pointer-events-none z-20">
                          {d.masuk}
                        </span>
                      )}
                    </div>
                    {/* Bar Keluar */}
                    <div
                      style={{ height: `${keluarHeight}%` }}
                      className="w-1/2 bg-purple-500 hover:bg-purple-600 rounded-t-sm transition-all duration-300 relative group/bar"
                      title={`${d.fullName}: ${d.keluar} Surat Keluar`}
                    >
                      {d.keluar > 0 && (
                        <span className="opacity-0 group-hover/bar:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-slate-900 text-white px-1 rounded transition-opacity pointer-events-none z-20">
                          {d.keluar}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`mt-2 text-[10px] font-semibold ${
                      isCurrent ? 'text-blue-700 font-black underline' : 'text-slate-500'
                    }`}
                  >
                    {d.monthName}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Data bersumber dari registrasi agenda resmi SDN 1 Keden</span>
            <span className="font-semibold text-slate-700">
              Total Tahun {selectedYear}: {filteredSuratMasuk.length + filteredSuratKeluar.length} Surat
            </span>
          </div>
        </div>

        {/* Right Col: Surat Perlu Perhatian Segera */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">Perlu Perhatian Segera</h2>
            </div>
            <button
              onClick={() => onNavigateTab('surat_masuk')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {urgentLetters.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Tidak ada surat dengan prioritas segera saat ini. Administrasi tertib!
              </div>
            ) : (
              urgentLetters.map((surat) => {
                const isNeedDisp =
                  surat.status === 'Baru Diterima' || surat.status === 'Menunggu Disposisi';

                return (
                  <div
                    key={surat.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-700">
                        {surat.noAgenda}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          surat.sifat === 'Segera'
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : surat.sifat === 'Penting'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {surat.sifat}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 line-clamp-2">
                      {surat.perihal}
                    </p>

                    <div className="text-[11px] text-slate-500 truncate">
                      Dari: <strong className="text-slate-700">{surat.asalSurat}</strong>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Diterima: {surat.tanggalDiterima}
                      </span>

                      {currentUser.role === 'kepala_sekolah' && isNeedDisp ? (
                        <button
                          onClick={() => onOpenDisposisiModal(surat)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-xs"
                        >
                          Disposisikan Sekarang
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigateTab('surat_masuk')}
                          className="text-[10px] font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Rincian &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & School Info Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Aktivitas Persuratan Terbaru SDN 1 Keden
            </h2>
            <span className="text-xs text-slate-500">Log Sistem Real-Time</span>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.slice(0, 5).map((log) => (
              <div key={log.id} className="py-2.5 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 truncate">{log.action}</p>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 truncate">{log.target}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Petugas: <strong className="text-slate-700">{log.userName}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Official Identity & Fast Verification */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Identitas Satuan Pendidikan</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black text-white">{school.namaSekolah}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{school.alamat}</p>
            <p className="text-xs text-slate-400">
              Kec. {school.kecamatan}, Kab. Klaten, Jawa Tengah
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between py-0.5 text-slate-300">
              <span className="text-slate-400">NPSN:</span>
              <span className="font-mono font-bold text-white">{school.npsn}</span>
            </div>
            <div className="flex justify-between py-0.5 text-slate-300">
              <span className="text-slate-400">NSS:</span>
              <span className="font-mono text-white">{school.nss}</span>
            </div>
            <div className="flex justify-between py-0.5 text-slate-300">
              <span className="text-slate-400">Kepala Sekolah:</span>
              <span className="font-semibold text-amber-300 text-right">{school.kepalaSekolah}</span>
            </div>
            <div className="flex justify-between py-0.5 text-slate-300">
              <span className="text-slate-400">NIP Kepsek:</span>
              <span className="font-mono text-white">{school.nipKepalaSekolah}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('buku_agenda')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md"
            >
              <span>Buka Format Lembar Disposisi Resmi</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
