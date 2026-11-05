import React from 'react';
import {
  Menu,
  Bell,
  Search,
  Printer,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { storeService } from '../lib/supabase';

interface HeaderProps {
  currentTab: string;
  onOpenMobile: () => void;
  currentUser: UserProfile;
  onQuickPrint: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobile,
  currentUser,
  onQuickPrint,
  searchQuery,
  setSearchQuery,
}) => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const activities = storeService.getActivityLogs();

  const titleMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Persuratan',
      subtitle: 'Ringkasan statistik, surat masuk, keluar, dan disposisi',
    },
    surat_masuk: {
      title: 'Surat Masuk',
      subtitle: 'Pengelolaan arsip, nomor agenda otomatis, dan disposisi pimpinan',
    },
    disposisi: {
      title: 'Disposisi Kepala Sekolah',
      subtitle: 'Instruksi pimpinan, arahan, dan penugasan tindak lanjut surat',
    },
    tindak_lanjut: {
      title: 'Tindak Lanjut & Pelaksanaan',
      subtitle: 'Laporan penyelesaian tugas oleh guru dan tenaga kependidikan',
    },
    surat_keluar: {
      title: 'Surat Keluar & Penomoran',
      subtitle: 'Penerbitan surat resmi dengan format kode klasifikasi dinas',
    },
    buku_agenda: {
      title: 'Buku Agenda & Cetak Dokumen',
      subtitle: 'Agenda surat masuk, agenda surat keluar, dan lembar disposisi resmi',
    },
    klasifikasi: {
      title: 'Klasifikasi Kode Surat',
      subtitle: 'Master data kode klasifikasi persuratan dinas pendidikan',
    },
    pengaturan: {
      title: 'Pengaturan & Supabase RLS',
      subtitle: 'Profil sekolah SDN 1 Keden, manajemen pengguna, dan skema Supabase',
    },
  };

  const currentInfo = titleMap[currentTab] || {
    title: 'SIPESKA SDN 1 Keden',
    subtitle: 'Sistem Informasi Persuratan Digital',
  };

  const roleBadgeMap: Record<UserRole, { label: string; badgeClass: string }> = {
    super_admin: { label: 'Super Admin', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300' },
    kepala_sekolah: { label: 'Kepala Sekolah', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300' },
    tata_usaha: { label: 'Tata Usaha / Admin', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' },
    guru: { label: 'Guru / Pelaksana', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  };

  // Indonesian date formatting
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 lg:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight">
              {currentInfo.title}
            </h2>
            <span
              className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                roleBadgeMap[currentUser.role]?.badgeClass
              }`}
            >
              <ShieldCheck className="w-3 h-3 mr-1" />
              {roleBadgeMap[currentUser.role]?.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Date, Quick Print, Notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date Display */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
          <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
          <span>{todayFormatted}</span>
        </div>

        {/* Global Quick Search */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari surat / perihal..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Print Agenda Button */}
        <button
          onClick={onQuickPrint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer shadow-2xs"
          title="Cetak Agenda / Lembar Disposisi"
        >
          <Printer className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Cetak Dokumen</span>
        </button>

        {/* Activity & Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Aktivitas Terkini"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Log Aktivitas Persuratan SDN 1 Keden</span>
                </div>
                <span className="text-[10px] text-slate-400">Terbaru</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {activities.slice(0, 7).map((act) => (
                  <div
                    key={act.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 truncate">
                        {act.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {act.timestamp.split(' ')[1] || act.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                      {act.target}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Oleh: <strong className="text-slate-700">{act.userName}</strong></span>
                      <span className="capitalize">{act.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400">
                  Semua aktivitas dicatat dengan aman untuk akuntabilitas sekolah.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
