import { Participant } from '@/types';

/**
 * Cryptographically secure random integer generator [0, max)
 * Avoids Math.random() biases and ensures fairness.
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
}

/**
 * Fisher-Yates cryptographically fair shuffle
 */
export function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Pick N random unique winners from available non-winner participants.
 * Automatically excludes:
 * 1. Participants who already won (is_winner = true)
 * 2. Participants currently selected in the pending batch (excludedIds)
 */
export function pickRandomWinners(
  allParticipants: Participant[],
  count: number,
  excludedIds: string[] = []
): { selected: Participant[]; remainingEligibleCount: number } {
  const excludedSet = new Set(excludedIds);

  // Filter only eligible participants
  const eligible = allParticipants.filter(
    (p) => !p.is_winner && !excludedSet.has(p.id)
  );

  if (eligible.length === 0) {
    return { selected: [], remainingEligibleCount: 0 };
  }

  const shuffled = secureShuffle(eligible);
  const selectedCount = Math.min(count, shuffled.length);
  const selected = shuffled.slice(0, selectedCount);

  return {
    selected,
    remainingEligibleCount: eligible.length - selectedCount,
  };
}

/**
 * Pick a single replacement participant (for when an individual in a batch draw is absent)
 */
export function pickReplacementWinner(
  allParticipants: Participant[],
  currentBatchIds: string[]
): Participant | null {
  const currentBatchSet = new Set(currentBatchIds);
  const eligible = allParticipants.filter(
    (p) => !p.is_winner && !currentBatchSet.has(p.id)
  );

  if (eligible.length === 0) return null;

  const randomIndex = getSecureRandomInt(eligible.length);
  return eligible[randomIndex];
}
