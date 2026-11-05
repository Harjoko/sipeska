/**
 * Supabase SQL Migration Script for SIPESKA SDN 1 KEDEN
 * Didesain idempotent (aman dijalankan berulang kali) di Supabase SQL Editor.
 * Mencakup Enum, Tabel, Initial Seed Data, Helper Functions, RLS Policies, dan Storage Buckets.
 */

export const SUPABASE_SQL_SCHEMA = `-- ============================================================
-- SIPESKA — SISTEM INFORMASI PERSURATAN SDN 1 KEDEN
-- Database: Supabase PostgreSQL (Auth + Storage + RLS)
-- Project ID: haqilujvtkwwykayqkep
-- ============================================================

-- 1. ENUM TYPES (Aman dijalankan berulang kali)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'kepala_sekolah', 'tata_usaha', 'guru');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE sifat_surat AS ENUM ('Biasa', 'Penting', 'Segera', 'Rahasia');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE status_surat_masuk AS ENUM (
    'Baru Diterima',
    'Menunggu Disposisi',
    'Sudah Didisposisikan',
    'Dalam Tindak Lanjut',
    'Selesai',
    'Diarsipkan'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE status_surat_keluar AS ENUM (
    'Draft',
    'Menunggu Pengesahan',
    'Disetujui',
    'Terkirim',
    'Diarsipkan'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABEL PROFIL PENGGUNA (Terkoneksi dengan auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'guru',
  nip TEXT,
  jabatan TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. TABEL PROFIL SEKOLAH (SD NEGERI 1 KEDEN)
CREATE TABLE IF NOT EXISTS public.school_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_sekolah TEXT NOT NULL DEFAULT 'SD NEGERI 1 KEDEN',
  npsn TEXT NOT NULL DEFAULT '20309531',
  nss TEXT NOT NULL DEFAULT '101030908001',
  alamat TEXT NOT NULL DEFAULT 'Kauman RT 04 / RW 02, Desa Keden',
  desa TEXT NOT NULL DEFAULT 'Keden',
  kecamatan TEXT NOT NULL DEFAULT 'Pedan',
  kabupaten TEXT NOT NULL DEFAULT 'Kabupaten Klaten',
  provinsi TEXT NOT NULL DEFAULT 'Jawa Tengah',
  kode_pos TEXT NOT NULL DEFAULT '57468',
  telepon TEXT DEFAULT '(0272) 898123',
  email TEXT DEFAULT 'sdnegeri1keden@gmail.com',
  website TEXT DEFAULT 'https://sdn1keden.sch.id',
  kepala_sekolah TEXT NOT NULL DEFAULT 'Harjoko, S.Pd, M.Pd',
  nip_kepala_sekolah TEXT NOT NULL DEFAULT '199101192019031006',
  logo_url TEXT,
  kop_header_baris1 TEXT DEFAULT 'PEMERINTAH KABUPATEN KLATEN',
  kop_header_baris2 TEXT DEFAULT 'DINAS PENDIDIKAN',
  kop_header_baris3 TEXT DEFAULT 'KOORDINATOR WILAYAH PENDIDIKAN KECAMATAN PEDAN',
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. TABEL KODE KLASIFIKASI SURAT
CREATE TABLE IF NOT EXISTS public.klasifikasi_surat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode VARCHAR(50) NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. TABEL SURAT MASUK
CREATE TABLE IF NOT EXISTS public.surat_masuk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no_agenda VARCHAR(50) NOT NULL UNIQUE,
  no_surat_pengirim VARCHAR(100) NOT NULL,
  tanggal_surat DATE NOT NULL,
  tanggal_diterima DATE NOT NULL DEFAULT CURRENT_DATE,
  asal_surat TEXT NOT NULL,
  alamat_pengirim TEXT,
  perihal TEXT NOT NULL,
  kode_klasifikasi VARCHAR(50) REFERENCES public.klasifikasi_surat(kode) ON UPDATE CASCADE,
  sifat sifat_surat NOT NULL DEFAULT 'Biasa',
  ringkasan_isi TEXT,
  lampiran_info TEXT,
  file_scan_url TEXT,
  file_name TEXT,
  file_size TEXT,
  status status_surat_masuk NOT NULL DEFAULT 'Baru Diterima',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. TABEL DISPOSISI KEPALA SEKOLAH
CREATE TABLE IF NOT EXISTS public.disposisi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surat_masuk_id UUID NOT NULL REFERENCES public.surat_masuk(id) ON DELETE CASCADE,
  tanggal_disposisi DATE NOT NULL DEFAULT CURRENT_DATE,
  batas_waktu DATE,
  sifat_disposisi sifat_surat NOT NULL DEFAULT 'Biasa',
  instruksi TEXT[] NOT NULL DEFAULT '{}',
  catatan_kepala_sekolah TEXT,
  ditujukan_kepada TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'Menunggu',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 7. TABEL TINDAK LANJUT DISPOSISI
CREATE TABLE IF NOT EXISTS public.tindak_lanjut (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disposisi_id UUID NOT NULL REFERENCES public.disposisi(id) ON DELETE CASCADE,
  surat_masuk_id UUID NOT NULL REFERENCES public.surat_masuk(id) ON DELETE CASCADE,
  pelaksana_id UUID REFERENCES auth.users(id),
  pelaksana_nama TEXT NOT NULL,
  pelaksana_jabatan TEXT,
  tanggal_tindak_lanjut DATE NOT NULL DEFAULT CURRENT_DATE,
  uraian_tindak_lanjut TEXT NOT NULL,
  bukti_file_url TEXT,
  bukti_file_name TEXT,
  status_akhir VARCHAR(50) NOT NULL DEFAULT 'Dalam Proses',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 8. TABEL SURAT KELUAR & PENOMORAN
CREATE TABLE IF NOT EXISTS public.surat_keluar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no_agenda_keluar VARCHAR(50) NOT NULL UNIQUE,
  no_surat VARCHAR(100) NOT NULL UNIQUE,
  kode_klasifikasi VARCHAR(50) REFERENCES public.klasifikasi_surat(kode) ON UPDATE CASCADE,
  tanggal_surat DATE NOT NULL DEFAULT CURRENT_DATE,
  tujuan_surat TEXT NOT NULL,
  alamat_tujuan TEXT,
  perihal TEXT NOT NULL,
  sifat sifat_surat NOT NULL DEFAULT 'Biasa',
  ringkasan_isi TEXT,
  lampiran_info TEXT,
  penandatangan_nama TEXT NOT NULL DEFAULT 'Harjoko, S.Pd, M.Pd',
  penandatangan_nip TEXT NOT NULL DEFAULT '199101192019031006',
  penandatangan_jabatan TEXT NOT NULL DEFAULT 'Kepala Sekolah SDN 1 Keden',
  status status_surat_keluar NOT NULL DEFAULT 'Draft',
  draft_file_url TEXT,
  file_name TEXT,
  file_size TEXT,
  disetujui_pada TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 9. TABEL LOG AKTIVITAS PERSURATAN
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  role user_role NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 10. HELPER FUNCTIONS UNTUK PENOMORAN OTOMATIS
-- ============================================================

-- Fungsi konversi bulan ke angka Romawi
CREATE OR REPLACE FUNCTION get_bulan_romawi(p_date DATE)
RETURNS TEXT AS $$
DECLARE
  m INT := EXTRACT(MONTH FROM p_date);
  romans TEXT[] := ARRAY['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
BEGIN
  RETURN romans[m];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto Nomor Agenda Masuk (Format: 400.3.5 / SEQ / SD-01 / YYYY)
CREATE OR REPLACE FUNCTION generate_next_agenda_masuk()
RETURNS TEXT AS $$
DECLARE
  curr_year TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
  count_masuk INT;
  next_seq TEXT;
BEGIN
  SELECT COUNT(*) + 18 INTO count_masuk
  FROM public.surat_masuk
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

  next_seq := LPAD(count_masuk::TEXT, 3, '0');
  RETURN '400.3.5 / ' || next_seq || ' / SD-01 / ' || curr_year;
END;
$$ LANGUAGE plpgsql;

-- Auto Nomor Surat Keluar Resmi (Format: KODE/SEQ/SD-01/ROMAWI/YYYY)
CREATE OR REPLACE FUNCTION generate_next_no_surat_keluar(p_kode TEXT)
RETURNS TEXT AS $$
DECLARE
  curr_year TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
  curr_roman TEXT := get_bulan_romawi(CURRENT_DATE);
  count_keluar INT;
  next_seq TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO count_keluar
  FROM public.surat_keluar
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

  next_seq := LPAD(count_keluar::TEXT, 3, '0');
  RETURN COALESCE(p_kode, '422') || '/' || next_seq || '/SD-01/' || curr_roman || '/' || curr_year;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klasifikasi_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disposisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tindak_lanjut ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_keluar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated
  USING (current_user_role() = 'super_admin');

-- School Profile Policies
DROP POLICY IF EXISTS "school_profile_select" ON public.school_profile;
CREATE POLICY "school_profile_select" ON public.school_profile FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "school_profile_update" ON public.school_profile;
CREATE POLICY "school_profile_update" ON public.school_profile FOR UPDATE TO authenticated
  USING (current_user_role() IN ('super_admin', 'kepala_sekolah', 'tata_usaha'));

-- Klasifikasi Surat Policies
DROP POLICY IF EXISTS "klasifikasi_select" ON public.klasifikasi_surat;
CREATE POLICY "klasifikasi_select" ON public.klasifikasi_surat FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "klasifikasi_manage" ON public.klasifikasi_surat;
CREATE POLICY "klasifikasi_manage" ON public.klasifikasi_surat FOR ALL TO authenticated
  USING (current_user_role() IN ('super_admin', 'tata_usaha'));

-- Surat Masuk Policies
DROP POLICY IF EXISTS "surat_masuk_select" ON public.surat_masuk;
CREATE POLICY "surat_masuk_select" ON public.surat_masuk FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "surat_masuk_tu_all" ON public.surat_masuk;
CREATE POLICY "surat_masuk_tu_all" ON public.surat_masuk FOR ALL TO authenticated
  USING (current_user_role() IN ('super_admin', 'tata_usaha'));

DROP POLICY IF EXISTS "surat_masuk_kepsek_update" ON public.surat_masuk;
CREATE POLICY "surat_masuk_kepsek_update" ON public.surat_masuk FOR UPDATE TO authenticated
  USING (current_user_role() = 'kepala_sekolah');

-- Disposisi Policies
DROP POLICY IF EXISTS "disposisi_select" ON public.disposisi;
CREATE POLICY "disposisi_select" ON public.disposisi FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "disposisi_kepsek_manage" ON public.disposisi;
CREATE POLICY "disposisi_kepsek_manage" ON public.disposisi FOR ALL TO authenticated
  USING (current_user_role() IN ('kepala_sekolah', 'super_admin'));

-- Tindak Lanjut Policies
DROP POLICY IF EXISTS "tindak_lanjut_select" ON public.tindak_lanjut;
CREATE POLICY "tindak_lanjut_select" ON public.tindak_lanjut FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tindak_lanjut_insert" ON public.tindak_lanjut;
CREATE POLICY "tindak_lanjut_insert" ON public.tindak_lanjut FOR INSERT TO authenticated
  WITH CHECK (current_user_role() IN ('guru', 'tata_usaha', 'super_admin'));

DROP POLICY IF EXISTS "tindak_lanjut_update" ON public.tindak_lanjut;
CREATE POLICY "tindak_lanjut_update" ON public.tindak_lanjut FOR UPDATE TO authenticated
  USING (pelaksana_id = auth.uid() OR current_user_role() = 'super_admin');

-- Surat Keluar Policies
DROP POLICY IF EXISTS "surat_keluar_select" ON public.surat_keluar;
CREATE POLICY "surat_keluar_select" ON public.surat_keluar FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "surat_keluar_tu_all" ON public.surat_keluar;
CREATE POLICY "surat_keluar_tu_all" ON public.surat_keluar FOR ALL TO authenticated
  USING (current_user_role() IN ('super_admin', 'tata_usaha'));

DROP POLICY IF EXISTS "surat_keluar_kepsek_update" ON public.surat_keluar;
CREATE POLICY "surat_keluar_kepsek_update" ON public.surat_keluar FOR UPDATE TO authenticated
  USING (current_user_role() IN ('kepala_sekolah', 'super_admin'));

-- Activity Logs Policies
DROP POLICY IF EXISTS "activity_logs_select" ON public.activity_logs;
CREATE POLICY "activity_logs_select" ON public.activity_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "activity_logs_insert" ON public.activity_logs;
CREATE POLICY "activity_logs_insert" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- 12. INITIAL SEED DATA (DATA AWAL SDN 1 KEDEN)
-- ============================================================

-- Inisialisasi profil sekolah
INSERT INTO public.school_profile (
  nama_sekolah, npsn, nss, alamat, desa, kecamatan, kabupaten, provinsi, kode_pos, telepon, email, website, kepala_sekolah, nip_kepala_sekolah
) VALUES (
  'SD NEGERI 1 KEDEN',
  '20309531',
  '101030908001',
  'Kauman RT 04 / RW 02, Desa Keden',
  'Keden',
  'Pedan',
  'Kabupaten Klaten',
  'Jawa Tengah',
  '57468',
  '(0272) 898123',
  'sdnegeri1keden@gmail.com',
  'https://sdn1keden.sch.id',
  'Harjoko, S.Pd, M.Pd',
  '199101192019031006'
) ON CONFLICT DO NOTHING;

-- Inisialisasi Master Kode Klasifikasi Surat Dinas
INSERT INTO public.klasifikasi_surat (kode, nama, kategori, keterangan) VALUES
  ('005', 'Undangan Kedinasan', 'Umum', 'Surat undangan pertemuan resmi, rakor, seminar'),
  ('400.3.5', 'Pendidikan Dasar & Pembinaan SD', 'Pendidikan', 'Klasifikasi urusan pembinaan sekolah dasar dan agenda persuratan dinas SD'),
  ('420', 'Pendidikan (Umum)', 'Pendidikan', 'Kebijakan umum bidang pendidikan'),
  ('421.1', 'Kurikulum & Pembelajaran', 'Pendidikan', 'Kalender akademik, silabus, asesmen kurikulum merdeka'),
  ('421.2', 'Kesiswaan & Lomba', 'Pendidikan', 'Kesiswaan, ekstrakurikuler, OSN, FLS2N, O2SN'),
  ('421.3', 'Ketenagaan & Kepegawaian Guru', 'Kepegawaian', 'Pelatihan guru, PKG, pembagian tugas guru'),
  ('421.4', 'Sarana & Prasarana Sekolah', 'Sarpras', 'Rehabilitasi gedung, inventaris, pengadaan TIK'),
  ('422', 'Administrasi Sekolah', 'Administrasi', 'Kelengkapan administrasi dan tata persuratan'),
  ('800', 'Kepegawaian', 'Kepegawaian', 'Mutasi, kenaikan pangkat, cuti, surat pengantar KGB'),
  ('900', 'Keuangan & Dana BOS', 'Keuangan', 'Pengelolaan anggaran, RKAS, SPJ dana BOS sekolah')
ON CONFLICT (kode) DO NOTHING;
`;
