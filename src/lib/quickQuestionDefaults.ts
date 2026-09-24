export interface QuickQuestion {
  text: string;
  emoji: string;
}

const GENERIC_QUICK_QUESTIONS: QuickQuestion[] = [
  { text: 'What are your hours?', emoji: '🕐' },
  { text: 'How can I contact you?', emoji: '✉️' },
  { text: 'Where are you located?', emoji: '📍' },
];

const QUESTIONS_BY_INDUSTRY: Record<string, QuickQuestion[]> = {
  saas: [
    { text: 'Do you offer a free trial/version?', emoji: '🚀' },
    { text: 'How secure is your platform?', emoji: '🔒' },
    { text: 'How do I use your product?', emoji: '💻' },
  ],
  ecommerce: [
    { text: 'What are your shipping options?', emoji: '📦' },
    { text: 'What is your return policy?', emoji: '↩️' },
    { text: 'How can I track my order?', emoji: '🔎' },
  ],
  education: [
    { text: 'How do I enroll?', emoji: '📚' },
    { text: 'What do you offer?', emoji: '🎓' },
    { text: 'How can I contact you?', emoji: '✉️' },
  ],
  agency: [
    { text: 'What services do you offer?', emoji: '🛠️' },
    { text: 'How do we start working together?', emoji: '🤝' },
    { text: 'How can I contact you?', emoji: '✉️' },
  ],
};

function copyQuestions(questions: QuickQuestion[]): QuickQuestion[] {
  return questions.map((question) => ({ ...question }));
}

export function questionsForIndustry(industry: string): QuickQuestion[] {
  return copyQuestions(QUESTIONS_BY_INDUSTRY[industry] ?? GENERIC_QUICK_QUESTIONS);
}

function sameQuestions(left: QuickQuestion[], right: QuickQuestion[]): boolean {
  return (
    left.length === right.length &&
    left.every((question, index) => question.text === right[index].text && question.emoji === right[index].emoji)
  );
}

/**
 * Replace quick questions when they still match the previous industry's defaults.
 * A list the user edited stays as they left it.
 */
export function quickQuestionsForIndustry(
  industry: string,
  current: QuickQuestion[],
  previousIndustry = ''
): QuickQuestion[] {
  if (!sameQuestions(current, questionsForIndustry(previousIndustry))) {
    return current;
  }
  return questionsForIndustry(industry);
}
