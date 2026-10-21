'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Participant, Prize } from '@/types';
import { pickRandomWinners, pickReplacementWinner } from '@/lib/randomizer';
import { sound } from '@/lib/sound';
import { fireConfettiBatch } from '@/lib/confetti';
import {
  Trophy,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  RotateCcw,
  Volume2
} from 'lucide-react';

interface BatchDrawProps {
  prize: Prize;
  eligibleParticipants: Participant[];
  allParticipants: Participant[];
  onConfirmWinners: (prize: Prize, selectedParticipants: Participant[]) => Promise<void>;
  onDrawNextPrize?: () => void;
}

export const BatchDraw: React.FC<BatchDrawProps> = ({
  prize,
  eligibleParticipants,
  allParticipants,
  onConfirmWinners,
}) => {
  const batchCount = prize.batch_size || 10;
  const [isSpinning, setIsSpinning] = useState(false);
  const [pendingWinners, setPendingWinners] = useState<Participant[]>([]);
  const [rollingDisplay, setRollingDisplay] = useState<Participant[]>([]);
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [isConfirmed, setIsConfirmed] = useState(prize.is_drawn);
  const [saving, setSaving] = useState(false);

  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
      sound.stopSpinLoop();
    };
  }, []);

  // Update confirmed state if prize changes
  useEffect(() => {
    setIsConfirmed(prize.is_drawn);
    if (!prize.is_drawn) {
      setPendingWinners([]);
      setRevealedCount(0);
    }
  }, [prize.id, prize.is_drawn]);

  // Handle Start Batch Spin
  const handleStartDraw = () => {
    if (isSpinning || saving) return;
    if (eligibleParticipants.length < 1) {
      alert('Tiada lagi peserta yang layak! Semua peserta telah menang.');
      return;
    }

    const targetCount = Math.min(batchCount, eligibleParticipants.length);
    const { selected } = pickRandomWinners(eligibleParticipants, targetCount);

    if (selected.length === 0) {
      alert('Ralat semasa memilih pemenang.');
      return;
    }

    setIsSpinning(true);
    setRevealedCount(0);
    setPendingWinners(selected);
    sound.startSpinLoop();

    // Rapid shuffle animation display
    const samplePool = allParticipants.length > 0 ? allParticipants : eligibleParticipants;
    let ticks = 0;

    rollIntervalRef.current = setInterval(() => {
      ticks++;
      sound.playTick(1.0 + (ticks % 5) * 0.1);

      // Random mock display for the 10 slots
      const fakeSlots: Participant[] = [];
      for (let i = 0; i < targetCount; i++) {
        const randIndex = Math.floor(Math.random() * samplePool.length);
        fakeSlots.push(samplePool[randIndex]);
      }
      setRollingDisplay(fakeSlots);
    }, 70);

    // Stop fast shuffle after 2.5 seconds and trigger cascading lock-in
    setTimeout(() => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
      sound.stopSpinLoop();

      // Cascading lock-in for each card
      let currentIdx = 0;
      const revealInterval = setInterval(() => {
        currentIdx++;
        setRevealedCount(currentIdx);
        sound.playCardReveal(currentIdx);

        if (currentIdx >= selected.length) {
          clearInterval(revealInterval);
          setIsSpinning(false);
          fireConfettiBatch();
          sound.playFanfare();
        }
      }, 160);
    }, 2400);
  };

  // Replace single absent participant from the current batch
  const handleReplaceSingle = (indexToReplace: number) => {
    if (isSpinning || saving || isConfirmed) return;

    const currentBatchIds = pendingWinners.map((p) => p.id);
    const replacement = pickReplacementWinner(allParticipants, currentBatchIds);

    if (!replacement) {
      alert('Tiada lagi peserta gantian yang belum menang!');
      return;
    }

    const updated = [...pendingWinners];
    updated[indexToReplace] = replacement;
    setPendingWinners(updated);
    sound.playCardReveal(indexToReplace);
  };

  // Confirm and commit to database
  const handleConfirm = async () => {
    if (pendingWinners.length === 0 || saving) return;
    setSaving(true);
    try {
      await onConfirmWinners(prize, pendingWinners);
      setIsConfirmed(true);
      fireConfettiBatch();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pemenang ke database.');
    } finally {
      setSaving(false);
    }
  };

  const currentDisplay = isSpinning ? rollingDisplay : pendingWinners;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Banner: Prize Info & Eligible Count */}
      <div className="w-full max-w-5xl mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel-gold border border-yellow-500/40 shadow-xl shadow-yellow-500/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                {prize.category} • Urutan #{prize.rank_order}
              </span>
              <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                Cabutan Pukal ({batchCount} Serentak)
              </span>
              {isConfirmed && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Sudah Disahkan
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {prize.name}
            </h2>
          </div>
        </div>

        {/* Participant counter badge */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700/60">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-300">
            Peserta Layak: <strong className="text-emerald-400 text-sm">{eligibleParticipants.length}</strong> orang
          </span>
        </div>
      </div>

      {/* Grid of 10 Cards */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
        {Array.from({ length: batchCount }).map((_, index) => {
          const participant = currentDisplay[index];
          const isSlotRevealed = !isSpinning && index < revealedCount;
          const isSlotCurrentlyRolling = isSpinning;

          return (
            <div
              key={index}
              className={`relative group rounded-xl p-4 flex flex-col justify-between transition-all duration-300 min-h-[145px] ${
                isSlotRevealed
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-yellow-950/40 border-2 border-yellow-500/70 shadow-lg shadow-yellow-500/20 scale-[1.02]'
                  : isSlotCurrentlyRolling
                  ? 'bg-slate-900/90 border border-yellow-500/40 animate-pulse'
                  : 'bg-slate-950/70 border border-slate-800/80'
              }`}
            >
              {/* Slot Index Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-yellow-500/20 text-yellow-300 font-bold text-xs border border-yellow-500/30">
                  {index + 1}
                </span>

                {/* Single replacement button if participant absent */}
                {isSlotRevealed && !isConfirmed && (
                  <button
                    onClick={() => handleReplaceSingle(index)}
                    title="Ganti peserta ini jika tidak hadir"
                    className="opacity-80 hover:opacity-100 flex items-center gap-1 text-[11px] text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/30 border border-amber-500/30 rounded px-1.5 py-0.5 transition-all"
                  >
                    <RotateCcw className="w-3 h-3" /> Ganti
                  </button>
                )}
              </div>

              {/* Participant Content */}
              {participant && (isSlotRevealed || isSlotCurrentlyRolling) ? (
                <div className="my-auto text-center">
                  <div className="font-mono text-xs font-black tracking-widest text-amber-300 mb-0.5">
                    {participant.ticket_number}
                  </div>
                  <h4 className="font-extrabold text-sm text-white line-clamp-2 leading-tight">
                    {participant.name}
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    {participant.department || 'Peserta'}
                  </div>
                </div>
              ) : (
                <div className="my-auto text-center text-slate-600">
                  <div className="text-2xl font-black tracking-wider opacity-40">????</div>
                  <div className="text-[11px] text-slate-500 mt-1">Sedia Dicabut</div>
                </div>
              )}

              {/* Shimmer overlay when revealed */}
              {isSlotRevealed && (
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="w-full h-full animate-shimmer opacity-30" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Control Action Bar */}
      <div className="w-full max-w-2xl flex flex-wrap items-center justify-center gap-4">
        {/* If not drawn yet */}
        {pendingWinners.length === 0 && !isConfirmed && (
          <button
            onClick={handleStartDraw}
            disabled={isSpinning || eligibleParticipants.length === 0}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-lg tracking-wider uppercase shadow-xl shadow-yellow-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed glow-gold"
          >
            <Sparkles className="w-6 h-6 animate-spin" />
            <span>{isSpinning ? 'Sedang Memusing...' : `CABUT ${batchCount} PEMENANG`}</span>
          </button>
        )}

        {/* If drawn but waiting for confirmation */}
        {pendingWinners.length > 0 && !isConfirmed && !isSpinning && (
          <>
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="flex-1 min-w-[240px] px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-base shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{saving ? 'Sedang Menyimpan...' : 'SAHKAN & SIMPAN 10 PEMENANG'}</span>
            </button>

            <button
              onClick={handleStartDraw}
              disabled={saving}
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold text-sm hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Putar Semula Semua</span>
            </button>
          </>
        )}

        {/* If already confirmed */}
        {isConfirmed && (
          <div className="flex items-center gap-3">
            <div className="px-6 py-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Pemenang untuk hadiah ini telah disimpan!</span>
            </div>
            <button
              onClick={() => {
                setIsConfirmed(false);
                setPendingWinners([]);
              }}
              className="text-xs text-slate-400 hover:text-yellow-400 underline underline-offset-4"
            >
              Cabut Semula?
            </button>
          </div>
        )}
      </div>

      {/* Helpful Hint */}
      <div className="mt-6 text-center text-xs text-slate-400 flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
        <span>Peserta yang memenangi cabutan ini tidak akan diundi lagi dalam pusingan seterusnya.</span>
      </div>
    </div>
  );
};
