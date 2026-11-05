import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Search,
  Filter,
  Plus,
  FileText,
  FileCheck2,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Calendar,
  Building2,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  User,
} from 'lucide-react';
import {
  SuratMasuk,
  SuratSifat,
  SuratMasukStatus,
  UserProfile,
  Disposisi,
  TindakLanjut,
} from '../types';
import { storeService } from '../lib/supabase';

interface SuratMasukViewProps {
  currentUser: UserProfile;
  suratList: SuratMasuk[];
  disposisiList: Disposisi[];
  tindakLanjutList: TindakLanjut[];
  onOpenDisposisiModal: (surat: SuratMasuk) => void;
  onPrintDisposisi: (surat: SuratMasuk, disposisi?: Disposisi) => void;
  externalSearchQuery?: string;
  isCreateModalOpen?: boolean;
  setIsCreateModalOpen?: (open: boolean) => void;
}

export const SuratMasukView: React.FC<SuratMasukViewProps> = ({
  currentUser,
  suratList,
  disposisiList,
  tindakLanjutList,
  onOpenDisposisiModal,
  onPrintDisposisi,
  externalSearchQuery = '',
  isCreateModalOpen = false,
  setIsCreateModalOpen,
}) => {
  const klasifikasiList = storeService.getKlasifikasi();
  const school = storeService.getSchoolProfile();

  // Search & Filters
  const [search, setSearch] = useState(externalSearchQuery);
  const [filterSifat, setFilterSifat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterKlasifikasi, setFilterKlasifikasi] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modals
  const [showFormModal, setShowFormModal] = useState<boolean>(isCreateModalOpen);
  const [editingSurat, setEditingSurat] = useState<SuratMasuk | null>(null);
  const [detailSurat, setDetailSurat] = useState<SuratMasuk | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'dokumen' | 'disposisi' | 'tindakLanjut'>('info');

  // Form State
  const [formData, setFormData] = useState({
    noAgenda: storeService.getNextAgendaMasuk(),
    noSuratPengirim: '',
    tanggalSurat: new Date().toISOString().split('T')[0],
    tanggalDiterima: new Date().toISOString().split('T')[0],
    asalSurat: '',
    alamatPengirim: '',
    perihal: '',
    kodeKlasifikasi: '422',
    sifat: 'Biasa' as SuratSifat,
    ringkasanIsi: '',
    lampiranInfo: '1 Berkas',
    fileName: 'scan_surat_masuk.pdf',
    fileSize: '1.2 MB',
    status: 'Baru Diterima' as SuratMasukStatus,
  });

  // Sync external search query
  React.useEffect(() => {
    if (externalSearchQuery) {
      setSearch(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  React.useEffect(() => {
    if (isCreateModalOpen !== undefined) {
      setShowFormModal(isCreateModalOpen);
    }
  }, [isCreateModalOpen]);

  const handleOpenCreate = () => {
    setEditingSurat(null);
    setFormData({
      noAgenda: storeService.getNextAgendaMasuk(),
      noSuratPengirim: '',
      tanggalSurat: new Date().toISOString().split('T')[0],
      tanggalDiterima: new Date().toISOString().split('T')[0],
      asalSurat: '',
      alamatPengirim: '',
      perihal: '',
      kodeKlasifikasi: '422',
      sifat: 'Biasa',
      ringkasanIsi: '',
      lampiranInfo: '1 Berkas',
      fileName: 'scan_surat_masuk.pdf',
      fileSize: '1.2 MB',
      status: 'Baru Diterima',
    });
    setShowFormModal(true);
    if (setIsCreateModalOpen) setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (surat: SuratMasuk) => {
    setEditingSurat(surat);
    setFormData({
      noAgenda: surat.noAgenda,
      noSuratPengirim: surat.noSuratPengirim,
      tanggalSurat: surat.tanggalSurat,
      tanggalDiterima: surat.tanggalDiterima,
      asalSurat: surat.asalSurat,
      alamatPengirim: surat.alamatPengirim || '',
      perihal: surat.perihal,
      kodeKlasifikasi: surat.kodeKlasifikasi,
      sifat: surat.sifat,
      ringkasanIsi: surat.ringkasanIsi,
      lampiranInfo: surat.lampiranInfo,
      fileName: surat.fileName || 'scan_surat.pdf',
      fileSize: surat.fileSize || '1.1 MB',
      status: surat.status,
    });
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingSurat(null);
    if (setIsCreateModalOpen) setIsCreateModalOpen(false);
  };

  const handleSaveSurat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.noSuratPengirim || !formData.asalSurat || !formData.perihal) {
      alert('Mohon lengkapi Nomor Surat, Asal Surat, dan Perihal.');
      return;
    }

    if (editingSurat) {
      storeService.updateSuratMasuk(editingSurat.id, formData);
    } else {
      storeService.addSuratMasuk(formData);
    }

    handleCloseModal();
  };

  const handleDeleteSurat = (id: string, noAgenda: string) => {
    if (confirm(`Yakin ingin menghapus arsip surat masuk ${noAgenda}? Tindakan ini tidak dapat dibatalkan.`)) {
      storeService.deleteSuratMasuk(id);
      if (detailSurat?.id === id) setDetailSurat(null);
    }
  };

  // Filtered letters
  const filteredList = useMemo(() => {
    return suratList.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        item.noAgenda.toLowerCase().includes(q) ||
        item.noSuratPengirim.toLowerCase().includes(q) ||
        item.asalSurat.toLowerCase().includes(q) ||
        item.perihal.toLowerCase().includes(q) ||
        (item.alamatPengirim && item.alamatPengirim.toLowerCase().includes(q));

      const matchSifat = filterSifat === 'all' || item.sifat === filterSifat;
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchKlasifikasi =
        filterKlasifikasi === 'all' || item.kodeKlasifikasi === filterKlasifikasi;

      let matchDate = true;
      if (startDate && item.tanggalDiterima < startDate) matchDate = false;
      if (endDate && item.tanggalDiterima > endDate) matchDate = false;

      return matchSearch && matchSifat && matchStatus && matchKlasifikasi && matchDate;
    });
  }, [suratList, search, filterSifat, filterStatus, filterKlasifikasi, startDate, endDate]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const statusBadge = (status: SuratMasukStatus) => {
    switch (status) {
      case 'Baru Diterima':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Menunggu Disposisi':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
      case 'Sudah Didisposisikan':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Dalam Tindak Lanjut':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Diarsipkan':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const sifatBadge = (sifat: SuratSifat) => {
    switch (sifat) {
      case 'Segera':
        return 'bg-red-50 text-red-700 border-red-300 font-bold';
      case 'Penting':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Rahasia':
        return 'bg-purple-50 text-purple-700 border-purple-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'tata_usaha';

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar Surat Masuk SDN 1 Keden
            </h2>
            <p className="text-xs text-slate-500">
              Total {filteredList.length} arsip ditemukan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Surat Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nomor agenda, pengirim, perihal..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Sifat Filter */}
          <div className="md:col-span-2">
            <select
              value={filterSifat}
              onChange={(e) => {
                setFilterSifat(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Sifat Surat</option>
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
              <option value="Segera">Segera</option>
              <option value="Rahasia">Rahasia</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="Baru Diterima">Baru Diterima</option>
              <option value="Menunggu Disposisi">Menunggu Disposisi</option>
              <option value="Sudah Didisposisikan">Sudah Didisposisikan</option>
              <option value="Dalam Tindak Lanjut">Dalam Tindak Lanjut</option>
              <option value="Selesai">Selesai</option>
              <option value="Diarsipkan">Diarsipkan</option>
            </select>
          </div>

          {/* Klasifikasi Filter */}
          <div className="md:col-span-3">
            <select
              value={filterKlasifikasi}
              onChange={(e) => {
                setFilterKlasifikasi(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Klasifikasi</option>
              {klasifikasiList.map((k) => (
                <option key={k.id} value={k.kode}>
                  {k.kode} - {k.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date range filter toggle */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
          <span className="font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Rentang Tgl Diterima:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
          <span>s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />

          {(search || filterSifat !== 'all' || filterStatus !== 'all' || filterKlasifikasi !== 'all' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterSifat('all');
                setFilterStatus('all');
                setFilterKlasifikasi('all');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="text-xs text-red-600 hover:text-red-800 font-semibold ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">No. Agenda</th>
                <th className="py-3 px-4">Tgl Terima</th>
                <th className="py-3 px-4">Asal Surat / Pengirim</th>
                <th className="py-3 px-4">Perihal & Nomor Asal</th>
                <th className="py-3 px-4">Sifat</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">Tidak ada surat masuk yang sesuai filter</p>
                    <p className="text-[11px] text-slate-400">Coba ubah kata kunci atau reset filter pencarian</p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((surat) => {
                  const existingDisposisi = disposisiList.find((d) => d.suratMasukId === surat.id);
                  const isNeedDisp =
                    surat.status === 'Baru Diterima' || surat.status === 'Menunggu Disposisi';

                  return (
                    <tr
                      key={surat.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => {
                        setDetailSurat(surat);
                        setActiveDetailTab('info');
                      }}
                    >
                      {/* No Agenda */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {surat.noAgenda}
                      </td>

                      {/* Tgl Terima */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {surat.tanggalDiterima}
                      </td>

                      {/* Asal Surat */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[200px] truncate">
                        <div className="truncate" title={surat.asalSurat}>
                          {surat.asalSurat}
                        </div>
                        {surat.alamatPengirim && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {surat.alamatPengirim}
                          </div>
                        )}
                      </td>

                      {/* Perihal & No Surat Asal */}
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <p className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors" title={surat.perihal}>
                          {surat.perihal}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                          <span>No: {surat.noSuratPengirim}</span>
                          <span className="text-slate-300">•</span>
                          <span>Kode: {surat.kodeKlasifikasi}</span>
                        </div>
                      </td>

                      {/* Sifat */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${sifatBadge(
                            surat.sifat
                          )}`}
                        >
                          {surat.sifat}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${statusBadge(
                            surat.status
                          )}`}
                        >
                          {surat.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {/* Kepala Sekolah Disposisi Shortcut */}
                          {currentUser.role === 'kepala_sekolah' && isNeedDisp && (
                            <button
                              onClick={() => onOpenDisposisiModal(surat)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-2xs mr-1"
                              title="Berikan Disposisi"
                            >
                              Disposisi
                            </button>
                          )}

                          {/* Print Lembar Disposisi Button */}
                          <button
                            onClick={() => onPrintDisposisi(surat, existingDisposisi)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="Cetak Lembar Disposisi Resmi"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Detail Button */}
                          <button
                            onClick={() => {
                              setDetailSurat(surat);
                              setActiveDetailTab('info');
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="Lihat Detail & Scan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit (TU & Super Admin) */}
                          {canManage && (
                            <button
                              onClick={() => handleOpenEdit(surat)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                              title="Edit Surat"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete (Super Admin only or TU) */}
                          {currentUser.role === 'super_admin' && (
                            <button
                              onClick={() => handleDeleteSurat(surat.id, surat.noAgenda)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Hapus Surat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          <div>
            Menampilkan{' '}
            <strong className="text-slate-900">
              {filteredList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </strong>{' '}
            sampai{' '}
            <strong className="text-slate-900">
              {Math.min(currentPage * itemsPerPage, filteredList.length)}
            </strong>{' '}
            dari <strong className="text-slate-900">{filteredList.length}</strong> data
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-800">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: INPUT / EDIT SURAT MASUK */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingSurat ? 'Edit Arsip Surat Masuk' : 'Input Surat Masuk Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sistem Penomoran Agenda Otomatis SDN 1 Keden
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSurat} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* No Agenda (Otomatis) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Agenda (Otomatis)
                  </label>
                  <input
                    type="text"
                    value={formData.noAgenda}
                    onChange={(e) => setFormData({ ...formData, noAgenda: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded-xl font-mono font-bold text-blue-700 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400">
                    Format resmi: 400.3.5 / [NOMOR] / SD-01 / [TAHUN]
                  </span>
                </div>

                {/* Sifat Surat */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sifat Surat <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.sifat}
                    onChange={(e) => setFormData({ ...formData, sifat: e.target.value as SuratSifat })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Penting">Penting</option>
                    <option value="Segera">Segera</option>
                    <option value="Rahasia">Rahasia</option>
                  </select>
                </div>

                {/* No Surat dari Pengirim */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Surat Asli (Pengirim) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.noSuratPengirim}
                    onChange={(e) => setFormData({ ...formData, noSuratPengirim: e.target.value })}
                    placeholder="Contoh: 421.2/1420/Disdik/2026"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Kode Klasifikasi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Klasifikasi Surat <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kodeKlasifikasi}
                    onChange={(e) => setFormData({ ...formData, kodeKlasifikasi: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {klasifikasiList.map((k) => (
                      <option key={k.id} value={k.kode}>
                        {k.kode} - {k.nama} ({k.kategori})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal Surat Asal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Surat Asal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalSurat}
                    onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Tanggal Diterima Sekolah */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Diterima Sekolah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalDiterima}
                    onChange={(e) => setFormData({ ...formData, tanggalDiterima: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Asal Surat / Pengirim */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Asal Surat / Nama Instansi Pengirim <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.asalSurat}
                  onChange={(e) => setFormData({ ...formData, asalSurat: e.target.value })}
                  placeholder="Contoh: Dinas Pendidikan Kabupaten Klaten / Puskesmas Pedan"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Alamat Pengirim */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Pengirim
                </label>
                <input
                  type="text"
                  value={formData.alamatPengirim}
                  onChange={(e) => setFormData({ ...formData, alamatPengirim: e.target.value })}
                  placeholder="Contoh: Jl. Pemuda No. 294, Klaten Tengah"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Perihal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Perihal Surat <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.perihal}
                  onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                  placeholder="Contoh: Pemberitahuan Pelaksanaan Verifikasi dan Validasi SPJ BOSP Tahap II Tahun 2026"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Ringkasan Isi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ringkasan Isi Surat
                </label>
                <textarea
                  rows={3}
                  value={formData.ringkasanIsi}
                  onChange={(e) => setFormData({ ...formData, ringkasanIsi: e.target.value })}
                  placeholder="Tuliskan pokok isi surat penting atau ringkasan instruksi..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lampiran Info */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Keterangan Lampiran
                  </label>
                  <input
                    type="text"
                    value={formData.lampiranInfo}
                    onChange={(e) => setFormData({ ...formData, lampiranInfo: e.target.value })}
                    placeholder="Contoh: 1 Berkas / 2 Lembar / -"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status Surat */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Surat Saat Ini
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SuratMasukStatus })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Baru Diterima">Baru Diterima</option>
                    <option value="Menunggu Disposisi">Menunggu Disposisi</option>
                    <option value="Sudah Didisposisikan">Sudah Didisposisikan</option>
                    <option value="Dalam Tindak Lanjut">Dalam Tindak Lanjut</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Diarsipkan">Diarsipkan</option>
                  </select>
                </div>
              </div>

              {/* Upload File Scan Surat */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                    Dokumen Scan Surat (PDF / Gambar)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Mendukung Supabase Storage
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs">
                    <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                    <span>Pilih Berkas Scan</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({
                            ...formData,
                            fileName: file.name,
                            fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                          });
                        }
                      }}
                    />
                  </label>
                  <span className="text-xs text-slate-600 font-mono">
                    {formData.fileName} ({formData.fileSize})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer"
                >
                  {editingSurat ? 'Simpan Perubahan' : 'Simpan Surat Masuk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL SURAT MASUK */}
      {detailSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {detailSurat.noAgenda}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${sifatBadge(detailSurat.sifat)}`}>
                      {detailSurat.sifat}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusBadge(detailSurat.status)}`}>
                      {detailSurat.status}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {detailSurat.perihal}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setDetailSurat(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 px-6 gap-4 text-xs font-semibold bg-slate-50/50">
              <button
                onClick={() => setActiveDetailTab('info')}
                className={`py-3 border-b-2 transition-all ${
                  activeDetailTab === 'info'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Informasi & Ringkasan
              </button>
              <button
                onClick={() => setActiveDetailTab('dokumen')}
                className={`py-3 border-b-2 transition-all ${
                  activeDetailTab === 'dokumen'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Dokumen Scan / Lampiran
              </button>
              <button
                onClick={() => setActiveDetailTab('disposisi')}
                className={`py-3 border-b-2 transition-all ${
                  activeDetailTab === 'disposisi'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Disposisi Kepala Sekolah
              </button>
              <button
                onClick={() => setActiveDetailTab('tindakLanjut')}
                className={`py-3 border-b-2 transition-all ${
                  activeDetailTab === 'tindakLanjut'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Catatan Tindak Lanjut
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {activeDetailTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block">Nomor Surat Pengirim:</span>
                      <strong className="text-slate-900 font-mono">{detailSurat.noSuratPengirim}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Klasifikasi Dokumen:</span>
                      <strong className="text-slate-900">
                        {detailSurat.kodeKlasifikasi} — {klasifikasiList.find((k) => k.kode === detailSurat.kodeKlasifikasi)?.nama || 'Pendidikan'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tanggal Surat Pengirim:</span>
                      <strong className="text-slate-900">{detailSurat.tanggalSurat}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tanggal Diterima Sekolah:</span>
                      <strong className="text-slate-900">{detailSurat.tanggalDiterima}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Asal / Instansi Pengirim:</span>
                      <strong className="text-slate-900">{detailSurat.asalSurat}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Alamat Pengirim:</span>
                      <span className="text-slate-700">{detailSurat.alamatPengirim || '-'}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                      Perihal Surat
                    </h4>
                    <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200 font-medium">
                      {detailSurat.perihal}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                      Ringkasan Pokok Isi
                    </h4>
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                      {detailSurat.ringkasanIsi || 'Tidak ada catatan ringkasan khusus.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>Lampiran: <strong>{detailSurat.lampiranInfo || '1 Berkas'}</strong></span>
                    <span>Dicatat: {detailSurat.createdAt.split('T')[0]}</span>
                  </div>
                </div>
              )}

              {activeDetailTab === 'dokumen' && (
                <div className="space-y-4">
                  {/* Simulated PDF Viewer Container */}
                  <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-900 text-white p-6 shadow-inner">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-xs font-bold text-white">{detailSurat.fileName || 'dokumen_scan.pdf'}</p>
                          <p className="text-[10px] text-slate-400">Ukuran: {detailSurat.fileSize || '1.2 MB'} — Terverifikasi Digital</p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Simulasi unduh berkas ${detailSurat.fileName}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh File</span>
                      </button>
                    </div>

                    {/* Paper Document Preview Simulation */}
                    <div className="bg-white text-slate-900 p-8 rounded-lg shadow-lg font-serif max-w-xl mx-auto space-y-4 text-xs">
                      <div className="text-center border-b-2 border-slate-900 pb-2">
                        <h4 className="font-bold text-sm tracking-wide uppercase">
                          {detailSurat.asalSurat}
                        </h4>
                        <p className="text-[10px] font-sans text-slate-600">
                          {detailSurat.alamatPengirim || 'Klaten, Jawa Tengah'}
                        </p>
                      </div>

                      <div className="flex justify-between font-sans text-[11px] pt-1">
                        <div>
                          <p>Nomor : {detailSurat.noSuratPengirim}</p>
                          <p>Sifat &nbsp;&nbsp;: {detailSurat.sifat}</p>
                          <p>Lamp. &nbsp;: {detailSurat.lampiranInfo}</p>
                        </div>
                        <div className="text-right">
                          <p>{detailSurat.tanggalSurat}</p>
                          <p className="font-bold">Kepada Yth:</p>
                          <p>Kepala SD Negeri 1 Keden</p>
                          <p className="text-[10px] text-slate-500">di Tempat</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="font-bold underline text-center uppercase font-sans">
                          {detailSurat.perihal}
                        </p>
                      </div>

                      <p className="leading-relaxed font-sans text-[11px] text-justify text-slate-700">
                        {detailSurat.ringkasanIsi ||
                          'Dengan hormat, sehubungan dengan agenda administrasi dan pembinaan satuan pendidikan di lingkungan Pemerintah Kabupaten Klaten, bersama surat ini kami sampaikan ketentuan dan pedoman pelaksanaan untuk ditindaklanjuti sebagaimana mestinya.'}
                      </p>

                      <div className="pt-6 flex justify-end font-sans text-center text-[10px]">
                        <div>
                          <p>Diterima dan Diarsipkan</p>
                          <p className="font-bold mt-1">SD NEGERI 1 KEDEN</p>
                          <div className="my-2 text-[9px] text-blue-600 font-mono font-bold">
                            [QR: {detailSurat.noAgenda}]
                          </div>
                          <p className="font-semibold text-slate-700">Tata Usaha Sekolah</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'disposisi' && (
                <div className="space-y-4">
                  {(() => {
                    const disp = disposisiList.find((d) => d.suratMasukId === detailSurat.id);
                    if (!disp) {
                      return (
                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                          <h4 className="text-xs font-bold text-slate-800">
                            Surat Ini Belum Didisposisikan oleh Kepala Sekolah
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                            Kepala Sekolah dapat memberikan instruksi langsung, menentukan tenggat waktu, dan menugaskan guru/staf terkait.
                          </p>
                          {currentUser.role === 'kepala_sekolah' && (
                            <button
                              onClick={() => {
                                setDetailSurat(null);
                                onOpenDisposisiModal(detailSurat);
                              }}
                              className="mt-3 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md"
                            >
                              Buat Disposisi Sekarang
                            </button>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <FileCheck2 className="w-4 h-4 text-amber-600" />
                              Disposisi Kepala Sekolah ({disp.createdByName || school.kepalaSekolah})
                            </span>
                            <span className="text-[10px] font-mono text-amber-800">
                              Tgl: {disp.tanggalDisposisi}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                              Instruksi / Arahan:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {disp.instruksi.map((ins, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-900 text-[11px] font-medium"
                                >
                                  ✓ {ins}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                              Catatan Khusus Kepala Sekolah:
                            </span>
                            <p className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-amber-200 leading-relaxed font-sans">
                              {disp.catatanKepalaSekolah || '-'}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 text-xs">
                            <div>
                              <span className="text-slate-500 block text-[10px]">Ditujukan Kepada Pelaksana:</span>
                              <strong className="text-slate-800">{disp.ditujukanKepada.join(', ')}</strong>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px]">Batas Waktu (Tenggat):</span>
                              <strong className="text-amber-900 font-mono">{disp.batasWaktu || 'Segera'}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <button
                            onClick={() => onPrintDisposisi(detailSurat, disp)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Lembar Disposisi Resmi SDN 1 Keden</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeDetailTab === 'tindakLanjut' && (
                <div className="space-y-3">
                  {(() => {
                    const tls = tindakLanjutList.filter((t) => t.suratMasukId === detailSurat.id);
                    if (tls.length === 0) {
                      return (
                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <h4 className="text-xs font-bold text-slate-700">Belum Ada Catatan Tindak Lanjut</h4>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Guru atau pelaksana yang ditugaskan dapat mengisi perkembangan tindak lanjut melalui menu Tindak Lanjut.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {tls.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                {item.pelaksanaNama} ({item.pelaksanaJabatan})
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {item.tanggalTindakLanjut}
                              </span>
                            </div>
                            <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                              {item.uraianTindakLanjut}
                            </p>
                            {item.buktiFileName && (
                              <div className="text-[11px] text-blue-600 flex items-center gap-1">
                                <Paperclip className="w-3.5 h-3.5" />
                                <span>Bukti / Lampiran: {item.buktiFileName}</span>
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500 flex justify-between">
                              <span>Status Akhir: <strong className="text-emerald-700">{item.statusAkhir}</strong></span>
                              <span>Tercatat di Log Sistem Persuratan</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => onPrintDisposisi(detailSurat, disposisiList.find((d) => d.suratMasukId === detailSurat.id))}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>Cetak Lembar Disposisi</span>
              </button>

              <button
                onClick={() => setDetailSurat(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
