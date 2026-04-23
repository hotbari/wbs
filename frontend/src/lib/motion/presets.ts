/**
 * Spring presets. Match CLAUDE.md values (stiffness 400–500, damping 28–35).
 * Prefer these over ad-hoc spring configs in components.
 *
 * Uses `'spring' as const` pattern consistent with existing code
 * (NavBar.tsx:81, PhaseAccordion.tsx:76, StaggerList.tsx:18).
 */
export const spring = {
  /** Interactive press/hover — fast, minimal bounce. Button taps, NavBar pill, TaskRow x-shift. */
  snappy: { type: 'spring' as const, stiffness: 500, damping: 32 },
  /** List item enter, accordion height, caret rotation — feels springy without overshoot. */
  gentle: { type: 'spring' as const, stiffness: 380, damping: 28 },
  /** Hero entrances, modal panel, drawer slide — larger elements, softer landing. */
  soft:   { type: 'spring' as const, stiffness: 280, damping: 28 },
}

/**
 * Duration-based presets. Use for tooltips, subtle fades, small-delta UI
 * where spring would overshoot noticeably.
 */
export const fade = {
  /** Tooltip, autocomplete dropdown — near-instant. */
  fast: { duration: 0.12, ease: 'easeOut' as const },
  /** Default fade — modal backdrop, page-level transitions when spring not appropriate. */
  base: { duration: 0.2, ease: 'easeOut' as const },
}
