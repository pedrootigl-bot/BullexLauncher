import { useEffect } from 'react'
import type { AdminDraw } from '../../data/drawAdminMock'
import { formatBullstartDateTime } from '../../services/bullstartAdmin'

type DrawWinnerCelebrationProps = {
  draw: AdminDraw
  traderId: string
  onClose: () => void
}

export function DrawWinnerCelebration({ draw, traderId, onClose }: DrawWinnerCelebrationProps) {
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

  const drawnLabel = draw.drawnAt ? formatBullstartDateTime(draw.drawnAt) : '—'
  const normalized = traderId.trim().replace(/^#/, '').toLowerCase()
  const myWin =
    draw.winners.find((winner) => winner.traderId.replace(/^#/, '').toLowerCase() === normalized) ??
    null
  const displayName = myWin?.name ?? draw.winnerName ?? 'Trader'

  return (
    <div className="bs-draw-win" role="presentation" onClick={onClose}>
      <div
        className="bs-draw-win__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bs-draw-win-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="bs-draw-win__eyebrow">Sorteio BullStart</p>
        <h2 id="bs-draw-win-title">Você ganhou!</h2>
        <p className="bs-draw-win__lead">
          Parabéns, <strong>{displayName}</strong>. Você foi sorteado
          {draw.prizeUnits > 1 ? ` entre ${draw.prizeUnits} ganhadores` : ''} deste sorteio com{' '}
          {draw.participantCount} participantes.
        </p>

        <div className="bs-draw-win__prize">
          <div className="bs-draw-win__media">
            <img src={draw.prizeImage} alt={draw.prizeName} />
          </div>
          <div className="bs-draw-win__prize-copy">
            <span>Prêmio</span>
            <strong>{draw.prizeName}</strong>
            <em>
              Sorteio {draw.code} · {drawnLabel}
              {myWin ? ` · ${myWin.place}º ganhador` : ''}
            </em>
          </div>
        </div>

        <p className="bs-draw-win__note">
          Em breve a equipe entrará em contato para validação e entrega. O status do prêmio inicia
          como pendente.
        </p>

        <button type="button" className="bs-draw-win__cta" onClick={onClose}>
          Entendi
        </button>
      </div>
    </div>
  )
}
