export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.";

export const OPENAI_API_HOST =
  process.env.OPENAI_API_HOST || 'https://api.openai.com';

export const DEFAULT_TEMPERATURE =
  parseFloat(process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || "1");

export const OPENAI_API_VERSION =
  process.env.OPENAI_API_VERSION || '2023-03-15-preview';

interface deploymentIdMap {
  [key: string]: string
}

export const DEPLOYMENT_ID_MAP: deploymentIdMap = {
  'gpt-3.5-turbo': process.env.DEPLOYMENT_ID_GPT_3_5_TURBO || '',
  'gpt-4-32k': process.env.DEPLOYMENT_ID_GPT_4_32K || '',
  'gpt-4-vision-preview': process.env.DEPLOYMENT_ID_GPT_4_VISION_PREVIEW || '',
}
