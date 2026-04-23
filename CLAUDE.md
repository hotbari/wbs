# CLAUDE.md

Project-level context loaded automatically into every Claude Code session.

## Design Context

### Users
Multi-role internal platform used daily by:
- **HR / Resource Managers** — primary users, allocate employees to projects, track capacity, manage staffing plans
- **Project Managers** — request staff, check availability, monitor allocation status per project
- **Admins** — configure the system, manage permissions, view org-wide dashboards

All roles are internal users working in a professional Korean corporate context. The platform is a core operational tool — users return to it daily under real work pressure. The UI must reduce cognitive load, not add to it.

### Brand Personality
**Structured · Trustworthy · Modern**

Serious without being sterile, modern without being trendy. The reliability of a good spreadsheet, the clarity of a great dashboard, the feel of software built with craft.

Emotional goals: **Confidence** (feel in control of complex data) · **Clarity** (density is fine if hierarchy is clear) · **Trust** (data-heavy UI must never feel chaotic)

### Aesthetic Direction
- **Tone:** Clinical-warm. Clean, airy, structured. Never cold or corporate-grey.
- **Color:** Zinc neutrals + Emerald accent (signals growth / allocation health). No hardcoded hex — always use CSS custom properties.
- **Typography:** Plus Jakarta Sans (UI) + GeistMono (numbers, %, dates). Tight letter-spacing on headings.
- **Cards:** Double-bezel elevation. Outer shell + inner white core with inset highlight.
- **Motion:** Spring physics (stiffness 400–500, damping 28–35). Purposeful, never theatrical. Animate transform + opacity only.
- **Nav:** Floating glass pill island. Never a full-width sticky bar.
- **Density:** 4/10 — gallery-airy. Generous whitespace.
- **Theme:** Light-first. Dark mode supported but secondary.
- **Icons:** Phosphor Icons, duotone weight preferred.

**Anti-patterns to avoid:**
- Cold enterprise grey, neon glows, oversaturated colors
- Symmetrical 3-column card grids
- Heavy shadows, drop-shadow overuse
- Decorative elements without semantic meaning
- Emoji in UI text

### Design Principles
1. **Structure earns trust.** Every element must justify its position. If it doesn't guide the eye, remove it.
2. **Motion is weight, not decoration.** Spring physics = intentional. Animate only transform + opacity. Never layout properties.
3. **Density through clarity, not compression.** Better hierarchy shows more — not smaller elements.
4. **Emerald means health.** Accent carries semantic meaning (allocation status, success). Use sparingly to preserve signal.
5. **Every role deserves the same craft.** Admin and internal views get the same design quality — no "internal admin ugliness."

## Behavioral guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.