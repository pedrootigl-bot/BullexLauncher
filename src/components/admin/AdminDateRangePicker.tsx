import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type DateRangeValue = {
  start: Date
  end: Date
}

type AdminDateRangePickerProps = {
  value: DateRangeValue
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (range: DateRangeValue) => void
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function formatBrDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatBrDateRange(range: DateRangeValue): string {
  return `${formatBrDate(range.start)} → ${formatBrDate(range.end)}`
}

export function parseBrDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2]) - 1
  const year = Number(match[3])
  const date = new Date(year, month, day)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null
  }
  return startOfDay(date)
}

export function parseBrDateRange(label: string): DateRangeValue | null {
  const parts = label.split('→').map((part) => part.trim())
  if (parts.length !== 2) return null
  const start = parseBrDate(parts[0])
  const end = parseBrDate(parts[1])
  if (!start || !end) return null
  return start <= end ? { start, end } : { start: end, end: start }
}

export function daysInRange(range: DateRangeValue): number {
  const ms = startOfDay(range.end).getTime() - startOfDay(range.start).getTime()
  return Math.max(1, Math.round(ms / 86_400_000) + 1)
}

export function chartPeriodLabel(range: DateRangeValue): string {
  const days = daysInRange(range)
  return days === 1 ? 'Último dia' : `Últimos ${days} dias`
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  const t = startOfDay(date).getTime()
  return t >= startOfDay(start).getTime() && t <= startOfDay(end).getTime()
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return startOfDay(next)
}

function buildMonthCells(monthCursor: Date): (Date | null)[] {
  const year = monthCursor.getFullYear()
  const month = monthCursor.getMonth()
  const first = new Date(year, month, 1)
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = Array.from({ length: first.getDay() }, () => null)
  for (let day = 1; day <= days; day += 1) {
    cells.push(new Date(year, month, day))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function AdminDateRangePicker({
  value,
  open,
  onOpenChange,
  onApply,
}: AdminDateRangePickerProps) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [draftStart, setDraftStart] = useState<Date>(value.start)
  const [draftEnd, setDraftEnd] = useState<Date | null>(value.end)
  const [pickingEnd, setPickingEnd] = useState(false)
  const [monthCursor, setMonthCursor] = useState(
    () => new Date(value.start.getFullYear(), value.start.getMonth(), 1),
  )

  useEffect(() => {
    if (!open) return
    setDraftStart(value.start)
    setDraftEnd(value.end)
    setPickingEnd(false)
    setMonthCursor(new Date(value.start.getFullYear(), value.start.getMonth(), 1))
  }, [open, value.end, value.start])

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  const cells = useMemo(() => buildMonthCells(monthCursor), [monthCursor])
  const resolvedEnd = draftEnd ?? draftStart
  const ordered =
    draftStart <= resolvedEnd
      ? { start: draftStart, end: resolvedEnd }
      : { start: resolvedEnd, end: draftStart }

  function selectDay(day: Date) {
    if (!pickingEnd) {
      setDraftStart(day)
      setDraftEnd(null)
      setPickingEnd(true)
      return
    }

    setDraftEnd(day)
    setPickingEnd(false)
  }

  function applyPreset(days: number) {
    const end = startOfDay(new Date())
    const start = addDays(end, -(days - 1))
    setDraftStart(start)
    setDraftEnd(end)
    setPickingEnd(false)
    setMonthCursor(new Date(start.getFullYear(), start.getMonth(), 1))
  }

  function applyMonth() {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = startOfDay(now)
    setDraftStart(start)
    setDraftEnd(end)
    setPickingEnd(false)
    setMonthCursor(new Date(start.getFullYear(), start.getMonth(), 1))
  }

  function handleApply() {
    onApply(ordered)
    onOpenChange(false)
  }

  return (
    <div className="bx-admin-date-wrap" ref={rootRef}>
      <button
        type="button"
        className={`bx-admin-date${open ? ' is-open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
      >
        <CalendarGlyph />
        {formatBrDateRange(value)}
      </button>

      {open ? (
        <div
          id={panelId}
          className="bx-admin-datepicker"
          role="dialog"
          aria-label="Filtrar por período"
        >
          <div className="bx-admin-datepicker__presets" role="group" aria-label="Atalhos">
            <button type="button" onClick={() => applyPreset(7)}>
              7 dias
            </button>
            <button type="button" onClick={() => applyPreset(17)}>
              17 dias
            </button>
            <button type="button" onClick={() => applyPreset(30)}>
              30 dias
            </button>
            <button type="button" onClick={applyMonth}>
              Este mês
            </button>
          </div>

          <div className="bx-admin-datepicker__nav">
            <button
              type="button"
              aria-label="Mês anterior"
              onClick={() =>
                setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))
              }
            >
              ‹
            </button>
            <strong>
              {MONTHS[monthCursor.getMonth()]} {monthCursor.getFullYear()}
            </strong>
            <button
              type="button"
              aria-label="Próximo mês"
              onClick={() =>
                setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))
              }
            >
              ›
            </button>
          </div>

          <div className="bx-admin-datepicker__weekdays">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="bx-admin-datepicker__grid" role="grid" aria-label="Calendário">
            {cells.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} className="bx-admin-datepicker__empty" />
              }

              const inRange = isBetween(day, ordered.start, ordered.end)
              const isStart = sameDay(day, ordered.start)
              const isEnd = sameDay(day, ordered.end)
              const className = [
                'bx-admin-datepicker__day',
                inRange ? ' is-in-range' : '',
                isStart ? ' is-start' : '',
                isEnd ? ' is-end' : '',
              ].join('')

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={className}
                  aria-pressed={isStart || isEnd}
                  onClick={() => selectDay(day)}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          <p className="bx-admin-datepicker__hint">
            {pickingEnd
              ? `Início ${formatBrDate(draftStart)} · escolha a data final`
              : `${formatBrDate(ordered.start)} → ${formatBrDate(ordered.end)} · ${daysInRange(ordered)} dias`}
          </p>

          <div className="bx-admin-datepicker__actions">
            <button type="button" className="bx-admin-datepicker__cancel" onClick={() => onOpenChange(false)}>
              Cancelar
            </button>
            <button type="button" className="bx-admin-datepicker__apply" onClick={handleApply}>
              Aplicar filtro
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CalendarGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </svg>
  )
}
