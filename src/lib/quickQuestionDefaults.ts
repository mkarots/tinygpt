export interface QuickQuestion {
  text: string;
  emoji: string;
}

export type IndustryOption = {
  id: string;
  label: string;
  questions: QuickQuestion[];
};

const GENERIC_QUICK_QUESTIONS: QuickQuestion[] = [
  { text: 'What are your hours?', emoji: '🕐' },
  { text: 'How can I contact you?', emoji: '✉️' },
  { text: 'Where are you located?', emoji: '📍' },
];

/**
 * One list drives the industry dropdown and the starter questions.
 * Add or edit a row here; do not copy labels into CompanyStep.
 */
export const INDUSTRIES: IndustryOption[] = [
  {
    id: 'saas',
    label: 'SaaS / Technology',
    questions: [
      { text: 'Do you offer a free trial/version?', emoji: '🚀' },
      { text: 'How secure is your platform?', emoji: '🔒' },
      { text: 'How do I use your product?', emoji: '💻' },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    questions: [
      { text: 'What are your shipping options?', emoji: '📦' },
      { text: 'What is your return policy?', emoji: '↩️' },
      { text: 'How can I track my order?', emoji: '🔎' },
    ],
  },
  {
    id: 'education',
    label: 'Education',
    questions: [
      { text: 'How do I enroll?', emoji: '📚' },
      { text: 'What do you offer?', emoji: '🎓' },
      { text: 'How can I contact you?', emoji: '✉️' },
    ],
  },
  {
    id: 'agency',
    label: 'Agency / Services',
    questions: [
      { text: 'What services do you offer?', emoji: '🛠️' },
      { text: 'How do we start working together?', emoji: '🤝' },
      { text: 'How can I contact you?', emoji: '✉️' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    questions: GENERIC_QUICK_QUESTIONS,
  },
];

function copyQuestions(questions: QuickQuestion[]): QuickQuestion[] {
  return questions.map((question) => ({ ...question }));
}

export function industrySelectOptions(): { label: string; value: string }[] {
  return [
    { label: 'Select an industry', value: '' },
    ...INDUSTRIES.map((industry) => ({ label: industry.label, value: industry.id })),
  ];
}

export function questionsForIndustry(industry: string): QuickQuestion[] {
  const match = INDUSTRIES.find((item) => item.id === industry);
  return copyQuestions(match?.questions ?? GENERIC_QUICK_QUESTIONS);
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
