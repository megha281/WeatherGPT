/** Translation keys keep starter questions in the active application language. */
export const SUGGESTION_KEYS = [
  'questions.rainTomorrow', 'questions.rainBellary', 'questions.umbrella', 'questions.travel',
  'questions.hot', 'questions.risk', 'questions.explain', 'questions.weekend',
];

export function getSuggestedQuestions(t) {
  return SUGGESTION_KEYS.map((key) => t(key));
}

export const SUGGESTED_QUESTIONS = [
  'Will it rain tomorrow?',
  'Will it rain tomorrow evening in Bellary?',
  'Should I carry an umbrella?',
  'Is it safe to travel today?',
  'How hot will it be this afternoon?',
  'Is there any severe weather risk?',
  "Explain today's weather simply.",
  'What will the weather be like this weekend?',
];

export default SUGGESTED_QUESTIONS;
