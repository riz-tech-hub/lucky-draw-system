'use client';

import React, { useState, useEffect } from 'react';
import { EventItem } from '@/types';
import { sound } from '@/lib/sound';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  Trophy,
  Users,
  Settings,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Database,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'stage' | 'winners' | 'admin';
  onViewChange: (view: 'stage' | 'winners' | 'admin') => void;
  events: EventItem[];
  activeEvent: EventItem;
  onSelectEvent: (eventId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  events,
  activeEvent,
  onSelectEvent,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCloud, setIsCloud] = useState(false);

  useEffect(() => {
    setIsCloud(isSupabaseConfigured());

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playCardReveal(3);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-yellow-500/20 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 text-white transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Title & Event Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-200 p-0.5 shadow-lg shadow-yellow-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                LUCKY DRAW PRO
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                Multi-Event
              </span>
            </div>

            {/* Event selector dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-yellow-500" />
              <select
                value={activeEvent.id}
                onChange={(e) => onSelectEvent(e.target.value)}
                className="bg-transparent hover:text-white text-slate-300 cursor-pointer font-medium focus:outline-none focus:ring-1 focus:ring-yellow-500 rounded px-1 -ml-1 border-b border-dashed border-slate-600"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id} className="bg-slate-900 text-white">
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onViewChange('stage')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentView === 'stage'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-yellow-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Paparan Pentas</span>
          </button>

          <button
            onClick={() => onViewChange('winners')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentView === 'winners'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-yellow-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Senarai Pemenang</span>
          </button>

          <button
            onClick={() => onViewChange('admin')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              currentView === 'admin'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-yellow-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Right Tools (Sound, Fullscreen, DB status) */}
        <div className="flex items-center gap-2">
          {/* Cloud DB Status badge */}
          <div
            title={isCloud ? 'Tersambung ke Supabase Cloud DB' : 'Mod Tempatan (Local Storage). Tambah kunci Supabase di .env.local untuk sync ke cloud.'}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isCloud
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
            }`}
          >
            <Database className="w-3 h-3" />
            <span>{isCloud ? 'Supabase' : 'Demo Mode'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Bunyikan SFX' : 'Senyapkan SFX'}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Fullscreen' : 'Paparan Skrin Penuh (Projector Mode)'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
