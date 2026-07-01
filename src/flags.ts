/** Cycle-flag groups bound to keyboard shortcuts (Ctrl+/ etc.). */
export const CYCLE_FLAG_GROUPS = {
  done: ['☑️', '✅', '🎉'],
  closed: ['❌', '❎', '🗑️'],
  pending: ['🟡', '⏱️', '⌛', '🚧', '🔄', '🛠️'],
  importance: ['📝', '📍', '📌'],
  attention: ['⚠️', '‼️', '🔥'],
  drink: ['☕️', '🍵', '🍼', '🍻', '🍹', '🍷'],
  goodEmotion: ['💕', '🤏', '☺️', '😃', '👍', '😍', '😘'],
  badEmotion: ['🥺', '🫩', '😂', '🤣', '😭', '😅', '💀'],
} as const;

export type CycleFlagGroup = keyof typeof CYCLE_FLAG_GROUPS;

export const ALL_CYCLE_FLAGS: readonly string[] = Object.values(CYCLE_FLAG_GROUPS).flat();

function normalizeFlag(flag: string): string {
  return flag.replace(/\uFE0E|\uFE0F/g, '');
}

const NORMALIZED_CYCLE_FLAG_SET = new Set(ALL_CYCLE_FLAGS.map(normalizeFlag));

export function isCycleEmojiFlag(flag: string): boolean {
  return NORMALIZED_CYCLE_FLAG_SET.has(normalizeFlag(flag));
}
