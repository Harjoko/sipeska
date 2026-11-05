export type UserRole = 'super_admin' | 'kepala_sekolah' | 'tata_usaha' | 'guru';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  nip?: string;
  jabatan: string;
  phone?: string;
  avatarUrl?: string;
}

export type SuratSifat = 'Biasa' | 'Penting' | 'Segera' | 'Rahasia';

export type SuratMasukStatus =
  | 'Baru Diterima'
  | 'Menunggu Disposisi'
  | 'Sudah Didisposisikan'
  | 'Dalam Tindak Lanjut'
  | 'Selesai'
  | 'Diarsipkan';

export type SuratKeluarStatus =
  | 'Draft'
  | 'Menunggu Pengesahan'
  | 'Disetujui'
  | 'Terkirim'
  | 'Diarsipkan';

export interface KlasifikasiSurat {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  keterangan?: string;
}

export interface SuratMasuk {
  id: string;
  noAgenda: string;
  noSuratPengirim: string;
  tanggalSurat: string;
  tanggalDiterima: string;
  asalSurat: string;
  alamatPengirim: string;
  perihal: string;
  kodeKlasifikasi: string;
  sifat: SuratSifat;
  ringkasanIsi: string;
  lampiranInfo: string;
  fileScanUrl?: string;
  fileName?: string;
  fileSize?: string;
  status: SuratMasukStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Disposisi {
  id: string;
  suratMasukId: string;
  noAgendaSurat: string;
  perihalSurat: string;
  tanggalDisposisi: string;
  batasWaktu?: string;
  sifatDisposisi: SuratSifat;
  instruksi: string[];
  catatanKepalaSekolah: string;
  ditujukanKepada: string[]; // nama atau jabatan guru/staf
  status: 'Menunggu' | 'Dalam Proses' | 'Selesai';
  createdByName: string;
  createdAt: string;
}

export interface TindakLanjut {
  id: string;
  disposisiId: string;
  suratMasukId: string;
  pelaksanaId: string;
  pelaksanaNama: string;
  pelaksanaJabatan: string;
  tanggalTindakLanjut: string;
  uraianTindakLanjut: string;
  buktiFileUrl?: string;
  buktiFileName?: string;
  statusAkhir: 'Dalam Proses' | 'Selesai';
  createdAt: string;
}

export interface SuratKeluar {
  id: string;
  noAgendaKeluar: string;
  noSurat: string;
  kodeKlasifikasi: string;
  tanggalSurat: string;
  tujuanSurat: string;
  alamatTujuan: string;
  perihal: string;
  sifat: SuratSifat;
  ringkasanIsi: string;
  lampiranInfo: string;
  penandatanganNama: string;
  penandatanganNip: string;
  penandatanganJabatan: string;
  status: SuratKeluarStatus;
  draftFileUrl?: string;
  fileName?: string;
  fileSize?: string;
  disetujuiPada?: string;
  createdAt: string;
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  nss: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  logoUrl: string;
  kopHeaderBaris1: string;
  kopHeaderBaris2: string;
  kopHeaderBaris3: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  target: string;
  timestamp: string;
  category: 'surat_masuk' | 'surat_keluar' | 'disposisi' | 'tindak_lanjut' | 'system';
}
