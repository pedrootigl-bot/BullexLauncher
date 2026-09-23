import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useSession } from '../../context/SessionContext'
import {
  fetchChatMessages,
  getMockChatAutoReply,
  sendChatMessage,
} from '../../services/support'
import { supportSpecialist, type SupportChatMessage } from '../../data/supportMock'
import { shouldUseMocks } from '../../api/config'

type LiveChatModalProps = {
  open: boolean
  onClose: () => void
}

export function LiveChatModal({ open, onClose }: LiveChatModalProps) {
  const titleId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const replyTimerRef = useRef<number | null>(null)
  const replyIndexRef = useRef(0)
  const { user } = useSession()

  const [messages, setMessages] = useState<SupportChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [agentTyping, setAgentTyping] = useState(false)

  useEffect(() => {
    if (!open) return
    void fetchChatMessages().then(setMessages)
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(focusTimer)
      if (replyTimerRef.current) window.clearTimeout(replyTimerRef.current)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const node = listRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [open, messages, agentTyping])

  if (!open) return null

  function clearReplyTimer() {
    if (replyTimerRef.current) {
      window.clearTimeout(replyTimerRef.current)
      replyTimerRef.current = null
    }
  }

  function scheduleAgentReply() {
    if (!shouldUseMocks()) return
    clearReplyTimer()
    setAgentTyping(true)
    replyTimerRef.current = window.setTimeout(() => {
      const reply = getMockChatAutoReply(replyIndexRef.current)
      replyIndexRef.current += 1
      setMessages((current) => [
        ...current,
        {
          id: `agent-${Date.now()}`,
          role: 'agent',
          text: reply,
          at: formatClock(),
        },
      ])
      setAgentTyping(false)
      replyTimerRef.current = null
    }, 1100 + Math.floor(Math.random() * 700))
  }

  async function sendMessage() {
    const text = draft.trim()
    if (!text || agentTyping) return

    setDraft('')
    try {
      const sent = await sendChatMessage(text)
      setMessages((current) => [
        ...current,
        { ...sent, at: sent.at || formatClock() },
      ])
      scheduleAgentReply()
    } catch (err) {
      console.error(err)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage()
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  return createPortal(
    <div className="bs-live-chat" role="presentation" onClick={onClose}>
      <div
        className="bs-live-chat__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="bs-live-chat__header">
          <div className="bs-live-chat__agent">
            <img
              src={supportSpecialist.imageSrc}
              alt=""
              width={44}
              height={44}
            />
            <div>
              <p className="bs-live-chat__online">
                <i aria-hidden="true" />
                {supportSpecialist.status}
              </p>
              <h2 id={titleId}>{supportSpecialist.name}</h2>
              <span>{supportSpecialist.role}</span>
            </div>
          </div>
          <button
            type="button"
            className="bs-live-chat__close"
            aria-label="Fechar chat"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="bs-live-chat__messages" ref={listRef} aria-live="polite">
          {messages.map((message) => {
            if (message.role === 'system') {
              return (
                <p key={message.id} className="bs-live-chat__system">
                  {message.text}
                </p>
              )
            }

            const isUser = message.role === 'user'
            return (
              <article
                key={message.id}
                className={`bs-live-chat__bubble is-${message.role}`}
              >
                <div className="bs-live-chat__bubble-meta">
                  <strong>{isUser ? (user?.firstName ?? 'Você') : supportSpecialist.name}</strong>
                  <time>{message.at}</time>
                </div>
                <p>{message.text}</p>
              </article>
            )
          })}

          {agentTyping ? (
            <div className="bs-live-chat__typing" aria-label="Atendente digitando">
              <span />
              <span />
              <span />
            </div>
          ) : null}
        </div>

        <form className="bs-live-chat__composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="bs-live-chat-input">
            Mensagem
          </label>
          <textarea
            ref={inputRef}
            id="bs-live-chat-input"
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Escreva sua mensagem..."
            maxLength={800}
          />
          <button
            type="submit"
            className="bs-live-chat__send"
            disabled={!draft.trim() || agentTyping}
          >
            Enviar
            <SendIcon />
          </button>
        </form>
      </div>
    </div>,
    document.body,
  )
}

function formatClock(): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())
  } catch {
    return 'Agora'
  }
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
