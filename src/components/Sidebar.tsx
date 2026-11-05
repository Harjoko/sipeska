import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  FileCheck2,
  ListTodo,
  Send,
  BookOpen,
  Tag,
  Settings,
  ShieldAlert,
  UserCheck,
  ChevronDown,
  Sparkles,
  School,
  Database,
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { UserProfile, UserRole } from '../types';
import { storeService, isSupabaseConfigured } from '../lib/supabase';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile;
  stats: {
    pendingDisposisiCount: number;
    pendingTindakLanjutCount: number;
    pendingSuratKeluarCount: number;
    suratMasukTotal: number;
  };
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  stats,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const school = storeService.getSchoolProfile();
  const allUsers = storeService.getUsers();
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      roles: ['super_admin', 'kepala_sekolah', 'tata_usaha', 'guru'],
    },
    {
      id: 'surat_masuk',
      label: 'Surat Masuk',
      icon: Inbox,
      badge: stats.pendingDisposisiCount > 0 ? `${stats.pendingDisposisiCount} perlu disp.` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      roles: ['super_admin', 'kepala_sekolah', 'tata_usaha', 'guru'],
    },
    {
      id: 'disposisi',
      label: 'Disposisi Kepala Sekolah',
      icon: FileCheck2,
      badge: stats.pendingDisposisiCount > 0 ? stats.pendingDisposisiCount : null,
      badgeColor: 'bg-red-100 text-red-700 border-red-300',
      roles: ['super_admin', 'kepala_sekolah', 'tata_usaha', 'guru'],
    },
    {
      id: 'tindak_lanjut',
      label: 'Tindak Lanjut & Pelaksanaan',
      icon: ListTodo,
      badge: stats.pendingTindakLanjutCount > 0 ? stats.pendingTindakLanjutCount : null,
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-300',
      roles: ['super_admin', 'kepala_sekolah', 'tata_usaha', 'guru'],
    },
    {
      id: 'surat_keluar',
      label: 'Surat Keluar & Penomoran',
      icon: Send,
      badge: stats.pendingSuratKeluarCount > 0 ? `${stats.pendingSuratKeluarCount} draf` : null,
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-300',
      roles: ['super_admin', 'kepala_sekolah', 'tata_usaha', 'guru'],
    },
    {
      id: 'buku_agenda',
      label: 'Buku Agenda & Cetak',
      icon: BookOpen,
      badge: null,
      roles: ['super_admin', 'kepala_sekolah', 'tata_usaha', 'guru'],
    },
    {
      id: 'klasifikasi',
      label: 'Klasifikasi Surat',
      icon: Tag,
      badge: null,
      roles: ['super_admin', 'kepala_sekolah', 'tata_usaha'],
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan & Supabase RLS',
      icon: Settings,
      badge: null,
      roles: ['super_admin', 'kepala_sekolah', 'tata_usaha'],
    },
  ];

  const roleLabelMap: Record<UserRole, { title: string; color: string; bg: string }> = {
    super_admin: { title: 'Super Admin', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    kepala_sekolah: { title: 'Kepala Sekolah', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
    tata_usaha: { title: 'Admin / Tata Usaha', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    guru: { title: 'Guru / Pelaksana', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  };

  const handleSelectRole = (user: UserProfile) => {
    storeService.setCurrentUser(user);
    setShowRoleMenu(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-gradient-to-b from-[#0f233a] via-[#122b49] to-[#0a1829] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <SchoolLogo size="md" customUrl={school.logoUrl} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black tracking-wider text-white">SIPESKA</h1>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-400 text-slate-900 uppercase">
                  SDN 1
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-200/90 truncate">
                {school.namaSekolah}
              </p>
              <p className="text-[10px] text-slate-300/80 truncate">
                Pedan, Klaten — Jawa Tengah
              </p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-white/10">
            <p className="text-[10px] italic text-slate-300 leading-tight">
              &ldquo;Administrasi Tertib, Arsip Digital, Pelayanan Efektif&rdquo;
            </p>
          </div>
        </div>

        {/* Database Status indicator */}
        <div className="px-4 py-2 mx-3 my-2 text-[11px] rounded-lg flex items-center justify-between border border-white/10 bg-white/5">
          <div className="flex items-center gap-2 truncate">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
              }`}
            />
            <span className="text-slate-300 font-medium truncate text-[11px]" title="haqilujvtkwwykayqkep">
              {isSupabaseConfigured ? 'Supabase: haqiluj...' : 'Offline / Local Store'}
            </span>
          </div>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold bg-white/10 text-amber-300 shrink-0">
            RLS Aktif
          </span>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pt-1 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Utama Persuratan
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isAllowed = item.roles.includes(currentUser.role);

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 font-semibold'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                } ${!isAllowed ? 'opacity-40 hover:opacity-70' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-amber-300' : 'text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                      isActive ? 'bg-amber-400 text-slate-900 border-amber-300' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile Card & Role Switcher */}
        <div className="p-3 border-t border-white/10 bg-black/20 relative">
          <div
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all"
            title="Klik untuk beralih akun simulasi role"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xs ring-2 ring-white/20 shrink-0">
              {currentUser.fullName
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span
                className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border mt-0.5 ${
                  roleLabelMap[currentUser.role]?.bg || 'bg-slate-800'
                } ${roleLabelMap[currentUser.role]?.color || 'text-white'}`}
              >
                {roleLabelMap[currentUser.role]?.title}
              </span>
            </div>
          </div>

          {/* Quick Role Switcher Dropdown */}
          {showRoleMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-xs space-y-1 z-50">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span>PILIH ROLE SIMULASI (RBAC)</span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 pt-1">
                {allUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const roleInfo = roleLabelMap[u.role];
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelectRole(u)}
                      className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                        isCurrent ? 'bg-blue-600/30 border border-blue-500/50' : 'hover:bg-slate-800'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-white truncate text-xs">{u.fullName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.jabatan}</p>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 font-bold ${
                          roleInfo.bg
                        } ${roleInfo.color}`}
                      >
                        {roleInfo.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
