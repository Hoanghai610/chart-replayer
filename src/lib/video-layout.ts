import { VIDEO_FORMATS, type Rect, type VideoShape } from './frame-kit';

/** Reserved regions keep chart, trade callout and result from overlapping. */
export function videoLayout(shape: VideoShape) {
  const { width: w, height: h } = VIDEO_FORMATS[shape];
  const u = Math.min(w, h) / 1080;
  const pad = 24 * u;
  const card: Rect = { x: pad, y: pad, w: w - pad * 2, h: h - pad - 88 * u };
  const inner = 40 * u;
  const header: Rect = { x: card.x + inner, y: card.y + inner, w: card.w - inner * 2, h: 112 * u };
  const bottom = card.y + card.h - 24 * u;
  const wide = w > h * 1.4;
  const summary: Rect = { x: header.x, y: bottom - 166 * u, w: header.w, h: 166 * u };
  const callout: Rect = { x: header.x, y: summary.y - 96 * u, w: header.w, h: 72 * u };
  const plot: Rect = { x: header.x, y: header.y + header.h + 48 * u, w: callout.w, h: callout.y - header.y - header.h - 76 * u };
  return { w, h, u, wide, card, header, plot, callout, summary, footerY: h - 34 * u };
}
