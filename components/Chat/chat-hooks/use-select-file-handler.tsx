import { useContext } from 'react';
import { ChatFile } from '@/types/chat-file';
import HomeContext from '@/pages/api/home/home.context';
import toast from 'react-hot-toast';
import pdfToText from 'react-pdftotext';
import mammoth from 'mammoth'
import { generateHash } from '@/utils/app/hash'

// NOTE: ファイルを追加した際にプレビュー表示する際の挙動をハンドリングする
export const useSelectFileHandler = () => {
  const {
    state: { messageFiles },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  // ファイルアップロード時にプレビューを表示する
  const handleSelectDeviceFile = async (file: File) => {
    if (!file) {
      return
    }

    // プレビューファイルのテキスト抽出中は送信ボタンを押下不可状態にする (messageIsStreaming=true で実現可能)
    homeDispatch({ field: 'messageIsStreaming', value: true });

    // 画像や docx ファイルの読み取りで利用する
    let reader = new FileReader()

    const simplifiedFileType = simplifiedFileTypeFromFileType(file.type)
    // context にプレビューファイル情報をセット
    homeDispatch({ field: 'messageFiles', value: [...messageFiles, {
      id: 'loading',
      name: file.name,
      type: simplifiedFileType,
      file: file,
      content: '' // 抽出するテキスト。抽出後に設定する
    }] });

    let content = ''
    if (file.type.includes('pdf')) {
      content = await retrieveTextFromPDF(file)
    } else if (
      file.type.includes(
        "vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        "docx"
      )
    ) {
      content = await retrieveTextFromDocx(file)
    } else if (file.type.includes("text/plain") || file.type.includes("text/markdown")) {
      content = await retrieveTextFromTextFile(file)
    }

    if (!content) {
      // ファイルからテキスト取得できない場合は、ファイルのプレビュー表示しない
      homeDispatch({ field: 'messageFiles', value: messageFiles.filter(f => f.id !== 'loading') });
      // 送信ボタン押下負荷状態を解除
      homeDispatch({ field: 'messageIsStreaming', value: false });
      reader.onloadend = null
      return
    }

    // Use readAsArrayBuffer for PDFs and readAsText for other types
    file.type.includes("pdf")
      ? reader.readAsArrayBuffer(file)
      : reader.readAsText(file)

    reader.onloadend = async function () {
      try {    
        const newMessageFile: ChatFile = {
          id: generateHash(), // ID を割り振り、同名ファイルでも ID で判定できる様にする
          name: file.name,
          type: simplifiedFileType,
          file: file,
          content: content
        }
        // context にプレビューファイル情報をセット
        homeDispatch({ field: 'messageFiles', value: [...messageFiles, newMessageFile] });
      } catch (error: any) {
        toast.error("ファイルアップロードに失敗しました。 " + error?.message)
        // ファイルのテキスト読み取り処理失敗しローディング中のままとなったファイルを削除
        homeDispatch({ field: 'messageFiles', value: messageFiles.filter(f => f.id !== 'loading') });
      } finally {
        // プレビューファイルのテキスト抽出後、もしくは失敗後は送信ボタンを押下可能にする
        homeDispatch({ field: 'messageIsStreaming', value: false });
      }
    }
  }

  return {
    handleSelectDeviceFile,
  }
}

const retrieveTextFromPDF = async (file: File) => {
  const content = await pdfToText(file)
    .catch((error) => toast.error(error));
  return content
}

const retrieveTextFromDocx = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({
    arrayBuffer
  })
  return result.value
}

const retrieveTextFromTextFile = async (file: File) => {
  const fileBuffer = Buffer.from(await file.arrayBuffer())
  const textDecoder = new TextDecoder("utf-8")
  return textDecoder.decode(fileBuffer)
}

// NOTE: 特殊な拡張子を判定できる様にする
function simplifiedFileTypeFromFileType (type: string) {
  let simplifiedFileType = type.split("/")[1]
  if (simplifiedFileType.includes("vnd.adobe.pdf")) {
    simplifiedFileType = "pdf"
  } else if (
    simplifiedFileType.includes(
      "vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        "docx"
    )
  ) {
    simplifiedFileType = "docx"
  }
  return simplifiedFileType
}