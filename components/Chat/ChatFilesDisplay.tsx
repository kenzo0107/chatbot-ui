import { IconX, IconFileText, IconCirclePlus, IconLoader2 } from '@tabler/icons-react';
import { FC, useContext, useRef } from "react"
import HomeContext from '@/pages/api/home/home.context';

import { useSelectFileHandler } from "./chat-hooks/use-select-file-handler"
import { Input } from './Input'

export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  "text/plain",
  "text/markdown",
].join(",")

interface Props {}

export const ChatFilesDisplay: FC<Props>  = ({}) => {
  const {
    state: { messageFiles },
    dispatch: homeDispatch
  } = useContext(HomeContext);

  const { handleSelectDeviceFile } = useSelectFileHandler()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      {/* ファイルアップロードのアイコン */}
      <IconCirclePlus
        className="absolute bottom-[6px] left-2 cursor-pointer p-1 hover:opacity-50"
        size={32}
        onClick={() => fileInputRef.current?.click()}
      />

      {/* アップロードファイル用の Input タグ */}
      <Input
        ref={fileInputRef}
        type="file"
        onChange={e => {
          if (!e.target.files) return
          handleSelectDeviceFile(e.target.files[0])

          // NOTE: アップロードキャンセルした場合でも再度同名ファイルがアップロードできるように明示的に value を空にする
          e.target.value = ''
        }}
        accept={ACCEPTED_FILE_TYPES}
      />

      {messageFiles.length > 0 && (messageFiles.map((file, key) => (
        // アップロードするファイルのプレビュー表示
        <div key={key} className="flex flex-nowrap gap-2 overflow-x-auto pb-1.5 pt-[12px] px-9">
          <div className="group relative inline-block text-sm text-token-text-primary">
            <div className="relative overflow-hidden rounded-xl bg-token-main-surface-primary dark:bg-[#282933]">
              <div className="p-2 w-100">
                <div className="flex flex-row items-center">
                  {file.id == 'loading' ? (
                    // ファイルのテキストを取得中（ファイルの中身が読み取れていない間）はファイルのローディングアイコンを表示する
                    <div className="relative flex h-[60px] items-center space-x-4 rounded-xl p-3">
                      <div className="rounded bg-[#FF5588] p-2">
                        <IconLoader2 className="animate-spin" />
                      </div>

                      <div className="truncate text-sm">
                        <div className="truncate">{file.name}</div>
                        <div className="truncate opacity-50">{file.type.toUpperCase()}</div>
                      </div>
                    </div>
                  ) : (
                    // ファイルのテキストを取得完了後、ファイル名を表示する
                    <div className="relative flex h-[60px] items-center space-x-4 rounded-xl p-3">
                      <div className="rounded bg-[#FF5588] p-2">
                        <IconFileText/>
                      </div>
                      <div className="overflow-hidden">
                        <div className="truncate font-semibold">{file.name}</div>
                        <div className="truncate text-token-text-tertiary">{file.type.toUpperCase()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <IconX
              // プレビュー表示中のファイルの取り消しボタン
              className="absolute right-1 top-1 -translate-y-1/2 translate-x-1/2 rounded-full border border-token-border-heavy bg-token-main-surface-secondary p-0.5 text-token-text-primary transition-colors hover:opacity-100 group-hover:opacity-100 md:opacity-0"
              onClick={e => {
                e.stopPropagation()
                // アップロード取り消しファイルを除外する
                homeDispatch({ field: 'messageFiles', value: messageFiles.filter(
                  f => f.id !== file.id
                ) });
              }}
            />
          </div>
        </div>
      )
    )
  )}
  </>)
}