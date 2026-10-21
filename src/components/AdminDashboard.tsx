'use client';

import React, { useState } from 'react';
import { EventItem, Participant, Prize, Winner } from '@/types';
import {
  Users,
  Trophy,
  Palette,
  FileSpreadsheet,
  Plus,
  Trash2,
  RefreshCw,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  Save,
  Image,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  events: EventItem[];
  activeEvent: EventItem;
  participants: Participant[];
  prizes: Prize[];
  winners: Winner[];
  onSaveEvent: (event: EventItem) => Promise<void>;
  onCreateNewEvent: (name: string, description: string) => Promise<void>;
  onImportParticipants: (newParticipants: Omit<Participant, 'id' | 'is_winner' | 'created_at'>[]) => Promise<void>;
  onAddParticipant: (participant: Omit<Participant, 'id' | 'is_winner' | 'created_at'>) => Promise<void>;
  onDeleteParticipant: (id: string) => Promise<void>;
  onClearParticipants: () => Promise<void>;
  onResetParticipantsStatus: () => Promise<void>;
  onReset74Prizes: () => Promise<void>;
  onUpdatePrize: (updatedPrizes: Prize[]) => Promise<void>;
  onResetAllDraws: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  events,
  activeEvent,
  participants,
  prizes,
  winners,
  onSaveEvent,
  onCreateNewEvent,
  onImportParticipants,
  onAddParticipant,
  onDeleteParticipant,
  onClearParticipants,
  onResetParticipantsStatus,
  onReset74Prizes,
  onUpdatePrize,
  onResetAllDraws,
}) => {
  const [activeTab, setActiveTab] = useState<'participants' | 'prizes' | 'theme' | 'danger'>('participants');

  // New participant form state
  const [newPartName, setNewPartName] = useState('');
  const [newPartTicket, setNewPartTicket] = useState('');
  const [newPartDept, setNewPartDept] = useState('');

  // Event form state
  const [eventForm, setEventForm] = useState<EventItem>({ ...activeEvent });

  // New Event Modal state
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Participant search & filter
  const [partSearch, setPartSearch] = useState('');
  const [partStatusFilter, setPartStatusFilter] = useState<'all' | 'unwon' | 'won'>('all');

  // Wallpaper presets
  const WALLPAPER_PRESETS = [
    {
      name: 'Emas Mewah (Gold Gala)',
      url: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&w=1920&q=80',
    },
    {
      name: 'Biru Diraja (Royal Blue)',
      url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80',
    },
    {
      name: 'Zamrud Gemilang (Emerald Night)',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
    },
    {
      name: 'Merah Eksklusif (Crimson VIP)',
      url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80',
    },
  ];

  // Handle CSV Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 1) return;

      const newItems: Omit<Participant, 'id' | 'is_winner' | 'created_at'>[] = [];
      // Check if first row is header
      const startIndex = lines[0].toLowerCase().includes('nama') || lines[0].toLowerCase().includes('name') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        // Support comma or tab separated
        const cols = lines[i].split(/[,\t]/).map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length >= 2) {
          // Format: Nama, No Tiket, Jabatan (optional)
          const name = cols[0];
          const ticket = cols[1];
          const dept = cols[2] || 'Umum';

          if (name && ticket) {
            newItems.push({
              event_id: activeEvent.id,
              name,
              ticket_number: ticket,
              department: dept,
            });
          }
        }
      }

      if (newItems.length > 0) {
        await onImportParticipants(newItems);
        alert(`Berjaya import ${newItems.length} peserta baharu!`);
      } else {
        alert('Format CSV tidak sah. Sila pastikan format: Nama, No Tiket, Jabatan');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Download Sample CSV
  const handleDownloadSampleCSV = () => {
    const sample = 'Nama,No Tiket,Jabatan\nAhmad Ridzuan,TK-2001,Teknologi Maklumat\nSiti Nurhaliza,TK-2002,Sumber Manusia\nTan Wei Liang,TK-2003,Kewangan\nPravin Kumar,TK-2004,Operasi';
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contoh_peserta_cabutan.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle Add Participant Manually
  const handleAddSinglePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName || !newPartTicket) {
      alert('Sila masukkan Nama dan No. Tiket peserta.');
      return;
    }
    await onAddParticipant({
      event_id: activeEvent.id,
      name: newPartName,
      ticket_number: newPartTicket,
      department: newPartDept || 'Umum',
    });
    setNewPartName('');
    setNewPartTicket('');
    setNewPartDept('');
  };

  // Filtered Participants
  const filteredParts = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
      p.ticket_number.toLowerCase().includes(partSearch.toLowerCase()) ||
      p.department.toLowerCase().includes(partSearch.toLowerCase());

    const matchesStatus =
      partStatusFilter === 'all' ||
      (partStatusFilter === 'unwon' && !p.is_winner) ||
      (partStatusFilter === 'won' && p.is_winner);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-[calc(100vh-61px)] w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-white">
      {/* Title & Quick Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-yellow-400 font-bold text-xs uppercase tracking-wider mb-1">
            Pusat Kawalan & Pengurusan
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Admin Dashboard: {activeEvent.name}
          </h2>
        </div>

        <button
          onClick={() => setShowNewEventModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-yellow-500/20 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cipta Majlis / Program Baharu</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 mb-8">
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'participants'
              ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Peserta ({participants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prizes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'prizes'
              ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Senarai Hadiah ({prizes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'theme'
              ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Tetapan Acara & Tema</span>
        </button>

        <button
          onClick={() => setActiveTab('danger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'danger'
              ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-red-400'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Reset & Penyelenggaraan</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PENGURUSAN PESERTA                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'participants' && (
        <div className="space-y-8">
          {/* Top action cards: CSV Import & Add Single */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CSV / Excel Importer Card */}
            <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <span>Import Senarai Peserta (CSV / Excel)</span>
                  </h3>
                  <button
                    onClick={handleDownloadSampleCSV}
                    className="text-xs text-yellow-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Contoh CSV
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Muat naik fail CSV dengan susunan kolum: <code>Nama, No Tiket, Jabatan</code>
                </p>
              </div>

              <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-yellow-400/80 rounded-xl cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-all">
                <Upload className="w-8 h-8 text-yellow-400 mb-2 animate-bounce" />
                <span className="text-sm font-bold text-slate-200">Klik untuk Pilih Fail CSV</span>
                <span className="text-xs text-slate-500 mt-1">.csv, .txt (Comma Separated)</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Add Single Participant Form */}
            <div className="p-6 rounded-2xl glass-panel border border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2 mb-3">
                <Plus className="w-5 h-5 text-yellow-400" />
                <span>Tambah Peserta Secara Manual</span>
              </h3>
              <form onSubmit={handleAddSinglePart} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Penuh</label>
                  <input
                    type="text"
                    placeholder="Contoh: Muhammad Ammar bin Roslan"
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">No. Tiket / Matrik</label>
                    <input
                      type="text"
                      placeholder="Contoh: TK-1099"
                      value={newPartTicket}
                      onChange={(e) => setNewPartTicket(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Jabatan / Bahagian</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kewangan"
                      value={newPartDept}
                      onChange={(e) => setNewPartDept(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all mt-2"
                >
                  Tambah Peserta
                </button>
              </form>
            </div>
          </div>

          {/* Participant Table with Filter & Search */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Cari nama, tiket, jabatan..."
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-yellow-400 focus:outline-none w-64"
                />

                <select
                  value={partStatusFilter}
                  onChange={(e) => setPartStatusFilter(e.target.value as 'all' | 'unwon' | 'won')}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="unwon">Belum Menang Sahaja</option>
                  <option value="won">Sudah Menang Sahaja</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={onResetParticipantsStatus}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Reset Status Semua
                </button>
                <button
                  onClick={onClearParticipants}
                  className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 font-medium border border-red-800"
                >
                  Padam Semua Peserta
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-400 sticky top-0 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">Bil</th>
                    <th className="py-2.5 px-3">No. Tiket</th>
                    <th className="py-2.5 px-3">Nama</th>
                    <th className="py-2.5 px-3">Jabatan</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredParts.length > 0 ? (
                    filteredParts.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-xs">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-yellow-400">{p.ticket_number}</td>
                        <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                        <td className="py-2.5 px-3 text-slate-400">{p.department}</td>
                        <td className="py-2.5 px-3">
                          {p.is_winner ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Dah Menang
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              Belum Menang
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => onDeleteParticipant(p.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                            title="Padam peserta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Tiada peserta dijumpai. Sila import atau tambah peserta baru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PENGURUSAN HADIAH (74 Hadiah)                                      */}
      {/* ========================================================================= */}
      {activeTab === 'prizes' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-yellow-500/30">
            <div>
              <h3 className="font-bold text-base text-white">Struktur 74 Hadiah Program</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Hadiah 74 - 34: Saguhati (Mod Pukal 10 serentak). Hadiah 33 - 1: Hadiah Utama (Mod 1-by-1 dramatik).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onReset74Prizes}
                className="px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Jana Semula 74 Hadiah Standard</span>
              </button>
            </div>
          </div>

          {/* Quick Bulk Batch Size Setters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="font-semibold text-slate-300">
              Tukar Saiz Cabutan Sekali Klik untuk Semua Hadiah Saguhati (Pukal):
            </span>
            <div className="flex items-center gap-1.5">
              {[5, 10, 15, 20].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    const updated = prizes.map((p) =>
                      p.draw_type === 'batch' ? { ...p, batch_size: size } : p
                    );
                    onUpdatePrize(updated);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-yellow-500 hover:text-slate-950 border border-slate-700 text-yellow-300 font-bold transition-all text-xs"
                >
                  {size} Sekali Klik
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 sticky top-0 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center">Urutan</th>
                    <th className="py-2.5 px-3">Nama Hadiah</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Mod Cabutan</th>
                    <th className="py-2.5 px-3 text-center">Saiz Batch</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {prizes.map((prz) => (
                    <tr key={prz.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-yellow-400">
                        #{prz.rank_order}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {prz.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          prz.category === 'Hadiah Utama'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {prz.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={prz.draw_type}
                          onChange={(e) => {
                            const newType = e.target.value as 'batch' | 'single';
                            const updated = prizes.map((p) =>
                              p.id === prz.id
                                ? { ...p, draw_type: newType, batch_size: newType === 'single' ? 1 : Math.max(2, p.batch_size) }
                                : p
                            );
                            onUpdatePrize(updated);
                          }}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-yellow-400"
                        >
                          <option value="single">Individu (Single)</option>
                          <option value="batch">Pukal (Batch)</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {prz.draw_type === 'batch' ? (
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={prz.batch_size}
                            onChange={(e) => {
                              const newSize = Math.max(1, parseInt(e.target.value) || 1);
                              const updated = prizes.map((p) =>
                                p.id === prz.id ? { ...p, batch_size: newSize } : p
                              );
                              onUpdatePrize(updated);
                            }}
                            className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-mono font-bold text-yellow-300 text-xs focus:outline-none focus:border-yellow-400"
                          />
                        ) : (
                          <span className="font-mono text-slate-500 text-xs">1</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {prz.is_drawn ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Selesai
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-400">
                            Belum
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TETAPAN ACARA & TEMA                                                */}
      {/* ========================================================================= */}
      {activeTab === 'theme' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-yellow-400" />
              <span>Kustomisasi Majlis & Paparan Pentas</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Acara / Program</label>
              <input
                type="text"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Penerangan / Tema</label>
              <input
                type="text"
                value={eventForm.description || ''}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">URL Logo Majlis (Pilihan)</label>
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                value={eventForm.logo_url || ''}
                onChange={(e) => setEventForm({ ...eventForm, logo_url: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>

            {/* Wallpaper Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Pilih Gambar Latar Belakang (Stage Wallpaper Preset)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WALLPAPER_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEventForm({ ...eventForm, bg_image_url: p.url })}
                    className={`relative rounded-xl overflow-hidden border-2 p-1 text-left transition-all ${
                      eventForm.bg_image_url === p.url
                        ? 'border-yellow-400 ring-2 ring-yellow-400/30'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className="h-16 w-full rounded-lg bg-cover bg-center mb-1"
                      style={{ backgroundImage: `url(${p.url})` }}
                    />
                    <div className="text-[11px] font-bold text-slate-200 truncate">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Atau Masukkan Custom Wallpaper URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={eventForm.bg_image_url || ''}
                onChange={(e) => setEventForm({ ...eventForm, bg_image_url: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>

            <button
              onClick={() => {
                onSaveEvent(eventForm);
                alert('Tetapan acara berjaya disimpan!');
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-yellow-500/20"
            >
              Simpan Perubahan Tema
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RESET & DANGER ZONE                                                */}
      {/* ========================================================================= */}
      {activeTab === 'danger' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-4">
            <h3 className="font-bold text-lg text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Zon Keselamatan & Tetapan Semula (Reset Data)</span>
            </h3>
            <p className="text-xs text-slate-300">
              Gunakan fungsi di bawah untuk memulakan majlis baharu atau mengulangi sesi cabutan.
            </p>

            <div className="pt-4 space-y-3">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">Reset Semua Cabutan (Clear Winners)</div>
                  <div className="text-xs text-slate-400">Padam semua pemenang dan buka semula semua hadiah.</div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Pasti ingin padam semua rekod pemenang dan reset cabutan?')) {
                      onResetAllDraws();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Reset Cabutan
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">Kosongkan Semua Peserta</div>
                  <div className="text-xs text-slate-400">Padam seluruh senarai peserta majlis ini.</div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('AMARAN: Anda pasti ingin memadam semua peserta? Tindakan ini tidak boleh dikembalikan.')) {
                      onClearParticipants();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Padam Peserta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Event */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950 border border-yellow-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <span>Cipta Program / Majlis Baharu</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Majlis</label>
              <input
                type="text"
                placeholder="Contoh: Majlis Anugerah Cemerlang 2026"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Penerangan Ringkas</label>
              <input
                type="text"
                placeholder="Contoh: Malam Penghargaan Warga Kerja"
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewEventModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!newEventName) return;
                  await onCreateNewEvent(newEventName, newEventDesc);
                  setShowNewEventModal(false);
                  setNewEventName('');
                  setNewEventDesc('');
                }}
                className="px-5 py-2 rounded-xl bg-yellow-500 text-slate-950 font-bold text-xs"
              >
                Cipta Majlis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
