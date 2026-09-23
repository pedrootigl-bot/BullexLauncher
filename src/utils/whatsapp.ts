/** Remove tudo que não for dígito — para links wa.me / tel: */
export function digitsOnlyPhone(value: string): string {
  return value.replace(/\D/g, '')
}

/** Link WhatsApp Web/App a partir do número com DDI. */
export function whatsappHref(whatsapp: string): string {
  const digits = digitsOnlyPhone(whatsapp)
  return digits ? `https://wa.me/${digits}` : '#'
}
