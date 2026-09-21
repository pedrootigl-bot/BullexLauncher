import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

export type AdminCreateKind = 'mission' | 'pass' | 'coupon' | 'campaign'
export type AdminModalMode = 'create' | 'edit'

type AdminCreateModalProps = {
  kind: AdminCreateKind
  mode?: AdminModalMode
  initialValues?: Record<string, string>
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
    createLead: 'Cadastre um item na trilha gratuita ou premium por nível.',
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
    createLead: 'Atualize banner, título e período de destaque na home.',
    editLead: 'Ajuste a campanha selecionada e o banner.',
    createSubmit: 'Publicar campanha',
    editSubmit: 'Salvar alterações',
  },
}

export function AdminCreateModal({
  kind,
  mode = 'create',
  initialValues,
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (kind === 'campaign' && !bannerName && mode === 'create') return
    onSubmit(
      kind,
      {
        ...values,
        bannerFile: bannerName || values.bannerFile || '',
        bannerPreview: bannerPreview ?? values.bannerPreview ?? '',
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
                  label="Encerra em"
                  name="endsAt"
                  value={values.endsAt}
                  onChange={updateField}
                  placeholder="30/10/2026"
                  required
                />
              </div>
            </>
          ) : null}

          {kind === 'pass' ? (
            <>
              <Field
                label="Título da recompensa"
                name="title"
                value={values.title}
                onChange={updateField}
                placeholder="Ex.: R$ 25 cashback"
                required
              />
              <div className="bs-admin-modal__row">
                <SelectField
                  label="Trilha"
                  name="track"
                  value={values.track}
                  onChange={updateField}
                  options={[
                    { value: 'free', label: 'Gratuita' },
                    { value: 'premium', label: 'Premium' },
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
              <div className="bs-admin-modal__row">
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
                  label="Estoque"
                  name="stock"
                  value={values.stock}
                  onChange={updateField}
                  placeholder="Ilimitado ou 1000"
                />
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
              <div className="bs-admin-modal__row">
                <Field
                  label="Código"
                  name="code"
                  value={values.code}
                  onChange={updateField}
                  placeholder="BULL150"
                  required
                />
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
              </div>
              <div className="bs-admin-modal__row">
                <Field
                  label="Valor / benefício"
                  name="valueLabel"
                  value={values.valueLabel}
                  onChange={updateField}
                  placeholder="150% de bônus"
                  required
                />
                <Field
                  label="Limite de usos"
                  name="limit"
                  value={values.limit}
                  onChange={updateField}
                  placeholder="1000"
                  required
                />
              </div>
              <Field
                label="Validade"
                name="expiresAt"
                value={values.expiresAt}
                onChange={updateField}
                placeholder="28/09/2026"
                required
              />
              <Field
                label="Condições"
                name="terms"
                value={values.terms}
                onChange={updateField}
                placeholder="Regras de elegibilidade"
              />
            </>
          ) : null}

          {kind === 'campaign' ? (
            <>
              <Field
                label="Título da campanha"
                name="title"
                value={values.title}
                onChange={updateField}
                placeholder="Ex.: iPhone 18 Pro Max"
                required
              />
              <Field
                label="Subtítulo"
                name="subtitle"
                value={values.subtitle}
                onChange={updateField}
                placeholder="Campanha especial da temporada"
              />
              <ImageUploadField
                fileName={bannerName}
                previewUrl={bannerPreview}
                onChange={handleBannerChange}
                required={!isEdit}
              />
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
              <SelectField
                label="Posição"
                name="placement"
                value={values.placement}
                onChange={updateField}
                options={[
                  { value: 'home', label: 'Home' },
                  { value: 'missions', label: 'BullStart' },
                  { value: 'rewards', label: 'Recompensas' },
                ]}
              />
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
              <button type="submit" className="bs-admin-modal__cta">
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
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
        endsAt: '',
      }
    case 'pass':
      return {
        title: '',
        track: 'free',
        level: '',
        kind: 'cashback',
        stock: 'Ilimitado',
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
      }
    case 'campaign':
      return {
        title: '',
        subtitle: '',
        bannerFile: '',
        startsAt: '',
        endsAt: '',
        placement: 'home',
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
