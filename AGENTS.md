# Meridian implementation notes

- Preserve the dark-first charcoal system and the semantic use of mint, coral, and gold.
- Numbers, prices, percentages, dates, and R-multiples use JetBrains Mono with tabular numerals.
- Keep primary panels low-contrast. Borders should define hierarchy before shadows do.
- Gold is reserved for primary actions, current risk attention, and intentional focus.
- Core user journeys must remain keyboard accessible and functional at 360px through wide desktop layouts.
- New product views should reuse `Panel`, `Button`, `Badge`, `FieldLabel`, and existing CSS variables before adding new primitives.
- Do not introduce a competing card radius, icon family, spacing scale, or color semantics.
