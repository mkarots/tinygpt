import { KnowledgeItem } from '../../types';
import type { QuickQuestion } from './quickQuestionDefaults';

const MAX_QUESTIONS = 3;

/** Section titles from a crawl → visitor questions in the owner's words. */
const SECTION_TO_QUESTION: { match: RegExp; question: string; emoji: string }[] = [
  { match: /\breturn|\brefund|\bexchange/i, question: 'What is your return policy?', emoji: '↩️' },
  { match: /\bshipping|\bdelivery|\bpostage/i, question: 'What are your shipping options?', emoji: '📦' },
  { match: /\btrack|\border status/i, question: 'How can I track my order?', emoji: '🔎' },
  { match: /\bhour|\bopen|\bclosing/i, question: 'What are your hours?', emoji: '🕐' },
  { match: /\bcontact|\bemail|\bphone|\breach/i, question: 'How can I contact you?', emoji: '✉️' },
  { match: /\blocation|\baddress|\bwhere (we|you) are/i, question: 'Where are you located?', emoji: '📍' },
  { match: /\bpric|\bcost|\bfee/i, question: 'What are your prices?', emoji: '💷' },
  { match: /\bwarrant|\bguarantee/i, question: 'Do you offer a warranty?', emoji: '🛡️' },
];

function pushUnique(out: QuickQuestion[], text: string, emoji: string) {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (!trimmed || trimmed.length < 8 || trimmed.length > 120) return;
  if (out.some((item) => item.text.toLowerCase() === trimmed.toLowerCase())) return;
  if (out.length >= MAX_QUESTIONS) return;
  out.push({ text: trimmed, emoji });
}

function questionFromHeading(heading: string): QuickQuestion | null {
  const clean = heading.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
  if (!clean) return null;
  if (clean.endsWith('?')) {
    return { text: clean, emoji: '💬' };
  }
  for (const row of SECTION_TO_QUESTION) {
    if (row.match.test(clean)) {
      return { text: row.question, emoji: row.emoji };
    }
  }
  return null;
}

function collectFromContent(content: string, out: QuickQuestion[]) {
  const headingRe = /^#{1,3}\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(content)) !== null && out.length < MAX_QUESTIONS) {
    const fromHeading = questionFromHeading(match[1] ?? '');
    if (fromHeading) pushUnique(out, fromHeading.text, fromHeading.emoji);
  }

  const lineRe = /^[^\n?]{8,110}\?/gm;
  while ((match = lineRe.exec(content)) !== null && out.length < MAX_QUESTIONS) {
    const line = (match[0] ?? '').replace(/^[-*•\d.)\s]+/, '').trim();
    if (line.split(/\s+/).length >= 3) {
      pushUnique(out, line, '💬');
    }
  }

  if (out.length >= MAX_QUESTIONS) return;
  for (const row of SECTION_TO_QUESTION) {
    if (out.length >= MAX_QUESTIONS) break;
    if (row.match.test(content)) {
      pushUnique(out, row.question, row.emoji);
    }
  }
}

/**
 * Build up to three suggested questions from active knowledge pages/notes.
 * Prefer headings and written questions; fall back to section topics in the text.
 */
export function quickQuestionsFromKnowledge(knowledge: KnowledgeItem[]): QuickQuestion[] {
  const out: QuickQuestion[] = [];
  for (const item of knowledge) {
    if (item.status !== 'active') continue;
    const content = typeof item.content === 'string' ? item.content : '';
    if (!content.trim()) continue;
    collectFromContent(content, out);
    if (out.length >= MAX_QUESTIONS) break;
  }
  return out;
}
