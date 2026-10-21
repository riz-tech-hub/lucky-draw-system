'use client';

import React, { useState } from 'react';
import { EventItem, Participant, Prize, Winner } from '@/types';
import { BatchDraw } from './BatchDraw';
import { SingleDraw } from './SingleDraw';
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Gift,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';

interface StageViewProps {
  activeEvent: EventItem;
  prizes: Prize[];
  participants: Participant[];
  winners: Winner[];
  onConfirmWinners: (prize: Prize, selected: Participant[]) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

export const StageView: React.FC<StageViewProps> = ({
  activeEvent,
  prizes,
  participants,
  winners,
  onConfirmWinners,
}) => {
  // Sort prizes 74 down to 1
  const sortedPrizes = [...prizes].sort((a, b) => b.rank_order - a.rank_order);

  // Default to the first undrawn prize, or the top prize
  const firstUndrawnIndex = sortedPrizes.findIndex((p) => !p.is_drawn);
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState(
    firstUndrawnIndex >= 0 ? firstUndrawnIndex : 0
  );

  const currentPrize = sortedPrizes[selectedPrizeIndex] || sortedPrizes[0];
  const eligibleParticipants = participants.filter((p) => !p.is_winner);

  // Navigate prizes
  const handlePrevPrize = () => {
    if (selectedPrizeIndex > 0) {
      setSelectedPrizeIndex(selectedPrizeIndex - 1);
    }
  };

  const handleNextPrize = () => {
    if (selectedPrizeIndex < sortedPrizes.length - 1) {
      setSelectedPrizeIndex(selectedPrizeIndex + 1);
    }
  };

  const backgroundStyle = activeEvent.bg_image_url
    ? {
        backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.88), rgba(6, 10, 20, 0.94)), url(${activeEvent.bg_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : {
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 45%, #020617 100%)',
      };

  return (
    <div
      style={backgroundStyle}
      className="min-h-[calc(100vh-61px)] w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-white relative select-none"
    >
      {/* Top Bar: Event Title, Logo, & Quick Stats */}
      <div className="w-full max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {activeEvent.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeEvent.logo_url}
              alt="Logo"
              className="h-10 w-auto object-contain rounded"
            />
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow">
              {activeEvent.name}
            </h2>
            {activeEvent.description && (
              <p className="text-xs text-amber-200/70 font-medium">
                {activeEvent.description}
              </p>
            )}
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-yellow-500/20 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>
              Hadiah: <strong className="text-yellow-400">{sortedPrizes.filter((p) => p.is_drawn).length}</strong>/{sortedPrizes.length}
            </span>
          </div>

          <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Pemenang: <strong className="text-emerald-400">{winners.length}</strong> orang
            </span>
          </div>
        </div>
      </div>

      {/* Prize Carousel Selector Ribbon */}
      <div className="w-full max-w-6xl mx-auto mb-8 bg-slate-950/70 p-2 sm:p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          {/* Previous button */}
          <button
            onClick={handlePrevPrize}
            disabled={selectedPrizeIndex === 0}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-yellow-400 border border-slate-700/80 transition-all"
            title="Hadiah Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Quick Prize Selector Dropdown & Indicator */}
          <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar px-2">
            <select
              value={selectedPrizeIndex}
              onChange={(e) => setSelectedPrizeIndex(Number(e.target.value))}
              className="bg-slate-900 text-yellow-300 font-bold text-sm sm:text-base px-4 py-2 rounded-xl border border-yellow-500/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 max-w-md w-full truncate cursor-pointer"
            >
              {sortedPrizes.map((p, idx) => (
                <option key={p.id} value={idx} className="bg-slate-950 text-white">
                  {p.is_drawn ? '✓ ' : '○ '}
                  #{p.rank_order} - {p.name} ({p.draw_type === 'batch' ? `Batch ${p.batch_size}` : 'Single'})
                </option>
              ))}
            </select>
          </div>

          {/* Next button */}
          <button
            onClick={handleNextPrize}
            disabled={selectedPrizeIndex === sortedPrizes.length - 1}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-yellow-400 border border-slate-700/80 transition-all"
            title="Hadiah Seterusnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Drawing Area: Switches between Batch and Single according to current prize */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-center">
        {currentPrize ? (
          currentPrize.draw_type === 'batch' ? (
            <BatchDraw
              key={currentPrize.id}
              prize={currentPrize}
              eligibleParticipants={eligibleParticipants}
              allParticipants={participants}
              onConfirmWinners={onConfirmWinners}
            />
          ) : (
            <SingleDraw
              key={currentPrize.id}
              prize={currentPrize}
              eligibleParticipants={eligibleParticipants}
              allParticipants={participants}
              onConfirmWinner={async (prz, winner) => {
                await onConfirmWinners(prz, [winner]);
              }}
            />
          )
        ) : (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-yellow-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold">Tiada Hadiah Dijumpai</h3>
            <p className="text-sm text-slate-400 mt-1">
              Sila pergi ke Admin Dashboard untuk menjana senarai 74 hadiah.
            </p>
          </div>
        )}
      </main>

      {/* Stage Footer: Shortcuts and hints */}
      <footer className="w-full max-w-6xl mx-auto mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sistem Rawak Kriptografik (Adil & Tanpa Ulangan)</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Mod Semasa: <strong className="text-yellow-400">{currentPrize?.draw_type === 'batch' ? `Pukal (${currentPrize.batch_size} Nama)` : 'Individu (1 Nama)'}</strong></span>
          <span>Tekan F11 untuk Projector Fullscreen</span>
        </div>
      </footer>
    </div>
  );
};
