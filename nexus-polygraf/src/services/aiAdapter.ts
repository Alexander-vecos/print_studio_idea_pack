import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase/client';

const functions = getFunctions(app);

export interface AiGenerateParams {
  provider: 'huggingface' | 'deepseek';
  model?: string;
  prompt: string;
}

export interface AiGenerateResult {
  text: string;
}

const aiGenerateFn = httpsCallable<AiGenerateParams, AiGenerateResult>(
  functions,
  'aiGenerate'
);

export const aiAdapter = {
  generate: async (params: AiGenerateParams): Promise<AiGenerateResult> => {
    try {
      const result = await aiGenerateFn(params);
      return result.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'AI generation failed';
      throw new Error(message);
    }
  },
};
