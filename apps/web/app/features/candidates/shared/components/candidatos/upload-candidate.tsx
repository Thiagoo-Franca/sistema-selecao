import { useRef, useState } from "react"

import { Button } from "../../../../../shared/ui/button"
import { useUploadCandidatosMestrado } from "@/features/candidates/mestrado/hooks"
import { parseCandidatosMestrado } from "@/features/candidates/mestrado/lib/parse-upload"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"

export function UploadCandidatosMestrado() {
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [modalOpen, setModalOpen] = useState(false)

  const upload = useUploadCandidatosMestrado()

  function clearFile() {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  function reset() {
    clearFile()
    setModalOpen(false)
  }
  async function handleUpload() {
    if (!file) return

    try {
      const candidatos = parseCandidatosMestrado(await file.text())
      if (candidatos.length === 0) {
        toast.error("Nenhum candidato encontrado no arquivo")
        return
      }
      upload.mutate(candidatos, { onSuccess: reset })
    } catch (error) {
      toast.error(
        `Arquivo inválido: ${error instanceof Error ? error.message : "Não foi possível ler o arquivo"}`
      )
    }
  }

  return (
    <div
      className={`flex w-full ${file ? "" : "max-w-md"} flex-row items-center justify-center gap-2 md:justify-end`}
    >
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (upload.isPending) return // não fecha enquanto envia
          setModalOpen(open)
          if (!open) reset()
        }}
      >
        <DialogTrigger className="w-full max-w-sm rounded-md bg-gradient-to-r from-blue-500 to-indigo-500 p-2 text-sm text-white hover:from-blue-600 hover:to-indigo-600 md:px-4 md:py-2 md:text-base">
          Adicionar candidatos
        </DialogTrigger>

        <DialogContent className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Adicionar candidato(os)</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Selecione um arquivo de texto (.txt) com um candidato por linha, colunas separadas por
            tabulação (como ao copiar direto da planilha).
          </DialogDescription>
          <label
            htmlFor="file-upload"
            className="cursor-pointer truncate rounded-md border p-2 hover:bg-gray-100"
          >
            {file ? file.name : "Clique para selecionar um arquivo .txt"}
          </label>
          <Input
            id="file-upload"
            ref={inputRef}
            type="file"
            accept=".txt"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <DialogFooter className="flex flex-col items-center justify-center gap-4 sm:justify-start md:flex-row">
            <Button
              aria-label="Salvar"
              className="max-x-xl w-full bg-green-500 text-white hover:bg-green-600"
              disabled={!file || upload.isPending}
              onClick={handleUpload}
            >
              {upload.isPending ? "Enviando..." : "Salvar"}
            </Button>
            <Button
              aria-label="Limpar"
              className="w-full max-w-xl bg-red-500 text-white hover:bg-red-600"
              disabled={!file || upload.isPending}
              onClick={clearFile}
            >
              Limpar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
