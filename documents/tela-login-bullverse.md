# Tela de Login BullVerse

## Objetivo

Tela de entrada alinhada ao visual cyberpunk da marca (fundo cinematico + painel de login interativo).

## Como rodar

```bash
npm install
npm run dev
```

Build de producao:

```bash
npm run build
npm run preview
```

## Estrutura relevante

| Caminho | Papel |
|---|---|
| `src/pages/LoginPage.tsx` | Layout hero + formulario |
| `src/components/LoginForm.tsx` | Campos reais (e-mail/usuario, senha, lembrar, social) |
| `src/components/MediaBackground.tsx` | Camada full-bleed imagem/video |
| `public/media/hero-bg.jpg` | Background estatico atual |
| `src/index.css` | Tokens de cor, tipografia e glassmorphism |

## Background: imagem agora, video depois

Hoje o fundo usa imagem estatica em `public/media/hero-bg.jpg`.

Para trocar por video sem redesenhar a tela, em `src/pages/LoginPage.tsx`:

```ts
const HERO_VIDEO = '/media/hero-bg.mp4' // coloque o arquivo em public/media/
const HERO_IMAGE = '/media/hero-bg.jpg' // continua como poster/fallback
```

O componente `MediaBackground` ja cobre:

- `object-fit: cover` full viewport
- veil/gradiente para legibilidade do texto
- `autoPlay`, `muted`, `loop`, `playsInline` no video

## Formulario

O card de login **nao** e imagem: e HTML/React com:

- e-mail ou nome de usuario
- senha com mostrar/ocultar
- lembrar de mim
- links de recuperar senha / criar conta
- botoes sociais (Google, Discord, Apple) — UI pronta, auth a conectar

O submit atual apenas registra no console (placeholder ate existir backend/auth).

## Visual

- Verde neon `#39FF14` sobre preto
- Fontes: Orbitron (display) + Rajdhani (corpo)
- Painel com `backdrop-filter` e borda neon
- Layout desktop: hero a esquerda, login a direita (personagem do fundo permanece visivel)
- Mobile: empilha hero + formulario

## Proximos passos sugeridos

1. Conectar autenticacao real (API / OAuth)
2. Adicionar `public/media/hero-bg.mp4` e ativar `HERO_VIDEO`
3. Rotas de cadastro e recuperacao de senha
