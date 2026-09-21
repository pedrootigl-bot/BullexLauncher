import { useEffect, useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import type { PromoBanner } from '../../data/missionsMock'

type PromoCarouselProps = {
  banners: PromoBanner[]
  intervalMs?: number
}

export function PromoCarousel({ banners, intervalMs = 5500 }: PromoCarouselProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [stepPx, setStepPx] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const active = banners[index]

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined

    const measure = () => {
      setStepPx(viewport.clientWidth)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (paused || banners.length <= 1) return undefined

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length)
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [paused, banners.length, intervalMs])

  function goTo(next: number) {
    const total = banners.length
    setIndex(((next % total) + total) % total)
  }

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null
    setPaused(true)
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartX.current
    const end = event.changedTouches[0]?.clientX
    touchStartX.current = null
    setPaused(false)

    if (start == null || end == null) return

    const delta = start - end
    if (Math.abs(delta) < 40) return
    goTo(delta > 0 ? index + 1 : index - 1)
  }

  if (!active) return null

  return (
    <section className="bs-promo" aria-label="Campanhas em destaque">
      <div className="bs-promo__frame">
        <div
          className="bs-promo__stage"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="bs-promo__viewport" ref={viewportRef}>
            <div
              className="bs-promo__track"
              style={{ transform: `translateX(-${index * stepPx}px)` }}
            >
              {banners.map((banner, i) => (
                <article
                  key={banner.id}
                  className={`bs-promo__slide${i === index ? ' is-active' : ''}`}
                  aria-roledescription="slide"
                  aria-label={`${banner.title} — ${i + 1} de ${banners.length}`}
                  aria-hidden={i !== index}
                >
                  <img src={banner.imageSrc} alt={banner.alt} draggable={false} />
                </article>
              ))}
            </div>

            <button
              type="button"
              className="bs-promo__nav bs-promo__nav--prev"
              aria-label="Banner anterior"
              onClick={() => goTo(index - 1)}
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              className="bs-promo__nav bs-promo__nav--next"
              aria-label="Próximo banner"
              onClick={() => goTo(index + 1)}
            >
              <Chevron direction="right" />
            </button>

            <div className="bs-promo__dots" role="tablist" aria-label="Escolher campanha">
              {banners.map((banner, i) => (
                <button
                  key={banner.id}
                  type="button"
                  role="tab"
                  aria-label={banner.title}
                  aria-selected={i === index}
                  className={`bs-promo__dot${i === index ? ' is-active' : ''}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
      {direction === 'left' ? (
        <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}
