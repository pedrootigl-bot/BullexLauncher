# Layout — BullStart Missions (Bullex)

## Escopo

Dashboard visual de missões no estilo Bullex/BullStart.
Login BullVerse em `/` permanece. Sem lógica de verificação/claim.

## Fluxo

`/` (login) → Entrar / Criar conta → `/missoes`

## Estrutura da tela

- Sidebar Bullex (BullStart ativo + badge NOVO)
- Header com saudação e perfil
- 4 metric cards (depósito, volume, dias, missões)
- Progresso do mês (68%)
- Guia rápido com 3 mission cards

## Arquivos

| Caminho | Papel |
|---|---|
| `src/pages/MissionsPage.tsx` | Página |
| `src/components/missions/AppSidebar.tsx` | Menu lateral |
| `src/components/missions/DashboardHeader.tsx` | Saudação + perfil |
| `src/components/missions/UserStatCards.tsx` | Métricas |
| `src/components/missions/GlobalProgress.tsx` | Barra do mês |
| `src/components/missions/MissionGuide.tsx` | Seção guia |
| `src/components/missions/MissionGuideCard.tsx` | Card de missão |
| `src/data/missionsMock.ts` | Dados mock |
| `src/styles/bullstart.css` | Tokens e layout Bullex |

## Tokens

- Fundo `#050706`
- Cards `#0D120E` / `#111711`
- Verde `#9EFF00`
- Texto secundário `#8D968F`
- Fonte Inter

## Promo carousel

Seção **ACONTECENDO AGORA** antes do guia rápido.

- Imagens em `public/media/banners/`
- Auto-scroll lento, pausa no hover
- Swipe no mobile + setas/dots
- No desktop o próximo banner fica parcialmente visível

