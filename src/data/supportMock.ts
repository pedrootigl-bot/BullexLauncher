export type SupportChannelId = 'chat' | 'ticket' | 'help'

export type SupportChannel = {
  id: SupportChannelId
  title: string
  description: string
  cta: string
  featured?: boolean
}

export type SupportFaq = {
  id: string
  question: string
  answer: string
}

export const supportIntro = {
  title: 'Suporte',
  lead: 'Estamos aqui para te ajudar. Escolha a melhor forma de falar com a nossa equipe.',
  statusLabel: 'Online',
}

export const supportChannels: SupportChannel[] = [
  {
    id: 'chat',
    title: 'Chat ao vivo',
    description: 'Fale agora com um atendente',
    cta: 'Iniciar chat',
    featured: true,
  },
  {
    id: 'ticket',
    title: 'Abrir ticket',
    description: 'Descreva seu problema',
    cta: 'Abrir ticket',
  },
  {
    id: 'help',
    title: 'Central de ajuda',
    description: 'Acesse tutoriais e dúvidas',
    cta: 'Acessar',
  },
]

export const supportFaqs: SupportFaq[] = [
  {
    id: 'saque',
    question: 'Como funciona o saque?',
    answer:
      'Solicite o saque pela área da conta. Após a análise de segurança, o valor segue para a conta cadastrada nos prazos informados no fluxo.',
  },
  {
    id: 'bonus',
    question: 'Quanto tempo leva para o bônus cair?',
    answer:
      'Bônus elegíveis costumam ser creditados em até alguns minutos após a confirmação. Em promoções especiais, o prazo pode variar conforme as regras.',
  },
  {
    id: 'sorteios',
    question: 'Como participar dos sorteios?',
    answer:
      'Acumule tickets nas missões e no Passe de Recompensas. Cada ticket válido entra automaticamente nos sorteios ativos da temporada.',
  },
  {
    id: 'missoes',
    question: 'O que são as missões mensais?',
    answer:
      'São desafios BullStart do mês. Complete metas de operação, depósitos ou consistência para ganhar pontos e liberar recompensas.',
  },
  {
    id: 'dados',
    question: 'Como alterar meus dados cadastrais?',
    answer:
      'Acesse o perfil da conta e edite os campos permitidos. Alterações sensíveis podem exigir confirmação por e-mail ou suporte.',
  },
]

export const supportBrand = {
  quote: 'TRADERS REAIS, SUPORTE DE VERDADE.',
  caption: 'Nossa equipe está pronta para atender você.',
  imageSrc: '/images/support-bull.jpg',
  imageAlt: 'Touro Bullex — traders reais, suporte de verdade',
}
