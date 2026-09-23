import { useEffect, useMemo } from 'react'
import {
  drawDeliveryStatusLabel,
  eligibleStatusLabel,
  type BullstartSeasonId,
} from '../../data/bullstartAdminMock'
import {
  formatBullstartBRL,
  formatBullstartDateTime,
  getBullstartEligibleDetail,
} from '../../services/bullstartAdmin'

type BullstartEligibleDetailModalProps = {
  seasonId: BullstartSeasonId
  userId: string
  onClose: () => void
}

export function BullstartEligibleDetailModal({
  seasonId,
  userId,
  onClose,
}: BullstartEligibleDetailModalProps) {
  const detail = useMemo(
    () => getBullstartEligibleDetail(seasonId, userId),
    [seasonId, userId],
  )

  useEffect(() => {
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
  }, [onClose])

  if (!detail) return null

  const { drawPrize } = detail

  return (
    <div className="bs-admin-modal" role="presentation" onClick={onClose}>
      <div
        className="bs-admin-modal__dialog bx-admin-user-modal bx-bullstart-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bx-bullstart-detail-title"
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

        <p className="bs-admin-modal__eyebrow">Elegível · BullStart</p>

        <div className="bx-admin-user-modal__hero">
          <span className="bx-admin-user-modal__avatar" aria-hidden="true">
            {detail.initials}
          </span>
          <div>
            <h2 id="bx-bullstart-detail-title">{detail.name}</h2>
            <p>{detail.email}</p>
            <em className="bx-admin-badge bx-admin-badge--active">
              {eligibleStatusLabel[detail.status]}
            </em>
          </div>
        </div>

        <dl className="bx-admin-user-modal__grid">
          <div>
            <dt>Trader ID</dt>
            <dd>#{detail.traderId}</dd>
          </div>
          <div>
            <dt>Temporada</dt>
            <dd>{detail.seasonLabel}</dd>
          </div>
          <div>
            <dt>Total depositado</dt>
            <dd>{formatBullstartBRL(detail.totalDeposited)}</dd>
          </div>
          <div>
            <dt>Conclusão 3/3</dt>
            <dd>{formatBullstartDateTime(detail.completedAt)}</dd>
          </div>
          <div>
            <dt>Missão 01</dt>
            <dd>{detail.mission1 ? `✓ ${detail.missionTitles.mission1}` : '—'}</dd>
          </div>
          <div>
            <dt>Missão 02</dt>
            <dd>{detail.mission2 ? `✓ ${detail.missionTitles.mission2}` : '—'}</dd>
          </div>
          <div className="bx-admin-user-modal__full">
            <dt>Missão 03</dt>
            <dd>{detail.mission3 ? `✓ ${detail.missionTitles.mission3}` : '—'}</dd>
          </div>
        </dl>

        <section
          className={`bx-bullstart-prize${drawPrize.isWinner ? ' is-winner' : ' is-not-winner'}`}
          aria-labelledby="bx-bullstart-prize-title"
        >
          <div className="bx-bullstart-prize__head">
            <h3 id="bx-bullstart-prize-title">Prêmio do sorteio</h3>
            {drawPrize.isWinner ? (
              <em className="bx-admin-badge bx-admin-badge--active">Ganhador</em>
            ) : (
              <em className="bx-admin-badge bx-admin-badge--pending">Não ganhador</em>
            )}
          </div>

          {drawPrize.isWinner ? (
            <dl className="bx-bullstart-prize__grid">
              <div>
                <dt>Prêmio</dt>
                <dd>{drawPrize.prizeTitle}</dd>
              </div>
              <div>
                <dt>Data do sorteio</dt>
                <dd>{drawPrize.wonAt ? formatBullstartDateTime(drawPrize.wonAt) : '—'}</dd>
              </div>
              <div>
                <dt>Recebeu o prêmio?</dt>
                <dd className={drawPrize.prizeReceived ? 'is-yes' : 'is-no'}>
                  {drawPrize.prizeReceived ? 'Sim — prêmio recebido' : 'Não — ainda não recebeu'}
                </dd>
              </div>
              <div>
                <dt>Status da entrega</dt>
                <dd>
                  {drawPrize.deliveryStatus
                    ? drawDeliveryStatusLabel[drawPrize.deliveryStatus]
                    : '—'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="bx-bullstart-prize__empty">
              Este trader concluiu as 3 missões, mas não foi o ganhador do prêmio nesta temporada.
            </p>
          )}
        </section>

        <div className="bs-admin-modal__actions">
          <div className="bs-admin-modal__actions-end">
            <button type="button" className="bs-admin-modal__cta" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}
