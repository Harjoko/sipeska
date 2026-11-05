import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  SuratMasuk,
  SuratKeluar,
  Disposisi,
  TindakLanjut,
} from './types';
import { storeService } from './lib/supabase';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SuratMasukView } from './components/SuratMasukView';
import { DisposisiView } from './components/DisposisiView';
import { DisposisiModal } from './components/DisposisiModal';
import { TindakLanjutView } from './components/TindakLanjutView';
import { SuratKeluarView } from './components/SuratKeluarView';
import { BukuAgendaView } from './components/BukuAgendaView';
import { KlasifikasiView } from './components/KlasifikasiView';
import { PengaturanView } from './components/PengaturanView';
import { PrintModal, PrintDocumentType } from './components/PrintModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(storeService.getCurrentUser());
  const [suratMasukList, setSuratMasukList] = useState<SuratMasuk[]>(storeService.getSuratMasuk());
  const [suratKeluarList, setSuratKeluarList] = useState<SuratKeluar[]>(storeService.getSuratKeluar());
  const [disposisiList, setDisposisiList] = useState<Disposisi[]>(storeService.getDisposisi());
  const [tindakLanjutList, setTindakLanjutList] = useState<TindakLanjut[]>(storeService.getTindakLanjut());

  // Navigation & UI States
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [disposisiSuratTarget, setDisposisiSuratTarget] = useState<SuratMasuk | null>(null);
  const [isInputSuratMasukOpen, setIsInputSuratMasukOpen] = useState<boolean>(false);
  const [isInputSuratKeluarOpen, setIsInputSuratKeluarOpen] = useState<boolean>(false);

  // Print Modal State
  const [printState, setPrintState] = useState<{
    isOpen: boolean;
    type: PrintDocumentType;
    suratMasuk?: SuratMasuk;
    disposisi?: Disposisi;
    suratKeluar?: SuratKeluar;
    customData?: any;
  }>({
    isOpen: false,
    type: 'lembar_disposisi',
  });

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = storeService.subscribe(() => {
      setCurrentUser(storeService.getCurrentUser());
      setSuratMasukList(storeService.getSuratMasuk());
      setSuratKeluarList(storeService.getSuratKeluar());
      setDisposisiList(storeService.getDisposisi());
      setTindakLanjutList(storeService.getTindakLanjut());
    });
    return () => unsubscribe();
  }, []);

  // Stats for badge counters
  const pendingDisposisiCount = suratMasukList.filter(
    (s) => s.status === 'Baru Diterima' || s.status === 'Menunggu Disposisi'
  ).length;

  const pendingTindakLanjutCount = suratMasukList.filter(
    (s) => s.status === 'Sudah Didisposisikan' || s.status === 'Dalam Tindak Lanjut'
  ).length;

  const pendingSuratKeluarCount = suratKeluarList.filter(
    (s) => s.status === 'Menunggu Pengesahan' || s.status === 'Draft'
  ).length;

  // Handlers
  const handleOpenDisposisiModal = (surat: SuratMasuk) => {
    setDisposisiSuratTarget(surat);
  };

  const handlePrintDisposisi = (surat: SuratMasuk, disp?: Disposisi) => {
    setPrintState({
      isOpen: true,
      type: 'lembar_disposisi',
      suratMasuk: surat,
      disposisi: disp,
    });
  };

  const handlePrintSuratKeluar = (surat: SuratKeluar) => {
    setPrintState({
      isOpen: true,
      type: 'surat_keluar',
      suratKeluar: surat,
    });
  };

  const handlePrintCustomDocument = (
    type: 'agenda_masuk' | 'agenda_keluar',
    customData: any
  ) => {
    setPrintState({
      isOpen: true,
      type,
      customData,
    });
  };

  const handleQuickPrint = () => {
    setCurrentTab('buku_agenda');
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        stats={{
          pendingDisposisiCount,
          pendingTindakLanjutCount,
          pendingSuratKeluarCount,
          suratMasukTotal: suratMasukList.length,
        }}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 transition-all">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobile={() => setIsMobileOpen(true)}
          currentUser={currentUser}
          onQuickPrint={handleQuickPrint}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              suratMasukList={suratMasukList}
              suratKeluarList={suratKeluarList}
              disposisiList={disposisiList}
              tindakLanjutList={tindakLanjutList}
              onNavigateTab={setCurrentTab}
              onOpenInputSuratMasuk={() => {
                setCurrentTab('surat_masuk');
                setIsInputSuratMasukOpen(true);
              }}
              onOpenInputSuratKeluar={() => {
                setCurrentTab('surat_keluar');
                setIsInputSuratKeluarOpen(true);
              }}
              onOpenDisposisiModal={handleOpenDisposisiModal}
            />
          )}

          {currentTab === 'surat_masuk' && (
            <SuratMasukView
              currentUser={currentUser}
              suratList={suratMasukList}
              disposisiList={disposisiList}
              tindakLanjutList={tindakLanjutList}
              onOpenDisposisiModal={handleOpenDisposisiModal}
              onPrintDisposisi={handlePrintDisposisi}
              externalSearchQuery={searchQuery}
              isCreateModalOpen={isInputSuratMasukOpen}
              setIsCreateModalOpen={setIsInputSuratMasukOpen}
            />
          )}

          {currentTab === 'disposisi' && (
            <DisposisiView
              currentUser={currentUser}
              suratMasukList={suratMasukList}
              disposisiList={disposisiList}
              tindakLanjutList={tindakLanjutList}
              onOpenDisposisiModal={handleOpenDisposisiModal}
              onPrintDisposisi={handlePrintDisposisi}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'tindak_lanjut' && (
            <TindakLanjutView
              currentUser={currentUser}
              suratMasukList={suratMasukList}
              disposisiList={disposisiList}
              tindakLanjutList={tindakLanjutList}
            />
          )}

          {currentTab === 'surat_keluar' && (
            <SuratKeluarView
              currentUser={currentUser}
              suratKeluarList={suratKeluarList}
              onPrintSuratKeluar={handlePrintSuratKeluar}
              externalSearchQuery={searchQuery}
              isCreateModalOpen={isInputSuratKeluarOpen}
              setIsCreateModalOpen={setIsInputSuratKeluarOpen}
            />
          )}

          {currentTab === 'buku_agenda' && (
            <BukuAgendaView
              currentUser={currentUser}
              suratMasukList={suratMasukList}
              suratKeluarList={suratKeluarList}
              disposisiList={disposisiList}
              onPrintDisposisi={handlePrintDisposisi}
              onPrintCustomDocument={handlePrintCustomDocument}
            />
          )}

          {currentTab === 'klasifikasi' && (
            <KlasifikasiView currentUser={currentUser} />
          )}

          {currentTab === 'pengaturan' && (
            <PengaturanView currentUser={currentUser} />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/70 py-4 px-6 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>
              <strong>SIPESKA</strong> — Sistem Informasi Persuratan SD Negeri 1 Keden
            </span>
            <span className="text-[11px] text-slate-400">
              Kauman RT 04/RW 02, Desa Keden, Kec. Pedan, Kab. Klaten, Jawa Tengah
            </span>
          </div>
        </footer>
      </div>

      {/* DISPOSISI MODAL (When triggered by Kepala Sekolah) */}
      {disposisiSuratTarget && (
        <DisposisiModal
          surat={disposisiSuratTarget}
          isOpen={Boolean(disposisiSuratTarget)}
          onClose={() => setDisposisiSuratTarget(null)}
          onSuccess={(newDisp) => {
            setDisposisiList(storeService.getDisposisi());
            setSuratMasukList(storeService.getSuratMasuk());
          }}
          onPrintDirect={(surat, disp) => handlePrintDisposisi(surat, disp)}
        />
      )}

      {/* PRINT MODAL (High-Fidelity Document Printing) */}
      {printState.isOpen && (
        <PrintModal
          isOpen={printState.isOpen}
          onClose={() => setPrintState({ ...printState, isOpen: false })}
          documentType={printState.type}
          suratMasuk={printState.suratMasuk}
          disposisi={printState.disposisi}
          suratKeluar={printState.suratKeluar}
          customData={printState.customData}
        />
      )}
    </div>
  );
}
