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
  Sparkles,
  Pencil,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowDownUp
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
  onUpdateParticipant: (participant: Participant) => Promise<void>;
  onDeleteParticipant: (id: string) => Promise<void>;
  onClearParticipants: () => Promise<void>;
  onResetParticipantsStatus: () => Promise<void>;
  onBulkDeleteParticipants?: (ids: string[]) => Promise<void>;
  onBulkUpdateParticipantsStatus?: (ids: string[], isWinner: boolean) => Promise<void>;
  onReset74Prizes: () => Promise<void>;
  onAddPrize: (prize: Omit<Prize, 'id' | 'is_drawn' | 'created_at'>) => Promise<void>;
  onDeletePrize: (id: string) => Promise<void>;
  onBulkDeletePrizes?: (prizeIds: string[]) => Promise<void>;
  onBulkUpdatePrizes?: (prizeIds: string[], updates: Partial<Prize>) => Promise<void>;
  onClearAllPrizes: () => Promise<void>;
  onGenerateCustomPrizes: (total: number, grand: number, batch: number) => Promise<void>;
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
  onUpdateParticipant,
  onDeleteParticipant,
  onClearParticipants,
  onResetParticipantsStatus,
  onBulkDeleteParticipants,
  onBulkUpdateParticipantsStatus,
  onReset74Prizes,
  onAddPrize,
  onDeletePrize,
  onBulkDeletePrizes,
  onBulkUpdatePrizes,
  onClearAllPrizes,
  onGenerateCustomPrizes,
  onUpdatePrize,
  onResetAllDraws,
}) => {
  const [activeTab, setActiveTab] = useState<'participants' | 'prizes' | 'theme' | 'danger'>('participants');

  // Bulk selection states
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [selectedPrizeIds, setSelectedPrizeIds] = useState<string[]>([]);

  // Custom prize modals state
  const [showAddPrizeModal, setShowAddPrizeModal] = useState(false);
  const [showCustomGenModal, setShowCustomGenModal] = useState(false);

  // New Prize Form
  const [prizeName, setPrizeName] = useState('');
  const [prizeCategory, setPrizeCategory] = useState('Hadiah Utama');
  const [prizeRank, setPrizeRank] = useState(1);
  const [prizeDrawType, setPrizeDrawType] = useState<'single' | 'batch'>('single');
  const [prizeBatchSize, setPrizeBatchSize] = useState(1);
  const [prizeImageUrl, setPrizeImageUrl] = useState('');

  // Custom Prize Generator
  const [genTotal, setGenTotal] = useState(30);
  const [genGrand, setGenGrand] = useState(5);
  const [genBatch, setGenBatch] = useState(5);

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

  // Participant sorting state
  const [partSortField, setPartSortField] = useState<'ticket' | 'name' | 'department' | 'status'>('ticket');
  const [partSortDirection, setPartSortDirection] = useState<'asc' | 'desc'>('asc');

  // Prize sorting state
  const [prizeSortField, setPrizeSortField] = useState<'rank' | 'name' | 'category' | 'mode' | 'batch' | 'status'>('rank');
  const [prizeSortDirection, setPrizeSortDirection] = useState<'asc' | 'desc'>('asc');

  // Edit Participant Modal state
  const [showEditPartModal, setShowEditPartModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editPartName, setEditPartName] = useState('');
  const [editPartTicket, setEditPartTicket] = useState('');
  const [editPartDept, setEditPartDept] = useState('');
  const [editPartIsWinner, setEditPartIsWinner] = useState(false);
  const [isSavingPart, setIsSavingPart] = useState(false);

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

    const currentMode = activeEvent.participant_mode || 'both';

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 1) return;

      const newItems: Omit<Participant, 'id' | 'is_winner' | 'created_at'>[] = [];
      const firstLineLower = lines[0].toLowerCase();
      const hasHeader =
        firstLineLower.includes('nama') ||
        firstLineLower.includes('name') ||
        firstLineLower.includes('tiket') ||
        firstLineLower.includes('ticket') ||
        firstLineLower.includes('matrik') ||
        firstLineLower.includes('matric') ||
        firstLineLower.includes('no');

      const startIndex = hasHeader ? 1 : 0;
      let startTicketNum = participants.length + 1;

      for (let i = startIndex; i < lines.length; i++) {
        const rawLine = lines[i].trim();
        if (!rawLine) continue;

        // Support comma or tab separated
        const cols = rawLine.split(/[,\t]/).map((c) => c.replace(/^["']|["']$/g, '').trim());

        let name = '';
        let ticket = '';
        let dept = '';

        if (currentMode === 'name_only') {
          // If only 1 col: Nama
          // If 2 cols: Nama, Jabatan
          // If 3 cols: Nama, No Tiket, Jabatan
          name = cols[0] || '';
          if (cols.length === 2) {
            dept = cols[1] || '';
          } else if (cols.length >= 3) {
            ticket = cols[1] || '';
            dept = cols[2] || '';
          }

          if (!name) {
            alert(`Ralat pada Baris ${i + 1}: Nama tidak dijumpai. Dalam mod "Nama Sahaja", semua peserta WAJIB mempunyai Nama Penuh!`);
            e.target.value = '';
            return;
          }

          if (!ticket) {
            ticket = `TK-${String(startTicketNum++).padStart(4, '0')}`;
          }
        } else if (currentMode === 'ticket_only') {
          // If only 1 col: No Tiket/Matrik
          // If 2 cols: No Tiket, Jabatan
          // If 3 cols: No Tiket, Nama, Jabatan
          ticket = cols[0] || '';
          if (cols.length === 2) {
            dept = cols[1] || '';
          } else if (cols.length >= 3) {
            name = cols[1] || '';
            dept = cols[2] || '';
          }

          if (!ticket) {
            alert(`Ralat pada Baris ${i + 1}: No. Tiket / Matrik tidak dijumpai. Dalam mod "No. Tiket / Matrik Sahaja", semua peserta WAJIB mempunyai No. Tiket / Matrik!`);
            e.target.value = '';
            return;
          }

          if (!name) {
            name = ticket;
          }
        } else {
          // Mode 'both'
          if (cols.length === 1) {
            alert(`Ralat pada Baris ${i + 1}: Format tidak lengkap. Dalam mod "Nama & No. Tiket", kedua-duanya wajib diisi!`);
            e.target.value = '';
            return;
          }
          name = cols[0] || '';
          ticket = cols[1] || '';
          dept = cols[2] || '';

          if (!name || !ticket) {
            alert(`Ralat pada Baris ${i + 1}: Sila pastikan kedua-dua Nama dan No. Tiket diisi! (Jabatan/Bahagian adalah pilihan).`);
            e.target.value = '';
            return;
          }
        }

        newItems.push({
          event_id: activeEvent.id,
          name,
          ticket_number: ticket,
          department: dept, // Bahagian adalah pilihan!
        });
      }

      if (newItems.length > 0) {
        await onImportParticipants(newItems);
        alert(`Berjaya import ${newItems.length} peserta baharu!`);
      } else {
        alert('Format CSV tidak sah atau tiada data.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Download Sample CSV according to current participant mode
  const handleDownloadSampleCSV = () => {
    const currentMode = activeEvent.participant_mode || 'both';
    let sample = '';
    if (currentMode === 'name_only') {
      sample = 'Nama,Jabatan\nAhmad Ridzuan bin Ismail,Teknologi Maklumat\nSiti Nurhaliza binti Ramli,Sumber Manusia\nTan Wei Liang,\nPravin Kumar a/l Raman,';
    } else if (currentMode === 'ticket_only') {
      sample = 'No Tiket / Matrik,Jabatan\nTK-2001,Teknologi Maklumat\nTK-2002,Sumber Manusia\nA198273,\nKUPON-088,';
    } else {
      sample = 'Nama,No Tiket,Jabatan\nAhmad Ridzuan bin Ismail,TK-2001,Teknologi Maklumat\nSiti Nurhaliza binti Ramli,TK-2002,Sumber Manusia\nTan Wei Liang,TK-2003,\nPravin Kumar a/l Raman,TK-2004,';
    }

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contoh_peserta_${currentMode}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle Add Participant Manually
  const handleAddSinglePart = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMode = activeEvent.participant_mode || 'both';
    let name = newPartName.trim();
    let ticket = newPartTicket.trim();
    const dept = newPartDept.trim();

    if (currentMode === 'name_only') {
      if (!name) {
        alert('Sila masukkan Nama Penuh peserta (Wajib).');
        return;
      }
      if (!ticket) {
        ticket = `TK-${String(participants.length + 1).padStart(4, '0')}`;
      }
    } else if (currentMode === 'ticket_only') {
      if (!ticket) {
        alert('Sila masukkan No. Tiket / No. Matrik peserta (Wajib).');
        return;
      }
      if (!name) {
        name = ticket;
      }
    } else {
      if (!name || !ticket) {
        alert('Sila masukkan kedua-dua Nama dan No. Tiket peserta (Wajib).');
        return;
      }
    }

    await onAddParticipant({
      event_id: activeEvent.id,
      name,
      ticket_number: ticket,
      department: dept,
    });
    setNewPartName('');
    setNewPartTicket('');
    setNewPartDept('');
  };

  const handleOpenEditPart = (p: Participant) => {
    setEditingParticipant(p);
    setEditPartName(p.name || '');
    setEditPartTicket(p.ticket_number || '');
    setEditPartDept(p.department || '');
    setEditPartIsWinner(p.is_winner);
    setShowEditPartModal(true);
  };

  const handleSaveEditPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;

    let name = editPartName.trim();
    let ticket = editPartTicket.trim();
    const dept = editPartDept.trim();
    const currentMode = activeEvent.participant_mode || 'both';

    if (currentMode === 'name_only') {
      if (!name) {
        alert('Sila masukkan Nama Penuh peserta (Wajib).');
        return;
      }
      if (!ticket) {
        ticket = editingParticipant.ticket_number || `TK-${String(editingParticipant.id).slice(0, 4)}`;
      }
    } else if (currentMode === 'ticket_only') {
      if (!ticket) {
        alert('Sila masukkan No. Tiket / No. Matrik peserta (Wajib).');
        return;
      }
      if (!name) {
        name = ticket;
      }
    } else {
      if (!name || !ticket) {
        alert('Sila masukkan kedua-dua Nama dan No. Tiket peserta (Wajib).');
        return;
      }
    }

    setIsSavingPart(true);
    try {
      await onUpdateParticipant({
        ...editingParticipant,
        name,
        ticket_number: ticket,
        department: dept,
        is_winner: editPartIsWinner,
      });
      setShowEditPartModal(false);
      setEditingParticipant(null);
    } catch (err) {
      console.error('Error updating participant:', err);
      alert('Ralat semasa mengemaskini maklumat peserta.');
    } finally {
      setIsSavingPart(false);
    }
  };

  // Filtered & Sorted Participants
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

  const sortedParts = [...filteredParts].sort((a, b) => {
    let result = 0;
    if (partSortField === 'ticket') {
      result = (a.ticket_number || '').localeCompare(b.ticket_number || '', undefined, { numeric: true, sensitivity: 'base' });
    } else if (partSortField === 'name') {
      result = (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' });
    } else if (partSortField === 'department') {
      result = (a.department || '').localeCompare(b.department || '', undefined, { numeric: true, sensitivity: 'base' });
    } else if (partSortField === 'status') {
      result = Number(a.is_winner) - Number(b.is_winner);
    }
    return partSortDirection === 'asc' ? result : -result;
  });

  const togglePartSort = (field: 'ticket' | 'name' | 'department' | 'status') => {
    if (partSortField === field) {
      setPartSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setPartSortField(field);
      setPartSortDirection('asc');
    }
  };

  const renderPartSortIndicator = (field: 'ticket' | 'name' | 'department' | 'status') => {
    if (partSortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 inline ml-1 group-hover:text-slate-400 transition-colors" />;
    }
    return partSortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-yellow-400 inline ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-yellow-400 inline ml-1" />
    );
  };

  // Sorted Prizes
  const sortedPrizes = [...prizes].sort((a, b) => {
    let result = 0;
    if (prizeSortField === 'rank') {
      result = (a.rank_order || 0) - (b.rank_order || 0);
    } else if (prizeSortField === 'name') {
      result = (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' });
    } else if (prizeSortField === 'category') {
      result = (a.category || '').localeCompare(b.category || '', undefined, { numeric: true, sensitivity: 'base' });
    } else if (prizeSortField === 'mode') {
      result = (a.draw_type || '').localeCompare(b.draw_type || '');
    } else if (prizeSortField === 'batch') {
      result = (a.batch_size || 0) - (b.batch_size || 0);
    } else if (prizeSortField === 'status') {
      result = Number(a.is_drawn) - Number(b.is_drawn);
    }
    return prizeSortDirection === 'asc' ? result : -result;
  });

  const togglePrizeSort = (field: 'rank' | 'name' | 'category' | 'mode' | 'batch' | 'status') => {
    if (prizeSortField === field) {
      setPrizeSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setPrizeSortField(field);
      setPrizeSortDirection('asc');
    }
  };

  const renderPrizeSortIndicator = (field: 'rank' | 'name' | 'category' | 'mode' | 'batch' | 'status') => {
    if (prizeSortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 inline ml-1 group-hover:text-slate-400 transition-colors" />;
    }
    return prizeSortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-yellow-400 inline ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-yellow-400 inline ml-1" />
    );
  };

  // Participant bulk actions
  const handleToggleSelectPart = (id: string) => {
    setSelectedPartIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllParts = () => {
    if (selectedPartIds.length === sortedParts.length) {
      setSelectedPartIds([]);
    } else {
      setSelectedPartIds(sortedParts.map((p) => p.id));
    }
  };

  const handleExecuteBulkDeleteParts = async () => {
    if (selectedPartIds.length === 0) return;
    if (!confirm(`Pasti ingin memadam ${selectedPartIds.length} peserta yang dipilih?`)) return;
    if (onBulkDeleteParticipants) {
      await onBulkDeleteParticipants(selectedPartIds);
    } else {
      for (const id of selectedPartIds) {
        await onDeleteParticipant(id);
      }
    }
    setSelectedPartIds([]);
  };

  const handleExecuteBulkUpdatePartsStatus = async (isWinner: boolean) => {
    if (selectedPartIds.length === 0) return;
    const label = isWinner ? 'Sudah Menang' : 'Belum Menang';
    if (!confirm(`Tukar status ${selectedPartIds.length} peserta terpilih kepada "${label}"?`)) return;
    if (onBulkUpdateParticipantsStatus) {
      await onBulkUpdateParticipantsStatus(selectedPartIds, isWinner);
    } else {
      for (const id of selectedPartIds) {
        const found = participants.find((p) => p.id === id);
        if (found) {
          await onUpdateParticipant({ ...found, is_winner: isWinner });
        }
      }
    }
    setSelectedPartIds([]);
  };

  // Prize bulk actions
  const handleToggleSelectPrize = (id: string) => {
    setSelectedPrizeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllPrizes = () => {
    if (selectedPrizeIds.length === sortedPrizes.length) {
      setSelectedPrizeIds([]);
    } else {
      setSelectedPrizeIds(sortedPrizes.map((p) => p.id));
    }
  };

  const handleExecuteBulkDeletePrizes = async () => {
    if (selectedPrizeIds.length === 0) return;
    if (!confirm(`Pasti ingin memadam ${selectedPrizeIds.length} hadiah yang dipilih?`)) return;
    if (onBulkDeletePrizes) {
      await onBulkDeletePrizes(selectedPrizeIds);
    } else {
      for (const id of selectedPrizeIds) {
        await onDeletePrize(id);
      }
    }
    setSelectedPrizeIds([]);
  };

  const handleExecuteBulkUpdatePrizes = async (updates: Partial<Prize>) => {
    if (selectedPrizeIds.length === 0) return;
    if (onBulkUpdatePrizes) {
      await onBulkUpdatePrizes(selectedPrizeIds, updates);
    } else {
      const idSet = new Set(selectedPrizeIds);
      const updated = prizes.map((p) => (idSet.has(p.id) ? { ...p, ...updates } : p));
      await onUpdatePrize(updated);
    }
    setSelectedPrizeIds([]);
  };

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
        <div className="space-y-6">
          {/* Format Pengecam Peserta (Dynamic Participant Identifier Mode) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-yellow-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-black/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold text-sm">Mod Format Pengenalan Peserta:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  Dinamik
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Tentukan format wajib untuk majlis ini. Kolum <strong>Jabatan/Bahagian sentiasa pilihan (tidak wajib)</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={async () => {
                  const updated = { ...activeEvent, participant_mode: 'both' as const };
                  await onSaveEvent(updated);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  (activeEvent.participant_mode || 'both') === 'both'
                    ? 'bg-yellow-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Nama & No. Tiket
              </button>
              <button
                type="button"
                onClick={async () => {
                  const updated = { ...activeEvent, participant_mode: 'name_only' as const };
                  await onSaveEvent(updated);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeEvent.participant_mode === 'name_only'
                    ? 'bg-yellow-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Nama Sahaja (Wajib Nama)
              </button>
              <button
                type="button"
                onClick={async () => {
                  const updated = { ...activeEvent, participant_mode: 'ticket_only' as const };
                  await onSaveEvent(updated);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeEvent.participant_mode === 'ticket_only'
                    ? 'bg-yellow-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                No. Tiket / Matrik (Wajib Tiket)
              </button>
            </div>
          </div>

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
                  {activeEvent.participant_mode === 'name_only'
                    ? 'Format CSV: Kolum 1 WAJIB Nama. (Jabatan/Bahagian adalah pilihan).'
                    : activeEvent.participant_mode === 'ticket_only'
                    ? 'Format CSV: Kolum 1 WAJIB No. Tiket/Matrik. (Jabatan/Bahagian adalah pilihan).'
                    : 'Format CSV: Kolum 1 Nama, Kolum 2 No Tiket (Kedua-dua wajib), Kolum 3 Jabatan (Pilihan).'}
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
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Nama Penuh {activeEvent.participant_mode === 'ticket_only' ? <span className="text-slate-500">(Pilihan)</span> : <span className="text-yellow-400 font-bold">* (Wajib)</span>}
                  </label>
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      No. Tiket / Matrik {activeEvent.participant_mode === 'name_only' ? <span className="text-slate-500">(Pilihan)</span> : <span className="text-yellow-400 font-bold">* (Wajib)</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: TK-1099 atau A198273"
                      value={newPartTicket}
                      onChange={(e) => setNewPartTicket(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Jabatan / Bahagian <span className="text-slate-500">(Pilihan / Tidak Wajib)</span>
                    </label>
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
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Cari nama, tiket, jabatan..."
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-yellow-400 focus:outline-none w-56 sm:w-64"
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

                {/* Participant Sort Selector Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
                  <ArrowDownUp className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                  <span className="text-slate-400 text-[11px] whitespace-nowrap">Susun:</span>
                  <select
                    value={`${partSortField}_${partSortDirection}`}
                    onChange={(e) => {
                      const [field, dir] = e.target.value.split('_') as ['ticket' | 'name' | 'department' | 'status', 'asc' | 'desc'];
                      setPartSortField(field);
                      setPartSortDirection(dir);
                    }}
                    className="bg-slate-950 text-yellow-300 font-bold text-xs px-2 py-1 rounded-lg border border-yellow-500/30 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
                  >
                    <option value="ticket_asc">No. Tiket: Menaik (0-9 / A-Z)</option>
                    <option value="ticket_desc">No. Tiket: Menurun (9-0 / Z-A)</option>
                    <option value="name_asc">Nama: A ➔ Z (Menaik)</option>
                    <option value="name_desc">Nama: Z ➔ A (Menurun)</option>
                    <option value="department_asc">Jabatan: A ➔ Z (Menaik)</option>
                    <option value="department_desc">Jabatan: Z ➔ A (Menurun)</option>
                    <option value="status_asc">Status: Belum Menang Dahulu</option>
                    <option value="status_desc">Status: Sudah Menang Dahulu</option>
                  </select>
                </div>
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

            {/* Participant Bulk Actions Bar */}
            {selectedPartIds.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-slate-900 border border-yellow-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold text-xs border border-yellow-500/30">
                    {selectedPartIds.length} Peserta Dipilih
                  </span>
                  <span className="text-xs text-slate-400">Tindakan pukal:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => handleExecuteBulkUpdatePartsStatus(false)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-bold transition-all"
                    title="Tukar status terpilih kepada belum menang (pemenang berkaitan akan dipadam)"
                  >
                    Tukar: Belum Menang
                  </button>
                  <button
                    onClick={() => handleExecuteBulkUpdatePartsStatus(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700 font-bold transition-all"
                  >
                    Tukar: Sudah Menang
                  </button>
                  <button
                    onClick={handleExecuteBulkDeleteParts}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Padam Terpilih ({selectedPartIds.length})</span>
                  </button>
                  <button
                    onClick={() => setSelectedPartIds([])}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs"
                  >
                    Batal Pilihan
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-400 sticky top-0 uppercase tracking-wider text-[11px] select-none border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={sortedParts.length > 0 && selectedPartIds.length === sortedParts.length}
                        onChange={handleSelectAllParts}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-slate-950 cursor-pointer accent-yellow-400"
                        title="Pilih / Nyahpilih Semua"
                      />
                    </th>
                    <th className="py-2.5 px-3 w-10 text-center text-slate-500">Bil</th>
                    <th
                      onClick={() => togglePartSort('ticket')}
                      className="py-2.5 px-3 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                      title="Klik untuk susun No. Tiket"
                    >
                      <span className="group-hover:text-yellow-400 inline-flex items-center">
                        No. Tiket
                        {renderPartSortIndicator('ticket')}
                      </span>
                    </th>
                    <th
                      onClick={() => togglePartSort('name')}
                      className="py-2.5 px-3 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                      title="Klik untuk susun Nama Peserta (A-Z / Z-A)"
                    >
                      <span className="group-hover:text-yellow-400 inline-flex items-center">
                        Nama
                        {renderPartSortIndicator('name')}
                      </span>
                    </th>
                    <th
                      onClick={() => togglePartSort('department')}
                      className="py-2.5 px-3 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                      title="Klik untuk susun Jabatan / Bahagian"
                    >
                      <span className="group-hover:text-yellow-400 inline-flex items-center">
                        Jabatan
                        {renderPartSortIndicator('department')}
                      </span>
                    </th>
                    <th
                      onClick={() => togglePartSort('status')}
                      className="py-2.5 px-3 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                      title="Klik untuk susun Status Kemenangan"
                    >
                      <span className="group-hover:text-yellow-400 inline-flex items-center">
                        Status
                        {renderPartSortIndicator('status')}
                      </span>
                    </th>
                    <th className="py-2.5 px-3 text-center w-24">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sortedParts.length > 0 ? (
                    sortedParts.map((p, idx) => {
                      const isSelected = selectedPartIds.includes(p.id);
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-900/40 transition-colors ${
                            isSelected ? 'bg-yellow-500/10' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectPart(p.id)}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-slate-950 cursor-pointer accent-yellow-400"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-xs">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-yellow-400">{p.ticket_number || '-'}</td>
                          <td className="py-2.5 px-3 font-semibold text-white">{p.name || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-400">{p.department || '-'}</td>
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
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditPart(p)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-yellow-500/20 text-slate-400 hover:text-yellow-400 transition-colors border border-slate-800 hover:border-yellow-500/40"
                                title="Edit maklumat peserta"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Adakah anda pasti ingin memadam peserta ${p.name || p.ticket_number}?`)) {
                                    onDeleteParticipant(p.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors border border-slate-800 hover:border-red-500/40"
                                title="Padam peserta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
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
      {/* TAB 2: PENGURUSAN HADIAH (FLEKSIBEL - BEBAS BERAPA JUMLAH & TAJUK)        */}
      {/* ========================================================================= */}
      {activeTab === 'prizes' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-yellow-500/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Kustomisasi Hadiah</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  {prizes.length} Hadiah Didaftarkan
                </span>
              </div>
              <h3 className="font-extrabold text-lg text-white mt-0.5">Senarai & Kategori Hadiah Majlis</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Anda boleh meletakkan sebarang tajuk, bilangan hadiah, dan mengubah mod cabutan pada bila-bila masa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setPrizeRank(prizes.length > 0 ? Math.max(...prizes.map((p) => p.rank_order)) + 1 : 1);
                  setPrizeName('');
                  setShowAddPrizeModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Hadiah Baharu</span>
              </button>

              <button
                onClick={() => setShowCustomGenModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-yellow-300 border border-yellow-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Jana Hadiah Pukal (Pilihan Jumlah)</span>
              </button>

              <button
                onClick={onReset74Prizes}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all flex items-center gap-1.5"
                title="Guna templat asal 74 hadiah"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Format Asal 74</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('AMARAN: Anda pasti ingin mengosongkan SEMUA hadiah untuk majlis ini?')) {
                    onClearAllPrizes();
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-semibold text-xs transition-all flex items-center gap-1.5"
                title="Padam semua hadiah dan mulakan semula"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Semua</span>
              </button>
            </div>
          </div>

          {/* Quick Bulk Batch Size Setters & Prize Sorting Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            {prizes.some((p) => p.draw_type === 'batch') ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-300">
                  Tukar Saiz Cabutan Sekali Klik:
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
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-yellow-500 hover:text-slate-950 border border-slate-700 text-yellow-300 font-bold transition-all text-xs"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-slate-450 text-xs">
                Susun senarai hadiah di bawah mengikut urutan pilihan anda.
              </div>
            )}

            {/* Prize Sort Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-750 rounded-xl px-2.5 py-1 text-xs ml-auto">
              <ArrowDownUp className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              <span className="text-slate-400 text-[11px] whitespace-nowrap">Susun:</span>
              <select
                value={`${prizeSortField}_${prizeSortDirection}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('_') as ['rank' | 'name' | 'category' | 'mode' | 'batch' | 'status', 'asc' | 'desc'];
                  setPrizeSortField(field);
                  setPrizeSortDirection(dir);
                }}
                className="bg-slate-900 text-yellow-300 font-bold text-xs px-2 py-1 rounded-lg border border-yellow-500/30 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
              >
                <option value="rank_asc">Urutan Hadiah: 1 ➔ 10 (Menaik)</option>
                <option value="rank_desc">Urutan Hadiah: 10 ➔ 1 (Menurun / Undur)</option>
                <option value="name_asc">Tajuk Hadiah: A ➔ Z (Menaik)</option>
                <option value="name_desc">Tajuk Hadiah: Z ➔ A (Menurun)</option>
                <option value="category_asc">Kategori: A ➔ Z (Menaik)</option>
                <option value="category_desc">Kategori: Z ➔ A (Menurun)</option>
                <option value="mode_asc">Mod Cabutan (Individu dahulu)</option>
                <option value="mode_desc">Mod Cabutan (Pukal dahulu)</option>
                <option value="batch_asc">Saiz Batch (Terkecil dahulu)</option>
                <option value="batch_desc">Saiz Batch (Terbesar dahulu)</option>
                <option value="status_asc">Status (Belum Cabut Dahulu)</option>
                <option value="status_desc">Status (Selesai Dahulu)</option>
              </select>
            </div>
          </div>

          {/* Prize Bulk Actions Bar */}
          {selectedPrizeIds.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-900 border border-yellow-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold text-xs border border-yellow-500/30">
                  {selectedPrizeIds.length} Hadiah Dipilih
                </span>
                <span className="text-xs text-slate-400">Tindakan pukal:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => handleExecuteBulkUpdatePrizes({ draw_type: 'batch', batch_size: 5 })}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700 font-bold transition-all"
                >
                  Tukar Mod: Pukal
                </button>
                <button
                  onClick={() => handleExecuteBulkUpdatePrizes({ draw_type: 'single', batch_size: 1 })}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700 font-bold transition-all"
                >
                  Tukar Mod: Individu
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Reset status ${selectedPrizeIds.length} hadiah terpilih kepada Belum Cabut? (Pemenang berkaitan akan dipadam)`)) {
                      handleExecuteBulkUpdatePrizes({ is_drawn: false });
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-bold transition-all"
                >
                  Reset: Belum Cabut
                </button>
                <button
                  onClick={handleExecuteBulkDeletePrizes}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Padam Terpilih ({selectedPrizeIds.length})</span>
                </button>
                <button
                  onClick={() => setSelectedPrizeIds([])}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs"
                >
                  Batal Pilihan
                </button>
              </div>
            </div>
          )}

          {/* Prizes Table with inline name, category, mode, batch editing, and delete */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto max-h-[580px]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 sticky top-0 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800 select-none">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={sortedPrizes.length > 0 && selectedPrizeIds.length === sortedPrizes.length}
                        onChange={handleSelectAllPrizes}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-slate-950 cursor-pointer accent-yellow-400"
                        title="Pilih / Nyahpilih Semua"
                      />
                    </th>
                    <th
                      onClick={() => togglePrizeSort('rank')}
                      className="py-2.5 px-3 w-20 text-center cursor-pointer hover:bg-slate-800/80 transition-colors group"
                      title="Klik untuk susun Urutan Hadiah (1-10 / 10-1)"
                    >
                      <span className="group-hover:text-yellow-400 inline-flex items-center justify-center">
                        Urutan
                        {renderPrizeSortIndicator('rank')}
                      </span>
                    </th>
                    <th
                      onClick={() => togglePrizeSort('name')}
                      className="py-2.5 px-3 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                      title="Klik untuk susun Tajuk Hadiah (A-Z / Z-A)"
                    >
                      <span className="group-hover:text-yellow-400 inline-flex items-center">
                        Tajuk / Nama Hadiah (Boleh Edit Terus)
                        {renderPrizeSortIndicator('name')}
                      </span>
                    </th>
                    <th
                      onClick={() => togglePrizeSort('category')}
                      className="py-2.5 px-3 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                      title="Klik untuk susun Kategori Hadiah"
                    >
                      <span className="group-hover:text-yellow-400 inline-flex items-center">
                        Kategori
                        {renderPrizeSortIndicator('category')}
                      </span>
                    </th>
                    <th
                      onClick={() => togglePrizeSort('mode')}
                      className="py-2.5 px-3 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                      title="Klik untuk susun Mod Cabutan"
                    >
                      <span className="group-hover:text-yellow-400 inline-flex items-center">
                        Mod Cabutan
                        {renderPrizeSortIndicator('mode')}
                      </span>
                    </th>
                    <th
                      onClick={() => togglePrizeSort('batch')}
                      className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-800/80 transition-colors group"
                      title="Klik untuk susun Saiz Batch"
                    >
                      <span className="group-hover:text-yellow-400 inline-flex items-center justify-center">
                        Saiz Batch
                        {renderPrizeSortIndicator('batch')}
                      </span>
                    </th>
                    <th
                      onClick={() => togglePrizeSort('status')}
                      className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-800/80 transition-colors group"
                      title="Klik untuk susun Status Cabutan"
                    >
                      <span className="group-hover:text-yellow-400 inline-flex items-center justify-center">
                        Status
                        {renderPrizeSortIndicator('status')}
                      </span>
                    </th>
                    <th className="py-2.5 px-3 text-center w-16">Padam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {sortedPrizes.length > 0 ? (
                    sortedPrizes.map((prz) => {
                      const isSelected = selectedPrizeIds.includes(prz.id);
                      return (
                        <tr
                          key={prz.id}
                          className={`hover:bg-slate-900/40 transition-colors ${
                            isSelected ? 'bg-yellow-500/10' : ''
                          }`}
                        >
                          {/* Row selection checkbox */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectPrize(prz.id)}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-slate-950 cursor-pointer accent-yellow-400"
                            />
                          </td>

                          {/* Rank order */}
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-yellow-400">
                            #{prz.rank_order}
                          </td>

                          {/* Editable Name Input */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={prz.name}
                              onChange={(e) => {
                                const newName = e.target.value;
                                const updated = prizes.map((p) =>
                                  p.id === prz.id ? { ...p, name: newName } : p
                                );
                                onUpdatePrize(updated);
                              }}
                              className="w-full bg-slate-900/90 border border-slate-750 hover:border-yellow-500/60 focus:border-yellow-400 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-white focus:outline-none transition-all"
                              placeholder="Masukkan tajuk hadiah..."
                            />
                          </td>

                          {/* Editable Category Input */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={prz.category}
                              onChange={(e) => {
                                const newCat = e.target.value;
                                const updated = prizes.map((p) =>
                                  p.id === prz.id ? { ...p, category: newCat } : p
                                );
                                onUpdatePrize(updated);
                              }}
                              className="w-28 sm:w-36 bg-slate-900 border border-slate-750 hover:border-yellow-500/60 focus:border-yellow-400 rounded-lg px-2 py-1 text-xs text-amber-200 focus:outline-none"
                              placeholder="Kategori"
                            />
                          </td>

                          {/* Draw Type Selector */}
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
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-yellow-400 cursor-pointer"
                            >
                              <option value="single">Individu (1-demi-1)</option>
                              <option value="batch">Pukal (Batch)</option>
                            </select>
                          </td>

                          {/* Batch Size Input */}
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
                                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-yellow-300 text-xs focus:outline-none focus:border-yellow-400"
                              />
                            ) : (
                              <span className="font-mono text-slate-500 text-xs">1</span>
                            )}
                          </td>

                          {/* Status */}
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

                          {/* Delete Action */}
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                if (confirm(`Pasti ingin padam hadiah: "${prz.name}"?`)) {
                                  onDeletePrize(prz.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Padam hadiah ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <Trophy className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                        <p className="font-semibold text-slate-300">Tiada hadiah didaftarkan lagi.</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Klik butang &quot;+ Tambah Hadiah Baharu&quot; di atas untuk memasukkan hadiah majlis anda.
                        </p>
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

      {/* Modal: Tambah Hadiah Baharu (Custom Single Prize) */}
      {showAddPrizeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-950 border border-yellow-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Tambah Hadiah Baharu</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tajuk / Nama Hadiah *</label>
                <input
                  type="text"
                  placeholder="Contoh: Pakej Percutian 3H2M ke Pulau Tioman"
                  value={prizeName}
                  onChange={(e) => setPrizeName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Kategori</label>
                  <input
                    type="text"
                    placeholder="Contoh: Hadiah Utama"
                    value={prizeCategory}
                    onChange={(e) => setPrizeCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nombor Urutan (Rank) *</label>
                  <input
                    type="number"
                    min={1}
                    value={prizeRank}
                    onChange={(e) => setPrizeRank(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold text-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mod Cabutan</label>
                  <select
                    value={prizeDrawType}
                    onChange={(e) => {
                      const dt = e.target.value as 'single' | 'batch';
                      setPrizeDrawType(dt);
                      if (dt === 'single') setPrizeBatchSize(1);
                      else if (prizeBatchSize === 1) setPrizeBatchSize(10);
                    }}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
                  >
                    <option value="single">Individu (1-demi-1)</option>
                    <option value="batch">Pukal (Batch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Saiz Cabutan (Sekali Klik)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    disabled={prizeDrawType === 'single'}
                    value={prizeBatchSize}
                    onChange={(e) => setPrizeBatchSize(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-yellow-400 disabled:opacity-40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">URL Gambar Hadiah (Pilihan)</label>
                <input
                  type="text"
                  placeholder="https://example.com/hadiah.jpg"
                  value={prizeImageUrl}
                  onChange={(e) => setPrizeImageUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPrizeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!prizeName.trim()) {
                    alert('Sila masukkan tajuk hadiah.');
                    return;
                  }
                  await onAddPrize({
                    event_id: activeEvent.id,
                    name: prizeName,
                    category: prizeCategory || 'Hadiah Umum',
                    rank_order: prizeRank,
                    draw_type: prizeDrawType,
                    batch_size: prizeBatchSize,
                    image_url: prizeImageUrl || undefined,
                  });
                  setShowAddPrizeModal(false);
                  setPrizeName('');
                  setPrizeImageUrl('');
                }}
                className="px-5 py-2 rounded-xl bg-yellow-500 text-slate-950 font-bold text-xs"
              >
                Simpan Hadiah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Jana Hadiah Pukal Mengikut Jumlah Pilihan Anda */}
      {showCustomGenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950 border border-yellow-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>Jana Hadiah Pukal (Pilihan Bebas)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Tetapkan jumlah hadiah yang anda inginkan tanpa terikat dengan format 74 hadiah.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Berapa Jumlah Keseluruhan Hadiah Anda?
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={genTotal}
                  onChange={(e) => setGenTotal(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3.5 py-2 text-sm text-yellow-300 font-bold font-mono focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Berapa Hadiah Utama (Mod 1-demi-1)?
                </label>
                <input
                  type="number"
                  min={1}
                  max={genTotal}
                  value={genGrand}
                  onChange={(e) => setGenGrand(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
                <span className="text-[11px] text-slate-500">
                  (Hadiah #{genGrand} hingga #1 akan dicabut secara individu)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Saiz Cabutan Sekali Klik untuk Hadiah Sampingan (Pukal):
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={genBatch}
                  onChange={(e) => setGenBatch(parseInt(e.target.value) || 5)}
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
                <span className="text-[11px] text-slate-500">
                  (Baki hadiah sampingan akan dicabut {genBatch} serentak setiap klik)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomGenModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (genTotal < 1) return;
                  await onGenerateCustomPrizes(genTotal, genGrand, genBatch);
                  setShowCustomGenModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-yellow-500 text-slate-950 font-bold text-xs"
              >
                Jana Hadiah Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Maklumat Peserta */}
      {showEditPartModal && editingParticipant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950 border border-yellow-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-yellow-400" />
                  <span>Edit Maklumat Peserta</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kemaskini butiran peserta majlis cabutan bertuah.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditPartModal(false);
                  setEditingParticipant(null);
                }}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditPart} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nama Penuh {activeEvent.participant_mode === 'ticket_only' ? <span className="text-slate-500">(Pilihan)</span> : <span className="text-yellow-400 font-bold">* (Wajib)</span>}
                </label>
                <input
                  type="text"
                  value={editPartName}
                  onChange={(e) => setEditPartName(e.target.value)}
                  placeholder="Contoh: Muhammad Ammar bin Roslan"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  No. Tiket / Matrik {activeEvent.participant_mode === 'name_only' ? <span className="text-slate-500">(Pilihan)</span> : <span className="text-yellow-400 font-bold">* (Wajib)</span>}
                </label>
                <input
                  type="text"
                  value={editPartTicket}
                  onChange={(e) => setEditPartTicket(e.target.value)}
                  placeholder="Contoh: TK-1099 atau A198273"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Jabatan / Bahagian <span className="text-slate-500">(Pilihan / Tidak Wajib)</span>
                </label>
                <input
                  type="text"
                  value={editPartDept}
                  onChange={(e) => setEditPartDept(e.target.value)}
                  placeholder="Contoh: Kewangan"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Status Kemenangan
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs p-1 rounded-lg hover:bg-slate-800/60">
                    <input
                      type="radio"
                      name="editStatus"
                      checked={!editPartIsWinner}
                      onChange={() => setEditPartIsWinner(false)}
                      className="text-yellow-500 focus:ring-yellow-400"
                    />
                    <span className="text-slate-300 font-medium">Belum Menang</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs p-1 rounded-lg hover:bg-slate-800/60">
                    <input
                      type="radio"
                      name="editStatus"
                      checked={editPartIsWinner}
                      onChange={() => setEditPartIsWinner(true)}
                      className="text-yellow-500 focus:ring-yellow-400"
                    />
                    <span className="text-emerald-400 font-medium">Sudah Menang</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPartModal(false);
                    setEditingParticipant(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingPart}
                  className="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isSavingPart ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
