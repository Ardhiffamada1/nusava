# DESIGN SYSTEM — PROJECT RULES

This document defines the permanent visual and UI/UX standards for this project.

ALL AI coding agents MUST follow these rules whenever creating, modifying, or extending any part of this website.

These rules are mandatory and take priority over generic AI design defaults.

## 1. CORE DESIGN PHILOSOPHY

The website must feel like a carefully crafted product designed by a professional human product designer.

Avoid the typical appearance of AI-generated websites.

Design principles:
- Intentional, minimal, and sophisticated.
- Consistent visual language.
- Strong typography and clear hierarchy.
- Restrained use of decorative elements.
- Functional over decorative.
- Every component must have a clear purpose.

Never introduce generic AI-generated visual patterns.

## 2. TYPOGRAPHY — STRICT RULES

Inter is the ONLY approved font family throughout the entire website.

- Use Inter for headings, body text, labels, buttons, navigation, tables, and forms.
- Never introduce another font family.
- Never use generic fallback font combinations as intentional design choices.
- Follow the existing typography scale.
- Maintain consistent font weights.
- Avoid excessive font size variations.
- Avoid unnecessary uppercase text.
- Avoid excessive bold typography.
- Avoid oversized headings without a clear reason.

IMPORTANT:
Do not create new typography styles when existing typography tokens or utility classes can be reused.

## 3. FORBIDDEN AI DESIGN PATTERNS

Never introduce these patterns unless explicitly requested:

- Unnecessary badges and labels.
- Decorative status pills.
- Excessive rounded corners.
- Random gradients.
- Purple/blue AI-style gradients.
- Unnecessary glow effects.
- Excessive box shadows.
- Random decorative icons.
- Floating decorative elements.
- Unnecessary borders.
- Repetitive card layouts.
- Excessive section labels such as "OVERVIEW", "FEATURES", or "INSIGHTS".
- Generic AI-generated dashboard patterns.
- Excessive empty containers.
- Unnecessary descriptions explaining obvious UI elements.
- Fake data and decorative metrics.

Do not add labels just to make a component look more informative.

Every label, badge, icon, and decorative element must serve a genuine functional purpose.

## 4. COMPONENT CONSISTENCY

Before creating any new component:

1. Inspect existing components.
2. Find an existing component with similar functionality.
3. Reuse it whenever possible.
4. Follow its existing styling.
5. Avoid creating duplicate component variations.

All new components must follow the established:
- Button styles.
- Input styles.
- Typography.
- Spacing.
- Border radius.
- Color palette.
- Hover and focus states.
- Interaction patterns.

Do not invent new visual styles for individual features.

## 5. SPACING AND LAYOUT

Follow the existing spacing system.

- Maintain consistent vertical rhythm.
- Align elements precisely.
- Avoid unnecessary containers.
- Avoid excessive padding.
- Avoid inconsistent content widths.
- Use whitespace intentionally.
- Keep layouts balanced and readable.

Do not add cards around every section.

## 6. COLOR AND VISUAL TREATMENT

Use only the existing project color palette and design tokens:
- Primary Brand: `#003D29` (Forest Green), `#002B1D` (Darker hover state)
- Secondary Accent: `#FCF0E4` (Peach campaign surface)
- Card / Neutral Surfaces: `#FAF9F5` (Stone neutral), `#F5F6F6` (Image backdrops)
- Borders: `border-stone-200`
- Text: `#1C1917` (Stone 900), Secondary `#78716C` (Stone 500)

Never introduce arbitrary colors.

Avoid:
- Random gradients.
- Excessive color combinations.
- Unnecessary accent colors.
- Excessive shadows.
- Inconsistent surface backgrounds.

## 7. LABELS, BADGES AND UI TEXT

Use labels only when they improve clarity or usability.

Avoid:
- Decorative labels above every heading.
- Unnecessary category badges.
- Repetitive metadata.
- Redundant descriptions.
- Generic AI-generated marketing language.

Keep UI copy concise, natural, and human.

## 8. NEW FEATURE DEVELOPMENT RULES

Whenever a new feature is requested:

- Preserve the existing design language.
- Reuse existing components and design tokens.
- Match the visual treatment of similar existing features.
- Do not redesign unrelated sections.
- Do not add unnecessary UI elements.
- Do not change global styles without a clear reason.
- Maintain existing functionality and responsive behavior.

A new feature must look like it was part of the original product from day one.

## 9. BEFORE IMPLEMENTATION

Before writing code for any new feature:

1. Inspect the relevant existing page.
2. Inspect similar existing components.
3. Identify the applicable design tokens.
4. Understand the current interaction patterns.
5. Plan the implementation around the existing design system.

Do not immediately generate new UI from scratch.

## 10. FINAL DESIGN REVIEW

Before considering a feature complete, verify:

- Is the Inter font used everywhere?
- Does the feature match existing components?
- Are there unnecessary labels or badges?
- Are there unnecessary cards or containers?
- Are colors consistent?
- Is spacing consistent?
- Does the feature look native to the existing website?
- Does it avoid generic AI-generated design patterns?
- Does it preserve existing functionality?

If any answer indicates inconsistency, fix it before finishing.

FINAL RULE:

Consistency is more important than novelty.

Never sacrifice the established visual identity of this project just to make a new feature look visually impressive.
