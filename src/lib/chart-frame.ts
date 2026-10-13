import type { BirdeyeCandle } from '@/server/birdeye/types';
import { activeLabels, burstEventsAt, compactUsd, formatChange, formatPrice, shortAddress, type TagBurst, type VideoTimeline } from './chart-scene';
import { LAYER_INFO, type EventBar, type TagEvent } from './chart-tags';
import { videoColors, drawLogo, drawNumber, drawTokenAvatar, fitText, font, numberWidth, roundRect, type Rect, type VideoShape, type VideoTheme } from './frame-kit';
import { DARK_THEME } from './design-system';
import { paintVideoBackground, type VideoBackgroundId } from './video-background';
import { videoLayout } from './video-layout';
import type { VideoIconName, VideoIcons } from './video-icons';
import { lineReplay } from './line-replay';

export { VIDEO_FORMATS, drawMessage, type VideoShape, type VideoTheme } from './frame-kit';
export type ChartAxis = 'price' | 'mcap';
export type ChartStyle = 'line' | 'candles';
export interface ChartScene {
  shape: VideoShape;
  chartStyle: ChartStyle;
  videoTheme: VideoTheme;
  videoBackground?: VideoBackgroundId;
  customBackgroundColor?: string;
  symbol: string;
  name?: string;
  tokenLogo?: CanvasImageSource | null;
  logo: CanvasImageSource | null;
  icons?: VideoIcons;
  demo?: boolean;
  candles: BirdeyeCandle[];
  rangeLabel: string;
  dateLabel: string;
  axis: ChartAxis;
  circulatingSupply?: number;
  bars: EventBar[];
  barEvents: Map<number, TagEvent[]>;
  bursts: TagBurst[];
  events: TagEvent[];
  timeline: VideoTimeline;
  holdSeconds: number;
  effects: boolean;
  markers: boolean;
}

const timeLabel = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
const dayLabel = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, color: string = DARK_THEME.text, weight = 500, align: CanvasTextAlign = 'left') {
  ctx.font = font(weight, size);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
  ctx.textAlign = 'left';
}
function surface(ctx: CanvasRenderingContext2D, R: Rect, radius: number, fill: string, border?: string) {
  roundRect(ctx, R.x, R.y, R.w, R.h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (border) { ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.stroke(); }
}
function icon(ctx: CanvasRenderingContext2D, scene: ChartScene, name: VideoIconName, x: number, y: number, size: number) {
  const image = scene.icons?.[scene.videoTheme]?.[name];
  if (image) ctx.drawImage(image, x, y, size, size);
}

/** Same deterministic renderer for the studio and the exported file. */
export function drawChartFrame(ctx: CanvasRenderingContext2D, t: number, scene: ChartScene): void {
  const C = videoColors(scene.videoTheme);
  const L = videoLayout(scene.shape);
  const { w, h, u, header: H, plot: P, summary: S } = L;
  const candles = scene.candles;
  const footerColor = paintVideoBackground(ctx, w, h, scene.videoBackground, scene.videoTheme, scene.customBackgroundColor);
  surface(ctx, L.card, 40 * u, C.ground);
  // Subtle brand tint stays behind content, rather than adding another panel.
  if (scene.videoTheme === 'dark') {
    ctx.save();
    roundRect(ctx, L.card.x, L.card.y, L.card.w, L.card.h, 40 * u); ctx.clip();
    const tint = ctx.createRadialGradient(
      L.card.x + L.card.w, L.card.y + L.card.h, 0,
      L.card.x + L.card.w, L.card.y + L.card.h, L.card.h * .88,
    );
    tint.addColorStop(0, 'rgba(0, 55, 38, .78)');
    tint.addColorStop(.62, 'rgba(0, 55, 38, .16)');
    tint.addColorStop(1, 'rgba(0, 55, 38, 0)');
    ctx.fillStyle = tint; ctx.fillRect(L.card.x, L.card.y, L.card.w, L.card.h);
    ctx.restore();
  }
  if (candles.length < 2) return;

  const progress = Math.max(0, Math.min(1, t / scene.timeline.replaySeconds));
  const { values: prices, start, exact, settled, current } = lineReplay(candles, progress);
  const pointPrice = (index: number) => prices[index]!;
  const change = start > 0 ? current / start - 1 : 0;
  const up = change >= 0;
  const color = up ? C.brand : C.loss;
  const mcap = scene.axis === 'mcap' && (scene.circulatingSupply ?? 0) > 0;
  const priceText = (price: number) => mcap ? compactUsd(price * scene.circulatingSupply!) : formatPrice(price);
  const complete = t >= scene.timeline.replaySeconds;

  // One identity, one time context. The live value stays next to the chart line.
  drawTokenAvatar(ctx, scene.tokenLogo, scene.symbol, H.x, H.y, 68 * u, C);
  fitText(ctx, `$${scene.symbol}`, H.x + 88 * u, H.y + 42 * u, H.w * .61 - 88 * u, 600, 42 * u, C.text);
  text(ctx, scene.rangeLabel.replace('CANDLES', 'INTERVALS'), H.x + 88 * u, H.y + 78 * u, 22 * u, C.text2);
  const right = H.x + H.w;
  text(ctx, dayLabel.format(candles.at(-1)!.unixTime * 1000), right, H.y + 24 * u, 22 * u, C.text3, 500, 'right');
  drawLogo(ctx, scene.logo, right, H.y + 49 * u, 25 * u, 'right');
  if (scene.demo) text(ctx, 'Sample data', H.x, H.y + H.h + 12 * u, 18 * u, C.text3);

  // A quiet line chart with a stable scale; recent moments have at most 3 pins.
  const visible = Math.min(prices.length, L.wide ? 100 : 64);
  const first = Math.max(0, exact - visible + 1);
  const gutter = (mcap ? 156 : 172) * u;
  const plotW = P.w - gutter;
  const plotRight = P.x + P.w;
  const chartTop = P.y + 24 * u;
  const chartBottom = P.y + P.h - 54 * u;
  const minPrice = Math.min(...(scene.chartStyle === 'candles' ? candles.map(c => c.l) : prices));
  const maxPrice = Math.max(...(scene.chartStyle === 'candles' ? candles.map(c => c.h) : prices));
  const span = Math.max(maxPrice - minPrice, start * .04, 1e-18);
  const low = minPrice - span * .18;
  const high = maxPrice + span * .18;
  const yAt = (price: number) => chartBottom - (price - low) / (high - low) * (chartBottom - chartTop);
  const xAt = (index: number) => P.x + (index - first) / (visible - 1) * plotW;
  const headX = xAt(exact);
  const headY = yAt(current);

  for (let i = 0; i < 3; i++) {
    const price = low + (high - low) * (i + .5) / 3;
    const y = yAt(price);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = u;
    ctx.beginPath(); ctx.moveTo(P.x, y); ctx.lineTo(P.x + P.w, y); ctx.stroke();
    if (Math.abs(y - headY) > 62 * u) text(ctx, priceText(price), plotRight, y - 12 * u, 20 * u, C.text3, 500, 'right');
  }
  const points = [];
  for (let i = Math.max(0, Math.floor(first)); i <= settled; i++) points.push({ x: xAt(i), y: yAt(pointPrice(i)) });
  points.push({ x: headX, y: headY });
  ctx.save();
  ctx.beginPath(); ctx.rect(P.x, chartTop, plotW + 5 * u, chartBottom - chartTop); ctx.clip();
  if (scene.chartStyle === 'candles') {
    const bodyW = Math.max(3 * u, Math.min(12 * u, plotW / (visible - 1) * .58));
    for (let bar = Math.max(0, Math.floor(first) - 1); bar <= Math.min(settled, candles.length - 1); bar++) {
      const candle = candles[bar]!;
      const closed = bar < settled;
      const close = closed ? candle.c : current;
      const x = closed ? xAt(bar + 1) : headX;
      const high = closed ? candle.h : Math.max(candle.o, close);
      const low = closed ? candle.l : Math.min(candle.o, close);
      ctx.strokeStyle = ctx.fillStyle = close >= candle.o ? C.brand : C.loss;
      ctx.lineWidth = 1.5 * u;
      ctx.beginPath(); ctx.moveTo(x, yAt(high)); ctx.lineTo(x, yAt(low)); ctx.stroke();
      ctx.fillRect(x - bodyW / 2, Math.min(yAt(candle.o), yAt(close)), bodyW, Math.max(2 * u, Math.abs(yAt(close) - yAt(candle.o))));
    }
  } else {
  ctx.beginPath(); ctx.moveTo(points[0]!.x, chartBottom);
  for (const p of points) ctx.lineTo(p.x, p.y);
  ctx.lineTo(headX, chartBottom); ctx.closePath();
  ctx.fillStyle = up ? `rgba(${C.brandRgb}, .035)` : `rgba(${C.lossRgb}, .035)`;
  ctx.fill();
  ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.strokeStyle = color; ctx.lineWidth = 6 * u; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.restore();

  // The price badge has its own gutter and never covers the line or pins.
  ctx.save(); ctx.setLineDash([7 * u, 8 * u]); ctx.lineWidth = 1.5 * u;
  ctx.strokeStyle = up ? `rgba(${C.brandRgb}, .5)` : `rgba(${C.lossRgb}, .5)`;
  ctx.beginPath(); ctx.moveTo(headX, headY); ctx.lineTo(plotRight, headY); ctx.stroke(); ctx.restore();
  ctx.beginPath(); ctx.arc(headX, headY, 6 * u, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  ctx.font = font(600, 24 * u);
  const value = priceText(current);
  const badgeW = Math.min(gutter - 10 * u, numberWidth(ctx, value) + 24 * u);
  surface(ctx, { x: plotRight - badgeW, y: headY - 23 * u, w: badgeW, h: 46 * u }, 12 * u, color);
  fitText(ctx, value, plotRight - badgeW + 12 * u, headY + 8 * u, badgeW - 24 * u, 600, 24 * u, C.badgeText);

  if (scene.markers) {
    const recent = [...scene.barEvents.entries()].filter(([bar]) => bar + 1 <= settled && bar + 1 >= Math.ceil(first) && xAt(bar + 1) > P.x + 20 * u && xAt(bar + 1) < P.x + plotW - 20 * u).slice(-3);
    let lastPinX = -Infinity;
    for (const [bar, events] of recent) {
      const event = [...events].sort((a, b) => b.usd - a.usd)[0];
      if (!event) continue;
      const x = xAt(bar + 1);
      if (x - lastPinX < 50 * u) continue;
      lastPinX = x;
      const lineY = yAt(pointPrice(bar + 1));
      const pinY = Math.max(chartTop + 23 * u, Math.min(chartBottom - 23 * u, lineY + (event.side === 'buy' ? 48 : -48) * u));
      const sideColor = event.side === 'buy' ? C.brand : C.loss;
      ctx.strokeStyle = C.lineStrong; ctx.lineWidth = 2 * u;
      ctx.beginPath(); ctx.moveTo(x, lineY); ctx.lineTo(x, pinY); ctx.stroke();
      surface(ctx, { x: x - 21 * u, y: pinY - 21 * u, w: 42 * u, h: 42 * u }, 21 * u, C.surface, sideColor);
      icon(ctx, scene, event.layer, x - 13 * u, pinY - 13 * u, 26 * u);
    }
  }
  for (const fraction of [0, .5, 1]) {
    const index = Math.min(candles.length - 1, Math.max(0, Math.round(first + (visible - 1) * fraction) - 1));
    text(ctx, timeLabel.format(candles[index]!.unixTime * 1000), P.x + plotW * fraction, P.y + P.h - 4 * u, 18 * u, C.text3, 500, fraction === 0 ? 'left' : fraction === 1 ? 'right' : 'center');
  }

  drawTradeCallout(ctx, t, scene, L.callout, u, complete);

  // Price and change share one quiet baseline, inspired by the supplied card.
  // Keep the opening value secondary and the same hierarchy on the final hold.
  const top = S.y;
  ctx.strokeStyle = C.lineStrong; ctx.lineWidth = u;
  ctx.beginPath(); ctx.moveTo(S.x, top); ctx.lineTo(S.x + S.w, top); ctx.stroke();
  text(ctx, `${complete ? 'Close' : 'Current'} ${mcap ? 'market cap' : 'price'}`, S.x, top + 38 * u, 22 * u, C.text2);
  const priceSize = 64;
  ctx.font = font(500, priceSize * u);
  const currentValue = priceText(current);
  const priceFit = Math.min(1, S.w * .54 / numberWidth(ctx, currentValue));
  ctx.font = font(500, priceSize * u * priceFit); ctx.fillStyle = C.text;
  drawNumber(ctx, currentValue, S.x, top + 108 * u);

  const changeValue = formatChange(change);
  const changeSize = 42 * u;
  ctx.font = font(500, changeSize);
  const changeRight = S.x + S.w;
  const changeY = top + 106 * u;
  ctx.fillStyle = color; drawNumber(ctx, changeValue, changeRight, changeY, 'right');
  text(ctx, `Open ${priceText(start)}`, S.x, top + 150 * u, 21 * u, C.text3);
  if (complete) text(ctx, 'Replay complete', S.x + S.w, top + 150 * u, 18 * u, C.text3, 500, 'right');

  text(ctx, 'Chart Replayer', L.card.x + 8 * u, L.footerY, 28 * u, footerColor, 600);
  text(ctx, 'Solana · UTC', w - L.card.x - 8 * u, L.footerY, 22 * u, footerColor, 500, 'right');
}

function drawTradeCallout(ctx: CanvasRenderingContext2D, t: number, scene: ChartScene, R: Rect, u: number, complete: boolean) {
  const C = videoColors(scene.videoTheme);
  const labels = scene.effects && !complete ? activeLabels(scene.bursts, t, scene.holdSeconds) : [];
  const active = labels.at(-1);
  const events = active ? burstEventsAt(active.burst, t) : [];
  const event = [...events].sort((a, b) => b.usd - a.usd)[0];
  if (!event) {
    const count = scene.bars.reduce((sum, bar) => sum + bar.events.length, 0);
    icon(ctx, scene, complete ? 'check' : 'chart', R.x, R.y + 20 * u, 28 * u);
    text(ctx, complete ? 'Window complete' : scene.effects ? 'Following the price' : 'Price replay', R.x + 40 * u, R.y + 39 * u, 22 * u, C.text2);
    text(ctx, `${count} tracked moments`, R.x + R.w, R.y + 39 * u, 20 * u, C.text3, 500, 'right');
    return;
  }
  const color = event.side === 'buy' ? C.brand : C.loss;
  icon(ctx, scene, event.layer, R.x, R.y + 20 * u, 32 * u);
  const label = `${LAYER_INFO[event.layer].label} · ${event.side === 'buy' ? 'Buy' : 'Sell'}`;
  text(ctx, label, R.x + 46 * u, R.y + 30 * u, 22 * u, C.text, 500);
  const detail = event.names?.[0] ?? (event.wallet ? shortAddress(event.wallet) : event.wallets ? `${event.wallets} wallets · net flow` : 'Individual swap');
  fitText(ctx, detail, R.x + 46 * u, R.y + 56 * u, R.w * .62, 400, 18 * u, C.text3);
  text(ctx, compactUsd(event.usd), R.x + R.w, R.y + 44 * u, 28 * u, color, 600, 'right');
}
