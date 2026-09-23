import { useEffect, useId, useRef, useState, type DragEvent } from 'react'

const ACCEPTED = 'image/png,image/jpeg,image/webp,image/gif'
const MAX_BYTES = 5 * 1024 * 1024

type ImageDropzoneProps = {
  label?: string
  fileName?: string
  previewUrl: string | null
  required?: boolean
  optionalHint?: boolean
  onChange: (file: File | null) => void
}

export function ImageDropzone({
  label = 'Banner',
  fileName = '',
  previewUrl,
  required = false,
  optionalHint = false,
  onChange,
}: ImageDropzoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!previewUrl && inputRef.current) inputRef.current.value = ''
  }, [previewUrl])

  function applyFile(file: File | null) {
    setError(null)
    if (!file) {
      onChange(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Envie uma imagem (PNG, JPG, WEBP ou GIF).')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('A imagem deve ter no máximo 5 MB.')
      return
    }
    onChange(file)
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    event.stopPropagation()
    setDragging(true)
  }

  function onDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    event.stopPropagation()
    setDragging(false)
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    event.stopPropagation()
    setDragging(false)
    const file = event.dataTransfer.files?.[0] ?? null
    applyFile(file)
  }

  return (
    <div className="bs-admin-modal__field bx-image-drop">
      <span>{label}</span>
      <label
        htmlFor={inputId}
        className={`bs-admin-upload${previewUrl ? ' has-file' : ''}${dragging ? ' is-dragging' : ''}`}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED}
          required={required && !fileName && !previewUrl}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null
            applyFile(file)
          }}
        />
        {previewUrl ? (
          <span className="bs-admin-upload__preview">
            <img src={previewUrl} alt="" />
            <span className="bs-admin-upload__meta">
              <strong>{fileName || 'Imagem selecionada'}</strong>
              <em>Solte outra imagem ou clique para trocar</em>
            </span>
          </span>
        ) : (
          <span className="bs-admin-upload__empty">
            <UploadIcon />
            <strong>{dragging ? 'Solte a imagem aqui' : 'Arraste e solte o banner'}</strong>
            <em>
              {optionalHint ? 'Opcional · ' : ''}
              PNG, JPG ou WEBP · até 5 MB · ou clique para escolher
            </em>
          </span>
        )}
      </label>
      {error ? <p className="bx-image-drop__error">{error}</p> : null}
      {previewUrl || fileName ? (
        <button
          type="button"
          className="bs-admin-upload__remove"
          onClick={() => applyFile(null)}
        >
          Remover imagem
        </button>
      ) : null}
    </div>
  )
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 16V5M8.5 8.5 12 5l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 16.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1.5" strokeLinecap="round" />
    </svg>
  )
}
