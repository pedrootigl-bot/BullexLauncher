import { useState } from 'react'
import { AppSidebar } from '../components/missions/AppSidebar'
import { DashboardHeader } from '../components/missions/DashboardHeader'
import {
  supportBrand,
  supportChannels,
  supportFaqs,
  supportIntro,
  type SupportChannelId,
} from '../data/supportMock'

export function SupportPage() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)

  function handleChannel(id: SupportChannelId) {
    // Layout/mock: integrações reais entram depois.
    console.log('suporte channel', id)
  }

  return (
    <div className="bs-shell">
      <DashboardHeader />

      <div className="bs-shell__body">
        <AppSidebar />

        <div className="bs-main bs-support">
          <header className="bs-support__header">
            <div>
              <h1 id="bs-support-title">{supportIntro.title}</h1>
              <p>{supportIntro.lead}</p>
            </div>
            <span className="bs-support__status" aria-label="Status do atendimento">
              <i aria-hidden="true" />
              {supportIntro.statusLabel}
            </span>
          </header>

          <section className="bs-support__channels" aria-label="Canais de atendimento">
            {supportChannels.map((channel) => (
              <article
                key={channel.id}
                className={`bs-support-card${channel.featured ? ' is-featured' : ''}`}
              >
                <span className="bs-support-card__icon" aria-hidden="true">
                  <ChannelIcon id={channel.id} />
                </span>
                <div className="bs-support-card__copy">
                  <strong>{channel.title}</strong>
                  <p>{channel.description}</p>
                </div>
                <button
                  type="button"
                  className={`bs-support-card__cta${channel.featured ? ' is-outline' : ''}`}
                  onClick={() => handleChannel(channel.id)}
                >
                  {channel.cta}
                  <ArrowIcon />
                </button>
              </article>
            ))}
          </section>

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

            <aside className="bs-support-brand" aria-label="Mensagem da Bullex">
              <img
                className="bs-support-brand__photo"
                src={supportBrand.imageSrc}
                alt={supportBrand.imageAlt}
              />
            </aside>
          </div>
        </div>
      </div>
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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M5 12h12M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
