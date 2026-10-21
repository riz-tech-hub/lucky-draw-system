'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Participant, Prize } from '@/types';
import { pickRandomWinners, pickReplacementWinner } from '@/lib/randomizer';
import { sound } from '@/lib/sound';
import { fireConfettiDualCannons } from '@/lib/confetti';
import {
  Trophy,
  Crown,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  Gift,
  User
} from 'lucide-react';

interface SingleDrawProps {
  prize: Prize;
  eligibleParticipants: Participant[];
  allParticipants: Participant[];
  onConfirmWinner: (prize: Prize, winner: Participant) => Promise<void>;
  participantMode?: 'both' | 'name_only' | 'ticket_only';
}

export const SingleDraw: React.FC<SingleDrawProps> = ({
  prize,
  eligibleParticipants,
  allParticipants,
  onConfirmWinner,
  participantMode = 'both',
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Participant | null>(null);
  const [displayParticipant, setDisplayParticipant] = useState<Participant | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(prize.is_drawn);
  const [saving, setSaving] = useState(false);
  const [showRespinConfirm, setShowRespinConfirm] = useState(false);

  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
      sound.stopSpinLoop();
    };
  }, []);

  useEffect(() => {
    setIsConfirmed(prize.is_drawn);
    if (!prize.is_drawn) {
      setSelectedWinner(null);
      setDisplayParticipant(null);
    }
  }, [prize.id, prize.is_drawn]);

  // Start 1-by-1 Dramatic Draw
  const handleStartDraw = () => {
    if (isSpinning || saving) return;
    if (eligibleParticipants.length < 1) {
      alert('Tiada lagi peserta yang layak! Semua peserta telah memenangi hadiah.');
      return;
    }

    const { selected } = pickRandomWinners(eligibleParticipants, 1);
    if (selected.length === 0) return;

    const winner = selected[0];
    setIsSpinning(true);
    setSelectedWinner(winner);
    setShowRespinConfirm(false);

    // Audio: Drumroll tension builder
    sound.playDrumRoll(3.2);

    const pool = allParticipants.length > 0 ? allParticipants : eligibleParticipants;
    let ticks = 0;

    rollIntervalRef.current = setInterval(() => {
      ticks++;
      sound.playTick(1.2);
      const randIdx = Math.floor(Math.random() * pool.length);
      setDisplayParticipant(pool[randIdx]);
    }, 60);

    // Dramatic stop after 3.2s
    setTimeout(() => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
      sound.stopSpinLoop();
      setDisplayParticipant(winner);
      setIsSpinning(false);

      // Climax celebrations
      fireConfettiDualCannons(4000);
      sound.playFanfare();
    }, 3200);
  };

  // Re-spin if participant absent
  const handleRespin = () => {
    if (!selectedWinner || isSpinning || isConfirmed) return;
    const replacement = pickReplacementWinner(allParticipants, [selectedWinner.id]);
    if (!replacement) {
      alert('Tiada lagi peserta yang layak untuk cabutan semula.');
      return;
    }
    setShowRespinConfirm(false);
    handleStartDraw();
  };

  // Confirm winner
  const handleConfirm = async () => {
    if (!selectedWinner || saving) return;
    setSaving(true);
    try {
      await onConfirmWinner(prize, selectedWinner);
      setIsConfirmed(true);
      fireConfettiDualCannons(2500);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pemenang ke database.');
    } finally {
      setSaving(false);
    }
  };

  const currentPerson = displayParticipant || selectedWinner;
  const isGrandTop3 = prize.rank_order <= 3;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Prize Header Banner */}
      <div className="w-full mb-6 p-6 rounded-2xl glass-panel-gold border border-yellow-500/40 text-center relative overflow-hidden shadow-2xl shadow-yellow-500/10">
        <div className="absolute top-2 right-4 flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full text-xs text-slate-300 border border-slate-700/60">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Peserta Layak: <strong className="text-emerald-400">{eligibleParticipants.length}</strong></span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-extrabold text-xs uppercase tracking-widest mb-2">
          {isGrandTop3 ? <Crown className="w-4 h-4 text-yellow-400 animate-bounce" /> : <Trophy className="w-4 h-4 text-yellow-400" />}
          <span>{prize.category} • Urutan #{prize.rank_order}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 tracking-tight">
          {prize.name}
        </h2>

        {prize.image_url && (
          <div className="mt-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={prize.image_url}
              alt={prize.name}
              className="max-h-36 object-contain rounded-xl border border-yellow-500/30 shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Hero Grand Draw Box */}
      <div className={`w-full relative rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center transition-all duration-500 ${
        selectedWinner && !isSpinning
          ? 'bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-950 border-2 border-yellow-400 neon-box shadow-2xl'
          : isSpinning
          ? 'bg-slate-900/90 border-2 border-yellow-500/60 animate-pulse'
          : 'bg-slate-950/80 border border-slate-800'
      }`}>
        {/* Shimmer Effect */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="w-full h-full animate-shimmer opacity-20" />
        </div>

        {/* Display Container */}
        {currentPerson ? (
          <div className="text-center z-10 space-y-4">
            {participantMode === 'name_only' ? (
              <>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-yellow-300 shadow-lg shadow-amber-500/20">
                  <User className="w-8 h-8" />
                </div>
                <h3 className={`font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight max-w-2xl mx-auto ${
                  isSpinning ? 'blur-[1px] opacity-80' : 'drop-shadow-lg scale-100'
                }`}>
                  {currentPerson.name}
                </h3>
              </>
            ) : participantMode === 'ticket_only' ? (
              <>
                <div className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                  NO. TIKET / NO. MATRIK
                </div>
                <div className="inline-block px-8 py-4 sm:px-12 sm:py-6 rounded-3xl bg-amber-500/20 border-4 border-amber-400 shadow-2xl shadow-amber-500/30">
                  <span className="font-mono text-4xl sm:text-6xl md:text-7xl font-black tracking-widest text-yellow-300 drop-shadow-md">
                    {currentPerson.ticket_number}
                  </span>
                </div>
                {currentPerson.name && currentPerson.name !== currentPerson.ticket_number && (
                  <h3 className="font-bold text-xl sm:text-2xl text-slate-200 mt-2">
                    {currentPerson.name}
                  </h3>
                )}
              </>
            ) : (
              <>
                {/* Both Mode: Ticket on top, Name in middle */}
                <div className="inline-block px-6 py-2 rounded-2xl bg-amber-500/20 border-2 border-amber-400/80 shadow-lg shadow-amber-500/20">
                  <span className="font-mono text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-yellow-300">
                    {currentPerson.ticket_number}
                  </span>
                </div>
                <h3 className={`font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight max-w-2xl mx-auto ${
                  isSpinning ? 'blur-[1px] opacity-80' : 'drop-shadow-lg scale-100'
                }`}>
                  {currentPerson.name}
                </h3>
              </>
            )}

            {/* Department Badge (Only if provided!) */}
            {currentPerson.department && (
              <div className="text-sm sm:text-base font-semibold text-amber-200/80 bg-slate-900/90 px-4 py-1.5 rounded-full inline-block border border-slate-700">
                {currentPerson.department}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 z-10 space-y-3">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-900/90 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-xl">
              {participantMode === 'name_only' ? (
                <User className="w-12 h-12 animate-pulse" />
              ) : (
                <Gift className="w-12 h-12 animate-pulse" />
              )}
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-black text-slate-600 tracking-widest">
              {participantMode === 'name_only' ? '[Nama Pemenang]' : participantMode === 'ticket_only' ? '??????' : 'TK-????'}
            </div>
            <p className="text-sm font-semibold text-slate-400">
              Tekan butang di bawah untuk memulakan cabutan 1-demi-1
            </p>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="mt-8 w-full max-w-xl flex flex-wrap items-center justify-center gap-4">
        {/* Initial Spin Button */}
        {!selectedWinner && !isConfirmed && (
          <button
            onClick={handleStartDraw}
            disabled={isSpinning || eligibleParticipants.length === 0}
            className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xl tracking-wider uppercase shadow-2xl shadow-yellow-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 glow-gold"
          >
            <Sparkles className="w-7 h-7 animate-spin" />
            <span>{isSpinning ? 'Sedang Memusing...' : 'PUTAR / CABUT HADIAH'}</span>
          </button>
        )}

        {/* Revealed state actions */}
        {selectedWinner && !isSpinning && !isConfirmed && (
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="w-full sm:flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-base shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{saving ? 'Sedang Menyimpan...' : 'SAHKAN PEMENANG INI'}</span>
            </button>

            {!showRespinConfirm ? (
              <button
                onClick={() => setShowRespinConfirm(true)}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-sm hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Pemenang Tiada? (Re-spin)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-950/80 p-2 rounded-xl border border-red-500/40">
                <span className="text-xs text-red-200 font-semibold px-2">Pasti nak putar semula?</span>
                <button
                  onClick={handleRespin}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  Ya, Putar
                </button>
                <button
                  onClick={() => setShowRespinConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        )}

        {/* Confirmed Banner */}
        {isConfirmed && (
          <div className="flex items-center gap-3">
            <div className="px-6 py-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Hadiah ini telah disahkan & disimpan ke rekod pemenang!</span>
            </div>
            <button
              onClick={() => {
                setIsConfirmed(false);
                setSelectedWinner(null);
              }}
              className="text-xs text-slate-400 hover:text-yellow-400 underline"
            >
              Ulang Cabutan?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
