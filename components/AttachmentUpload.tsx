'use client'

import { useState, useRef } from 'react'
import { 
  Upload, 
  Image, 
  FileText, 
  Mic, 
  Video, 
  X, 
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react'

// ============================================
// TIPOS
// ============================================

export type AttachmentType = 'IMAGE' | 'AUDIO' | 'PDF' | 'VIDEO' | 'OTHER'

export interface Attachment {
  id: string
  file: File
  type: AttachmentType
  preview?: string
  uploading: boolean
  error?: string
  description?: string
}

interface AttachmentUploadProps {
  attachments: Attachment[]
  onAttachmentsChange: (attachments: Attachment[]) => void
  maxFiles?: number
  maxSizeMB?: number
  disabled?: boolean
}

// ============================================
// HELPERS
// ============================================

const getFileType = (file: File): AttachmentType => {
  const mime = file.type.toLowerCase()
  
  if (mime.startsWith('image/')) return 'IMAGE'
  if (mime.startsWith('audio/')) return 'AUDIO'
  if (mime.startsWith('video/')) return 'VIDEO'
  if (mime === 'application/pdf') return 'PDF'
  return 'OTHER'
}

const getTypeIcon = (type: AttachmentType) => {
  switch (type) {
    case 'IMAGE': return Image
    case 'AUDIO': return Mic
    case 'VIDEO': return Video
    case 'PDF': return FileText
    default: return FileText
  }
}

const getTypeLabel = (type: AttachmentType) => {
  switch (type) {
    case 'IMAGE': return 'Imagem'
    case 'AUDIO': return 'Áudio'
    case 'VIDEO': return 'Vídeo'
    case 'PDF': return 'PDF'
    default: return 'Arquivo'
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ============================================
// COMPONENTE
// ============================================

export default function AttachmentUpload({
  attachments,
  onAttachmentsChange,
  maxFiles = 5,
  maxSizeMB = 10,
  disabled = false
}: AttachmentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || disabled) return

    const newAttachments: Attachment[] = []
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Verificar limite de arquivos
      if (attachments.length + newAttachments.length >= maxFiles) {
        break
      }

      // Verificar tamanho
      if (file.size > maxSizeBytes) {
        newAttachments.push({
          id: `${Date.now()}-${i}`,
          file,
          type: getFileType(file),
          uploading: false,
          error: `Arquivo muito grande (máx: ${maxSizeMB}MB)`
        })
        continue
      }

      // Criar preview para imagens
      let preview: string | undefined
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file)
      }

      newAttachments.push({
        id: `${Date.now()}-${i}`,
        file,
        type: getFileType(file),
        preview,
        uploading: false
      })
    }

    onAttachmentsChange([...attachments, ...newAttachments])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removeAttachment = (id: string) => {
    const attachment = attachments.find(a => a.id === id)
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview)
    }
    onAttachmentsChange(attachments.filter(a => a.id !== id))
  }

  const updateDescription = (id: string, description: string) => {
    onAttachmentsChange(
      attachments.map(a => a.id === id ? { ...a, description } : a)
    )
  }

  return (
    <div className="space-y-4">
      {/* Área de upload */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
          ${dragOver 
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
            : 'border-gray-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,audio/*,video/*,.pdf"
          onChange={e => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-purple-600 dark:text-purple-400">Clique para enviar</span> ou arraste arquivos
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Imagens, áudios, vídeos ou PDFs (máx: {maxSizeMB}MB cada)
        </p>
        
        {attachments.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            {attachments.length}/{maxFiles} arquivos
          </p>
        )}
      </div>

      {/* Lista de anexos */}
      {attachments.length > 0 && (
        <div className="space-y-3">
          {attachments.map(attachment => {
            const Icon = getTypeIcon(attachment.type)
            
            return (
              <div 
                key={attachment.id}
                className={`
                  flex items-start gap-3 p-3 rounded-xl
                  ${attachment.error 
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                    : 'bg-gray-50 dark:bg-slate-700'
                  }
                `}
              >
                {/* Preview ou ícone */}
                <div className="flex-shrink-0">
                  {attachment.preview ? (
                    <button
                      onClick={() => setPreviewUrl(attachment.preview!)}
                      className="relative w-16 h-16 rounded-lg overflow-hidden group"
                    >
                      <img 
                        src={attachment.preview} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {attachment.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getTypeLabel(attachment.type)} • {formatFileSize(attachment.file.size)}
                  </p>
                  
                  {attachment.error ? (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {attachment.error}
                    </p>
                  ) : (
                    <input
                      type="text"
                      placeholder="Descrição (opcional)"
                      value={attachment.description || ''}
                      onChange={e => updateDescription(attachment.id, e.target.value)}
                      className="w-full mt-2 px-2 py-1 text-xs rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                  )}
                </div>

                {/* Status/Ações */}
                <div className="flex-shrink-0">
                  {attachment.uploading ? (
                    <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                  ) : (
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de preview */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] rounded-lg"
            />
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Aviso de segurança */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        💡 <strong>Dica:</strong> Anexos podem servir como evidência. Guarde prints de conversas, 
        fotos de situações relevantes e documentos importantes.
      </p>
    </div>
  )
}
