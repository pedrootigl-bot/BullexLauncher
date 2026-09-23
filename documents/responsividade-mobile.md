# Responsividade — telas menores

Ajustes CSS (sem redesign) para mobile ≈ 360–640px.

## O que mudou

| Área | Melhoria |
|------|----------|
| Shell | `100dvh`, safe-area, padding do main/topbar mais compacto |
| Login | Tagline oculta &lt;480px, tipografia e card mais densos |
| BullStart / Passe | Hero menos alto, cupons empilhados, scroll do grid com overscroll |
| Admin / Sorteio | Prêmios em card horizontal; participantes em linha compacta (sem M01–M03); stepper com scroll; modais full-width |
| Menu mobile | `inert` quando fechado |

## Arquivos

- `src/styles/admin-panel.css`
- `src/styles/bullstart.css`
- `src/styles/login-bullex.css`
- `src/components/missions/AppSidebar.tsx`
