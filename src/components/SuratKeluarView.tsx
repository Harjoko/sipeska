import React, { useState, useMemo } from 'react';
import {
  Send,
  Plus,
  Search,
  Filter,
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  Eye,
  Edit2,
  Trash2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  UploadCloud,
  Download,
  Building,
} from 'lucide-react';
import {
  SuratKeluar,
  SuratKeluarStatus,
  SuratSifat,
  UserProfile,
} from '../types';
import { storeService, getBulanRomawi } from '../lib/supabase';

interface SuratKeluarViewProps {
  currentUser: UserProfile;
  suratKeluarList: SuratKeluar[];
  onPrintSuratKeluar: (surat: SuratKeluar) => void;
  externalSearchQuery?: string;
  isCreateModalOpen?: boolean;
  setIsCreateModalOpen?: (open: boolean) => void;
}

export const SuratKeluarView: React.FC<SuratKeluarViewProps> = ({
  currentUser,
  suratKeluarList,
  onPrintSuratKeluar,
  externalSearchQuery = '',
  isCreateModalOpen = false,
  setIsCreateModalOpen,
}) => {
  const klasifikasiList = storeService.getKlasifikasi();
  const school = storeService.getSchoolProfile();

  // Filters & Search
  const [search, setSearch] = useState(externalSearchQuery);
  const [statusFilter, setStatusFilter] = useState('all');
  const [klasifikasiFilter, setKlasifikasiFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modals
  const [showFormModal, setShowFormModal] = useState<boolean>(isCreateModalOpen);
  const [editingSurat, setEditingSurat] = useState<SuratKeluar | null>(null);
  const [detailSurat, setDetailSurat] = useState<SuratKeluar | null>(null);

  // Form State
  const defaultKode = '421.2';
  const [formData, setFormData] = useState({
    noAgendaKeluar: storeService.getNextAgendaKeluar(),
    kodeKlasifikasi: defaultKode,
    noSurat: storeService.generateOfficialLetterNumber(defaultKode),
    tanggalSurat: new Date().toISOString().split('T')[0],
    tujuanSurat: '',
    alamatTujuan: '',
    perihal: '',
    sifat: 'Biasa' as SuratSifat,
    ringkasanIsi: '',
    lampiranInfo: '1 Berkas',
    penandatanganNama: school.kepalaSekolah,
    penandatanganNip: school.nipKepalaSekolah,
    penandatanganJabatan: 'Kepala Sekolah SDN 1 Keden',
    status: 'Draft' as SuratKeluarStatus,
    fileName: 'draf_surat_keluar.pdf',
    fileSize: '650 KB',
  });

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

  // Recalculate auto letter number when classification code changes
  const handleKodeChange = (newKode: string) => {
    const autoNumber = storeService.generateOfficialLetterNumber(newKode);
    setFormData((prev) => ({
      ...prev,
      kodeKlasifikasi: newKode,
      noSurat: autoNumber,
    }));
  };

  const handleOpenCreate = () => {
    setEditingSurat(null);
    const autoNumber = storeService.generateOfficialLetterNumber(defaultKode);
    setFormData({
      noAgendaKeluar: storeService.getNextAgendaKeluar(),
      kodeKlasifikasi: defaultKode,
      noSurat: autoNumber,
      tanggalSurat: new Date().toISOString().split('T')[0],
      tujuanSurat: '',
      alamatTujuan: '',
      perihal: '',
      sifat: 'Biasa',
      ringkasanIsi: '',
      lampiranInfo: '1 Berkas',
      penandatanganNama: school.kepalaSekolah,
      penandatanganNip: school.nipKepalaSekolah,
      penandatanganJabatan: 'Kepala Sekolah SDN 1 Keden',
      status: 'Menunggu Pengesahan',
      fileName: 'surat_keluar_resmi.pdf',
      fileSize: '540 KB',
    });
    setShowFormModal(true);
    if (setIsCreateModalOpen) setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (surat: SuratKeluar) => {
    setEditingSurat(surat);
    setFormData({
      noAgendaKeluar: surat.noAgendaKeluar,
      kodeKlasifikasi: surat.kodeKlasifikasi,
      noSurat: surat.noSurat,
      tanggalSurat: surat.tanggalSurat,
      tujuanSurat: surat.tujuanSurat,
      alamatTujuan: surat.alamatTujuan || '',
      perihal: surat.perihal,
      sifat: surat.sifat,
      ringkasanIsi: surat.ringkasanIsi,
      lampiranInfo: surat.lampiranInfo,
      penandatanganNama: surat.penandatanganNama,
      penandatanganNip: surat.penandatanganNip,
      penandatanganJabatan: surat.penandatanganJabatan,
      status: surat.status,
      fileName: surat.fileName || 'dokumen.pdf',
      fileSize: surat.fileSize || '500 KB',
    });
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingSurat(null);
    if (setIsCreateModalOpen) setIsCreateModalOpen(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.noSurat || !formData.tujuanSurat || !formData.perihal) {
      alert('Mohon lengkapi Nomor Surat, Tujuan Surat, dan Perihal.');
      return;
    }

    if (editingSurat) {
      storeService.updateSuratKeluar(editingSurat.id, formData);
    } else {
      storeService.addSuratKeluar(formData);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string, noSurat: string) => {
    if (confirm(`Yakin ingin menghapus arsip surat keluar ${noSurat}?`)) {
      storeService.deleteSuratKeluar(id);
      if (detailSurat?.id === id) setDetailSurat(null);
    }
  };

  const handleApprove = (surat: SuratKeluar) => {
    if (confirm(`Sahkan dan setujui penerbitan surat ${surat.noSurat}?`)) {
      storeService.approveSuratKeluar(surat.id);
      if (detailSurat?.id === surat.id) {
        setDetailSurat({
          ...detailSurat,
          status: 'Disetujui',
          disetujuiPada: new Date().toISOString(),
        });
      }
    }
  };

  const handleMarkSent = (surat: SuratKeluar) => {
    storeService.updateSuratKeluar(surat.id, { status: 'Terkirim' });
    if (detailSurat?.id === surat.id) {
      setDetailSurat({ ...detailSurat, status: 'Terkirim' });
    }
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return suratKeluarList.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        item.noSurat.toLowerCase().includes(q) ||
        item.noAgendaKeluar.toLowerCase().includes(q) ||
        item.tujuanSurat.toLowerCase().includes(q) ||
        item.perihal.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchKlasifikasi =
        klasifikasiFilter === 'all' || item.kodeKlasifikasi === klasifikasiFilter;

      return matchSearch && matchStatus && matchKlasifikasi;
    });
  }, [suratKeluarList, search, statusFilter, klasifikasiFilter]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const statusBadge = (status: SuratKeluarStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Menunggu Pengesahan':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'Disetujui':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
      case 'Terkirim':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Diarsipkan':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'tata_usaha';
  const isKepsek = currentUser.role === 'kepala_sekolah' || currentUser.role === 'super_admin';

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Surat Keluar & Penomoran Resmi SDN 1 Keden
            </h2>
            <p className="text-xs text-slate-500">
              Format Penomoran: [KODE_KLASIFIKASI]/[NOMOR]/SD-01/[BULAN_ROMAWI]/[TAHUN]
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Surat Keluar</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nomor surat, tujuan, perihal..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Semua Status Surat Keluar</option>
              <option value="Draft">Draft</option>
              <option value="Menunggu Pengesahan">Menunggu Pengesahan</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Terkirim">Terkirim</option>
              <option value="Diarsipkan">Diarsipkan</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={klasifikasiFilter}
              onChange={(e) => {
                setKlasifikasiFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">No. Surat Keluar</th>
                <th className="py-3 px-4">Tgl Surat</th>
                <th className="py-3 px-4">Tujuan / Penerima</th>
                <th className="py-3 px-4">Perihal</th>
                <th className="py-3 px-4">Penandatangan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Send className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">Belum ada surat keluar yang sesuai filter</p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((surat) => (
                  <tr
                    key={surat.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => setDetailSurat(surat)}
                  >
                    {/* No Surat */}
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700 whitespace-nowrap">
                      {surat.noSurat}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">
                        Agenda: {surat.noAgendaKeluar}
                      </span>
                    </td>

                    {/* Tanggal */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {surat.tanggalSurat}
                    </td>

                    {/* Tujuan */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[200px] truncate">
                      <div className="truncate" title={surat.tujuanSurat}>
                        {surat.tujuanSurat}
                      </div>
                      {surat.alamatTujuan && (
                        <div className="text-[10px] text-slate-400 truncate">
                          {surat.alamatTujuan}
                        </div>
                      )}
                    </td>

                    {/* Perihal */}
                    <td className="py-3.5 px-4 max-w-[260px]">
                      <p className="font-bold text-slate-900 line-clamp-1 group-hover:text-purple-600 transition-colors" title={surat.perihal}>
                        {surat.perihal}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                        <span>Kode: {surat.kodeKlasifikasi}</span>
                        <span>•</span>
                        <span>Lamp: {surat.lampiranInfo || '-'}</span>
                      </div>
                    </td>

                    {/* Penandatangan */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-700">
                      <p className="font-semibold">{surat.penandatanganNama}</p>
                      <p className="text-[10px] text-slate-400 font-mono">NIP: {surat.penandatanganNip}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${statusBadge(surat.status)}`}>
                        {surat.status}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {/* Kepala Sekolah Approve Action */}
                        {isKepsek && surat.status === 'Menunggu Pengesahan' && (
                          <button
                            onClick={() => handleApprove(surat)}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-2xs mr-1"
                            title="Sahkan & Tanda Tangani Surat"
                          >
                            Setujui
                          </button>
                        )}

                        {/* Print Resmi */}
                        <button
                          onClick={() => onPrintSuratKeluar(surat)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                          title="Cetak Surat Resmi Ber-KOP"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDetailSurat(surat)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                          title="Lihat Detail Naskah"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canManage && (
                          <button
                            onClick={() => handleOpenEdit(surat)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Edit Draf Surat"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {currentUser.role === 'super_admin' && (
                          <button
                            onClick={() => handleDelete(surat.id, surat.noSurat)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Hapus Surat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* MODAL: INPUT / EDIT SURAT KELUAR */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingSurat ? 'Edit Draf Surat Keluar' : 'Form Surat Keluar & Nomor Otomatis'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Penerbitan Surat Resmi SD Negeri 1 Keden
                  </p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Klasifikasi Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Klasifikasi Kode Surat <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kodeKlasifikasi}
                    onChange={(e) => handleKodeChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500"
                  >
                    {klasifikasiList.map((k) => (
                      <option key={k.id} value={k.kode}>
                        {k.kode} — {k.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nomor Surat Resmi Otomatis */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Surat Resmi (Otomatis Sesuai Kode)
                  </label>
                  <input
                    type="text"
                    value={formData.noSurat}
                    onChange={(e) => setFormData({ ...formData, noSurat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-purple-50 border border-purple-300 rounded-xl font-mono font-bold text-purple-900 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    Format: [KODE]/[NO]/SD-01/[ROMAWI]/[TAHUN]
                  </span>
                </div>

                {/* Tanggal Surat */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Surat Keluar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalSurat}
                    onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* Sifat Surat */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sifat Surat
                  </label>
                  <select
                    value={formData.sifat}
                    onChange={(e) => setFormData({ ...formData, sifat: e.target.value as SuratSifat })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Penting">Penting</option>
                    <option value="Segera">Segera</option>
                    <option value="Rahasia">Rahasia</option>
                  </select>
                </div>
              </div>

              {/* Tujuan Surat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tujuan Surat (Penerima) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tujuanSurat}
                  onChange={(e) => setFormData({ ...formData, tujuanSurat: e.target.value })}
                  placeholder="Contoh: Koordinator Wilayah Pendidikan Kecamatan Pedan / Wali Murid Kelas 1 s.d. 6"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Alamat Tujuan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat / Tempat Tujuan
                </label>
                <input
                  type="text"
                  value={formData.alamatTujuan}
                  onChange={(e) => setFormData({ ...formData, alamatTujuan: e.target.value })}
                  placeholder="Contoh: di Pedan, Klaten / di Tempat"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
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
                  placeholder="Contoh: Permohonan Bantuan Kerja Bakti dan Pengamanan Drainase Sekolah"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Isi / Ringkasan Naskah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Isi / Ringkasan Naskah Surat
                </label>
                <textarea
                  rows={4}
                  value={formData.ringkasanIsi}
                  onChange={(e) => setFormData({ ...formData, ringkasanIsi: e.target.value })}
                  placeholder="Tuliskan isi surat resmi yang akan dicantumkan pada naskah..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lampiran Info */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lampiran
                  </label>
                  <input
                    type="text"
                    value={formData.lampiranInfo}
                    onChange={(e) => setFormData({ ...formData, lampiranInfo: e.target.value })}
                    placeholder="Contoh: 1 Lembar / 1 Berkas / -"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                {/* Status Surat Keluar */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Dokumen
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SuratKeluarStatus })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Menunggu Pengesahan">Menunggu Pengesahan Kepala Sekolah</option>
                    <option value="Disetujui">Disetujui & Diterbitkan</option>
                    <option value="Terkirim">Terkirim ke Penerima</option>
                    <option value="Diarsipkan">Diarsipkan</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
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
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all cursor-pointer"
                >
                  {editingSurat ? 'Simpan Perubahan' : 'Terbitkan Surat Keluar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL & PRATINJAU NASKAH SURAT KELUAR */}
      {detailSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-700">
                      {detailSurat.noSurat}
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

            {/* Simulated Official Letter Preview */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-100">
              <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-md border border-slate-300 font-serif text-xs text-slate-900 space-y-4">
                {/* Official Letterhead (Kop Surat) */}
                <div className="text-center border-b-4 border-double border-slate-950 pb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider">{school.kopHeaderBaris1}</h4>
                  <h3 className="font-bold text-sm uppercase tracking-wide">{school.kopHeaderBaris2}</h3>
                  <h2 className="font-black text-base uppercase text-blue-900 tracking-tight">{school.namaSekolah}</h2>
                  <p className="text-[10px] font-sans text-slate-600 mt-0.5">
                    {school.alamat}, Kec. {school.kecamatan}, Kab. Klaten, Jawa Tengah {school.kodePos}
                  </p>
                  <p className="text-[10px] font-sans text-slate-500">
                    Telepon: {school.telepon} | Email: {school.email} | NSS: {school.nss} NPSN: {school.npsn}
                  </p>
                </div>

                {/* Surat Details */}
                <div className="flex justify-between font-sans text-[11px] pt-1">
                  <div className="space-y-0.5">
                    <p>Nomor &nbsp;: <strong className="font-mono">{detailSurat.noSurat}</strong></p>
                    <p>Sifat &nbsp;&nbsp;&nbsp;: {detailSurat.sifat}</p>
                    <p>Lamp. &nbsp;&nbsp;: {detailSurat.lampiranInfo || '-'}</p>
                    <p>Perihal : <strong>{detailSurat.perihal}</strong></p>
                  </div>
                  <div className="text-right font-sans">
                    <p>Klaten, {detailSurat.tanggalSurat}</p>
                    <div className="mt-3 text-left">
                      <p>Kepada Yth:</p>
                      <p className="font-bold">{detailSurat.tujuanSurat}</p>
                      <p className="text-[10px] text-slate-500">{detailSurat.alamatTujuan || 'di Tempat'}</p>
                    </div>
                  </div>
                </div>

                {/* Letter Body */}
                <div className="pt-4 font-sans text-[11px] leading-relaxed text-justify space-y-2 text-slate-800">
                  <p>Dengan hormat,</p>
                  <p>
                    {detailSurat.ringkasanIsi ||
                      'Sehubungan dengan peningkatan mutu layanan pendidikan dan administrasi di lingkungan SD Negeri 1 Keden, kami sampaikan informasi dan ketentuan resmi sebagaimana tercantum dalam pokok surat ini.'}
                  </p>
                  <p>
                    Demikian surat ini kami sampaikan, atas perhatian dan kerjasama yang baik kami ucapkan terima kasih.
                  </p>
                </div>

                {/* Signature Box */}
                <div className="pt-8 flex justify-end font-sans text-center text-xs">
                  <div className="w-64 space-y-1">
                    <p>Kepala SD Negeri 1 Keden</p>
                    <div className="h-16 flex items-center justify-center relative">
                      {detailSurat.status === 'Disetujui' || detailSurat.status === 'Terkirim' ? (
                        <div className="border border-emerald-500/80 rounded-lg p-1.5 bg-emerald-50 text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>TERVALIDASI DIGITAL — SIPESKA</span>
                        </div>
                      ) : (
                        <span className="text-[10px] italic text-slate-400">Menunggu Pengesahan</span>
                      )}
                    </div>
                    <p className="font-bold underline text-slate-900">{detailSurat.penandatanganNama}</p>
                    <p className="text-[10px] text-slate-600 font-mono">NIP. {detailSurat.penandatanganNip}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {isKepsek && detailSurat.status === 'Menunggu Pengesahan' && (
                  <button
                    onClick={() => handleApprove(detailSurat)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sahkan & Tanda Tangani</span>
                  </button>
                )}

                {detailSurat.status === 'Disetujui' && (
                  <button
                    onClick={() => handleMarkSent(detailSurat)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 cursor-pointer"
                  >
                    <span>Tandai Terkirim</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPrintSuratKeluar(detailSurat)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Surat Resmi</span>
                </button>
                <button
                  onClick={() => setDetailSurat(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
