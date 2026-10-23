'use client';

import React, { useState } from 'react';
import { EventItem, Winner, Prize, Participant } from '@/types';
import {
  Trophy,
  Search,
  Download,
  Printer,
  Trash2,
  Medal,
  Users,
  Award,
  Sparkles,
  Crown,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';

interface WinnersViewProps {
  activeEvent: EventItem;
  winners: Winner[];
  prizes: Prize[];
  participants: Participant[];
  onRemoveWinner?: (winnerId: string, participantId: string, prizeId: string) => Promise<void>;
  onBulkRemoveWinners?: (winnerIds: string[]) => Promise<void>;
}

export type WinnerSortOption =
  | 'rank_desc'
  | 'rank_asc'
  | 'ticket_asc'
  | 'ticket_desc'
  | 'name_asc'
  | 'name_desc'
  | 'dept_asc'
  | 'dept_desc'
  | 'prize_asc'
  | 'prize_desc'
  | 'cat_asc'
  | 'cat_desc'
  | 'time_desc'
  | 'time_asc';

export const WinnersView: React.FC<WinnersViewProps> = ({
  activeEvent,
  winners,
  prizes,
  participants,
  onRemoveWinner,
  onBulkRemoveWinners,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<WinnerSortOption>('rank_desc');
  const [selectedWinnerIds, setSelectedWinnerIds] = useState<string[]>([]);

  // Helper to extract numerical ranking from prize rank or notes (e.g. "No. 10", "Hadiah No. 10", rank_order 10)
  const getWinnerRank = (w: Winner): number => {
    if (w.notes) {
      const match = w.notes.match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }
    return w.prize?.rank_order || 0;
  };

  // Filter winners
  const filteredWinners = winners.filter((w) => {
    const pName = w.participant?.name || '';
    const tNum = w.participant?.ticket_number || '';
    const przName = w.prize?.name || '';
    const dep = w.participant?.department || '';

    const matchesSearch =
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      przName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' || w.prize?.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  // Sort winners according to selected order
  const sortedWinners = [...filteredWinners].sort((a, b) => {
    const rankA = getWinnerRank(a);
    const rankB = getWinnerRank(b);
    const timeA = new Date(a.won_at || 0).getTime();
    const timeB = new Date(b.won_at || 0).getTime();
    const nameA = a.participant?.name || '';
    const nameB = b.participant?.name || '';
    const ticketA = a.participant?.ticket_number || '';
    const ticketB = b.participant?.ticket_number || '';
    const deptA = a.participant?.department || '';
    const deptB = b.participant?.department || '';
    const prizeA = a.prize?.name || '';
    const prizeB = b.prize?.name || '';
    const catA = a.prize?.category || '';
    const catB = b.prize?.category || '';

    switch (sortOrder) {
      case 'rank_desc':
        if (rankB !== rankA) return rankB - rankA; // 10 down to 1
        return timeB - timeA;
      case 'rank_asc':
        if (rankA !== rankB) return rankA - rankB; // 1 up to 10
        return timeA - timeB;
      case 'ticket_asc':
        return ticketA.localeCompare(ticketB, undefined, { numeric: true, sensitivity: 'base' });
      case 'ticket_desc':
        return ticketB.localeCompare(ticketA, undefined, { numeric: true, sensitivity: 'base' });
      case 'name_asc':
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      case 'name_desc':
        return nameB.localeCompare(nameA, undefined, { numeric: true, sensitivity: 'base' });
      case 'dept_asc':
        return deptA.localeCompare(deptB, undefined, { numeric: true, sensitivity: 'base' });
      case 'dept_desc':
        return deptB.localeCompare(deptA, undefined, { numeric: true, sensitivity: 'base' });
      case 'prize_asc':
        return prizeA.localeCompare(prizeB, undefined, { numeric: true, sensitivity: 'base' });
      case 'prize_desc':
        return prizeB.localeCompare(prizeA, undefined, { numeric: true, sensitivity: 'base' });
      case 'cat_asc':
        return catA.localeCompare(catB, undefined, { numeric: true, sensitivity: 'base' });
      case 'cat_desc':
        return catB.localeCompare(catA, undefined, { numeric: true, sensitivity: 'base' });
      case 'time_desc':
        return timeB - timeA;
      case 'time_asc':
        return timeA - timeB;
      default:
        return 0;
    }
  });

  const toggleColumnSort = (field: 'rank' | 'ticket' | 'name' | 'dept' | 'prize' | 'cat' | 'time') => {
    switch (field) {
      case 'rank':
        setSortOrder(sortOrder === 'rank_desc' ? 'rank_asc' : 'rank_desc');
        break;
      case 'ticket':
        setSortOrder(sortOrder === 'ticket_asc' ? 'ticket_desc' : 'ticket_asc');
        break;
      case 'name':
        setSortOrder(sortOrder === 'name_asc' ? 'name_desc' : 'name_asc');
        break;
      case 'dept':
        setSortOrder(sortOrder === 'dept_asc' ? 'dept_desc' : 'dept_asc');
        break;
      case 'prize':
        setSortOrder(sortOrder === 'prize_asc' ? 'prize_desc' : 'prize_asc');
        break;
      case 'cat':
        setSortOrder(sortOrder === 'cat_asc' ? 'cat_desc' : 'cat_asc');
        break;
      case 'time':
        setSortOrder(sortOrder === 'time_desc' ? 'time_asc' : 'time_desc');
        break;
    }
  };

  const renderSortIndicator = (field: 'rank' | 'ticket' | 'name' | 'dept' | 'prize' | 'cat' | 'time') => {
    const isAsc =
      (field === 'rank' && sortOrder === 'rank_asc') ||
      (field === 'ticket' && sortOrder === 'ticket_asc') ||
      (field === 'name' && sortOrder === 'name_asc') ||
      (field === 'dept' && sortOrder === 'dept_asc') ||
      (field === 'prize' && sortOrder === 'prize_asc') ||
      (field === 'cat' && sortOrder === 'cat_asc') ||
      (field === 'time' && sortOrder === 'time_asc');

    const isDesc =
      (field === 'rank' && sortOrder === 'rank_desc') ||
      (field === 'ticket' && sortOrder === 'ticket_desc') ||
      (field === 'name' && sortOrder === 'name_desc') ||
      (field === 'dept' && sortOrder === 'dept_desc') ||
      (field === 'prize' && sortOrder === 'prize_desc') ||
      (field === 'cat' && sortOrder === 'cat_desc') ||
      (field === 'time' && sortOrder === 'time_desc');

    if (isAsc) {
      return <ArrowUp className="w-3.5 h-3.5 text-yellow-400 inline ml-1" />;
    }
    if (isDesc) {
      return <ArrowDown className="w-3.5 h-3.5 text-yellow-400 inline ml-1" />;
    }
    return <ArrowUpDown className="w-3 h-3 text-slate-600 inline ml-1 group-hover:text-slate-400 transition-colors" />;
  };

  // Dynamic categories from actual winners
  const categories = Array.from(
    new Set(
      winners
        .map((w) => w.prize?.category)
        .filter((cat): cat is string => Boolean(cat))
    )
  );

  // Export to CSV
  const handleExportCSV = () => {
    if (sortedWinners.length === 0) {
      alert('Tiada senarai pemenang untuk dieksport.');
      return;
    }

    const headers = ['Bil', 'Kedudukan', 'No. Tiket', 'Nama Pemenang', 'Jabatan/Kelas', 'Urutan Hadiah', 'Nama Hadiah', 'Kategori', 'Masa Menang'];
    const rows = sortedWinners.map((w, idx) => {
      const rank = getWinnerRank(w);
      return [
        idx + 1,
        `"No. ${rank > 0 ? rank : idx + 1}"`,
        `"${w.participant?.ticket_number || ''}"`,
        `"${w.participant?.name || ''}"`,
        `"${w.participant?.department || ''}"`,
        w.prize?.rank_order || '',
        `"${w.prize?.name || ''}"`,
        `"${w.prize?.category || ''}"`,
        `"${w.won_at ? new Date(w.won_at).toLocaleString('ms-MY') : ''}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pemenang_${activeEvent.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print friendly view
  const handlePrint = () => {
    window.print();
  };

  const handleToggleSelectWinner = (id: string) => {
    setSelectedWinnerIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllWinners = () => {
    if (selectedWinnerIds.length === sortedWinners.length) {
      setSelectedWinnerIds([]);
    } else {
      setSelectedWinnerIds(sortedWinners.map((w) => w.id));
    }
  };

  const handleExecuteBulkRemoveWinners = async () => {
    if (selectedWinnerIds.length === 0) return;
    if (
      !confirm(
        `Adakah anda pasti ingin membatalkan kemenangan bagi ${selectedWinnerIds.length} pemenang yang dipilih? Status peserta-peserta ini akan dikembalikan kepada belum menang secara automatik.`
      )
    ) {
      return;
    }
    if (onBulkRemoveWinners) {
      await onBulkRemoveWinners(selectedWinnerIds);
    } else if (onRemoveWinner) {
      for (const wid of selectedWinnerIds) {
        const found = winners.find((w) => w.id === wid);
        if (found) {
          await onRemoveWinner(
            found.id,
            found.participant_id || found.participant?.id || '',
            found.prize_id || found.prize?.id || ''
          );
        }
      }
    }
    setSelectedWinnerIds([]);
  };

  return (
    <div className="min-h-[calc(100vh-61px)] w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-white">
      {/* Header & Stats Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Keputusan Rasmi Cabutan Bertuah</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Senarai Pemenang: {activeEvent.name}
          </h2>
        </div>

        {/* Action Buttons: Export & Print */}
        <div className="flex items-center gap-2.5 print:hidden">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold hover:text-white transition-all shadow"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Eksport CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 print:hidden">
        <div className="p-4 rounded-2xl glass-panel border border-yellow-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 border border-yellow-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Jumlah Pemenang</div>
            <div className="text-2xl font-black text-white">{winners.length} <span className="text-sm font-normal text-slate-400">orang</span></div>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Hadiah Telah Dicabut</div>
            <div className="text-2xl font-black text-white">{prizes.filter((p) => p.is_drawn).length} / {prizes.length}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Baki Peserta Belum Menang</div>
            <div className="text-2xl font-black text-white">{participants.filter((p) => !p.is_winner).length} <span className="text-sm font-normal text-slate-400">orang</span></div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, no. tiket, atau hadiah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Sort Selector Dropdown */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
          <ArrowDownUp className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-slate-400 font-medium whitespace-nowrap">Susunan:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as WinnerSortOption)}
            className="bg-slate-950 text-yellow-300 font-bold text-xs px-2.5 py-1.5 rounded-lg border border-yellow-500/30 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
          >
            <option value="rank_desc">Kedudukan: 10 ➔ 1 (Menurun)</option>
            <option value="rank_asc">Kedudukan: 1 ➔ 10 (Menaik)</option>
            <option value="ticket_asc">No. Tiket: Menaik (A ➔ Z / 0 ➔ 9)</option>
            <option value="ticket_desc">No. Tiket: Menurun (Z ➔ A / 9 ➔ 0)</option>
            <option value="name_asc">Nama: A ➔ Z (Menaik)</option>
            <option value="name_desc">Nama: Z ➔ A (Menurun)</option>
            <option value="dept_asc">Jabatan: A ➔ Z (Menaik)</option>
            <option value="dept_desc">Jabatan: Z ➔ A (Menurun)</option>
            <option value="prize_asc">Hadiah: A ➔ Z (Menaik)</option>
            <option value="prize_desc">Hadiah: Z ➔ A (Menurun)</option>
            <option value="cat_asc">Kategori: A ➔ Z (Menaik)</option>
            <option value="cat_desc">Kategori: Z ➔ A (Menurun)</option>
            <option value="time_desc">Masa: Terkini Dahulu (Menurun)</option>
            <option value="time_asc">Masa: Terawal Dahulu (Menaik)</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-yellow-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua ({winners.length})
          </button>
          {categories.map((cat) => {
            const count = winners.filter((w) => w.prize?.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-yellow-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedWinnerIds.length > 0 && (
        <div className="mb-4 p-3.5 rounded-2xl bg-slate-900/95 border border-red-500/40 flex flex-wrap items-center justify-between gap-3 shadow-2xl backdrop-blur-md sticky top-16 z-20 print:hidden animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs">
              {selectedWinnerIds.length} Pemenang Dipilih
            </span>
            <span className="text-xs text-slate-300">
              Tindakan pukal untuk pemenang yang ditandakan:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExecuteBulkRemoveWinners}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105"
            >
              <Trash2 className="w-4 h-4" />
              <span>Batalkan Kemenangan Terpilih ({selectedWinnerIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedWinnerIds([])}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
            >
              Nyahpilih Semua
            </button>
          </div>
        </div>
      )}

      {/* Winners Table */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 select-none">
              <tr>
                <th className="py-3 px-3 w-10 text-center print:hidden">
                  <input
                    type="checkbox"
                    checked={sortedWinners.length > 0 && selectedWinnerIds.length === sortedWinners.length}
                    onChange={handleSelectAllWinners}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-slate-950 cursor-pointer accent-yellow-400"
                    title="Pilih / Nyahpilih Semua"
                  />
                </th>
                <th className="py-3 px-4 w-12 text-center text-slate-500">Bil</th>
                <th
                  onClick={() => toggleColumnSort('rank')}
                  className="py-3 px-4 w-28 text-center cursor-pointer hover:bg-slate-800/80 transition-colors group"
                  title="Klik untuk susun Kedudukan Hadiah (10-1 / 1-10)"
                >
                  <span className="group-hover:text-yellow-400 inline-flex items-center justify-center">
                    Kedudukan
                    {renderSortIndicator('rank')}
                  </span>
                </th>
                <th
                  onClick={() => toggleColumnSort('ticket')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                  title="Klik untuk susun mengikut No. Tiket"
                >
                  <span className="group-hover:text-yellow-400 inline-flex items-center">
                    No. Tiket
                    {renderSortIndicator('ticket')}
                  </span>
                </th>
                <th
                  onClick={() => toggleColumnSort('name')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                  title="Klik untuk susun Nama Pemenang (A-Z / Z-A)"
                >
                  <span className="group-hover:text-yellow-400 inline-flex items-center">
                    Nama Pemenang
                    {renderSortIndicator('name')}
                  </span>
                </th>
                <th
                  onClick={() => toggleColumnSort('dept')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                  title="Klik untuk susun Jabatan / Bahagian"
                >
                  <span className="group-hover:text-yellow-400 inline-flex items-center">
                    Jabatan / Bahagian
                    {renderSortIndicator('dept')}
                  </span>
                </th>
                <th
                  onClick={() => toggleColumnSort('prize')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                  title="Klik untuk susun Hadiah Dimiliki"
                >
                  <span className="group-hover:text-yellow-400 inline-flex items-center">
                    Hadiah Dimiliki
                    {renderSortIndicator('prize')}
                  </span>
                </th>
                <th
                  onClick={() => toggleColumnSort('cat')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                  title="Klik untuk susun Kategori Hadiah"
                >
                  <span className="group-hover:text-yellow-400 inline-flex items-center">
                    Kategori
                    {renderSortIndicator('cat')}
                  </span>
                </th>
                <th
                  onClick={() => toggleColumnSort('time')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-800/80 transition-colors group"
                  title="Klik untuk susun Masa Cabutan (Terkini / Terawal)"
                >
                  <span className="group-hover:text-yellow-400 inline-flex items-center">
                    Masa Cabutan
                    {renderSortIndicator('time')}
                  </span>
                </th>
                {onRemoveWinner && <th className="py-3 px-4 text-center print:hidden">Tindakan</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {sortedWinners.length > 0 ? (
                sortedWinners.map((winner, idx) => {
                  const rank = getWinnerRank(winner);
                  const isTop1 = rank === 1;
                  const isTop10 = rank > 0 && rank <= 10;
                  const isSelected = selectedWinnerIds.includes(winner.id);

                  return (
                    <tr
                      key={winner.id}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isSelected ? 'bg-red-950/20' : isTop1 ? 'bg-yellow-500/10' : isTop10 ? 'bg-yellow-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center print:hidden">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectWinner(winner.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-slate-950 cursor-pointer accent-yellow-400"
                        />
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isTop1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/30 text-amber-300 font-black text-xs border border-amber-400 shadow-sm shadow-amber-500/30">
                            <Crown className="w-3.5 h-3.5 text-yellow-300" />
                            <span>No. 1</span>
                          </span>
                        ) : rank > 0 ? (
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-extrabold text-xs border ${
                            isTop10
                              ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            No. {rank}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs text-slate-400">
                            -
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          {winner.participant?.ticket_number || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          {isTop1 ? (
                            <Medal className="w-4 h-4 text-yellow-400 flex-shrink-0 animate-pulse" />
                          ) : isTop10 ? (
                            <Medal className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          ) : null}
                          <span>{winner.participant?.name || 'Tiada Maklumat'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {winner.participant?.department || '-'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-amber-200">
                          {winner.prize?.name || 'Hadiah'}
                        </div>
                        {winner.notes && winner.notes !== `No. ${rank}` && (
                          <div className="text-[11px] text-amber-400/80 font-medium">
                            {winner.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          winner.prize?.category === 'Hadiah Utama'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {winner.prize?.category || 'Saguhati'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-400">
                        {winner.won_at ? new Date(winner.won_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                      </td>

                      {onRemoveWinner && (
                        <td className="py-3 px-4 text-center print:hidden">
                          <button
                            onClick={() => {
                              if (confirm(`Pasti ingin batalkan kemenangan ${winner.participant?.name}? Status peserta ini akan dikembalikan kepada belum menang.`)) {
                                onRemoveWinner(
                                  winner.id,
                                  winner.participant_id || winner.participant?.id || '',
                                  winner.prize_id || winner.prize?.id || ''
                                );
                              }
                            }}
                            title="Batalkan kemenangan peserta ini"
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={onRemoveWinner ? 10 : 9} className="py-12 text-center text-slate-500">
                    <Sparkles className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-400">Tiada rekod pemenang dijumpai</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {searchTerm ? 'Cuba kata kunci carian yang lain' : 'Mulakan cabutan di Paparan Pentas untuk melihat pemenang'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
