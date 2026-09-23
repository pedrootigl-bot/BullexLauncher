import { useState } from 'react'
import { AppSidebar } from '../components/missions/AppSidebar'
import { DashboardHeader } from '../components/missions/DashboardHeader'
import { LiveChatModal } from '../components/missions/LiveChatModal'
import {
  supportChannels,
  supportFaqs,
  supportIntro,
  supportSpecialist,
  supportTiles,
  type SupportChannelId,
  type SupportTile,
} from '../data/supportMock'

export function SupportPage() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)

  function handleChannel(id: SupportChannelId) {
    switch (id) {
      case 'chat':
        setChatOpen(true)
        return
      case 'help': {
        const faq = document.getElementById('bs-support-faq-title')
        faq?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      case 'ticket':
        console.log('suporte channel', id)
        return
      default: {
        const _exhaustive: never = id
        return _exhaustive
      }
    }
  }

  return (
    <div className="bs-shell">
      <DashboardHeader />

      <div className="bs-shell__body">
        <AppSidebar />

        <div className="bs-main bs-support">
          <section className="bs-support__hero" aria-labelledby="bs-support-title">
            <img
              className="bs-support__hero-bg"
              src="/media/banners/support-hero.jpg"
              alt=""
              width={1600}
              height={520}
            />
            <div className="bs-support__hero-copy">
              <p className="bs-support__eyebrow">{supportIntro.eyebrow}</p>
              <h1 id="bs-support-title">
                {supportIntro.titleBefore} <span>{supportIntro.titleHighlight}</span>
              </h1>
              <p className="bs-support__lead">{supportIntro.lead}</p>
              <span className="bs-support__status" aria-label="Status do atendimento">
                <i aria-hidden="true" />
                {supportIntro.statusLabel}
              </span>
            </div>
          </section>

          <section className="bs-support__tiles" aria-label="Indicadores de suporte">
            {supportTiles.map((tile) => (
              <article key={tile.id} className={`bs-support-tile is-${tile.id}`}>
                <span className="bs-support-tile__icon" aria-hidden="true">
                  <TileIcon icon={tile.icon} />
                </span>
                <div className="bs-support-tile__copy">
                  <p>{tile.label}</p>
                  <strong>{tile.value}</strong>
                </div>
              </article>
            ))}
          </section>

          <section className="bs-support__channels" aria-label="Canais de atendimento">
            {supportChannels.map((channel) => (
              <article
                key={channel.id}
                className={`bs-support-card${channel.featured ? ' is-featured' : ''}`}
              >
                <div className="bs-support-card__top">
                  <span className="bs-support-card__icon" aria-hidden="true">
                    <ChannelIcon id={channel.id} />
                  </span>
                  {channel.badge ? (
                    <em className="bs-support-card__badge">
                      <BoltIcon />
                      {channel.badge}
                    </em>
                  ) : null}
                </div>
                <div className="bs-support-card__copy">
                  <strong>{channel.title}</strong>
                  <p>{channel.description}</p>
                </div>
                <button
                  type="button"
                  className={`bs-support-card__cta${channel.featured ? ' is-solid' : ''}`}
                  onClick={() => handleChannel(channel.id)}
                >
                  {channel.cta}
                </button>
              </article>
            ))}
          </section>

          <article className="bs-support-specialist">
            <img
              src={supportSpecialist.imageSrc}
              alt={supportSpecialist.imageAlt}
              width={88}
              height={88}
            />
            <div>
              <span className="bs-support-specialist__online">
                <i aria-hidden="true" />
                {supportSpecialist.status}
              </span>
              <strong>{supportSpecialist.name}</strong>
              <p>{supportSpecialist.role}</p>
            </div>
            <em className="bs-support-specialist__badge">
              <StarIcon />
              {supportSpecialist.teamBadge}
            </em>
          </article>

          <div className="bs-support__bottom">
            <section className="bs-support-faq" aria-labelledby="bs-support-faq-title">
              <h2 id="bs-support-faq-title">Perguntas frequentes</h2>

              <div className="bs-support-faq__list">
                {supportFaqs.map((faq) => {
                  const open = openFaqId === faq.id
                  return (
                    <div key={faq.id} className={`bs-support-faq__item${open ? ' is-open' : ''}`}>
                      <button
                        type="button"
                        className="bs-support-faq__q"
                        aria-expanded={open}
                        onClick={() => setOpenFaqId(open ? null : faq.id)}
                      >
                        <span>{faq.question}</span>
                        <ChevronIcon />
                      </button>
                      {open ? <p className="bs-support-faq__a">{faq.answer}</p> : null}
                    </div>
                  )
                })}
              </div>
            </section>

            <aside className="bs-support-cta-panel">
              <span className="bs-support-cta-panel__icon" aria-hidden="true">
                <BulbIcon />
              </span>
              <strong>Ainda precisa de ajuda?</strong>
              <p>Abra um ticket e nossa equipe responde com prioridade.</p>
              <button type="button" className="bs-support-cta-panel__btn" onClick={() => handleChannel('ticket')}>
                Abrir ticket agora →
              </button>
            </aside>
          </div>
        </div>
      </div>

      <LiveChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}

function ChannelIcon({ id }: { id: SupportChannelId }) {
  switch (id) {
    case 'chat':
      return (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
          <path
            d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H11l-3.8 3.2V15H7.5A2.5 2.5 0 0 1 5 12.5v-6Z"
            fill="currentColor"
            opacity="0.95"
          />
          <circle cx="9.2" cy="9.5" r="1.1" fill="#0a1200" />
          <circle cx="12" cy="9.5" r="1.1" fill="#0a1200" />
          <circle cx="14.8" cy="9.5" r="1.1" fill="#0a1200" />
        </svg>
      )
    case 'ticket':
      return (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M8 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V5A1.5 1.5 0 0 1 8 3.5Z" />
          <path d="M14 3.5V8h4.5M9.5 12h5M9.5 15.5h5M9.5 19h3.5" />
        </svg>
      )
    case 'help':
      return (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M12 5.5c-2.2-1.4-5.2-1.5-7.5-.4v12.2c2.4-1 5.4-.9 7.5.5 2.1-1.4 5.1-1.5 7.5-.5V5.1c-2.3-1.1-5.3-1-7.5.4Z" />
          <path d="M12 5.5v12.3" />
        </svg>
      )
    default: {
      const _exhaustive: never = id
      return _exhaustive
    }
  }
}

function TileIcon({ icon }: { icon: SupportTile['icon'] }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 18,
    height: 18,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (icon) {
    case 'online':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4.5L15 16" />
        </svg>
      )
    case 'ticket':
      return (
        <svg {...props}>
          <path d="M8 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V5A1.5 1.5 0 0 1 8 3.5Z" />
          <path d="M14 3.5V8h4.5" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 3 5 6.5v5.2c0 4.2 2.8 7.8 7 8.8 4.2-1 7-4.6 7-8.8V6.5L12 3Z" />
        </svg>
      )
    default: {
      const _exhaustive: never = icon
      return _exhaustive
    }
  }
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <path d="M13 2 6 13h5l-1 9 8-12h-5l1-8Z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <path d="M12 3 14.5 8.5 20.5 9.2 16 13.4 17.2 19.3 12 16.4 6.8 19.3 8 13.4 3.5 9.2 9.5 8.5 12 3Z" />
    </svg>
  )
}

function BulbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 18h6M10 21h4" strokeLinecap="round" />
      <path d="M8 14.5c-1.7-1.3-2.8-3.3-2.8-5.5A6.8 6.8 0 0 1 12 2.2 6.8 6.8 0 0 1 18.8 9c0 2.2-1.1 4.2-2.8 5.5L15 17H9l-1-2.5Z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
