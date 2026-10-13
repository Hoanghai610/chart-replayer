# Video card QA — 13 October 2026

Scope: the video card iteration plus the subsequently approved Mindtrip start layout (option 1) and Sound C (Glass & Air). Both selections were explicitly approved by the user on 13 October 2026 and are now implemented. D/E remain reference alternatives, not pending blockers.

## Source and rendered evidence

- Direction reference: `docs/video-reference/chart-card-reference.png` (1200×900 supplied image, card crop 528×676 at x336/y113). This is a direction reference, not an instruction to reproduce its unrelated keyword filters or persona data.
- User-reported Light issue: `docs/video-reference/light-contrast-before.png` (1260×1500). Canvas crop x58/y50, 1132×1414, normalized to 540×675.
- User-reported landscape issue: `docs/video-reference/landscape-before.png`, a right-side fragment of the previous 16:9 design. This cannot establish an exact full-viewport pixel comparison; it establishes the rejected side-column arrangement.
- Browser implementation: `http://127.0.0.1:3000/`, isolated sample session, WIF, 7D, 4H, 6 seconds, 30 fps, sound muted. Browser viewport 1280×720 for final square/portrait context captures; source screenshots came from the user's larger viewport.
- Browser screenshots: `/Users/hoanghai/.codex/visualizations/2026/10/13/01a13325-5a7a-76f0-b24c-24688f5b01dd/contrast-light-studio.png`, `video-square-final.png`, `video-portrait-final.png` in that directory.
- Browser-rendered and downloaded H.264 video frames: `docs/media/replay-light-line.png` and `result-light-line.png` (1080×1350); `replay-landscape-fixed.png` and `result-landscape-fixed.png` (1920×1080). These are actual export frames, not mockups. Dark landscape is Market cap, Light feed is Price. Both playback and final-hold frames inspected.
- Full paired comparison: `docs/media/qa-light-comparison.png` (1080×675). Both canvas crops normalized to 540×675. Same Light / Line / final-hold state; dates and synthetic token window differ (August source vs October test), so numeric changes and chart shape are expected.
- Focused paired comparison: `docs/media/qa-light-detail.png` (1996×190), source result crop 998×190 alongside implementation crop 952×166 padded without scaling. Checks copy, typography, signed percent, opening value and separation.
- Dark direction comparison: `docs/media/qa-dark-comparison.png` (1488×676). Source card at its native crop size; actual landscape export scaled 50% to 960×540 and padded vertically. Aspect ratios and product content deliberately differ; compare background treatment and price/change hierarchy, not pixel fidelity.

All paired images were opened together before this report. Square and portrait screenshots and both actual landscape frames were opened separately to inspect fit.

## Findings and iteration history

1. [P1, fixed] Large boxed percentage dominated the card and displaced the chart. Replaced it with current/close price on the left, signed percentage on the right, and a secondary opening value. Trade is a caption rather than another bordered panel. Paired detail evidence confirms the hierarchy.
2. [P1, fixed] Light background and secondary labels were too pale. Video Light now uses #F0F4EF, primary #10271D, secondary #354D40, labels #4B6052 and brand mint 200 outside the card. Calculated contrast against the card: primary 14.2:1, secondary 8.26:1, labels 6.11:1, gain 5.16:1, loss 5.77:1. Final exported-frame comparison confirms the darker labels and clearer frame separation.
3. [P1, fixed] Landscape used a detached right results column, creating a different alignment and empty region. All formats now reserve a full-width chart, trade caption and bottom results row. The 1920×1080 export shows long Market cap values, dates, callout and footer contained; final hold retains the same structure.
4. [P2, fixed] An arrow repeated the meaning already conveyed by +/−. Removed the result arrow in every format and theme; source/detail pair and landscape frames confirm only signed numbers remain.
5. [P2, fixed during export QA] A horizontal grid label could sit partly behind the live badge in the first Light Candles export. Increased the grid-label exclusion distance from 36 to 62 output pixels. Re-rendered Light Line after the correction; current and final frames show separate price badge and labels.
6. [P2, fixed] A development-session video generated before these visual changes could remain offered as the current output. Added the renderer revision to the export cache key so the new appearance requires a fresh render.

No remaining actionable P0/P1/P2 findings in this scope.

## Required fidelity surfaces

- **Typography:** retains the existing Aeonik-local/Geist fallback system. Price 64px at 1080 short edge, change 42px, descriptive labels 18–22px; tabular numerical widths. Long price/mcap values shrink within their reserved width. No result wrapping or truncation in inspected frames. These are product adaptations of the reference hierarchy, not an attempt to identify an unprovided licensed typeface.
- **Spacing/layout:** 40px inner padding, rounded card, reserved chart/caption/result/footer regions. Compact result height 166px; landscape follows the same vertical stack. Geometry test covers containment and non-overlap for all four export ratios. Portrait and square browser captures retain all regions.
- **Colors/tokens:** brand scale retained. Dark near-black #0E1412 with a subtle brand-950 tint toward the lower-right, mint-300 gains and salmon losses. Light uses stronger dark green labels with deeper gain/loss colors. Brand frame remains outside both cards. The underlying video palette is independent from the editor theme.
- **Image quality/assets:** actual supplied Birdeye logos and generated-from-library Phosphor SVG assets, sharp in H.264 exports. Demo token monogram is explicit because no real token artwork is present in the synthetic dataset. No decorative photography/illustration is implied by this reference. Background tint is a card surface treatment, not a replacement for a logo or illustration.
- **Copy/content:** current becomes close on the final hold; opening value retained; signed price change is not described as wallet profit. Sample data, UTC and market cap supply caveat remain. Reference-only controls/keywords/persona copy are intentionally omitted from the share video.

## Verification and limits

- Switched Line/Candles, Light/Dark, Price/Market cap, 4:5/16:9/1:1/9:16 in the browser.
- Rendered and saved 6-second, 30fps, silent H.264 samples in Light feed and Dark landscape; verified dimensions and duration. Inspected playback and final hold frames.
- Primary render → ready → save path works. Other export options/audio were verified in earlier iterations, not re-rendered for this palette-only pass.
- No error entries among the captured browser logs for the isolated verification session.
- Lint, TypeScript, 27 tests and webpack production build pass. Final renderer-revision key received lint/TypeScript verification as well.
- Real Birdeye data not verified: no visitor/server API key provided. Current findings concern rendering and sample flow, not provider availability.

## Follow-up polish

- [P3] Optional preview zoom could improve inspection of tall videos on short desktop viewports; the exported output remains full resolution.
- The user has now approved start layout 1 and Sound C; see the completed follow-on checks below.

## Implementation checklist

- [x] Compact result hierarchy.
- [x] Reference-inspired Dark and stronger Light contrast.
- [x] Signed percentage without arrow.
- [x] Unified landscape stack and long Market cap check.
- [x] Grid label/badge spacing correction and re-render.
- [x] Browser, actual export, full/focused visual comparisons.


## Approved start screen and Sound C — follow-on QA

### Visual source, normalization and comparison

- Approved layout source: `public/review-assets/mindtrip.webp`, 1920×1320, canonical source https://mobbin.com/screens/a9fac616-694e-45d2-92dc-57cb74bba4a1.
- This is the approved *centered form pattern*, adapted to Chart Replayer and the supplied design system, not a pixel clone of Mindtrip. The user-facing proposal explicitly relocates the create action next to the input, adds one sample link and omits editor chrome before loading.
- Actual desktop screenshots: `/Users/hoanghai/.codex/visualizations/2026/10/13/01a13325-5a7a-76f0-b24c-24688f5b01dd/start-layout-light.png` and `start-layout-dark.png`, both 1280×720, empty form, no token, no modal. These were captured before validation input was entered.
- Actual mobile screenshots: `start-layout-mobile.png` and `start-layout-mobile-dark.png` in the same directory, verified DOM viewport 375×812 with document width 375 (no horizontal overflow). The earlier 1051×1109 capture was not a valid mobile capture and was replaced. Temporary viewport overrides were reset.
- Full paired input: `docs/media/qa-start-comparison.png`, 2560×720. Source top content crop 1920×1080 scaled to 1280×720 alongside native 1280×720 implementation. The reference's bottom navigation/watermark are outside this selected pattern and are deliberately omitted.
- Focused paired input: `docs/media/qa-start-form.png`, 1200×62. Source input crop 730×62 resized to 600×51 with padding; implementation full input/action row 600×62. Both paired inputs were opened before evaluating.
- Intentional differences: product wordmark and Phosphor mark, Beside type/colors/radii, shorter product-specific copy, an explicit field label, inline create action, sample link, and a quiet source footer. The reference's link illustration and unrelated Back/Next navigation are omitted to satisfy the requested minimal screen.

### Findings and required surfaces

- [P1, fixed] Empty editor previously showed tool rail, disabled export/playback, a timeline placeholder and duplicate sample actions. Empty state now renders only a minimal header, centered token form and source footer. The editor mounts after token metadata loads.
- [P2, fixed] Submitting a malformed address used to request an API key first. Local address validation now precedes the missing-key step; error appears adjacent to the field.
- [P2, fixed] “Continue with sample data” in the key dialog previously only closed the dialog. It now loads the sample and transitions into the editor, matching the action label.
- **Typography:** existing Aeonik-local/Geist design-system family; 30–40px main heading, 14–15px support copy, labeled field, readable actions. No heading or action wraps awkwardly at the inspected widths.
- **Spacing/layout:** one 600px form area centered within the available page; 52px input/action height; desktop inline action becomes a full-width row on 375px mobile. No tool rail, blank timeline, dead export action or duplicate sample button on the start screen.
- **Tokens/contrast:** existing light/dark semantic palette, restrained brand CTA, readable primary/secondary hierarchy. Dark mode matches the rest of the editor rather than copying an unrelated source palette.
- **Assets/icons:** existing Phosphor chart/arrow/appearance icons; no invented illustration or source-logo imitation. The selected reference is a form pattern and does not require a generated bitmap asset.
- **Copy:** one heading, one sentence, explicit Solana token label, Create replay action and one sample link with no-key explanation. Source attribution remains quiet in the footer.
- No actionable P0/P1/P2 findings remain in the implemented start screen.

### Functional and sound evidence

- Invalid mint → inline validation; no credential dialog.
- Valid mint with no configured key → Birdeye key dialog; no external token request before a key is available.
- Continue with sample → editor loading states → populated synthetic WIF replay. Direct sample-link path also verified.
- Fresh editor session selects Glass & Air by default with Include sound, Trade sounds and End chime enabled; milestone control omitted for this pack.
- Preview sound enters the visible Playing sound state, then returns to Preview sound. Both approved samples decode locally; no asset-loading alert. Capture: `sound-c-effects.png` in the visualization directory.
- All six original review clips were played through native controls; readyState 4 and no media error for each. Review now marks Layout 1 + Sound C as selected; C is the implemented default, D/E are references. Capture: `sound-c-selected-review.png` in the same directory.
- Production assets: `public/sfx/glass-sweep.mp3` (1.208322s) and `glass-chime.mp3` (2s), with source/notice recorded in `THIRD_PARTY_NOTICES.md`.
- Sound C chooses the largest separated trades, with at least 1.5s between sweeps and 1.4s of space before the result. One chime begins 0.12s into the final hold; no ticks, voice lines or milestone cues. Gains are 0.24 / 0.34 before the shared master chain.
- Added two meaningful sound tests: strongest-event selection/spacing/end-tail fit, and mute/category gating with legacy tick/voice suppression. Total 27 tests pass. Lint, TypeScript and webpack production build pass.
- Actual browser export saved as `/Users/hoanghai/.codex/visualizations/2026/10/13/01a13325-5a7a-76f0-b24c-24688f5b01dd/chart-replayer-sound-c.mp4`: H.264 1080×1350, AAC stereo 48kHz, 6.08s container duration for a 6s clip (AAC padding). Audio extracted without re-encoding to `docs/media/sound-c-mix.m4a`. Measured non-silent audio, peak −9.8dBFS, no clipping. This verifies the actual output contains the selected sound rather than only an “audio enabled” UI label.
- Temporary test tabs were not used to replace the user's entered token. The user's in-progress start-screen draft remains intact.
- Real Birdeye data remains unverified because no API key was supplied; this does not block the completed sample/render/sound path.

### Follow-on checklist

- [x] Approved layout 1 implemented, including Light/Dark and mobile stacking.
- [x] Key prompt deferred until a valid real-token request.
- [x] Sample flow enters the editor.
- [x] Approved Sound C default and actual preview/export samples.
- [x] Effects sound-preview action and error handling.
- [x] Actual AAC export inspected; no clipping.
- [x] Full and focused paired visual comparisons; no remaining actionable P0/P1/P2 findings.

final result: passed
