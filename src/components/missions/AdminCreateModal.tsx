import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

export type AdminCreateKind = 'mission' | 'pass' | 'coupon' | 'campaign'
export type AdminModalMode = 'create' | 'edit'

type AdminCreateModalProps = {
  kind: AdminCreateKind
  mode?: AdminModalMode
  initialValues?: Record<string, string>
  occupiedLevels?: number[]
  occupiedKeys?: string[]
  onClose: () => void
  onSubmit: (
    kind: AdminCreateKind,
    payload: Record<string, string>,
    mode: AdminModalMode,
  ) => void
  onDelete?: (kind: AdminCreateKind) => void
}

const MODAL_COPY: Record<
  AdminCreateKind,
  {
    eyebrow: string
    createTitle: string
    editTitle: string
    createLead: string
    editLead: string
    createSubmit: string
    editSubmit: string
  }
> = {
  mission: {
    eyebrow: 'Missões',
    createTitle: 'Criar missão',
    editTitle: 'Editar missão',
    createLead: 'Defina meta, pontos e período da missão da temporada.',
    editLead: 'Atualize os dados da missão selecionada.',
    createSubmit: 'Criar missão',
    editSubmit: 'Salvar alterações',
  },
  pass: {
    eyebrow: 'Passe',
    createTitle: 'Adicionar recompensa',
    editTitle: 'Editar recompensa',
    createLead: 'Cadastre um item digital na BullPass por nível.',
    editLead: 'Atualize a recompensa selecionada no passe.',
    createSubmit: 'Salvar no passe',
    editSubmit: 'Salvar alterações',
  },
  coupon: {
    eyebrow: 'Cupons',
    createTitle: 'Gerar cupom',
    editTitle: 'Editar cupom',
    createLead: 'Publique um código promocional com regras de uso.',
    editLead: 'Atualize o cupom selecionado e suas regras.',
    createSubmit: 'Gerar cupom',
    editSubmit: 'Salvar alterações',
  },
  campaign: {
    eyebrow: 'Campanha',
    createTitle: 'Configurar campanha',
    editTitle: 'Editar campanha',
    createLead: 'Atualize banner, título, ordem e CTA na home.',
    editLead: 'Ajuste a campanha selecionada e o banner.',
    createSubmit: 'Publicar campanha',
    editSubmit: 'Salvar alterações',
  },
}

export function AdminCreateModal({
  kind,
  mode = 'create',
  initialValues,
  occupiedLevels = [],
  occupiedKeys = [],
  onClose,
  onSubmit,
  onDelete,
}: AdminCreateModalProps) {
  const copy = MODAL_COPY[kind]
  const isEdit = mode === 'edit'
  const [values, setValues] = useState<Record<string, string>>(
    () => initialValues ?? defaultValues(kind),
  )
  const [bannerName, setBannerName] = useState(initialValues?.bannerFile ?? '')
  const [bannerPreview, setBannerPreview] = useState<string | null>(() => {
    if (initialValues?.bannerPreview) return initialValues.bannerPreview
    const file = initialValues?.bannerFile
    if (file && (file.startsWith('/') || file.startsWith('blob:') || file.startsWith('http'))) {
      return file
    }
    return null
  })
  const [ownedPreview, setOwnedPreview] = useState(false)

  const levelNumber = Number(values.level)
  const currentPassKey = `${values.track}-${levelNumber}`
  const initialPassKey = `${initialValues?.track}-${initialValues?.level}`
  const levelOccupied =
    kind === 'pass' &&
    Number.isFinite(levelNumber) &&
    occupiedKeys.includes(currentPassKey) &&
    (!isEdit || currentPassKey !== initialPassKey)

  const passPreviewTitle = buildPassTitle(values.amount, values.unitLabel, values.title)
  const unitPreviewLabel =
    values.unit === 'brl' ? 'R$' : values.unit === 'days' ? 'dias' : 'volume'
  const missionProgressHint =
    values.target.trim().length > 0
      ? `Meta: ${values.target} ${unitPreviewLabel} · +${values.points || '0'} pontos`
      : 'Defina a meta para prévia do progresso.'

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

  useEffect(() => {
    return () => {
      if (ownedPreview && bannerPreview) URL.revokeObjectURL(bannerPreview)
    }
  }, [bannerPreview, ownedPreview])

  function updateField(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleBannerChange(file: File | null) {
    setBannerPreview((current) => {
      if (ownedPreview && current) URL.revokeObjectURL(current)
      return file ? URL.createObjectURL(file) : null
    })
    setOwnedPreview(Boolean(file))
    setBannerName(file?.name ?? '')
    updateField('bannerFile', file?.name ?? '')
  }

  function handleGenerateCode() {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
    updateField('code', `BULL${suffix}`)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (kind === 'campaign' && !bannerName && !bannerPreview && mode === 'create') return
    if (kind === 'pass' && levelOccupied) return
    onSubmit(
      kind,
      {
        ...values,
        title: kind === 'pass' ? passPreviewTitle : values.title,
        bannerFile: bannerName || values.bannerFile || '',
        bannerPreview: bannerPreview ?? values.bannerPreview ?? '',
        placement: 'home',
      },
      mode,
    )
  }

  const title = isEdit ? copy.editTitle : copy.createTitle
  const lead = isEdit ? copy.editLead : copy.createLead
  const submitLabel = isEdit ? copy.editSubmit : copy.createSubmit

  return (
    <div className="bs-admin-modal" role="presentation" onClick={onClose}>
      <div
        className="bs-admin-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bs-admin-modal-title"
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

        <p className="bs-admin-modal__eyebrow">{copy.eyebrow}</p>
        <h2 id="bs-admin-modal-title">{title}</h2>
        <p className="bs-admin-modal__lead">{lead}</p>

        <form className="bs-admin-modal__form" onSubmit={handleSubmit}>
          {kind === 'mission' ? (
            <>
              <Field
                label="Título"
                name="title"
                value={values.title}
                onChange={updateField}
                placeholder="Ex.: Depositar este mês"
                required
              />
              <Field
                label="Descrição"
                name="description"
                value={values.description}
                onChange={updateField}
                placeholder="Breve explicação da missão"
                required
              />
              <div className="bs-admin-modal__row">
                <SelectField
                  label="Status"
                  name="status"
                  value={values.status}
                  onChange={updateField}
                  options={[
                    { value: 'draft', label: 'Rascunho' },
                    { value: 'active', label: 'Ativa' },
                    { value: 'ended', label: 'Encerrada' },
                  ]}
                />
                <Field
                  label="CTA do botão"
                  name="ctaLabel"
                  value={values.ctaLabel}
                  onChange={updateField}
                  placeholder="Depositar"
                  required
                />
              </div>
              <div className="bs-admin-modal__row">
                <Field
                  label="Meta"
                  name="target"
                  value={values.target}
                  onChange={updateField}
                  placeholder="Ex.: 500"
                  required
                />
                <SelectField
                  label="Unidade"
                  name="unit"
                  value={values.unit}
                  onChange={updateField}
                  options={[
                    { value: 'brl', label: 'R$' },
                    { value: 'days', label: 'Dias' },
                    { value: 'volume', label: 'Volume' },
                  ]}
                />
              </div>
              <div className="bs-admin-modal__row">
                <Field
                  label="Pontos"
                  name="points"
                  value={values.points}
                  onChange={updateField}
                  placeholder="300"
                  required
                />
                <Field
                  label="Início"
                  name="startsAt"
                  value={values.startsAt}
                  onChange={updateField}
                  placeholder="01/09/2026"
                  required
                />
              </div>
              <Field
                label="Encerra em"
                name="endsAt"
                value={values.endsAt}
                onChange={updateField}
                placeholder="30/10/2026"
                required
              />
              <div className="bs-admin-modal__preview">
                <span>Prévia do progresso</span>
                <strong>{missionProgressHint}</strong>
                <div className="bs-admin-modal__preview-bar" aria-hidden="true">
                  <i style={{ width: '35%' }} />
                </div>
                <em>O usuário vê a barra até {values.target || '0'} {unitPreviewLabel}.</em>
              </div>
            </>
          ) : null}

          {kind === 'pass' ? (
            <>
              <div className="bs-admin-modal__row">
                <Field
                  label="Valor"
                  name="amount"
                  value={values.amount}
                  onChange={updateField}
                  placeholder="25"
                  required
                />
                <SelectField
                  label="Unidade"
                  name="unitLabel"
                  value={values.unitLabel}
                  onChange={updateField}
                  options={[
                    { value: 'R$', label: 'R$' },
                    { value: 'pontos', label: 'Pontos' },
                    { value: 'ticket', label: 'Ticket' },
                    { value: '%', label: '%' },
                    { value: 'dias', label: 'Dias' },
                    { value: 'caixa', label: 'Caixa' },
                  ]}
                />
              </div>
              <div className="bs-admin-modal__row">
                <SelectField
                  label="Trilha"
                  name="track"
                  value={values.track}
                  onChange={updateField}
                  options={[
                    { value: 'free', label: 'BullPass' },
                    { value: 'premium', label: 'BullPass Premium' },
                  ]}
                />
                <Field
                  label="Nível"
                  name="level"
                  value={values.level}
                  onChange={updateField}
                  placeholder="4"
                  required
                />
              </div>
              {levelOccupied ? (
                <p className="bs-admin-modal__warn">
                  Este nível já possui recompensa nesta trilha. Escolha outro nível.
                </p>
              ) : null}
              <SelectField
                label="Tipo"
                name="kind"
                value={values.kind}
                onChange={updateField}
                options={[
                  { value: 'cashback', label: 'Cashback' },
                  { value: 'points', label: 'Pontos' },
                  { value: 'ticket', label: 'Ticket' },
                  { value: 'chest', label: 'Caixa' },
                  { value: 'report', label: 'Relatório' },
                  { value: 'balance', label: 'Saldo' },
                  { value: 'badge', label: 'Emblema' },
                  { value: 'bonus', label: 'Bônus' },
                ]}
              />
              <Field
                label="Elegibilidade"
                name="eligibility"
                value={values.eligibility}
                onChange={updateField}
                placeholder="Válido por 7 dias após o resgate"
              />
              <p className="bs-admin-modal__hint">Estoque digital: <strong>Ilimitado</strong> (automático).</p>
              <div className="bs-admin-modal__pass-preview" aria-label="Prévia do card">
                <span>Prévia do card</span>
                <article className={`bs-admin-modal__pass-card is-${values.track}`}>
                  <em>{values.track === 'premium' ? 'Premium' : 'BullPass'}</em>
                  <strong>{passPreviewTitle || 'Recompensa'}</strong>
                  <p>{values.eligibility || 'Benefício digital do passe'}</p>
                  <b>Nv. {values.level || '—'}</b>
                </article>
              </div>
            </>
          ) : null}

          {kind === 'coupon' ? (
            <>
              <Field
                label="Nome do cupom"
                name="name"
                value={values.name}
                onChange={updateField}
                placeholder="Ex.: Bônus de Depósito 150%"
                required
              />
              <div className="bs-admin-modal__row bs-admin-modal__row--code">
                <Field
                  label="Código"
                  name="code"
                  value={values.code}
                  onChange={updateField}
                  placeholder="BULL150"
                  required
                />
                <button
                  type="button"
                  className="bs-admin-modal__generate"
                  onClick={handleGenerateCode}
                >
                  Gerar código
                </button>
              </div>
              <div className="bs-admin-modal__row">
                <SelectField
                  label="Tipo"
                  name="type"
                  value={values.type}
                  onChange={updateField}
                  options={[
                    { value: 'bonus', label: 'Bônus' },
                    { value: 'cashback', label: 'Cashback' },
                    { value: 'fee', label: 'Taxas' },
                    { value: 'ticket', label: 'Ticket' },
                    { value: 'riskfree', label: 'RiskFree' },
                  ]}
                />
                <Field
                  label="Valor / benefício"
                  name="valueLabel"
                  value={values.valueLabel}
                  onChange={updateField}
                  placeholder="150% de bônus"
                  required
                />
              </div>
              <div className="bs-admin-modal__row">
                <Field
                  label="Limite de usos"
                  name="limit"
                  value={values.limit}
                  onChange={updateField}
                  placeholder="1000"
                  required
                />
                <Field
                  label="Depósito mínimo (R$)"
                  name="minDeposit"
                  value={values.minDeposit}
                  onChange={updateField}
                  placeholder="100"
                />
              </div>
              <div className="bs-admin-modal__row">
                <Field
                  label="Validade"
                  name="expiresAt"
                  value={values.expiresAt}
                  onChange={updateField}
                  placeholder="28/09/2026"
                  required
                />
                <SelectField
                  label="1 uso por usuário"
                  name="onePerUser"
                  value={values.onePerUser}
                  onChange={updateField}
                  options={[
                    { value: 'true', label: 'Sim' },
                    { value: 'false', label: 'Não' },
                  ]}
                />
              </div>
              <Field
                label="Condições"
                name="terms"
                value={values.terms}
                onChange={updateField}
                placeholder="Regras de elegibilidade"
              />
              {isEdit && values.redemptions ? (
                <div className="bs-admin-modal__preview">
                  <span>Uso atual</span>
                  <strong>
                    {values.redemptions} / {values.limit || '0'} usos
                  </strong>
                  <div className="bs-admin-modal__preview-bar" aria-hidden="true">
                    <i
                      style={{
                        width: `${Math.min(
                          100,
                          (Number(values.redemptions) / Math.max(1, Number(values.limit) || 1)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {kind === 'campaign' ? (
            <>
              <Field
                label="Título da campanha"
                name="title"
                value={values.title}
                onChange={updateField}
                placeholder="Ex.: iPhone 15 Pro Max"
                required
              />
              <ImageUploadField
                fileName={bannerName}
                previewUrl={bannerPreview}
                onChange={handleBannerChange}
                required={!isEdit}
              />
              {bannerPreview ? (
                <div className="bs-admin-modal__banner-preview">
                  <img src={bannerPreview} alt={values.altText || values.title || 'Prévia do banner'} />
                </div>
              ) : null}
              <div className="bs-admin-modal__row">
                <Field
                  label="Início"
                  name="startsAt"
                  value={values.startsAt}
                  onChange={updateField}
                  placeholder="01/10/2026"
                  required
                />
                <Field
                  label="Fim"
                  name="endsAt"
                  value={values.endsAt}
                  onChange={updateField}
                  placeholder="31/10/2026"
                  required
                />
              </div>
              <div className="bs-admin-modal__row">
                <Field
                  label="Ordem no carrossel"
                  name="priority"
                  value={values.priority}
                  onChange={updateField}
                  placeholder="1"
                  required
                />
                <Field
                  label="Link do CTA"
                  name="ctaUrl"
                  value={values.ctaUrl}
                  onChange={updateField}
                  placeholder="/missoes"
                  required
                />
              </div>
              <Field
                label="Texto alternativo do banner"
                name="altText"
                value={values.altText}
                onChange={updateField}
                placeholder="Descrição acessível da imagem"
                required
              />
              <p className="bs-admin-modal__hint">
                Todos os banners de campanha são publicados na posição <strong>Home</strong>.
              </p>
            </>
          ) : null}

          <div className="bs-admin-modal__actions">
            {isEdit && kind === 'mission' && onDelete ? (
              <button
                type="button"
                className="bs-admin-modal__danger"
                onClick={() => onDelete(kind)}
              >
                Excluir
              </button>
            ) : null}
            <div className="bs-admin-modal__actions-end">
              <button type="button" className="bs-admin-modal__ghost" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="bs-admin-modal__cta" disabled={levelOccupied}>
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function buildPassTitle(amount?: string, unitLabel?: string, fallback?: string) {
  const cleanAmount = amount?.trim() ?? ''
  const cleanUnit = unitLabel?.trim() ?? ''
  if (!cleanAmount) return fallback?.trim() || ''
  if (cleanUnit === 'R$') return `R$ ${cleanAmount}`
  if (cleanUnit === '%') return `${cleanAmount}%`
  if (cleanUnit) return `${cleanAmount} ${cleanUnit}`
  return cleanAmount
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="bs-admin-modal__field">
      <span>{label}</span>
      <input
        name={name}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </label>
  )
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="bs-admin-modal__field">
      <span>{label}</span>
      <select name={name} value={value} onChange={(event) => onChange(name, event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ImageUploadField({
  fileName,
  previewUrl,
  onChange,
  required = false,
}: {
  fileName: string
  previewUrl: string | null
  onChange: (file: File | null) => void
  required?: boolean
}) {
  return (
    <div className="bs-admin-modal__field">
      <span>Banner da campanha</span>
      <label className={`bs-admin-upload${previewUrl ? ' has-file' : ''}`}>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          required={required && !fileName}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null
            onChange(file)
          }}
        />
        {previewUrl ? (
          <span className="bs-admin-upload__preview">
            <img src={previewUrl} alt="" />
            <span className="bs-admin-upload__meta">
              <strong>{fileName}</strong>
              <em>Clique para trocar a imagem</em>
            </span>
          </span>
        ) : (
          <span className="bs-admin-upload__empty">
            <UploadIcon />
            <strong>Enviar banner</strong>
            <em>PNG, JPG ou WEBP · até 5 MB</em>
          </span>
        )}
      </label>
      {fileName ? (
        <button
          type="button"
          className="bs-admin-upload__remove"
          onClick={() => onChange(null)}
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

function defaultValues(kind: AdminCreateKind): Record<string, string> {
  switch (kind) {
    case 'mission':
      return {
        title: '',
        description: '',
        target: '',
        unit: 'brl',
        points: '',
        status: 'draft',
        startsAt: '',
        endsAt: '',
        ctaLabel: 'Continuar',
      }
    case 'pass':
      return {
        title: '',
        track: 'free',
        level: '',
        kind: 'cashback',
        amount: '',
        unitLabel: 'R$',
        eligibility: 'Válido por 7 dias após o resgate',
      }
    case 'coupon':
      return {
        name: '',
        code: '',
        type: 'bonus',
        valueLabel: '',
        limit: '',
        expiresAt: '',
        terms: '',
        minDeposit: '0',
        onePerUser: 'true',
        redemptions: '0',
      }
    case 'campaign':
      return {
        title: '',
        bannerFile: '',
        startsAt: '',
        endsAt: '',
        placement: 'home',
        priority: '1',
        ctaUrl: '/missoes',
        altText: '',
      }
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}
