'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EventItem, Participant, Prize, Winner } from '@/types';
import { DataStore, INITIAL_EVENT } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { StageView } from '@/components/StageView';
import { WinnersView } from '@/components/WinnersView';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function LuckyDrawApp() {
  const [currentView, setCurrentView] = useState<'stage' | 'winners' | 'admin'>('stage');
  const [events, setEvents] = useState<EventItem[]>([INITIAL_EVENT]);
  const [activeEvent, setActiveEvent] = useState<EventItem>(INITIAL_EVENT);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all initial events and data
  const loadData = useCallback(async (targetEventId?: string) => {
    setIsLoading(true);
    try {
      const allEvents = await DataStore.getEvents();
      setEvents(allEvents);

      let current = allEvents[0];
      if (targetEventId) {
        const found = allEvents.find((e) => e.id === targetEventId);
        if (found) current = found;
      } else {
        current = await DataStore.getActiveEvent();
      }
      setActiveEvent(current);

      const [parts, przs, wins] = await Promise.all([
        DataStore.getParticipants(current.id),
        DataStore.getPrizes(current.id),
        DataStore.getWinners(current.id),
      ]);

      setParticipants(parts);
      setPrizes(przs);
      setWinners(wins);
    } catch (err) {
      console.error('Failed loading lucky draw data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Switch Event
  const handleSelectEvent = async (eventId: string) => {
    DataStore.setActiveEventId(eventId);
    await loadData(eventId);
  };

  // Confirm and Commit Drawn Winners
  const handleConfirmWinners = async (prize: Prize, selected: Participant[]) => {
    const pIds = selected.map((p) => p.id);
    const updatedWinners = await DataStore.commitWinners(activeEvent.id, prize.id, pIds);

    // Refresh state
    const [parts, przs] = await Promise.all([
      DataStore.getParticipants(activeEvent.id),
      DataStore.getPrizes(activeEvent.id),
    ]);

    setWinners(updatedWinners);
    setParticipants(parts);
    setPrizes(przs);
  };

  // Remove/Cancel single winner (e.g. absent)
  const handleRemoveWinner = async (winnerId: string, participantId: string, prizeId: string) => {
    await DataStore.cancelWinner(activeEvent.id, winnerId, participantId, prizeId);
    const [parts, przs, wins] = await Promise.all([
      DataStore.getParticipants(activeEvent.id),
      DataStore.getPrizes(activeEvent.id),
      DataStore.getWinners(activeEvent.id),
    ]);
    setParticipants(parts);
    setPrizes(przs);
    setWinners(wins);
  };

  // Event Theme Save
  const handleSaveEvent = async (updatedEvent: EventItem) => {
    await DataStore.saveEvent(updatedEvent);
    setActiveEvent(updatedEvent);
    const all = await DataStore.getEvents();
    setEvents(all);
  };

  // Create New Event
  const handleCreateNewEvent = async (name: string, description: string) => {
    const newEv: EventItem = {
      id: `event-${Date.now()}`,
      name,
      description,
      event_date: new Date().toISOString().split('T')[0],
      primary_color: '#EAB308',
      theme_preset: 'gold',
      bg_image_url: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&w=1920&q=80',
    };
    await DataStore.saveEvent(newEv);
    // Auto initialize 74 prizes for the new event
    await DataStore.resetDefault74Prizes(newEv.id);
    await handleSelectEvent(newEv.id);
  };

  // Import Batch Participants
  const handleImportParticipants = async (
    newParts: Omit<Participant, 'id' | 'is_winner' | 'created_at'>[]
  ) => {
    const formatted: Participant[] = newParts.map((p, idx) => ({
      ...p,
      id: `part-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      is_winner: false,
      created_at: new Date().toISOString(),
    }));
    const combined = [...participants, ...formatted];
    await DataStore.saveParticipants(activeEvent.id, combined);
    setParticipants(combined);
  };

  // Add Single Participant
  const handleAddParticipant = async (
    item: Omit<Participant, 'id' | 'is_winner' | 'created_at'>
  ) => {
    const added = await DataStore.addParticipant(item);
    setParticipants((prev) => [...prev, added]);
  };

  // Delete Participant
  const handleDeleteParticipant = async (id: string) => {
    await DataStore.deleteParticipant(activeEvent.id, id);
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  // Clear All Participants
  const handleClearParticipants = async () => {
    await DataStore.clearAllParticipants(activeEvent.id);
    setParticipants([]);
  };

  // Reset Participant Winner Status
  const handleResetParticipantsStatus = async () => {
    const reset = participants.map((p) => ({ ...p, is_winner: false }));
    await DataStore.saveParticipants(activeEvent.id, reset);
    setParticipants(reset);
  };

  // Reset 74 Prizes
  const handleReset74Prizes = async () => {
    const defaultPrizes = await DataStore.resetDefault74Prizes(activeEvent.id);
    setPrizes(defaultPrizes);
    alert('74 Hadiah standard telah dijana semula!');
  };

  // Add Custom Prize
  const handleAddPrize = async (item: Omit<Prize, 'id' | 'is_drawn' | 'created_at'>) => {
    const added = await DataStore.addPrize(item);
    setPrizes((prev) => [...prev, added].sort((a, b) => b.rank_order - a.rank_order));
  };

  // Delete Individual Prize
  const handleDeletePrize = async (prizeId: string) => {
    await DataStore.deletePrize(activeEvent.id, prizeId);
    setPrizes((prev) => prev.filter((p) => p.id !== prizeId));
  };

  // Clear All Prizes (Start from scratch)
  const handleClearAllPrizes = async () => {
    await DataStore.clearAllPrizes(activeEvent.id);
    setPrizes([]);
  };

  // Generate Custom Total Prizes (e.g. 10, 30, 50, etc.)
  const handleGenerateCustomPrizes = async (
    totalCount: number,
    grandCount: number,
    batchSize: number
  ) => {
    const generated = await DataStore.generateCustomPrizes(
      activeEvent.id,
      totalCount,
      grandCount,
      batchSize
    );
    setPrizes(generated);
    alert(`Berjaya menjana ${generated.length} hadiah tersuai!`);
  };

  // Update Prizes
  const handleUpdatePrize = async (updatedPrizes: Prize[]) => {
    await DataStore.savePrizes(activeEvent.id, updatedPrizes);
    setPrizes(updatedPrizes);
  };

  // Reset All Draws
  const handleResetAllDraws = async () => {
    await DataStore.resetAllDraws(activeEvent.id);
    const [parts, przs, wins] = await Promise.all([
      DataStore.getParticipants(activeEvent.id),
      DataStore.getPrizes(activeEvent.id),
      DataStore.getWinners(activeEvent.id),
    ]);
    setParticipants(parts);
    setPrizes(przs);
    setWinners(wins);
    alert('Semua cabutan telah di-reset!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mb-4" />
        <h2 className="text-lg font-bold">Memuatkan Sistem Cabutan Bertuah...</h2>
        <p className="text-xs text-slate-400 mt-1">Sila tunggu sebentar.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      {/* Universal Top Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        events={events}
        activeEvent={activeEvent}
        onSelectEvent={handleSelectEvent}
      />

      {/* Main Views */}
      {currentView === 'stage' && (
        <StageView
          activeEvent={activeEvent}
          prizes={prizes}
          participants={participants}
          winners={winners}
          onConfirmWinners={handleConfirmWinners}
          onRefreshData={() => loadData(activeEvent.id)}
        />
      )}

      {currentView === 'winners' && (
        <WinnersView
          activeEvent={activeEvent}
          winners={winners}
          prizes={prizes}
          participants={participants}
          onRemoveWinner={handleRemoveWinner}
        />
      )}

      {currentView === 'admin' && (
        <AdminDashboard
          events={events}
          activeEvent={activeEvent}
          participants={participants}
          prizes={prizes}
          winners={winners}
          onSaveEvent={handleSaveEvent}
          onCreateNewEvent={handleCreateNewEvent}
          onImportParticipants={handleImportParticipants}
          onAddParticipant={handleAddParticipant}
          onDeleteParticipant={handleDeleteParticipant}
          onClearParticipants={handleClearParticipants}
          onResetParticipantsStatus={handleResetParticipantsStatus}
          onReset74Prizes={handleReset74Prizes}
          onAddPrize={handleAddPrize}
          onDeletePrize={handleDeletePrize}
          onClearAllPrizes={handleClearAllPrizes}
          onGenerateCustomPrizes={handleGenerateCustomPrizes}
          onUpdatePrize={handleUpdatePrize}
          onResetAllDraws={handleResetAllDraws}
        />
      )}
    </div>
  );
}
