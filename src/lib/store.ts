import { EventItem, Participant, Prize, Winner } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Generate a valid RFC4122 version 4 UUID for PostgreSQL compatibility
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Default Event with a valid UUID
export const DEFAULT_EVENT_ID = '30150754-4af2-4474-8fd5-a228b53fe403';

export const INITIAL_EVENT: EventItem = {
  id: DEFAULT_EVENT_ID,
  name: 'Malam Gala Gemilang 2026',
  description: 'Majlis Makan Malam & Cabutan Bertuah Tahunan',
  event_date: new Date().toISOString().split('T')[0],
  bg_image_url: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&w=1920&q=80',
  logo_url: '',
  primary_color: '#EAB308',
  theme_preset: 'gold',
  participant_mode: 'both',
  created_at: new Date().toISOString(),
};

// Generate standard 74 prizes specification
export function createDefault74Prizes(eventId: string): Prize[] {
  const prizes: Prize[] = [];

  // Prizes 74 to 34 (Saguhati / Cabutan Sampingan) - Batch mode 10
  for (let rank = 74; rank >= 34; rank--) {
    prizes.push({
      id: generateUUID(),
      event_id: eventId,
      name: `Hadiah Saguhati #${rank}`,
      category: 'Hadiah Sampingan',
      rank_order: rank,
      draw_type: 'batch',
      batch_size: 10,
      is_drawn: false,
      created_at: new Date().toISOString(),
    });
  }

  // Prizes 33 to 1 (Hadiah Utama / Grand Prizes) - Single mode 1-by-1
  for (let rank = 33; rank >= 1; rank--) {
    let name = `Hadiah Utama #${rank}`;
    if (rank === 1) name = 'HADIAH UTAMA #1: Motosikal Honda Vario 160';
    else if (rank === 2) name = 'HADIAH UTAMA #2: iPhone 16 Pro 256GB';
    else if (rank === 3) name = 'HADIAH UTAMA #3: Smart TV Samsung 65" UHD 4K';
    else if (rank === 4) name = 'HADIAH UTAMA #4: Apple iPad Air M2 11"';
    else if (rank === 5) name = 'HADIAH UTAMA #5: Peti Sejuk 2-Pintu Inverter';
    else if (rank === 6) name = 'HADIAH UTAMA #6: Mesin Basuh Automatik 10kg';
    else if (rank === 7) name = 'HADIAH UTAMA #7: Sony Soundbar 5.1 Dolby';
    else if (rank === 8) name = 'HADIAH UTAMA #8: Dyson Digital Slim Vacuum';
    else if (rank === 9) name = 'HADIAH UTAMA #9: Philips Air Fryer XXL';
    else if (rank === 10) name = 'HADIAH UTAMA #10: Nintendo Switch OLED';

    prizes.push({
      id: generateUUID(),
      event_id: eventId,
      name,
      category: 'Hadiah Utama',
      rank_order: rank,
      draw_type: 'single',
      batch_size: 1,
      is_drawn: false,
      created_at: new Date().toISOString(),
    });
  }

  return prizes.sort((a, b) => b.rank_order - a.rank_order);
}

// Generate starting participants for first-time demo
export function createDefaultParticipants(eventId: string): Participant[] {
  const departments = ['Teknologi Maklumat', 'Sumber Manusia', 'Kewangan', 'Operasi', 'Pemasaran', 'Logistik'];
  const names = [
    'Ahmad Ridzuan bin Ismail', 'Siti Nurhaliza binti Ramli', 'Muhammad Faiz bin Osman',
    'Nurul Aisyah binti Zakaria', 'Tan Wei Liang', 'Pravin Kumar a/l Raman',
    'Mohd Hafizuddin bin Razak', 'Farah Diana binti Rosli', 'Chong Jia Wei',
    'Kavitha a/p Subramaniam', 'Zulhilmi bin Abdul Wahab', 'Nor Azlina binti Mansor',
    'Muhammad Ammar bin Roslan', 'Siti Sarah binti Hashim', 'Lee Ming Xuan'
  ];

  return names.map((name, idx) => ({
    id: generateUUID(),
    event_id: eventId,
    name,
    ticket_number: `TK-${String(1001 + idx).padStart(4, '0')}`,
    department: departments[idx % departments.length],
    is_winner: false,
    created_at: new Date().toISOString(),
  }));
}

// LocalStorage Helper Keys
const LS_KEYS = {
  EVENTS: 'lucky_draw_events',
  PARTICIPANTS: 'lucky_draw_participants',
  PRIZES: 'lucky_draw_prizes',
  WINNERS: 'lucky_draw_winners',
  ACTIVE_EVENT_ID: 'lucky_draw_active_event_id',
  INITIALIZED: 'lucky_draw_init_done',
};

// ==============================================================================
// UNIFIED DATA SERVICE (Supabase + LocalStorage Fallback)
// ==============================================================================

export const DataStore = {
  isUsingCloud(): boolean {
    return isSupabaseConfigured();
  },

  // ----------------------------------------------------------------------------
  // EVENTS
  // ----------------------------------------------------------------------------
  async getEvents(): Promise<EventItem[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const hydrated = (data as EventItem[]).map((ev) => {
            const m = typeof window !== 'undefined' ? (localStorage.getItem(`lucky_draw_part_mode_${ev.id}`) as any) : null;
            return { ...ev, participant_mode: m || ev.participant_mode || 'both' };
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem(LS_KEYS.EVENTS, JSON.stringify(hydrated));
          }
          return hydrated;
        }
        // If Supabase table is completely empty, insert initial event
        if (!error && data && data.length === 0) {
          const { participant_mode, ...initData } = INITIAL_EVENT;
          const { data: inserted } = await supabase.from('events').insert(initData).select();
          if (inserted && inserted.length > 0) {
            return inserted.map((ev) => ({ ...ev, participant_mode: 'both' })) as EventItem[];
          }
        }
      } catch (err) {
        console.warn('Supabase getEvents error, falling back to local storage:', err);
      }
    }

    if (typeof window === 'undefined') return [INITIAL_EVENT];
    const stored = localStorage.getItem(LS_KEYS.EVENTS);
    if (!stored) {
      localStorage.setItem(LS_KEYS.EVENTS, JSON.stringify([INITIAL_EVENT]));
      return [INITIAL_EVENT];
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((ev: EventItem) => {
          const m = typeof window !== 'undefined' ? (localStorage.getItem(`lucky_draw_part_mode_${ev.id}`) as any) : null;
          return { ...ev, participant_mode: m || ev.participant_mode || 'both' };
        });
      }
      return [INITIAL_EVENT];
    } catch {
      return [INITIAL_EVENT];
    }
  },

  async getActiveEvent(): Promise<EventItem> {
    const events = await this.getEvents();
    if (typeof window !== 'undefined') {
      const activeId = localStorage.getItem(LS_KEYS.ACTIVE_EVENT_ID);
      const found = events.find((e) => e.id === activeId);
      if (found) return found;
    }
    return events[0] || INITIAL_EVENT;
  },

  setActiveEventId(eventId: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_KEYS.ACTIVE_EVENT_ID, eventId);
    }
  },

  async saveEvent(event: EventItem): Promise<EventItem> {
    if (typeof window !== 'undefined' && event.participant_mode) {
      localStorage.setItem(`lucky_draw_part_mode_${event.id}`, event.participant_mode);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { participant_mode, ...supabaseEvent } = event;
        const { data, error } = await supabase.from('events').upsert(supabaseEvent).select().single();
        if (!error && data) {
          event = { ...event, ...(data as EventItem), participant_mode: event.participant_mode || 'both' };
        }
      } catch (err) {
        console.error('Supabase saveEvent error:', err);
      }
    }

    const events = await this.getEvents();
    const existingIndex = events.findIndex((e) => e.id === event.id);
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.unshift(event);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_KEYS.EVENTS, JSON.stringify(events));
    }
    return event;
  },

  // ----------------------------------------------------------------------------
  // PARTICIPANTS
  // ----------------------------------------------------------------------------
  async getParticipants(eventId: string): Promise<Participant[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select('*')
          .eq('event_id', eventId)
          .order('ticket_number', { ascending: true });
        
        // Return exactly what Supabase has (even if [] or only 3 participants!)
        if (!error && data !== null) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`${LS_KEYS.PARTICIPANTS}_${eventId}`, JSON.stringify(data));
            localStorage.setItem(`${LS_KEYS.INITIALIZED}_parts_${eventId}`, 'true');
          }
          return data as Participant[];
        }
      } catch (err) {
        console.warn('Supabase getParticipants error:', err);
      }
    }

    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${LS_KEYS.PARTICIPANTS}_${eventId}`);

    // If stored in localStorage, respect whatever list the user has (including empty [])
    if (stored !== null) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    return [];
  },

  async saveParticipants(eventId: string, list: Participant[]): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LS_KEYS.PARTICIPANTS}_${eventId}`, JSON.stringify(list));
      localStorage.setItem(`${LS_KEYS.INITIALIZED}_parts_${eventId}`, 'true');
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        // Delete participants for this event then re-insert to keep in exact sync
        await supabase.from('participants').delete().eq('event_id', eventId);
        if (list.length > 0) {
          await supabase.from('participants').insert(list);
        }
      } catch (err) {
        console.error('Supabase saveParticipants error:', err);
      }
    }
  },

  async addParticipant(participant: Omit<Participant, 'id' | 'is_winner' | 'created_at'>): Promise<Participant> {
    const newPart: Participant = {
      ...participant,
      id: generateUUID(),
      is_winner: false,
      created_at: new Date().toISOString(),
    };

    const current = await this.getParticipants(participant.event_id);
    current.push(newPart);
    await this.saveParticipants(participant.event_id, current);
    return newPart;
  },

  async deleteParticipant(eventId: string, participantId: string): Promise<void> {
    const current = await this.getParticipants(eventId);
    const filtered = current.filter((p) => p.id !== participantId);
    await this.saveParticipants(eventId, filtered);
  },

  async updateParticipant(eventId: string, updated: Participant): Promise<Participant> {
    const current = await this.getParticipants(eventId);
    const index = current.findIndex((p) => p.id === updated.id);
    if (index >= 0) {
      current[index] = { ...current[index], ...updated };
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LS_KEYS.PARTICIPANTS}_${eventId}`, JSON.stringify(current));
    }
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('participants')
          .update({
            name: updated.name,
            ticket_number: updated.ticket_number,
            department: updated.department,
            is_winner: updated.is_winner,
          })
          .eq('id', updated.id);
      } catch (err) {
        console.error('Supabase updateParticipant error:', err);
      }
    }
    return updated;
  },

  async clearAllParticipants(eventId: string): Promise<void> {
    await this.saveParticipants(eventId, []);
  },

  // ----------------------------------------------------------------------------
  // PRIZES
  // ----------------------------------------------------------------------------
  async getPrizes(eventId: string): Promise<Prize[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('prizes')
          .select('*')
          .eq('event_id', eventId)
          .order('rank_order', { ascending: false });

        // If query succeeded, respect the EXACT prizes in DB (even if 1 prize or 0 prizes!)
        if (!error && data !== null) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`${LS_KEYS.PRIZES}_${eventId}`, JSON.stringify(data));
            localStorage.setItem(`${LS_KEYS.INITIALIZED}_prizes_${eventId}`, 'true');
          }
          return data as Prize[];
        }
      } catch (err) {
        console.warn('Supabase getPrizes error:', err);
      }
    }

    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${LS_KEYS.PRIZES}_${eventId}`);

    // If stored in localStorage, respect whatever list the user has (including empty [])
    if (stored !== null) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    return [];
  },

  async savePrizes(eventId: string, prizes: Prize[]): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LS_KEYS.PRIZES}_${eventId}`, JSON.stringify(prizes));
      localStorage.setItem(`${LS_KEYS.INITIALIZED}_prizes_${eventId}`, 'true');
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('prizes').delete().eq('event_id', eventId);
        if (prizes.length > 0) {
          await supabase.from('prizes').insert(prizes);
        }
      } catch (err) {
        console.error('Supabase savePrizes error:', err);
      }
    }
  },

  async resetDefault74Prizes(eventId: string): Promise<Prize[]> {
    const prizes = createDefault74Prizes(eventId);
    await this.savePrizes(eventId, prizes);
    return prizes;
  },

  async addPrize(prize: Omit<Prize, 'id' | 'is_drawn' | 'created_at'>): Promise<Prize> {
    const newPrize: Prize = {
      ...prize,
      id: generateUUID(),
      is_drawn: false,
      created_at: new Date().toISOString(),
    };

    const current = await this.getPrizes(prize.event_id);
    current.push(newPrize);
    current.sort((a, b) => b.rank_order - a.rank_order);
    await this.savePrizes(prize.event_id, current);
    return newPrize;
  },

  async deletePrize(eventId: string, prizeId: string): Promise<void> {
    const current = await this.getPrizes(eventId);
    const filtered = current.filter((p) => p.id !== prizeId);
    await this.savePrizes(eventId, filtered);
  },

  async clearAllPrizes(eventId: string): Promise<void> {
    await this.savePrizes(eventId, []);
  },

  async generateCustomPrizes(
    eventId: string,
    totalPrizes: number,
    grandCount: number,
    batchSize: number
  ): Promise<Prize[]> {
    const prizes: Prize[] = [];
    const actualGrand = Math.min(grandCount, totalPrizes);

    // Saguhati prizes
    for (let r = totalPrizes; r > actualGrand; r--) {
      prizes.push({
        id: generateUUID(),
        event_id: eventId,
        name: `Hadiah Saguhati #${r}`,
        category: 'Hadiah Sampingan',
        rank_order: r,
        draw_type: 'batch',
        batch_size: batchSize,
        is_drawn: false,
        created_at: new Date().toISOString(),
      });
    }

    // Grand prizes
    for (let r = actualGrand; r >= 1; r--) {
      prizes.push({
        id: generateUUID(),
        event_id: eventId,
        name: r === 1 ? 'HADIAH UTAMA #1' : `HADIAH UTAMA #${r}`,
        category: 'Hadiah Utama',
        rank_order: r,
        draw_type: 'single',
        batch_size: 1,
        is_drawn: false,
        created_at: new Date().toISOString(),
      });
    }

    prizes.sort((a, b) => b.rank_order - a.rank_order);
    await this.savePrizes(eventId, prizes);
    return prizes;
  },

  // ----------------------------------------------------------------------------
  // WINNERS & DRAW RECORDING
  // ----------------------------------------------------------------------------
  async getWinners(eventId: string): Promise<Winner[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('winners')
          .select('*, prize:prizes(*), participant:participants(*)')
          .eq('event_id', eventId)
          .order('won_at', { ascending: false });
        if (!error && data) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`${LS_KEYS.WINNERS}_${eventId}`, JSON.stringify(data));
          }
          return data as Winner[];
        }
      } catch (err) {
        console.warn('Supabase getWinners error:', err);
      }
    }

    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${LS_KEYS.WINNERS}_${eventId}`);
    if (!stored) return [];
    try {
      const winners: Winner[] = JSON.parse(stored);
      const [participants, prizes] = await Promise.all([
        this.getParticipants(eventId),
        this.getPrizes(eventId),
      ]);
      // Hydrate
      return winners.map((w) => ({
        ...w,
        participant: participants.find((p) => p.id === w.participant_id),
        prize: prizes.find((prz) => prz.id === w.prize_id),
      }));
    } catch {
      return [];
    }
  },

  /**
   * Commit drawn winners:
   * 1. Mark participants as is_winner = true
   * 2. Mark prize as is_drawn = true
   * 3. Insert into winners table
   */
  async commitWinners(
    eventId: string,
    prizeId: string,
    participantIds: string[]
  ): Promise<Winner[]> {
    const now = new Date().toISOString();
    const newWinners: Winner[] = participantIds.map((pId) => ({
      id: generateUUID(),
      event_id: eventId,
      prize_id: prizeId,
      participant_id: pId,
      won_at: now,
    }));

    // Update participants & prizes in store
    const [allParticipants, allPrizes, currentWinners] = await Promise.all([
      this.getParticipants(eventId),
      this.getPrizes(eventId),
      this.getWinners(eventId),
    ]);

    const partMap = new Set(participantIds);
    allParticipants.forEach((p) => {
      if (partMap.has(p.id)) p.is_winner = true;
    });

    const prize = allPrizes.find((p) => p.id === prizeId);
    if (prize) prize.is_drawn = true;

    // Save locally
    const updatedWinners = [...newWinners, ...currentWinners];
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LS_KEYS.WINNERS}_${eventId}`, JSON.stringify(updatedWinners));
      localStorage.setItem(`${LS_KEYS.PARTICIPANTS}_${eventId}`, JSON.stringify(allParticipants));
      localStorage.setItem(`${LS_KEYS.PRIZES}_${eventId}`, JSON.stringify(allPrizes));
    }

    // Also persist to Supabase if available
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('winners').insert(newWinners);
        await supabase.from('participants').update({ is_winner: true }).in('id', participantIds);
        await supabase.from('prizes').update({ is_drawn: true }).eq('id', prizeId);
      } catch (err) {
        console.error('Supabase commitWinners error:', err);
      }
    }

    return this.getWinners(eventId);
  },

  /**
   * Re-spin/remove an individual winner (e.g., absent)
   */
  async cancelWinner(eventId: string, winnerId: string, participantId: string, prizeId: string): Promise<void> {
    const currentWinners = await this.getWinners(eventId);
    const filteredWinners = currentWinners.filter((w) => w.id !== winnerId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LS_KEYS.WINNERS}_${eventId}`, JSON.stringify(filteredWinners));
    }

    const participants = await this.getParticipants(eventId);
    const targetP = participants.find((p) => p.id === participantId);
    if (targetP) {
      targetP.is_winner = false;
      await this.saveParticipants(eventId, participants);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('winners').delete().eq('id', winnerId);
        await supabase.from('participants').update({ is_winner: false }).eq('id', participantId);
      } catch (err) {
        console.error('Supabase cancelWinner error:', err);
      }
    }
  },

  /**
   * Reset all winners and participant statuses (Fresh Start)
   * KEEPS user's custom participants and prizes intact!
   */
  async resetAllDraws(eventId: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${LS_KEYS.WINNERS}_${eventId}`);
    }

    const [participants, prizes] = await Promise.all([
      this.getParticipants(eventId),
      this.getPrizes(eventId),
    ]);

    participants.forEach((p) => (p.is_winner = false));
    prizes.forEach((prz) => (prz.is_drawn = false));

    await Promise.all([
      this.saveParticipants(eventId, participants),
      this.savePrizes(eventId, prizes),
    ]);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('winners').delete().eq('event_id', eventId);
        await supabase.from('participants').update({ is_winner: false }).eq('event_id', eventId);
        await supabase.from('prizes').update({ is_drawn: false }).eq('event_id', eventId);
      } catch (err) {
        console.error('Supabase resetAllDraws error:', err);
      }
    }
  },
};
