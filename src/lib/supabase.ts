import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  KlasifikasiSurat,
  SuratMasuk,
  Disposisi,
  TindakLanjut,
  SuratKeluar,
  SchoolProfile,
  ActivityLog,
  UserRole,
} from '../types';
import {
  initialSchoolProfile,
  initialKlasifikasi,
  initialUsers,
  initialSuratMasuk,
  initialDisposisi,
  initialTindakLanjut,
  initialSuratKeluar,
  initialActivities,
} from '../data/initialData';

export const SUPABASE_PROJECT_ID = 'haqilujvtkwwykayqkep';
export const SUPABASE_PROJECT_NAME = 'SIPESKA — Sistem Informasi Persuratan SDN 1 Keden';

const defaultSupabaseUrl = 'https://haqilujvtkwwykayqkep.supabase.co';
const defaultAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcWlsdWp2dGt3d3lrYXlxa2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4Nzk4NjgsImV4cCI6MjEwOTQ1NTg2OH0.aR7J_HyQrBOwMouhTbCFtRq6kZcbjlEnWkkMePYFeMw';

// Sanitize URL by removing any trailing /rest/v1/ path provided by user
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl).trim();
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.includes('supabase.co') &&
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  message: string;
}> {
  if (!supabase) {
    return {
      connected: false,
      tablesExist: false,
      message: 'Supabase credentials belum dikonfigurasi.',
    };
  }

  try {
    // Attempt a lightweight probe on the profiles / school_profile table
    const { error } = await supabase.from('school_profile').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        // PostgreSQL error code 42P01 = undefined_table (tabel belum dibuat via SQL)
        return {
          connected: true,
          tablesExist: false,
          message: 'Terkoneksi ke Supabase! Tabel database belum dibuat. Silakan jalankan Skrip SQL di Supabase SQL Editor.',
        };
      }
      return {
        connected: true,
        tablesExist: false,
        message: `Terkoneksi ke Supabase: ${error.message}`,
      };
    }

    return {
      connected: true,
      tablesExist: true,
      message: 'Terkoneksi ke Supabase PostgreSQL & Tabel database terdeteksi aktif!',
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesExist: false,
      message: `Gagal terhubung ke Supabase: ${err?.message || err}`,
    };
  }
}

// LocalStorage Keys for persistent and reliable offline-first fallback
const STORAGE_PREFIX = 'sipeska_sdn1keden_';

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error reading localStorage for ${key}:`, e);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing localStorage for ${key}:`, e);
  }
}

// Helper to convert date to Roman numeral month (standard Indonesian governance)
export function getBulanRomawi(dateStrOrObj: string | Date = new Date()): string {
  const date = typeof dateStrOrObj === 'string' ? new Date(dateStrOrObj) : dateStrOrObj;
  const month = isNaN(date.getTime()) ? new Date().getMonth() + 1 : date.getMonth() + 1;
  const romanMap = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romanMap[month] || 'I';
}

// Unified Store Service
class SipeskaStoreService {
  private listeners: Array<() => void> = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Current Active User
  getCurrentUser(): UserProfile {
    const user = getStorage<UserProfile>('current_user', initialUsers[1]);
    if (user && (user.fullName.includes('Sri Wahyuni') || (user.role === 'kepala_sekolah' && user.nip !== '199101192019031006'))) {
      const updated = {
        ...user,
        fullName: 'Harjoko, S.Pd, M.Pd',
        nip: '199101192019031006',
      };
      setStorage('current_user', updated);
      return updated;
    }
    return user;
  }

  setCurrentUser(user: UserProfile) {
    setStorage('current_user', user);
    this.addActivityLog({
      action: 'Beralih Akun / Sesi Pengguna',
      target: `Login sebagai ${user.fullName} (${user.jabatan})`,
      category: 'system',
    });
    this.notify();
  }

  // School Profile
  getSchoolProfile(): SchoolProfile {
    const profile = getStorage<SchoolProfile>('school_profile', initialSchoolProfile);
    if (profile && (profile.kepalaSekolah.includes('Sri Wahyuni') || profile.nipKepalaSekolah !== '199101192019031006')) {
      const updated = {
        ...profile,
        kepalaSekolah: 'Harjoko, S.Pd, M.Pd',
        nipKepalaSekolah: '199101192019031006',
      };
      setStorage('school_profile', updated);
      return updated;
    }
    return profile;
  }

  updateSchoolProfile(profile: Partial<SchoolProfile>) {
    const current = this.getSchoolProfile();
    const updated = { ...current, ...profile };
    setStorage('school_profile', updated);
    this.addActivityLog({
      action: 'Memperbarui Profil Sekolah SDN 1 Keden',
      target: `Data identitas sekolah diperbarui`,
      category: 'system',
    });
    this.notify();
    return updated;
  }

  // Users
  getUsers(): UserProfile[] {
    const users = getStorage<UserProfile[]>('users', initialUsers);
    let changed = false;
    const updatedUsers = users.map((u) => {
      if (u.role === 'kepala_sekolah' && (u.fullName.includes('Sri Wahyuni') || u.nip !== '199101192019031006')) {
        changed = true;
        return {
          ...u,
          fullName: 'Harjoko, S.Pd, M.Pd',
          nip: '199101192019031006',
        };
      }
      return u;
    });
    if (changed) {
      setStorage('users', updatedUsers);
    }
    return updatedUsers;
  }

  addUser(user: Omit<UserProfile, 'id'>): UserProfile {
    const users = this.getUsers();
    const newUser: UserProfile = {
      ...user,
      id: `usr-${Date.now()}`,
    };
    users.push(newUser);
    setStorage('users', users);
    this.addActivityLog({
      action: 'Menambahkan Pengguna Baru',
      target: `${newUser.fullName} (${newUser.jabatan})`,
      category: 'system',
    });
    this.notify();
    return newUser;
  }

  updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    setStorage('users', users);
    // If updating current active user, sync current_user too
    const current = this.getCurrentUser();
    if (current.id === id) {
      setStorage('current_user', users[idx]);
    }
    this.notify();
    return users[idx];
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    setStorage('users', filtered);
    this.notify();
    return true;
  }

  // Klasifikasi
  getKlasifikasi(): KlasifikasiSurat[] {
    return getStorage<KlasifikasiSurat[]>('klasifikasi', initialKlasifikasi);
  }

  addKlasifikasi(item: Omit<KlasifikasiSurat, 'id'>): KlasifikasiSurat {
    const list = this.getKlasifikasi();
    const newItem: KlasifikasiSurat = {
      ...item,
      id: `k-${Date.now()}`,
    };
    list.push(newItem);
    setStorage('klasifikasi', list);
    this.notify();
    return newItem;
  }

  // Surat Masuk
  getSuratMasuk(): SuratMasuk[] {
    return getStorage<SuratMasuk[]>('surat_masuk', initialSuratMasuk);
  }

  getNextAgendaMasuk(): string {
    const list = this.getSuratMasuk();
    const now = new Date();
    const year = now.getFullYear();
    // Default starting point is 18 so next agenda begins at 019 ("400.3.5 / 019 / ... / 2026")
    let maxSeq = 18;
    list.forEach((s) => {
      const match = s.noAgenda.match(/400\.3\.5\s*\/\s*(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });
    const seq = String(maxSeq + 1).padStart(3, '0');
    return `400.3.5 / ${seq} / SD-01 / ${year}`;
  }

  addSuratMasuk(data: Omit<SuratMasuk, 'id' | 'createdAt' | 'updatedAt'>): SuratMasuk {
    const list = this.getSuratMasuk();
    const now = new Date().toISOString();
    const newSurat: SuratMasuk = {
      ...data,
      id: `sm-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(newSurat);
    setStorage('surat_masuk', list);
    this.addActivityLog({
      action: 'Mencatat Surat Masuk Baru',
      target: `${newSurat.noAgenda} - Dari ${newSurat.asalSurat}`,
      category: 'surat_masuk',
    });
    this.notify();
    return newSurat;
  }

  updateSuratMasuk(id: string, updates: Partial<SuratMasuk>): SuratMasuk | null {
    const list = this.getSuratMasuk();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setStorage('surat_masuk', list);
    this.notify();
    return list[idx];
  }

  deleteSuratMasuk(id: string): boolean {
    const list = this.getSuratMasuk();
    const target = list.find((s) => s.id === id);
    const filtered = list.filter((s) => s.id !== id);
    if (filtered.length === list.length) return false;
    setStorage('surat_masuk', filtered);
    if (target) {
      this.addActivityLog({
        action: 'Menghapus Arsip Surat Masuk',
        target: `${target.noAgenda} (${target.perihal})`,
        category: 'surat_masuk',
      });
    }
    this.notify();
    return true;
  }

  // Disposisi
  getDisposisi(): Disposisi[] {
    return getStorage<Disposisi[]>('disposisi', initialDisposisi);
  }

  addDisposisi(data: Omit<Disposisi, 'id' | 'createdAt'>): Disposisi {
    const list = this.getDisposisi();
    const newDisp: Disposisi = {
      ...data,
      id: `disp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newDisp);
    setStorage('disposisi', list);

    // Update Surat Masuk status
    this.updateSuratMasuk(data.suratMasukId, {
      status: 'Sudah Didisposisikan',
    });

    this.addActivityLog({
      action: 'Memberikan Disposisi Kepala Sekolah',
      target: `Surat ${data.noAgendaSurat} ditujukan ke ${data.ditujukanKepada.join(', ')}`,
      category: 'disposisi',
    });

    this.notify();
    return newDisp;
  }

  updateDisposisi(id: string, updates: Partial<Disposisi>): Disposisi | null {
    const list = this.getDisposisi();
    const idx = list.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    setStorage('disposisi', list);
    this.notify();
    return list[idx];
  }

  // Tindak Lanjut
  getTindakLanjut(): TindakLanjut[] {
    return getStorage<TindakLanjut[]>('tindak_lanjut', initialTindakLanjut);
  }

  addTindakLanjut(data: Omit<TindakLanjut, 'id' | 'createdAt'>): TindakLanjut {
    const list = this.getTindakLanjut();
    const newTL: TindakLanjut = {
      ...data,
      id: `tl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newTL);
    setStorage('tindak_lanjut', list);

    // Update Disposisi and Surat Masuk status
    this.updateDisposisi(data.disposisiId, {
      status: data.statusAkhir === 'Selesai' ? 'Selesai' : 'Dalam Proses',
    });

    this.updateSuratMasuk(data.suratMasukId, {
      status: data.statusAkhir === 'Selesai' ? 'Selesai' : 'Dalam Tindak Lanjut',
    });

    this.addActivityLog({
      action: 'Mengisi Catatan Tindak Lanjut',
      target: `Oleh ${data.pelaksanaNama} (${data.statusAkhir})`,
      category: 'tindak_lanjut',
    });

    this.notify();
    return newTL;
  }

  // Surat Keluar
  getSuratKeluar(): SuratKeluar[] {
    return getStorage<SuratKeluar[]>('surat_keluar', initialSuratKeluar);
  }

  getNextAgendaKeluar(): string {
    const list = this.getSuratKeluar();
    const now = new Date();
    const year = now.getFullYear();
    const roman = getBulanRomawi(now);
    const seq = String(list.length + 1).padStart(3, '0');
    return `AGK/${year}/${roman}/${seq}`;
  }

  generateOfficialLetterNumber(kodeKlasifikasi: string, customSeq?: number): string {
    const list = this.getSuratKeluar();
    const now = new Date();
    const year = now.getFullYear();
    const roman = getBulanRomawi(now);
    const seq = String(customSeq || list.length + 1).padStart(3, '0');
    // Format resmi dinas SDN 1 Keden: [KODE]/[NOMOR]/SD-01/[BULAN_ROMAWI]/[TAHUN]
    return `${kodeKlasifikasi || '422'}/${seq}/SD-01/${roman}/${year}`;
  }

  addSuratKeluar(data: Omit<SuratKeluar, 'id' | 'createdAt'>): SuratKeluar {
    const list = this.getSuratKeluar();
    const newSurat: SuratKeluar = {
      ...data,
      id: `sk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newSurat);
    setStorage('surat_keluar', list);
    this.addActivityLog({
      action: 'Membuat Draf Surat Keluar',
      target: `${newSurat.noSurat} - Kepada ${newSurat.tujuanSurat}`,
      category: 'surat_keluar',
    });
    this.notify();
    return newSurat;
  }

  updateSuratKeluar(id: string, updates: Partial<SuratKeluar>): SuratKeluar | null {
    const list = this.getSuratKeluar();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    setStorage('surat_keluar', list);
    this.notify();
    return list[idx];
  }

  deleteSuratKeluar(id: string): boolean {
    const list = this.getSuratKeluar();
    const target = list.find((s) => s.id === id);
    const filtered = list.filter((s) => s.id !== id);
    if (filtered.length === list.length) return false;
    setStorage('surat_keluar', filtered);
    if (target) {
      this.addActivityLog({
        action: 'Menghapus Arsip Surat Keluar',
        target: `${target.noSurat}`,
        category: 'surat_keluar',
      });
    }
    this.notify();
    return true;
  }

  approveSuratKeluar(id: string): boolean {
    const user = this.getCurrentUser();
    const result = this.updateSuratKeluar(id, {
      status: 'Disetujui',
      disetujuiPada: new Date().toISOString(),
      penandatanganNama: user.fullName,
      penandatanganNip: user.nip || '199101192019031006',
      penandatanganJabatan: user.jabatan,
    });
    if (result) {
      this.addActivityLog({
        action: 'Mengesahkan / Menyetujui Surat Keluar',
        target: `${result.noSurat} disahkan oleh ${user.fullName}`,
        category: 'surat_keluar',
      });
      return true;
    }
    return false;
  }

  // Activity Logs
  getActivityLogs(): ActivityLog[] {
    return getStorage<ActivityLog[]>('activities', initialActivities);
  }

  addActivityLog(log: {
    action: string;
    target: string;
    category: ActivityLog['category'];
  }) {
    const user = this.getCurrentUser();
    const logs = this.getActivityLogs();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      userId: user.id,
      userName: user.fullName,
      role: user.role,
      action: log.action,
      target: log.target,
      category: log.category,
      timestamp: timestampStr,
    };
    logs.unshift(newLog);
    // Keep max 50 recent logs
    setStorage('activities', logs.slice(0, 50));
    this.notify();
  }

  // Backup / Reset
  resetToDefault() {
    localStorage.removeItem(STORAGE_PREFIX + 'school_profile');
    localStorage.removeItem(STORAGE_PREFIX + 'users');
    localStorage.removeItem(STORAGE_PREFIX + 'klasifikasi');
    localStorage.removeItem(STORAGE_PREFIX + 'surat_masuk');
    localStorage.removeItem(STORAGE_PREFIX + 'disposisi');
    localStorage.removeItem(STORAGE_PREFIX + 'tindak_lanjut');
    localStorage.removeItem(STORAGE_PREFIX + 'surat_keluar');
    localStorage.removeItem(STORAGE_PREFIX + 'activities');
    this.notify();
  }

  exportDataJson(): string {
    const data = {
      app: 'SIPESKA SDN 1 Keden',
      exportDate: new Date().toISOString(),
      schoolProfile: this.getSchoolProfile(),
      users: this.getUsers(),
      klasifikasi: this.getKlasifikasi(),
      suratMasuk: this.getSuratMasuk(),
      disposisi: this.getDisposisi(),
      tindakLanjut: this.getTindakLanjut(),
      suratKeluar: this.getSuratKeluar(),
      activityLogs: this.getActivityLogs(),
    };
    return JSON.stringify(data, null, 2);
  }
}

export const storeService = new SipeskaStoreService();
