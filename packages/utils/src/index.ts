/**
 * Calculates spaced repetition parameters using the SM-2 algorithm.
 * @param quality Recall quality rating (1 to 5)
 * @param prevRepetitions Number of consecutive successful recalls
 * @param prevEaseFactor Ease factor (defaults to 2.5)
 * @param prevInterval Interval in days
 */
export function calculateSM2(
  quality: number,
  prevRepetitions: number,
  prevEaseFactor: number = 2.5,
  prevInterval: number = 0,
): { repetitions: number; easeFactor: number; intervalDays: number } {
  let repetitions = prevRepetitions;
  let easeFactor = prevEaseFactor;
  let intervalDays = prevInterval;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 3; // First interval defaults to 3 days (customized for exam study)
    } else {
      intervalDays = Math.round(prevInterval * easeFactor);
    }
    repetitions++;
  }

  // Adjust Ease Factor (EF)
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Cap Ease Factor at a minimum of 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  return {
    repetitions,
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    intervalDays,
  };
}

/**
 * Format seconds to HH:MM:SS string.
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
}
