import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  drawDeliveryStatusLabel,
  type BullstartDrawWinner,
} from '../../data/bullstartAdminMock'
import type { AdminDraw, AdminDrawWinner } from '../../data/drawAdminMock'
import { formatBullstartDateTime } from '../../services/bullstartAdmin'
import { updateDrawWinnerDelivery } from '../../services/bullstartDraw'
import { canViewAdminDrawDetails } from '../../utils/adminAccess'
import { whatsappHref } from '../../utils/whatsapp'
import { StatusBadge } from './StatusBadge'

type DeliveryStatus = BullstartDrawWinner['deliveryStatus']

type DrawPrizeDetailModalProps = {
  draw: AdminDraw
  onClose: () => void
  onUpdated?: (draw: AdminDraw) => void
}

const DELIVERY_OPTIONS: DeliveryStatus[] = ['pending', 'shipped', 'delivered']

export function DrawPrizeDetailModal({
  draw: initialDraw,
  onClose,
  onUpdated,
}: DrawPrizeDetailModalProps) {
  const [draw, setDraw] = useState(initialDraw)
  const [error, setError] = useState<string | null>(null)
  const allowed = canViewAdminDrawDetails()

  useEffect(() => {
    setDraw(initialDraw)
  }, [initialDraw])

  useEffect(() => {
    if (!allowed) return undefined

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [allowed, onClose])

  if (!allowed) return null

  const winners =
    draw.winners.length > 0
      ? draw.winners
      : draw.winnerName
        ? [
            {
              userId: draw.winnerUserId ?? '',
              traderId: draw.winnerTraderId ?? '',
              name: draw.winnerName,
              whatsapp: '',
              place: 1,
              prizeReceived: false,
              deliveryStatus: 'pending' as const,
            },
          ]
        : []

  const drawDate = draw.drawnAt ?? draw.preparedAt
  const canEditDelivery = draw.status === 'completed'

  function handleStatusChange(winner: AdminDrawWinner, status: DeliveryStatus) {
    if (!winner.userId) return
    setError(null)
    try {
      const updated = updateDrawWinnerDelivery(draw.id, winner.userId, status)
      setDraw(updated)
      onUpdated?.(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar o status.')
    }
  }

  return createPortal(
    <div className="bs-admin-modal" role="presentation" onClick={onClose}>
      <div
        className="bs-admin-modal__dialog bx-draw-prize-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bx-draw-prize-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="bs-admin-modal__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <div className="bx-draw-prize-detail__scroll">
          <header className="bx-draw-prize-detail__header">
            <p className="bs-admin-modal__eyebrow">Detalhes do prêmio · Admin</p>
            <div className="bx-draw-prize-detail__hero">
              <div className="bx-draw-prize-detail__media">
                <img src={draw.prizeImage} alt="" />
              </div>
              <div className="bx-draw-prize-detail__hero-copy">
                <div className="bx-draw-prize-detail__chips">
                  <StatusBadge
                    label={draw.status === 'completed' ? 'Concluído' : 'Preparado'}
                    tone={draw.status === 'completed' ? 'completed' : 'prepared'}
                  />
                  {draw.prizeUnits > 1 ? (
                    <span className="bx-draw-prize-detail__chip">{draw.prizeUnits} unidades</span>
                  ) : null}
                </div>
                <h2 id="bx-draw-prize-detail-title">{draw.prizeName}</h2>
                <p className="bx-draw-prize-detail__lead">
                  <code>{draw.code}</code>
                  <span aria-hidden="true">·</span>
                  {draw.seasonLabel}
                </p>
              </div>
            </div>
          </header>

          <dl className="bx-draw-prize-detail__stats">
            <div>
              <dt>Participantes</dt>
              <dd>{draw.participantCount}</dd>
            </div>
            <div>
              <dt>Ganhadores</dt>
              <dd>{winners.length}</dd>
            </div>
            <div>
              <dt>{draw.drawnAt ? 'Sorteado em' : 'Preparado em'}</dt>
              <dd>{drawDate ? formatBullstartDateTime(drawDate) : '—'}</dd>
            </div>
            <div>
              <dt>Criado por</dt>
              <dd>{draw.createdBy || '—'}</dd>
            </div>
          </dl>

          <section className="bx-draw-prize-detail__winners" aria-labelledby="bx-draw-winners-title">
            <div className="bx-draw-prize-detail__section-head">
              <h3 id="bx-draw-winners-title">
                {winners.length > 1 ? 'Ganhadores' : 'Ganhador'}
              </h3>
              <span>
                {winners.length === 0
                  ? 'Aguardando sorteio'
                  : `${winners.length} ${winners.length === 1 ? 'registro' : 'registros'}`}
              </span>
            </div>

            {winners.length === 0 ? (
              <div className="bx-draw-prize-detail__empty">
                <EmptyTrophyIcon />
                <p>
                  Este sorteio ainda não possui ganhador. Realize o sorteio para definir o(s)
                  vencedor(es).
                </p>
              </div>
            ) : (
              <ul className="bx-draw-prize-detail__list">
                {winners.map((winner) => {
                  const wa = winner.whatsapp ? whatsappHref(winner.whatsapp) : null
                  const deliveryTone = winner.deliveryStatus
                  const canEdit = canEditDelivery && Boolean(winner.userId)

                  return (
                    <li
                      key={`${winner.userId}-${winner.place}`}
                      className={`bx-draw-prize-detail__winner is-${deliveryTone}`}
                    >
                      <div className="bx-draw-prize-detail__winner-top">
                        <span className="bx-draw-prize-detail__avatar" aria-hidden="true">
                          {initials(winner.name)}
                        </span>
                        <div className="bx-draw-prize-detail__winner-info">
                          <div className="bx-draw-prize-detail__winner-name">
                            {winners.length > 1 ? (
                              <em className="bx-draw-prize-detail__place">{winner.place}º</em>
                            ) : null}
                            <strong>{winner.name}</strong>
                          </div>
                          <span className="bx-draw-prize-detail__trader">
                            Trader #{winner.traderId || '—'}
                          </span>
                        </div>
                        <span
                          className={`bx-draw-prize-detail__delivery-pill is-${deliveryTone}`}
                        >
                          {drawDeliveryStatusLabel[deliveryTone]}
                        </span>
                      </div>

                      <div className="bx-draw-prize-detail__winner-body">
                        <div className="bx-draw-prize-detail__contact">
                          <span className="bx-draw-prize-detail__field-label">WhatsApp</span>
                          {wa ? (
                            <a
                              className="bx-draw-prize-detail__wa"
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <WhatsAppIcon />
                              {winner.whatsapp}
                            </a>
                          ) : (
                            <span className="bx-draw-prize-detail__muted">Sem WhatsApp</span>
                          )}
                        </div>

                        <div className="bx-draw-prize-detail__delivery">
                          <span className="bx-draw-prize-detail__field-label">Status de entrega</span>
                          <div
                            className="bx-draw-prize-detail__delivery-tabs"
                            role="group"
                            aria-label={`Status de entrega de ${winner.name}`}
                          >
                            {DELIVERY_OPTIONS.map((status) => (
                              <button
                                key={status}
                                type="button"
                                className={`bx-draw-prize-detail__delivery-tab is-${status}${
                                  winner.deliveryStatus === status ? ' is-active' : ''
                                }`}
                                disabled={!canEdit}
                                aria-pressed={winner.deliveryStatus === status}
                                onClick={() => handleStatusChange(winner, status)}
                              >
                                {drawDeliveryStatusLabel[status]}
                              </button>
                            ))}
                          </div>
                          <p className="bx-draw-prize-detail__hint">
                            {!canEditDelivery
                              ? 'Disponível após concluir o sorteio.'
                              : !winner.userId
                                ? 'Registro incompleto — não é possível atualizar.'
                                : winner.prizeReceived
                                  ? 'Prêmio marcado como entregue ao ganhador.'
                                  : winner.deliveryStatus === 'shipped'
                                    ? 'Enviado — aguardando confirmação de entrega.'
                                    : 'Aguardando envio do prêmio.'}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {error ? <p className="bx-draw-prize-detail__error">{error}</p> : null}
        </div>

        <div className="bx-draw-prize-detail__actions">
          <button type="button" className="bs-admin-modal__cta" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 1.9.5 3.76 1.45 5.4L2 22l4.9-1.55a9.9 9.9 0 0 0 5.14 1.4h.01c5.46 0 9.89-4.4 9.89-9.84S17.5 2 12.04 2Zm5.76 14.1c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.4-.14-.19-1.18-1.57-1.18-3 0-1.42.74-2.12 1-2.41.26-.29.57-.36.76-.36h.55c.17 0 .4-.07.63.48.24.57.8 1.97.87 2.11.07.14.12.31.02.5-.1.19-.14.31-.28.48-.14.17-.3.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.93 1.94 1.22 2.22 1.36.28.14.44.12.6-.07.17-.19.7-.81.89-1.09.19-.28.38-.23.64-.14.26.1 1.66.78 1.94.93.28.14.47.21.54.33.07.12.07.7-.17 1.38Z" />
    </svg>
  )
}

function EmptyTrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5.5A2.5 2.5 0 0 0 5.5 11H8M16 6h2.5A2.5 2.5 0 0 1 18.5 11H16" />
      <path d="M12 13v3M9 20h6M10 17h4" strokeLinecap="round" />
    </svg>
  )
}
