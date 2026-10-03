import { PREVIEW } from '../dev/preview';

/**
 * AI-powered features whose Edge Functions aren't deployed yet stay hidden. Set
 * VITE_AI_FUNCTIONS=true in .env once they exist. Preview mode always shows them (with fake results).
 */
export const aiSuggestions = PREVIEW || import.meta.env.VITE_AI_FUNCTIONS === 'true';
