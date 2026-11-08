# Interior Visualisation BD

A static HTML, CSS and JavaScript website. No dependencies or build step.

The site contains a homepage, two complete apartment concept pages and a privacy policy. The Warm Residence has three bedrooms; the Quiet Apartment has two. Each collection begins with a furnished architectural concept plan, followed by room visualisations generated with that plan as a reference. Desks belong inside bedrooms, and halls are kept clear. These are illustrative concepts, not completed client projects or measured construction drawings.

## Editing

- `index.html`: homepage layout and copy.
- `warm-residence.html` and `quiet-apartment.html`: apartment plans, room images and captions. Their galleries work from the HTML.
- `styles.css`: shared desktop and phone styles.
- `app.js`: mobile menu, room tabs, gallery lightbox and enquiry actions.
- `site-content.js`: contact details, homepage room-tab content and design packages. The apartment collection data is also retained here as an editable reference.
- `privacy.html` and `privacy.js`: privacy policy and contact-status handling.
- `assets/*-approved-plan.png`: the original user-approved floor plans. The matching WebP files are used for display; SVG wrappers add transparent room links without redrawing the plans.
- `assets/*-v3-{480,960,1536}.webp`: responsive room photographs. Keep all three sizes when replacing a photo, or update its source attributes.
- `IMAGE-PROMPTS.md`: the complete prompt set and plan references used for the new room images.

Open the extracted download folder in VS Code. Preview `index.html` with the Live Server extension, or open it directly in your browser. Keep the assets folder with the HTML, CSS and JavaScript.

## Contact setup

WhatsApp is currently the requested `XXXXXXX` placeholder and Facebook has no supplied URL. They stay inactive until real values are entered in site-content.js. WhatsApp prepares a message for the visitor to send; Facebook opens the Page and copies the brief for pasting. Save a copy downloads the brief locally. A configured HTTPS form endpoint can receive JSON; update the privacy policy to identify that provider before enabling it.

## Static hosting

Upload the contents of `dist` with `index.html` at the root. No build command is required. The downloadable source ZIP already has this structure. Existing Cloudflare Pages Direct Upload instructions are available at https://developers.cloudflare.com/pages/get-started/direct-upload/ . Change the canonical URLs and sitemap to your own domain before launch.

## Verification

JavaScript syntax and all local image, page and fragment references checked. Desktop and 360/393px phone-width browser previews checked; floor-plan room links and gallery navigation verified. No physical-device network benchmark was performed.

## Approved Quiet Apartment update

The Quiet Apartment now uses the approved open-entry plan supplied by the user. Its original PNG is preserved at assets/quiet-approved-plan.png, with a WebP display version and transparent room links over it. This replaces the earlier diagram for this apartment. Nine new photographs use the quiet-*-v3 file stems; there are no added study desks. Do not regenerate its page using an older layout template. Editing is done directly in its HTML and site-content.js. The complete new prompt set is in QUIET-APPROVED-IMAGE-PROMPTS.md.

## Approved Warm Residence update

The Warm Residence now uses the user-supplied revised three-bedroom, two-bathroom plan. The original PNG is preserved at assets/warm-approved-plan.png. A WebP display copy and transparent SVG room links retain its supplied layout. Ten new images use the warm-*-v3 stems: living, dining, kitchen, primary, guest, study, bathroom, balcony, ensuite and utility. The study stays inside the northwest bedroom; the kitchen has its own south-side laundry access and two side-by-side appliances. The approved plan does not state an area, so no measured area is advertised. Edit the current HTML and site-content.js directly; do not rebuild either apartment page with older scratch templates. The complete prompt set and corrective edits are in WARM-APPROVED-IMAGE-PROMPTS.md.

## Updated Canva logo

The user-supplied logo is used in all page headers and footers. assets/ivbd-logo-original.png preserves the original upload. The responsive ivbd-logo-{198,396,990}.webp files trim only outer blank margins and retain the supplied lettering, bronze dot, divider and three-line name. Replace these image assets to update the logo; the old text wordmark has been removed from the HTML.

## Interactive effects

interactions.js adds warm pointer spotlights on grouped cards, one-time entrance animations, touch swipe navigation for the homepage room preview and both apartment lightboxes, a reading progress line and a Back to top control. app.js handles the room-selection events. Touch scrolling and pinch zoom remain native; buttons and arrows still work. Reduced-motion preferences skip decorative motion and pointer-only effects are disabled on touch-only devices. No animation library or network requests are added. Adjust spotlight colours and sizes in the final interactive section of styles.css.

References: https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/interactive-content-reveal ; https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events ; https://web.dev/articles/animations-guide .

## Services preview and cursor glow fix

The services floor-plan teaser is a block-level link using the approved WebP directly, with intrinsic dimensions. This avoids inline-link fragments and external-image SVG restrictions. interactions.js also adds a non-interactive bronze cursor aura on fine, hover-capable pointers; it stops on pointer leave, keyboard use, window blur and reduced-motion changes.

## Bronze line motion update

The new opening, gallery and menu motion is documented in MOTION-NOTES.md with timing controls, reference links, browser test results and measurement limits. The entrance uses a sessionStorage flag named ivbd.intro.seen.v4. The privacy policy documents this flag.

The first-visit loading signature and responsive room camera motion are documented in MOTION-NOTES.md. No build step or added dependencies.
