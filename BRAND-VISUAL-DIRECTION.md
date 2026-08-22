# Hérisair Website Visual Direction

## Background system

Use different backgrounds for different page roles, while keeping every treatment within the same Hérisair visual family. Do not repeat one identical background across the entire website, and do not introduce unrelated styles.

### Homepage

- Use the expressive saffron-to-espresso gradient.
- Retain the softly blurred Hérisair monogram watermark and restrained curved line elements.
- This is the brand's most distinctive and memorable background treatment.

### House page

- Use a quieter espresso-to-near-black background.
- Add only a very subtle leather-like grain or tonal variation.
- Keep it calm and editorial so the typography, photography and brand story remain the focus.

### Collection page

- Use a simplified relative of the homepage gradient.
- Retain the saffron, brown and near-black palette, but omit the large monogram.
- The treatment should support product comparison without competing with the bottles.

### Individual fragrance pages

- Use dark espresso product sections for atmosphere and luxury.
- Introduce occasional warm ivory sections for fragrance notes, ingredients and detailed information.
- Ivory should be used as a considered visual pause, not as the dominant site background.

## Elements that remain global

- Fixed translucent black header and Hérisair logo treatment.
- Cormorant Garamond-led editorial typography.
- Champagne text, restrained copper accents and burnt-saffron highlights.
- Consistent button and text-link styling.
- Subtle leather texture, controlled shadows and restrained warmth.
- The same fade-in/fade-out motion language across sections.

## Approved section scroll behaviour

Use this motion standard for the Home and House pages, and reuse it on future editorial pages unless a page has a specific interaction requirement.

- Keep the page background fixed while section text and imagery move with the document.
- Only one section may be active and fully visible at a time.
- When scrolling down, hand the active state to the incoming section when it reaches approximately 70% of the viewport height. This early handoff prevents an empty-background interval.
- When scrolling up, keep the approved later handoff at approximately 25% of the viewport height.
- If the handoff line falls into spacing between sections, activate the nearest incoming section when scrolling down or the nearest preceding section when scrolling up; never leave the page with no active section.
- Use a restrained 640ms opacity-and-vertical-motion transition with the established editorial easing.
- Apply the same directional behaviour on desktop and mobile.
- Do not change page layout, imagery or background styling when reusing this behaviour; it controls section visibility only.

## Guiding principle

The pages may have different background treatments, but they must feel like different rooms within the same House: expressive on the homepage, quiet and narrative on the House page, structured on the Collection page, and intimate on the fragrance pages.
