export type QuickQuestion = string | { text: string; emoji?: string };

export const EMOJI_CHOICES = [
  '💡', '✨', '❓', '💬', '👋', '🕐', '✉️', '📍', '📞', '🏠',
  '🚀', '🔒', '💻', '📦', '↩️', '🔎', '📚', '🎓', '🛠️', '🤝',
  '⭐', '✅', '💳', '🚚',
];

export function setQuestionEmoji(
  questions: readonly QuickQuestion[],
  index: number,
  emoji: string
): { text: string; emoji: string }[] {
  return questions.map((question, i) => {
    if (typeof question === 'string') {
      return { text: question, emoji: i === index ? emoji : '💡' };
    }
    return { text: question.text, emoji: i === index ? emoji : (question.emoji ?? '💡') };
  });
}
