import React, { useState } from 'react';
import {
  Settings,
  School,
  Users,
  Shield,
  Database,
  UploadCloud,
  Check,
  Copy,
  Download,
  RotateCcw,
  Key,
  ShieldAlert,
  Server,
  Plus,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import { UserProfile, SchoolProfile, UserRole } from '../types';
import {
  storeService,
  isSupabaseConfigured,
  checkSupabaseConnection,
  SUPABASE_PROJECT_ID,
  SUPABASE_PROJECT_NAME,
  supabaseUrl,
} from '../lib/supabase';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabaseSchema';
import { SchoolLogo } from './SchoolLogo';

interface PengaturanViewProps {
  currentUser: UserProfile;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'sekolah' | 'pengguna' | 'supabase' | 'backup'>('sekolah');
  const [copiedSql, setCopiedSql] = useState(false);

  // School Profile Form State
  const initialSchool = storeService.getSchoolProfile();
  const [schoolForm, setSchoolForm] = useState<SchoolProfile>(initialSchool);
  const [schoolSavedAlert, setSchoolSavedAlert] = useState(false);

  // Users State
  const [userList, setUserList] = useState<UserProfile[]>(storeService.getUsers());
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    role: 'guru' as UserRole,
    nip: '',
    jabatan: '',
    phone: '',
  });

  // Supabase Connection Test State
  const [connResult, setConnResult] = useState<{
    tested: boolean;
    loading: boolean;
    connected: boolean;
    tablesExist: boolean;
    message: string;
  }>({
    tested: false,
    loading: false,
    connected: isSupabaseConfigured,
    tablesExist: false,
    message: '',
  });

  const handleTestConnection = async () => {
    setConnResult((prev) => ({ ...prev, loading: true, tested: true }));
    const res = await checkSupabaseConnection();
    setConnResult({
      tested: true,
      loading: false,
      connected: res.connected,
      tablesExist: res.tablesExist,
      message: res.message,
    });
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    storeService.updateSchoolProfile(schoolForm);
    setSchoolSavedAlert(true);
    setTimeout(() => setSchoolSavedAlert(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const updated = { ...schoolForm, logoUrl: reader.result };
          setSchoolForm(updated);
          storeService.updateSchoolProfile({ logoUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email) {
      alert('Nama lengkap dan email wajib diisi.');
      return;
    }

    storeService.addUser(newUser);
    setUserList(storeService.getUsers());
    setShowAddUserModal(false);
    setNewUser({
      fullName: '',
      email: '',
      role: 'guru',
      nip: '',
      jabatan: '',
      phone: '',
    });
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Hapus pengguna ${name}?`)) {
      storeService.deleteUser(id);
      setUserList(storeService.getUsers());
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sipeska_sdn1keden_supabase_schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadBackup = () => {
    const jsonStr = storeService.exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_sipeska_sdn1keden_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetData = () => {
    if (
      confirm(
        'PERHATIAN: Apakah Anda yakin ingin mengembalikan seluruh data ke data awal (default SDN 1 Keden)? Seluruh data yang baru diinput akan direset.'
      )
    ) {
      storeService.resetToDefault();
      window.location.reload();
    }
  };

  const roleLabelMap: Record<UserRole, { label: string; badge: string }> = {
    super_admin: { label: 'Super Admin', badge: 'bg-purple-100 text-purple-800 border-purple-300' },
    kepala_sekolah: { label: 'Kepala Sekolah', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
    tata_usaha: { label: 'Admin / Tata Usaha', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
    guru: { label: 'Guru / Pelaksana', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pengaturan Aplikasi & Konfigurasi Supabase
            </h2>
            <p className="text-xs text-slate-500">
              Profil SDN 1 Keden, manajemen pengguna (RBAC), dan arsitektur database Supabase
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sekolah')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'sekolah'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profil Sekolah
          </button>
          <button
            onClick={() => setActiveTab('pengguna')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'pengguna'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengguna & Role
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'supabase'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Supabase & RLS
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'backup'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Backup & Reset
          </button>
        </div>
      </div>

      {/* TAB 1: PROFIL SEKOLAH */}
      {activeTab === 'sekolah' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Identitas Resmi Satuan Pendidikan
              </h3>
              <p className="text-xs text-slate-500">
                Informasi ini otomatis tercetak pada KOP Surat resmi dan Lembar Disposisi
              </p>
            </div>
            {schoolSavedAlert && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
                ✓ Data berhasil disimpan!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSchool} className="space-y-5 text-xs">
            {/* Logo Upload Box */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4">
              <SchoolLogo size="xl" customUrl={schoolForm.logoUrl} />
              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <h4 className="font-bold text-slate-900 text-xs">Logo Sekolah Resmi</h4>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Unggah logo resmi SDN 1 Keden atau lambang pendidikan daerah (format PNG/JPG transparan direkomendasikan).
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer shadow-xs">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Unggah Logo Sekolah</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {schoolForm.logoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...schoolForm, logoUrl: '' };
                        setSchoolForm(updated);
                        storeService.updateSchoolProfile({ logoUrl: '' });
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
                    >
                      Hapus Logo Kustom
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Satuan Pendidikan</label>
                <input
                  type="text"
                  value={schoolForm.namaSekolah}
                  onChange={(e) => setSchoolForm({ ...schoolForm, namaSekolah: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NPSN (Nomor Pokok Sekolah Nasional)</label>
                <input
                  type="text"
                  value={schoolForm.npsn}
                  onChange={(e) => setSchoolForm({ ...schoolForm, npsn: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  value={schoolForm.alamat}
                  onChange={(e) => setSchoolForm({ ...schoolForm, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kecamatan & Kabupaten</label>
                <input
                  type="text"
                  value={`${schoolForm.kecamatan}, ${schoolForm.kabupaten}`}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={schoolForm.kepalaSekolah}
                  onChange={(e) => setSchoolForm({ ...schoolForm, kepalaSekolah: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={schoolForm.nipKepalaSekolah}
                  onChange={(e) => setSchoolForm({ ...schoolForm, nipKepalaSekolah: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Resmi Sekolah</label>
                <input
                  type="email"
                  value={schoolForm.email}
                  onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={schoolForm.telepon}
                  onChange={(e) => setSchoolForm({ ...schoolForm, telepon: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">Teks KOP Surat Resmi (Header Tingkat Dinas)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Baris 1:</label>
                  <input
                    type="text"
                    value={schoolForm.kopHeaderBaris1}
                    onChange={(e) => setSchoolForm({ ...schoolForm, kopHeaderBaris1: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Baris 2:</label>
                  <input
                    type="text"
                    value={schoolForm.kopHeaderBaris2}
                    onChange={(e) => setSchoolForm({ ...schoolForm, kopHeaderBaris2: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Baris 3:</label>
                  <input
                    type="text"
                    value={schoolForm.kopHeaderBaris3}
                    onChange={(e) => setSchoolForm({ ...schoolForm, kopHeaderBaris3: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition-all cursor-pointer"
              >
                Simpan Perubahan Identitas Sekolah
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: MANAJEMEN PENGGUNA & RBAC */}
      {activeTab === 'pengguna' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Manajemen Pengguna & Role-Based Access Control (RBAC)
              </h3>
              <p className="text-xs text-slate-500">
                Hak akses terbagi menjadi Super Admin, Kepala Sekolah, Tata Usaha, dan Guru/Pelaksana
              </p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengguna Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Pengguna</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role Akses</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4">NIP</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {userList.map((user) => {
                  const roleInfo = roleLabelMap[user.role];
                  const isCurrent = user.id === currentUser.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {user.fullName}
                        {isCurrent && (
                          <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                            Sesi Anda
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold ${roleInfo.badge}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{user.jabatan}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{user.nip || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.fullName)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUPABASE & RLS ARCHITECTURE */}
      {activeTab === 'supabase' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Integrasi Backend Supabase PostgreSQL & Row Level Security
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Proyek Supabase: <strong className="text-slate-800">{SUPABASE_PROJECT_NAME}</strong> (ID: <code className="font-mono text-blue-700">{SUPABASE_PROJECT_ID}</code>)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-xs font-bold rounded-xl border flex items-center gap-1.5 ${
                  isSupabaseConfigured
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-blue-50 text-blue-800 border-blue-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
                  }`}
                />
                <span>Supabase Terkonfigurasi</span>
              </span>

              <button
                onClick={handleTestConnection}
                disabled={connResult.loading}
                className="px-3 py-1 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                {connResult.loading ? 'Menguji...' : 'Uji Koneksi Supabase'}
              </button>
            </div>
          </div>

          {/* Connection Test Result Banner */}
          {connResult.tested && (
            <div
              className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in ${
                connResult.tablesExist
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : connResult.connected
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{connResult.message}</span>
              </div>
              {!connResult.tablesExist && connResult.connected && (
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs shrink-0"
                >
                  Buka Supabase SQL Editor &rarr;
                </a>
              )}
            </div>
          )}

          {/* Active Credentials Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Kredensial Aktif Proyek Supabase SDN 1 Keden</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Project URL (Endpoint API):</span>
                <span className="font-mono font-bold text-slate-800 text-[11px] select-all">
                  {supabaseUrl}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Project ID:</span>
                <span className="font-mono font-bold text-blue-700 text-[11px]">
                  {SUPABASE_PROJECT_ID}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Anon Public Key:</span>
              <span className="font-mono text-slate-600 text-[10px] break-all select-all">
                eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcWlsdWp2dGt3d3lrYXlxa2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4Nzk4NjgsImV4cCI6MjEwOTQ1NTg2OH0...
              </span>
            </div>
          </div>

          {/* Setup Guide Info Box */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2 text-xs">
            <h4 className="font-bold text-blue-900">
              Langkah 1x Inisialisasi Database Supabase (Jika Belum Menjalankan SQL):
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1 leading-relaxed">
              <li>
                Buka dashboard project Anda di:{' '}
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-700 underline"
                >
                  Supabase SQL Editor (haqilujvtkwwykayqkep)
                </a>
              </li>
              <li>
                Klik tombol <strong>&ldquo;Salin SQL&rdquo;</strong> di bawah ini, tempelkan (paste) pada editor Supabase, lalu klik <strong>Run</strong>.
              </li>
              <li>
                Seluruh tabel persuratan, fungsi penomoran otomatis dinas, dan aturan <strong>Row Level Security (RLS)</strong> akan aktif secara permanen!
              </li>
            </ol>
          </div>

          {/* SQL Schema Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">
                Skrip Lengkap Supabase PostgreSQL Migration (Termasuk RLS per Role)
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
                <button
                  onClick={handleDownloadSql}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File .SQL</span>
                </button>
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  <span>Buka Supabase SQL Editor</span>
                </a>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] max-h-80 overflow-y-auto custom-scrollbar border border-slate-800">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & RESET */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">
              Pencadangan Arsip & Pengembalian Data (Backup & Restore)
            </h3>
            <p className="text-xs text-slate-500">
              Unduh cadangan data lengkap dalam format JSON yang dapat disimpan secara aman
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Backup Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                <Download className="w-4 h-4" />
                <span>Ekspor Cadangan Lengkap (JSON)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mencakup seluruh profil sekolah, daftar klasifikasi, arsip surat masuk, disposisi kepala sekolah, tindak lanjut, dan surat keluar.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Unduh Cadangan Arsip SIPESKA
              </button>
            </div>

            {/* Reset Card */}
            <div className="p-5 rounded-2xl border border-red-200 bg-red-50/40 space-y-3">
              <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                <RotateCcw className="w-4 h-4" />
                <span>Reset ke Data Demo SDN 1 Keden</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mengembalikan seluruh data ke data bawaan awal SD Negeri 1 Keden (Klaten). Berguna untuk demonstrasi dan evaluasi sistem.
              </p>
              <button
                onClick={handleResetData}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Reset ke Data Awal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Tambah Akun Pengguna</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="Contoh: Dra. Endang Mulyani"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="endang@sdn1keden.sch.id"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Akses (RBAC)</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="guru">Guru / Pelaksana</option>
                  <option value="tata_usaha">Admin / Tata Usaha</option>
                  <option value="kepala_sekolah">Kepala Sekolah</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan / Tugas</label>
                <input
                  type="text"
                  value={newUser.jabatan}
                  onChange={(e) => setNewUser({ ...newUser, jabatan: e.target.value })}
                  placeholder="Guru Kelas 3 / Bendahara BOS"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP (Opsional)</label>
                <input
                  type="text"
                  value={newUser.nip}
                  onChange={(e) => setNewUser({ ...newUser, nip: e.target.value })}
                  placeholder="1985xxxx xxxx x xxx"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
