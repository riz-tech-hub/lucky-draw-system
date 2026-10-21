import confetti from 'canvas-confetti';

/**
 * Standard center explosion
 */
export function fireConfettiStandard() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FACC15', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#EC4899'],
  });
}

/**
 * Spectacular Dual-Cannon celebration from bottom corners for Grand Prize reveals
 */
export function fireConfettiDualCannons(durationMs: number = 3000) {
  const end = Date.now() + durationMs;
  const colors = ['#EAB308', '#F59E0B', '#FDE047', '#38BDF8', '#F43F5E', '#A855F7'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

/**
 * Golden star rain for Batch Draw (10 winners)
 */
export function fireConfettiBatch() {
  confetti({
    particleCount: 80,
    angle: 90,
    spread: 100,
    startVelocity: 35,
    origin: { y: 0.4 },
    colors: ['#FACC15', '#FDE047', '#CA8A04', '#FFFFFF'],
    shapes: ['star', 'circle'],
  });
}
