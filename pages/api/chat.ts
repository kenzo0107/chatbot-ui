import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE, OPENAI_API_HOST, OPENAI_API_VERSION, DEPLOYMENT_ID_MAP } from '@/utils/app/const';
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from 'ai';

import { buildRetrievalText } from "@/lib/build-prompt"
import { ChatBody, ChatMessage } from '@/types/chat';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';

export const config = {
  runtime: 'edge',
};

class OpenAIError extends Error {
  type: string;
  param: string;
  code: string;

  constructor(message: string, type: string, param: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.param = param;
    this.code = code;
  }
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, key, prompt, temperature } = (await req.json()) as ChatBody;

    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: ChatMessage[] = [];

    let isTokenLimitExceeded = false
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.fileItems.length > 0) {
        const retrievalText = await buildRetrievalText(message.fileItems)
        message.content = `${message.content}\n\n${retrievalText}`
      }
      
      const tokens = encoding.encode(message.content);

      if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
        isTokenLimitExceeded = true
        break;
      }
      tokenCount += tokens.length;
      messagesToSend = [{role: message.role, content: message.content }, ...messagesToSend];
    }

    if (isTokenLimitExceeded) {
      throw new Error('The limits of the specified model have been exceeded.');
    }

    // NOTE: 利用するモデルによりデプロイを選定する
    const deploymentId = DEPLOYMENT_ID_MAP[model.id]
    if (!deploymentId) {
      return new Response(JSON.stringify({ message: "Model not found" }), {
        status: 400
      })
    }

    encoding.free();

    const azureOpenai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: `${OPENAI_API_HOST}/openai/deployments/${deploymentId}`,
      defaultQuery: { "api-version": OPENAI_API_VERSION },
      defaultHeaders: { "api-key": process.env.OPENAI_API_KEY }
    })

    const response = await azureOpenai.chat.completions.create({
      model: deploymentId,
      messages: [
        {
          role: 'system',
          content: promptToSend,
        },
        ...messagesToSend,
      ],
      temperature: temperatureToUse,
      max_tokens: model.id === "gpt-4-vision-preview" ? 4096 : null, // TODO: Fix
      stream: true
    })

    const stream = OpenAIStream(response, {
      onCompletion: async (completion: string) => {
        // NOTE: 監査ログとしてリクエストとレスポンスをログに出力
        console.log(JSON.stringify({
           type: 'openai',
           event_type: 'web',
           request_body: [
            {
              role: 'system',
              content: promptToSend,
            },
            ...messagesToSend,
          ],
          response_body: completion,
        }))
      },
    })

    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error(error);
    if (error instanceof OpenAIError) {
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      return new Response('Error', { status: 500, statusText: error.message });
    }
  }
};

export default handler;
