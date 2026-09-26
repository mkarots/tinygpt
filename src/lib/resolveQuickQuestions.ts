import { KnowledgeItem } from '../../types';
import {
  INDUSTRIES,
  questionsForIndustry,
  type QuickQuestion,
} from './quickQuestionDefaults';
import { quickQuestionsFromKnowledge } from './quickQuestionsFromKnowledge';

function sameQuestions(left: QuickQuestion[], right: QuickQuestion[]): boolean {
  return (
    left.length === right.length &&
    left.every(
      (question, index) =>
        question.text === right[index]?.text && question.emoji === right[index]?.emoji
    )
  );
}

/** True when the list is empty or still one of the industry starter packs. */
export function isStockQuickQuestions(questions: QuickQuestion[]): boolean {
  if (!Array.isArray(questions) || questions.length === 0) return true;
  if (sameQuestions(questions, questionsForIndustry(''))) return true;
  return INDUSTRIES.some((industry) => sameQuestions(questions, industry.questions));
}

/**
 * Prefer the owner's edited questions. Otherwise use questions taken from the
 * agent's active pages. Never invent industry stock when knowledge is empty.
 */
export function resolveQuickQuestions(
  stored: QuickQuestion[] | undefined,
  knowledge: KnowledgeItem[]
): QuickQuestion[] {
  const current = Array.isArray(stored) ? stored : [];
  if (!isStockQuickQuestions(current)) return current;
  return quickQuestionsFromKnowledge(knowledge);
}
