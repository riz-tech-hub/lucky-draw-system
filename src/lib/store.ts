import { EventItem, Participant, Prize, Winner } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const DEFAULT_EVENT_ID = 'demo-event-2026';

export const INITIAL_EVENT: EventItem = {
  id: DEFAULT_EVENT_ID,
  name: 'Malam Gala Gemilang 2026',
  description: 'Majlis Makan Malam & Cabutan Bertuah Tahunan',
  event_date: new Date().toISOString().split('T')[0],
  bg_image_url: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&w=1920&q=80',
  logo_url: '',
  primary_color: '#EAB308',
  theme_preset: 'gold',
  created_at: new Date().toISOString(),
};

// Generate standard 74 prizes specification
export function createDefault74Prizes(eventId: string): Prize[] {
  const prizes: Prize[] = [];

  // Prizes 74 to 34 (Saguhati / Cabutan Sampingan) - Batch mode 10
  for (let rank = 74; rank >= 34; rank--) {
    prizes.push({
      id: `prize-${eventId}-${rank}`,
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
      id: `prize-${eventId}-${rank}`,
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

  // Sort descending by rank_order (74 down to 1)
  return prizes.sort((a, b) => b.rank_order - a.rank_order);
}

// Generate realistic starting participants for demo testing
export function createDefaultParticipants(eventId: string): Participant[] {
  const departments = ['Teknologi Maklumat', 'Sumber Manusia', 'Kewangan', 'Operasi', 'Pemasaran', 'Logistik', 'Khidmat Pelanggan'];
  const names = [
    'Ahmad Ridzuan bin Ismail', 'Siti Nurhaliza binti Ramli', 'Muhammad Faiz bin Osman',
    'Nurul Aisyah binti Zakaria', 'Tan Wei Liang', 'Pravin Kumar a/l Raman',
    'Mohd Hafizuddin bin Razak', 'Farah Diana binti Rosli', 'Chong Jia Wei',
    'Kavitha a/p Subramaniam', 'Zulhilmi bin Abdul Wahab', 'Nor Azlina binti Mansor',
    'Muhammad Ammar bin Roslan', 'Siti Sarah binti Hashim', 'Lee Ming Xuan',
    'Arun a/l Murugan', 'Mohd Danial bin Azhar', 'Anis Syahirah binti Bakar',
    'Kelvin Lim Chee Seng', 'Nadia Natasha binti Kamarudin', 'Megat Iskandar bin Megat Hashim',
    'Puteri Nur Balqis binti Yusoff', 'Mohd Syazwan bin Daud', 'Cheah Siew Ling',
    'Goh Wei Kiat', 'Siti Aminah binti Kassim', 'Khairul Naim bin Hamdan',
    'Nurul Huda binti Sulaiman', 'Vikneswaran a/l Ganesan', 'Sharifah Munirah binti Syed Omar',
    'Muhammad Harith bin Jamil', 'Nur Ain binti Mustapha', 'Teo Boon Keng',
    'Hazim bin Khairuddin', 'Amira Sofea binti Adnan', 'Daniel Wong Chun Kit',
    'Thivya a/p Mohan', 'Azman bin Othman', 'Noraini binti Abdullah',
    'Muhammad Syafiq bin Salleh', 'Liew Mei Ling', 'Suresh a/l Rajendran',
    'Nur Fatihah binti Zulkifli', 'Mohd Firdaus bin Alias', 'Ng Wai Hong',
    'Siti Mariam binti Ibrahim', 'Wan Ahmad Faris bin Wan Azman', 'Tan Kai Xuan',
    'Raja Azlan bin Raja Sulaiman', 'Zalikha binti Zainal Abidin', 'Mohamad Aizat bin Saiful',
    'Nur Qistina binti Shamsul', 'Pang Kok Keong', 'Ravin a/l Velu',
    'Siti Khatijah binti Mohd Noor', 'Luqman Hakim bin Badrul', 'Fatin Nabilah binti Ismail',
    'Daphne Low Hui Min', 'Syed Muzaffar bin Syed Ali', 'Nur Sabrina binti Jeffry',
    'Alif Haiqal bin Kamarul', 'Norhafizah binti Mat Zin', 'Raymond Tan Guan Jie',
    'Karthik a/l Annamalai', 'Mohd Rahmat bin Sanusi', 'Aina Mardhiah binti Latif',
    'Jason Chan Chi Ho', 'Shalini a/p Krishnan', 'Muhammad Haziq bin Shukri',
    'Nur Safiyyah binti Redzuan', 'Khairul Anuar bin Basir', 'Fong Suet Yee',
    'Deepak a/l Naidu', 'Sharifah Amani binti Syed Noh', 'Zaim Asyraf bin Zulkarnain',
    'Nurul Iman binti Fauzi', 'Lim Jing Wen', 'Naveen a/l Chandran',
    'Haziqah binti Abdul Aziz', 'Mohd Zulfadhli bin Johari', 'Nurul Syuhada binti Mazlan',
    'Kenny Wong Kok Hoong', 'Preeti a/p Sivakumar', 'Amirul Asyraf bin Johari',
    'Nur Syazana binti Johari', 'Vincent Tan Kok Wei', 'Kogilavani a/p Muthusamy',
    'Muhammad Danish bin Rizal', 'Siti Zulaikha binti Roslan', 'Low Jun Wei',
    'Siti Zubaidah binti Yaakob', 'Mohd Farhan bin Zainal', 'Nur Adila binti Hamzah',
    'Justin Ong Wei Lun', 'Devi a/p Chandran', 'Ahmad Taufiq bin Marzuki',
    'Nurul Izzati binti Azman', 'Bernard Wong Soon Hock', 'Gayathri a/p Balakrishnan',
    'Muhammad Irfan bin Norman', 'Siti Rohani binti Mat Said', 'Kwan Siew Fen',
    'Shahrul Nizam bin Borhan', 'Nur Syamimi binti Ridzuan', 'Alvin Tan Zhen Yang',
    'Mohd Yusof bin Mat Lazim', 'Fatin Farhana binti Jalil', 'Kok Chee Keong',
    'Mageswari a/p Arumugam', 'Izzat Haikal bin Nazri', 'Nur Fadhilah binti Daud',
    'Tan Sze Min', 'Ganesh a/l Vijayakumar', 'Mohd Izzuddin bin Halim',
    'Siti Fairuz binti Che Mat', 'Wong Jian Hao', 'Sangeetha a/p Ramesh',
    'Muhammad Aqil bin Safuan', 'Nurul Husna binti Jalil', 'Chua Seng Huat'
  ];

  return names.map((name, idx) => ({
    id: `part-${eventId}-${idx + 1}`,
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
};

// ==============================================================================
// UNIFIED DATA SERVICE (Supabase + LocalStorage Fallback)
// ==============================================================================

export const DataStore = {
  // Check storage engine
  isUsingCloud(): boolean {
    return isSupabaseConfigured();
  },

  // ----------------------------------------------------------------------------
  // EVENTS
  // ----------------------------------------------------------------------------
  async getEvents(): Promise<EventItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as EventItem[];
    }

    // Local fallback
    if (typeof window === 'undefined') return [INITIAL_EVENT];
    const stored = localStorage.getItem(LS_KEYS.EVENTS);
    if (!stored) {
      localStorage.setItem(LS_KEYS.EVENTS, JSON.stringify([INITIAL_EVENT]));
      return [INITIAL_EVENT];
    }
    try {
      return JSON.parse(stored);
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
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('events')
        .upsert(event)
        .select()
        .single();
      if (!error && data) return data as EventItem;
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
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', eventId)
        .order('ticket_number', { ascending: true });
      if (!error && data) return data as Participant[];
    }

    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${LS_KEYS.PARTICIPANTS}_${eventId}`);
    if (!stored) {
      const defaults = createDefaultParticipants(eventId);
      localStorage.setItem(`${LS_KEYS.PARTICIPANTS}_${eventId}`, JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  async saveParticipants(eventId: string, list: Participant[]): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      // Upsert to Supabase
      await supabase.from('participants').upsert(list);
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LS_KEYS.PARTICIPANTS}_${eventId}`, JSON.stringify(list));
    }
  },

  async addParticipant(participant: Omit<Participant, 'id' | 'is_winner' | 'created_at'>): Promise<Participant> {
    const newPart: Participant = {
      ...participant,
      id: `part-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      is_winner: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('participants').insert(newPart).select().single();
      if (data) return data as Participant;
    }

    const current = await this.getParticipants(participant.event_id);
    current.push(newPart);
    await this.saveParticipants(participant.event_id, current);
    return newPart;
  },

  async deleteParticipant(eventId: string, participantId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('participants').delete().eq('id', participantId);
      return;
    }
    const current = await this.getParticipants(eventId);
    const filtered = current.filter((p) => p.id !== participantId);
    await this.saveParticipants(eventId, filtered);
  },

  async clearAllParticipants(eventId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('participants').delete().eq('event_id', eventId);
      return;
    }
    await this.saveParticipants(eventId, []);
  },

  // ----------------------------------------------------------------------------
  // PRIZES
  // ----------------------------------------------------------------------------
  async getPrizes(eventId: string): Promise<Prize[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .eq('event_id', eventId)
        .order('rank_order', { ascending: false });
      if (!error && data && data.length > 0) return data as Prize[];
    }

    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${LS_KEYS.PRIZES}_${eventId}`);
    if (!stored) {
      const defaultPrizes = createDefault74Prizes(eventId);
      localStorage.setItem(`${LS_KEYS.PRIZES}_${eventId}`, JSON.stringify(defaultPrizes));
      return defaultPrizes;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  async savePrizes(eventId: string, prizes: Prize[]): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('prizes').upsert(prizes);
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LS_KEYS.PRIZES}_${eventId}`, JSON.stringify(prizes));
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
      id: `prize-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      is_drawn: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('prizes').insert(newPrize).select().single();
      if (data) return data as Prize;
    }

    const current = await this.getPrizes(prize.event_id);
    current.push(newPrize);
    current.sort((a, b) => b.rank_order - a.rank_order);
    await this.savePrizes(prize.event_id, current);
    return newPrize;
  },

  async deletePrize(eventId: string, prizeId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('prizes').delete().eq('id', prizeId);
      return;
    }
    const current = await this.getPrizes(eventId);
    const filtered = current.filter((p) => p.id !== prizeId);
    await this.savePrizes(eventId, filtered);
  },

  async clearAllPrizes(eventId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('prizes').delete().eq('event_id', eventId);
      return;
    }
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

    // Saguhati prizes: rank totalPrizes down to (actualGrand + 1)
    for (let r = totalPrizes; r > actualGrand; r--) {
      prizes.push({
        id: `prize-${eventId}-${r}`,
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

    // Grand prizes: rank actualGrand down to 1
    for (let r = actualGrand; r >= 1; r--) {
      prizes.push({
        id: `prize-${eventId}-${r}`,
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
      const { data, error } = await supabase
        .from('winners')
        .select('*, prize:prizes(*), participant:participants(*)')
        .eq('event_id', eventId)
        .order('won_at', { ascending: false });
      if (!error && data) return data as Winner[];
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
      id: `win-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      event_id: eventId,
      prize_id: prizeId,
      participant_id: pId,
      won_at: now,
    }));

    if (isSupabaseConfigured() && supabase) {
      // Supabase transaction simulation
      await supabase.from('winners').insert(newWinners);
      await supabase.from('participants').update({ is_winner: true }).in('id', participantIds);
      await supabase.from('prizes').update({ is_drawn: true }).eq('id', prizeId);
      return this.getWinners(eventId);
    }

    // Local Storage
    const [allParticipants, allPrizes, currentWinners] = await Promise.all([
      this.getParticipants(eventId),
      this.getPrizes(eventId),
      this.getWinners(eventId),
    ]);

    // Update participants
    const partMap = new Set(participantIds);
    allParticipants.forEach((p) => {
      if (partMap.has(p.id)) p.is_winner = true;
    });
    await this.saveParticipants(eventId, allParticipants);

    // Update prize
    const prize = allPrizes.find((p) => p.id === prizeId);
    if (prize) prize.is_drawn = true;
    await this.savePrizes(eventId, allPrizes);

    // Save winners
    const updatedWinners = [...newWinners, ...currentWinners];
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LS_KEYS.WINNERS}_${eventId}`, JSON.stringify(updatedWinners));
    }

    return this.getWinners(eventId);
  },

  /**
   * Re-spin/remove an individual winner (e.g., absent)
   */
  async cancelWinner(eventId: string, winnerId: string, participantId: string, prizeId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('winners').delete().eq('id', winnerId);
      await supabase.from('participants').update({ is_winner: false }).eq('id', participantId);
      return;
    }

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
  },

  /**
   * Reset all winners and participant statuses (Fresh Start)
   */
  async resetAllDraws(eventId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('winners').delete().eq('event_id', eventId);
      await supabase.from('participants').update({ is_winner: false }).eq('event_id', eventId);
      await supabase.from('prizes').update({ is_drawn: false }).eq('event_id', eventId);
      return;
    }

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
  },
};
