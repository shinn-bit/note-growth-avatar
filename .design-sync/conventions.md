# note-tree-ui conventions

This is a small, hand-picked slice of "note TREE" (a Next.js habit-tracking app where posting grows a plant avatar). It is **not** a full design system — just the handful of components that were already duplicated across pages and got extracted into a shared library. Build with these exact pieces; don't invent parallel ones for the same job.

## No provider, no wrapper

None of these components read from React context. Drop them in directly — no `ThemeProvider`, no root wrapper required.

## Styling idiom: inline styles with literal brand constants, not utility classes

This library does **not** use Tailwind or any CSS class vocabulary — every component styles itself via inline `style={{}}` objects with hard-coded hex values. When composing new layout around these components (spacing, containers), match the same idiom — inline styles, not classNames — and reuse these exact brand colors:

| Name | Hex | Use |
|---|---|---|
| Background (cream) | `#EAE3D6` | page/card background |
| Green | `#3D7A50` | primary actions, filled progress, positive state |
| Gold | `#C4922A` | secondary accent, gacha/celebration moments |
| Dark | `#1A1A18` | primary text |
| Red | `#C04030` | destructive actions |
| Muted label | `#A09080` | small caps labels (e.g. "STREAK") |
| Muted body | `#9A9080` | secondary/sublabel text |
| Unfilled track | `#C8C0B0` | inactive stage-progress cells |

Border radius runs 14–20px (`Card` defaults to 18). Shadows are consistently `0 2px 10px rgba(0,0,0,0.07)` (baked into `Card`, don't restate it manually).

## Where the truth lives

Each component ships `components/general/<Name>/<Name>.d.ts` (props) and `<Name>.prompt.md` (usage). There are only 6 exports — read the `.d.ts` directly rather than guessing an API; nothing here has hidden variants beyond what's typed.

## Composing them together

```tsx
import { Card, StatTile, StageProgress, CloseButton } from 'note-tree-ui';

function ExampleScreen() {
  return (
    <div style={{ background: '#EAE3D6', padding: 20 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <StatTile label="STREAK" value={7} sublabel="日連続" />
        <StatTile label="COMPLETED" value={3} sublabel="植物完成" />
      </div>
      <StageProgress stage={3} maxStage={5} />
      <Card style={{ marginTop: 14 }}>
        <div style={{ fontSize: 14, color: '#1A1A18', fontWeight: 600 }}>Status text</div>
      </Card>
    </div>
  );
}
```

## Known gap

`StatTile`'s numeric value uses `var(--font-dm-serif)`, a font this bundle does not ship (it's injected at runtime by the real app's `next/font`). Expect it to render in a fallback serif here — that's expected, not a bug to fix.
