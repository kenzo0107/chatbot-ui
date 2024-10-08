import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  const models = Object.entries(OpenAIModelID).map(([key, value]) => {
    return {
      id: OpenAIModels[value].id,
      name: OpenAIModels[value].name,
    };
  });

  return new Response(JSON.stringify(models), { status: 200 });
};

export default handler;
