export type ThemePreset = 'gold' | 'emerald' | 'royal_blue' | 'neon_purple' | 'crimson';

export interface EventItem {
  id: string;
  name: string;
  description?: string;
  event_date: string;
  bg_image_url?: string;
  logo_url?: string;
  primary_color: string;
  theme_preset: ThemePreset;
  created_at?: string;
}

export interface Participant {
  id: string;
  event_id: string;
  name: string;
  ticket_number: string;
  department: string;
  is_winner: boolean;
  created_at?: string;
}

export interface Prize {
  id: string;
  event_id: string;
  name: string;
  category: string;
  image_url?: string;
  rank_order: number; // 1 to 74
  draw_type: 'batch' | 'single';
  batch_size: number;
  is_drawn: boolean;
  created_at?: string;
}

export interface Winner {
  id: string;
  event_id: string;
  prize_id: string;
  participant_id: string;
  won_at: string;
  notes?: string;
  // Hydrated joins
  prize?: Prize;
  participant?: Participant;
}

export interface DrawCandidate {
  participant: Participant;
  prize: Prize;
}
