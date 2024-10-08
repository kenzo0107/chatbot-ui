# Chatbot UI

ref: https://github.com/mckaywrigley/chatbot-ui

## About

Chatbot UI is an open source chat UI for AI models.

## Configuration

When deploying the application, the following environment variables can be set:

| Environment Variable              | Default value                  | Description                                                                                                                               |
| --------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| OPENAI_API_KEY                    |                                | The default API key used for authentication with OpenAI                                                                                   |
| OPENAI_API_HOST                   | `https://api.openai.com`       | The base url, for Azure use `https://<endpoint>.openai.azure.com`                                                                         |
| OPENAI_API_VERSION                | `2023-03-15-preview`           | Only applicable for Azure OpenAI                                                                                                          |
| DEFAULT_MODEL                     | `gpt-3.5-turbo`                | The default model to use on new conversations, for Azure use `gpt-35-turbo`                                                               |
| NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT | [see here](utils/app/const.ts) | The default system prompt to use on new conversations                                                                                     |
| NEXT_PUBLIC_DEFAULT_TEMPERATURE   | 1                              | The default temperature to use on new conversations                                                                                       |
| DEPLOYMENT_ID_GPT_3_5_TURBO       |                                | The deployment id of gpt3.5-turbo |
| DEPLOYMENT_ID_GPT_4_32K           |                                | The deployment id of gpt4-32k |
| DEPLOYMENT_ID_GPT_4_VISION_PREVIEW |                               | The deployment id of gpt4-vision |
| TEXT_EXTRACTION_API                |                               | The API url for text extraction from pdf, md files |  
