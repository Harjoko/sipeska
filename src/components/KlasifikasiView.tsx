import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  BookOpen,
  Info,
  Check,
  X,
} from 'lucide-react';
import { KlasifikasiSurat, UserProfile } from '../types';
import { storeService } from '../lib/supabase';

interface KlasifikasiViewProps {
  currentUser: UserProfile;
}

export const KlasifikasiView: React.FC<KlasifikasiViewProps> = ({ currentUser }) => {
  const [klasifikasiList, setKlasifikasiList] = useState<KlasifikasiSurat[]>(
    storeService.getKlasifikasi()
  );
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    kategori: 'Pendidikan',
    keterangan: '',
  });

  const categories = Array.from(new Set(klasifikasiList.map((k) => k.kategori)));

  const filteredList = klasifikasiList.filter((k) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      k.kode.toLowerCase().includes(q) ||
      k.nama.toLowerCase().includes(q) ||
      (k.keterangan && k.keterangan.toLowerCase().includes(q));

    const matchCat = categoryFilter === 'all' || k.kategori === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kode || !formData.nama) {
      alert('Mohon isi kode klasifikasi dan nama.');
      return;
    }

    const newItem = storeService.addKlasifikasi(formData);
    setKlasifikasiList(storeService.getKlasifikasi());
    setShowAddModal(false);
    setFormData({ kode: '', nama: '', kategori: 'Pendidikan', keterangan: '' });
  };

  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'tata_usaha';

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Kode Klasifikasi Persuratan Dinas Pendidikan
            </h2>
            <p className="text-xs text-slate-500">
              Standar kode penomoran surat resmi satuan pendidikan di Kabupaten Klaten
            </p>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kode Klasifikasi</span>
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode (contoh: 421.2) atau nama kegiatan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Classification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                {item.kode}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {item.kategori}
              </span>
            </div>

            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.nama}</h4>

            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              {item.keterangan || 'Digunakan untuk tata persuratan dinas SDN 1 Keden.'}
            </p>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
              Contoh: {item.kode}/001/SD-01/XI/2026
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: TAMBAH KODE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Tambah Kode Klasifikasi Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Surat</label>
                <input
                  type="text"
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  placeholder="Contoh: 421.5"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Klasifikasi</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Ekstrakurikuler dan Kepramukaan"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                <input
                  type="text"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  placeholder="Pendidikan / Sarpras / Keuangan"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Penggunaan</label>
                <textarea
                  rows={2}
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Penjelasan cakupan surat..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                >
                  Simpan Kode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
