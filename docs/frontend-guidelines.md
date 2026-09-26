# Frontend guidelines

## Design tokens

The `medical-pantry` daisyUI theme in `app/globals.css` is the source of truth for colours.
The initial palette follows Medical Pantry's public brand presentation:

- Navy `#141A43`: primary navigation, headings, and primary UI
- Blue `#485FC7`: secondary actions and informational states
- Red `#D02327`: high-emphasis calls to action, accents, and errors

Use semantic utilities such as `bg-primary`, `btn-secondary`, and `text-error` in feature
code. The direct `brand-navy`, `brand-blue`, and `brand-red` Tailwind tokens are reserved for
brand-specific artwork or layouts that cannot be expressed semantically.

## Typography

Poppins is the only product font. Body copy defaults to 400; use 500 or 600 for UI emphasis and
700 for headings. Fonts are loaded and self-hosted by `next/font`.

## Components

daisyUI is the base component library. Prefer daisyUI classes directly for one-off composition.
Create a wrapper in `components/ui` when an API, accessibility behaviour, or styling rule repeats
across features. Wrappers should remain thin and accept native element properties plus `className`.

The initial shared set is:

- `Button`: semantic variants, sizes, loading, and disabled behaviour
- `Input`: label, guidance, validation, and native input properties
- `Checkbox`: labelled single box, composed into groups with one `register` spread
- `RadioGroup`: fieldset of radios sharing one name, with optional description and error
- `Textarea`: multi-line sibling of `Input`
- `Card`: consistent content grouping with optional title, description, and footer

## Responsive layout

Build mobile-first. Base classes target narrow screens, `sm` handles common phone-to-tablet layout
changes, and `lg` introduces multi-column desktop composition. Avoid fixed widths unless the content
has a genuine maximum reading width.

## Dark mode

The initial release is light-only. Automatic `prefers-color-scheme` switching is disabled because
there is no approved Medical Pantry dark palette yet. Add a separate named daisyUI theme only after
design review; do not invert the light palette ad hoc in feature code.
