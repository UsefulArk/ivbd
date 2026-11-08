# IVBD motion update

Completed 5 November 2026. Browser checks were performed on 4 November before the session pause.

The direction uses a bronze point of light, a fine line and a coordinated photograph and headline entrance. The supplied logo and all apartment assets are retained byte for byte. The opening now starts with a warm-ivory loading signature and fades into the existing hero. It never locks scroll or keyboard focus.

## What changed

- A 1,040 ms first-visit entrance. A brief light accent aligns with the existing logo dot, the logo settles into view, the hero rule extends, and the interior and two headline lines enter together.
- The entrance uses one session flag, skips direct section URLs and reduced-motion visitors, and settles when the page is hidden. Blocked session storage gives the settled page. The normal HTML and CSS remain visible if scripts fail.
- The desktop gradient fades to transparent at 63% of the hero. The apartment caption is a small, readable numbered plaque. Phone hero spacing is tighter.
- Incoming gallery images receive a 320 ms opacity transition when loaded. Section and portfolio entrances use small vertical movement and 460 ms timing.
- The mobile menu opens and closes over 210 ms, marks closing content inert, responds to Escape and restores focus. Rapid menu toggles cancel the preceding transition.
- One pointer sampling handler updates both the bronze aura and nearby card edges. It schedules work only in response to pointer movement. Keyboard use, pointer leave, reduced motion and hidden pages clear it.
- Touch galleries retain vertical scrolling and pinch zoom. A second touch cancels the pending swipe.
- Reduced-motion CSS removes decorative animation. The JavaScript preference also skips Web Animations effects.
- The privacy policy now explains the non-personal session flag. The phone field pattern was corrected for modern browser validation. Both design options also have a readable script-disabled summary.

## Editing the motion

Open styles.css and find BRONZE LINE near the end. In the source repository this file is styles.css. In the download it is directly beside index.html.

| Setting | Default | Controls |
| --- | --- | --- |
| --entry-length | 1040ms | Entire opening sequence |
| --room-length | 320ms | Loaded gallery photograph entrance |
| --menu-length | 210ms | Mobile navigation transition |
| --section-length | 460ms | Section and portfolio entrances |
| --studio-ease | cubic-bezier(.2,.72,.23,1) | Shared easing |

Use millisecond values for these variables, since JavaScript reads their numeric values in milliseconds. Opening timing fractions and movement distances live in the same CSS section. The opening eligibility check is in index.html. Menu behaviour is in app.js. Pointer effects, loaded-image transitions and section entrances are in interactions.js.

The introductory sequence appears once per tab session. To preview it again, use a new private browser window on the homepage without a section hash. Direct links such as #contact deliberately skip it.

## Research

Four actual websites were opened in the browser. Interaction results below describe only what was observed. Exact animation durations, easing curves and full phone behaviour of the reference websites were not measured. IVBD's timings and choreography are original design decisions.

| Reference | Observed | Principle applied to IVBD |
| --- | --- | --- |
| Elite Design Studio | The live home page leads to individual residential projects. Clicking Projects opens an index with large project names, room photography and a 1/6 position indicator. The rendered index uses generous dark space and oversized typography. | Give imagery a clear project identity. Use a compact numbered hero caption and preserve labelled apartment navigation. |
| Studio RHE | The homepage moves from its headline into an introduction, selected projects and practice information. Clicking Toggle menu reveals four named destinations. | Keep the story ordered and navigation concise. Use short menu movement with immediately identifiable links. |
| Primland Residences | The live homepage groups its story around daily life, residences, experiences and availability. It exposes map destination buttons and an enquiry link near the menu. | Connect attractive imagery to a useful next action. Keep IVBD's floor-plan links and consultation routes prominent. |
| 111 West 57th Street | The live homepage pairs large headlines with residence, design and services destinations. Inquire sits beside the menu. | Give enquiry navigation a clear place alongside image-led storytelling. |

Reference links

- Elite live site — https://www.elite-designstudio.com/
- Elite project index — https://www.elite-designstudio.com/projects
- Elite Awwwards record — https://www.awwwards.com/sites/elite-interior-design
- Studio RHE live site — https://www.studiorhe.com/
- Studio RHE designer case study and award record — https://outpost.design/work/studio-rhe/
- Primland live site — https://ownprimland.com/
- Primland Awwwards record — https://www.awwwards.com/sites/primland-residences
- 111 West 57th Street live site — https://111w57.com/
- 111 West 57th Street designer case study and award record — https://outpost.design/work/111-west-57th-street/

Access limits

The requested Awwwards architecture directory timed out. The Elite and Primland award records were accessible. Studio RHE and 111 West 57th Street award-page requests failed through the research service, so their designers' published case studies supplied award context. All four live websites were accessible. Initial attempts at primlandresidences.com and eliteinteriordesign.ch did not resolve the intended sites, and research continued at the verified live addresses above.

The reference review established navigation and composition, with limited before/after interaction inspection. It did not establish frame-accurate reference animation sequences or their phone performance. No reference code, font, imagery or wording was imported into IVBD. IVBD uses its existing system font stack and browser-native APIs.

## Verification

A temporary browser test page embedded the real four IVBD pages at 360, 390, 768 and 1440 CSS pixels. The page was removed from the deliverable after testing.

| Check | Result |
| --- | --- |
| Horizontal overflow, all four pages at all four widths | Passed |
| Phone menu open/close, rapid toggles, Escape, focus return and section links | Passed |
| Room tabs using arrow keys | Passed |
| Touch pointer swipe handling on homepage and both apartment galleries | Passed |
| Vertical gestures and a second touch do not select another room | Passed |
| Both apartment lightboxes, next/previous, keyboard and close focus return | Passed |
| Floor-plan target links and static page/asset/fragment references | Passed, 320 references checked |
| Original images decode | Passed, 140 raster files decoded |
| First entrance settles, return visits skip it | Passed |
| Fresh direct #contact link skips entrance and reaches enquiry section | Passed |
| Scripts disabled | Hero and apartment links visible, mobile navigation exposed |
| Simulated reduced-motion JavaScript preference | Entrance skipped, menu immediate |
| Placeholder enquiry handling and Standard quote selection | Passed |
| JavaScript syntax | Passed |
| Website-origin console errors in checked preview | None |

The reduced-motion test simulated matchMedia for JavaScript. The CSS media rules were inspected in source. Native operating-system reduced-motion toggling was not available in the browser controls.

Touch tests dispatched pointer events in Chromium. Physical Android/iOS pinch zoom and swipes still need a real-device check. Desktop and 390px compositions were visually inspected. Other widths were checked by DOM layout measurements.

## Earlier preview measurements (before the loading-screen update)

One unthrottled, warm desktop preview run at 1363px reported the following through PerformanceObserver and Navigation Timing.

| Measurement | Recorded value |
| --- | --- |
| DOMContentLoaded | 164 ms |
| First contentful paint | 188 ms |
| Largest contentful paint at the observation time | 188 ms |
| Layout shift score during that observation | 0 |
| Hero source selected | warm-living-v3-1536.webp |

The sample was collected around 1.8 seconds after load. It is a local preview sample, not a Bangladesh mobile-network benchmark or a guaranteed production result. Lighthouse and physical-device performance checks were not run.

Responsive tests selected the 480px hero at 360/390px, 960px at 768px, and 1536px at 1440px. Those image files are approximately 27.1 KiB, 95.7 KiB and 224.0 KiB respectively. No animation framework or extra font downloads were added.

## Loading screen and room camera update — 5 November 2026

The original logo reveals on warm ivory with a bronze glow, an extending line and a sweep of light. The cover appears once per tab. The hero starts loading immediately and readiness waiting is bounded at 900ms. The cover fades over 620ms, with an independent 1600ms exit if the motion script fails. Keyboard focus or pointer input dismisses it immediately. A return visit plays the staggered hero entrance without the cover. Direct hash links, blocked storage and reduced motion skip the opening. The session key is ivbd.intro.seen.v4.

Room photos settle from scale 1.03 to 1 as they enter view, with a short caption reveal. The camera move is 1800ms on desktop and 1400ms on phones. Gallery photos fade in over 420ms and the phone menu opens over 300ms. Scroll reveals and camera moves stop offscreen. Active effects cancel when the tab is hidden or reduced motion is selected. Edit the shared motion timings in styles.css. Keep the independent index.html exit when changing the loader timings.

Verification of this update: Chromium preview at 360, 390, 768 and 1440 CSS pixels passed overflow checks on all four pages, phone menu/Escape checks, apartment gallery opening, returning-visit and direct-link skips, absent external motion script, broken hero, scripts disabled, keyboard dismissal and simulated reduced motion. Touch pointer events changed a room horizontally and preserved a vertical gesture; pinch-zoom CSS was verified. Phone camera timing was checked. Loading composition was visually inspected. Physical devices, OS-level reduced motion and new network/performance scores were not measured. Previous performance figures above describe the earlier version only.

The main consultation button and floating phone button share dark forest green #254637 with ivory #FAF6ED. The floating button hides alongside the hero button, the open menu and the enquiry section.
