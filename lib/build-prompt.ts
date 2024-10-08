import { ChatFile } from '@/types/chat-file'

export async function buildRetrievalText(fileItems: ChatFile[]) {
  const retrievalText = fileItems
    .map(item => `<BEGIN SOURCE>\n${item.content}\n</END SOURCE>`)
    .join("\n\n")

  return `You may use the following sources if needed to answer the user's question.\n\n${retrievalText}`
}