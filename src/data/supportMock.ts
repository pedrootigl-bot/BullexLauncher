export type SupportChannelId = 'chat' | 'ticket' | 'help'

export type SupportChannel = {
  id: SupportChannelId
  title: string
  description: string
  cta: string
  featured?: boolean
  badge?: string
}

export type SupportFaq = {
  id: string
  question: string
  answer: string
  category: string
}

export type SupportTile = {
  id: string
  label: string
  value: string
  icon: 'online' | 'clock' | 'ticket' | 'shield'
}

export const supportIntro = {
  eyebrow: 'SUPORTE',
  titleBefore: 'Estamos aqui para',
  titleHighlight: 'te ajudar.',
  lead: 'Escolha a melhor forma de falar com a nossa equipe Bullex.',
  statusLabel: 'Online',
}

export const supportTiles: SupportTile[] = [
  { id: 'online', label: 'Status', value: 'Online agora', icon: 'online' },
  { id: 'time', label: 'Tempo médio', value: '5 minutos', icon: 'clock' },
  { id: 'tickets', label: 'Tickets abertos', value: '2 em andamento', icon: 'ticket' },
  { id: 'privacy', label: 'Privacidade', value: 'Atendimento seguro', icon: 'shield' },
]

export const supportChannels: SupportChannel[] = [
  {
    id: 'chat',
    title: 'Chat ao vivo',
    description: 'Fale agora com um atendente em tempo real.',
    cta: 'Iniciar chat →',
    featured: true,
    badge: 'Mais rápido',
  },
  {
    id: 'ticket',
    title: 'Abrir ticket',
    description: 'Descreva seu problema e acompanhe o protocolo.',
    cta: 'Abrir ticket →',
  },
  {
    id: 'help',
    title: 'Central de ajuda',
    description: 'Tutoriais, regras e dúvidas frequentes.',
    cta: 'Acessar →',
  },
]

export const supportFaqCategories = [
  'Todos',
  'Conta',
  'BullStart',
  'Recompensas',
  'Saques',
] as const

export const supportFaqs: SupportFaq[] = [
  {
    id: 'saque',
    question: 'Como funciona o saque?',
    answer:
      'Solicite o saque pela área da conta. Após a análise de segurança, o valor segue para a conta cadastrada nos prazos informados no fluxo.',
    category: 'Saques',
  },
  {
    id: 'bonus',
    question: 'Quanto tempo leva para o bônus cair?',
    answer:
      'Bônus elegíveis costumam ser creditados em até alguns minutos após a confirmação. Em promoções especiais, o prazo pode variar conforme as regras.',
    category: 'Recompensas',
  },
  {
    id: 'sorteios',
    question: 'Como participar dos sorteios?',
    answer:
      'Acumule tickets nas missões e no Passe de Recompensas. Cada ticket válido entra automaticamente nos sorteios ativos da temporada.',
    category: 'Recompensas',
  },
  {
    id: 'missoes',
    question: 'O que são as missões mensais?',
    answer:
      'São desafios BullStart do mês. Complete metas de operação, depósitos ou consistência para ganhar pontos e liberar recompensas.',
    category: 'BullStart',
  },
  {
    id: 'dados',
    question: 'Como alterar meus dados cadastrais?',
    answer:
      'Acesse o perfil da conta e edite os campos permitidos. Alterações sensíveis podem exigir confirmação por e-mail ou suporte.',
    category: 'Conta',
  },
]

export const supportSpecialist = {
  name: 'Ana Souza',
  role: 'Especialista Bullex',
  status: 'Online Agora',
  teamBadge: 'Equipe Bullex',
  imageSrc: '/images/support-specialist.jpg?v2',
  imageAlt: 'Ana Souza, especialista de suporte Bullex',
}

export type SupportChatRole = 'agent' | 'user' | 'system'

export type SupportChatMessage = {
  id: string
  role: SupportChatRole
  text: string
  at: string
}

/** Mensagens iniciais do chat ao vivo (MVP sem backend). */
export const supportChatSeed: SupportChatMessage[] = [
  {
    id: 'sys-1',
    role: 'system',
    text: 'Você entrou no chat com a equipe Bullex. Tempo médio de resposta: menos de 5 minutos.',
    at: 'Agora',
  },
  {
    id: 'agent-1',
    role: 'agent',
    text: `Olá! Sou ${supportSpecialist.name}, ${supportSpecialist.role}. Como posso te ajudar hoje?`,
    at: 'Agora',
  },
]

/** Respostas simuladas do atendente enquanto não houver websocket/API. */
export const supportChatAutoReplies = [
  'Entendi. Pode me enviar mais detalhes do que aconteceu?',
  'Estou verificando isso por aqui. Um instante, por favor.',
  'Obrigado pela informação. Vou te orientar no próximo passo.',
  'Se preferir, também posso abrir um ticket para acompanhamento do protocolo.',
  'Qualquer dúvida adicional, é só mandar por aqui — estou online.',
]

export const supportBrand = {
  quote: 'TRADERS REAIS, SUPORTE DE VERDADE.',
  caption: 'Nossa equipe está pronta para atender você.',
  imageSrc: '/images/support-bull.jpg',
  imageAlt: 'Touro Bullex — traders reais, suporte de verdade',
  heroImageSrc: '/images/support-bull.jpg',
}
