# Chat ao vivo — Suporte

## Contexto

O card **Chat ao vivo** em `/suporte` abria apenas `console.log`. Foi implementado um chat MVP no frontend, sem backend/websocket.

## Comportamento

- CTA **Iniciar chat →** abre `LiveChatModal`
- Cabeçalho com Ana Souza (especialista mock) e status online
- Mensagens iniciais + envio pelo usuário (Enter ou botão)
- Respostas simuladas do atendente com indicador “digitando”
- Central de ajuda continua rolando até o FAQ

## Arquivos

| Arquivo | Função |
|---------|--------|
| `src/components/missions/LiveChatModal.tsx` | UI do chat |
| `src/data/supportMock.ts` | Seed + auto-replies |
| `src/pages/SupportPage.tsx` | Abre/fecha o modal |
| `src/styles/bullstart.css` | Estilos `.bs-live-chat*` |

## Próximo passo (backend)

Trocar o mock por sessão autenticada + websocket/API (`POST /api/support/chat`, eventos de mensagem). Não confiar no client para histórico definitivo.
