// fit.js — one way to put text on the canvas: a fixed type scale, a hard rule that a
// string is shrunk to its box before it is ever clipped, and letter-spaced small caps
// for labels. If text cannot fit at the floor size it is ellipsised, never overlapped.
(function () {
  if (globalThis.CP_Fit) return;
  const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';
  const DISPLAY = '"Arial Black", "Trebuchet MS", sans-serif';

  function setFont(ctx, size, bold, display) {
    ctx.font = (bold ? '900 ' : '700 ') + size + 'px ' + (display ? DISPLAY : FONT);
  }
  function draw(ctx, text, x, y, size, color, align, bold, maxW, display) {
    let s = size;
    setFont(ctx, s, bold, display);
    if (maxW) {
      while (s > 10 && ctx.measureText(text).width > maxW) { s -= 1; setFont(ctx, s, bold, display); }
      if (ctx.measureText(text).width > maxW) {
        let t = text;
        while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
        text = t + '…';
      }
    }
    ctx.fillStyle = color;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    return s;
  }
  // Wrapped paragraph: returns the y after the last line.
  function wrap(ctx, text, x, y, size, color, maxW, lineH, align) {
    setFont(ctx, size, false, false);
    const words = text.split(' ');
    let line = '', yy = y;
    for (const w of words) {
      const trial = line ? line + ' ' + w : w;
      if (ctx.measureText(trial).width > maxW && line) {
        draw(ctx, line, x, yy, size, color, align || 'left', false, maxW);
        line = w; yy += lineH;
      } else line = trial;
    }
    if (line) draw(ctx, line, x, yy, size, color, align || 'left', false, maxW);
    return yy + lineH;
  }
  function outline(ctx, text, x, y, size, color, align, maxW) {
    setFont(ctx, size, true, true);
    if (maxW) { let s = size; while (s > 10 && ctx.measureText(text).width > maxW) { s -= 1; setFont(ctx, s, true, true); } }
    ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(3, size / 9); ctx.strokeStyle = color;
    ctx.strokeText(text, x, y);
  }

  globalThis.CP_Fit = { draw, wrap, outline, setFont };
})();
