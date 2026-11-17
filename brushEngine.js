/**
 * Atelier Baroque - Painterly Bristle & Dry-Brush Scratch Engine
 * Recreates the exact authentic dry-brush scratch reveal effect from the reference:
 * - Broad painterly stroke with realistic dry-brush bristle streaks
 * - Tangent-oriented bristle whiskers that fan out along movement curves
 * - Sub-pixel path interpolation for smooth continuous reveal
 * - Destination-out compositing over warm cream canvas
 */

export class BrushEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Options
    this.brushSize = options.brushSize || 85; // Base brush width in pixels
    this.bgColor = options.bgColor || '#FAF7F2'; // Cream canvas background color
    this.onRevealProgress = options.onRevealProgress || null;

    // State
    this.isScratching = false;
    this.lastX = null;
    this.lastY = null;
    this.lastAngle = 0;
    this.lastTime = 0;
    this.velocity = 0;

    // Procedural bristle definition (48 individual bristle strands across the brush width)
    this.bristleCount = 48;
    this.bristles = this._createBristles(this.bristleCount);

    // Pre-rendered textured brush stamp
    this.stamp = this._createBristleStamp(this.brushSize);

    // Sampling for reveal progress
    this._initProgressSampler();

    // Fill initial canvas
    this.resize();
  }

  _createBristles(count) {
    const bristles = [];
    for (let i = 0; i < count; i++) {
      // Offset from center (-1 to 1) with higher concentration towards edges for dry brush streaks
      const u = (i / (count - 1)) * 2 - 1;
      bristles.push({
        offsetRatio: u,
        lengthVariation: (Math.random() - 0.5) * 0.45,
        thickness: 1.0 + Math.random() * 2.2,
        alpha: 0.35 + Math.random() * 0.65,
        jitter: (Math.random() - 0.5) * 0.3
      });
    }
    return bristles;
  }

  _createBristleStamp(size) {
    const c = document.createElement('canvas');
    const w = size * 1.5;
    const h = size * 1.2;
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    const cx = w / 2;
    const cy = h / 2;
    const rx = size * 0.5;
    const ry = size * 0.35;

    // Solid core
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.75, 'rgba(0,0,0,0.95)');
    grad.addColorStop(0.9, 'rgba(0,0,0,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Procedural dry-brush bristle spikes around perimeter
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    for (let i = 0; i < 40; i++) {
      const angle = (Math.random() - 0.5) * Math.PI; // Top and bottom whiskers
      const sign = Math.random() > 0.5 ? 1 : -1;
      const bx = cx + (Math.random() - 0.5) * rx * 1.8;
      const by = cy + sign * ry * (0.8 + Math.random() * 0.35);
      const spikeLen = 6 + Math.random() * (size * 0.25);
      const spikeW = 1 + Math.random() * 2.5;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate((Math.random() - 0.5) * 0.3);
      ctx.fillRect(-spikeW / 2, 0, spikeW, sign * spikeLen);
      ctx.restore();
    }

    return c;
  }

  _initProgressSampler() {
    this.sampleCanvas = document.createElement('canvas');
    this.sampleCanvas.width = 64;
    this.sampleCanvas.height = 36;
    this.sampleCtx = this.sampleCanvas.getContext('2d', { willReadFrequently: true });
    this.lastSampleTime = 0;
  }

  /**
   * Resize canvas to viewport or parent container with high-DPI scaling
   */
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);

    if (w === 0 || h === 0) return;

    if (this.canvas.width !== w || this.canvas.height !== h) {
      // Save existing scratched state if any
      const temp = document.createElement('canvas');
      temp.width = this.canvas.width;
      temp.height = this.canvas.height;
      if (temp.width > 0 && temp.height > 0) {
        temp.getContext('2d').drawImage(this.canvas, 0, 0);
      }

      this.canvas.width = w;
      this.canvas.height = h;
      this.dpr = dpr;

      if (temp.width > 0 && temp.height > 0) {
        this.ctx.drawImage(temp, 0, 0, w, h);
      } else {
        this.fillCanvas();
      }
    }
  }

  /**
   * Fills canvas with seamless soft cream linen cover
   */
  fillCanvas() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Subtle paper/canvas linen texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.012)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }
    for (let x = 0; x < w; x += 4) {
      ctx.fillRect(x, 0, 1, h);
    }
    ctx.restore();

    this.lastX = null;
    this.lastY = null;
    this._checkProgress();
  }

  /**
   * Scratch/Reveal at coordinate (clientX, clientY)
   * Designed specifically for cursor hovering or touchmove
   */
  scratchAt(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = this.dpr || 1;
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;

    const now = performance.now();

    if (this.lastX === null || this.lastY === null) {
      this.lastX = x;
      this.lastY = y;
      this.lastTime = now;
      this._paintDab(x, y, 0);
      return;
    }

    const dx = x - this.lastX;
    const dy = y - this.lastY;
    const dist = Math.hypot(dx, dy);

    if (dist < 1) return;

    const dt = Math.max(1, now - this.lastTime);
    this.velocity = Math.min(3, dist / dt);

    // Direction angle
    const angle = Math.atan2(dy, dx);
    let diff = angle - this.lastAngle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.lastAngle += diff * 0.4;

    // Sub-pixel path interpolation for buttery smooth continuous paint stroke
    const stepSize = Math.max(2.5, (this.brushSize * dpr) * 0.05);
    const steps = Math.max(1, Math.ceil(dist / stepSize));

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const curX = this.lastX + dx * t;
      const curY = this.lastY + dy * t;
      this._paintStrokeSegment(this.lastX, this.lastY, curX, curY, this.lastAngle, this.velocity);
    }

    this.lastX = x;
    this.lastY = y;
    this.lastTime = now;

    // Periodically sample progress
    if (now - this.lastSampleTime > 500) {
      this._checkProgress();
      this.lastSampleTime = now;
    }
  }

  stopScratch() {
    this.lastX = null;
    this.lastY = null;
  }

  /**
   * Paints a single stroke segment with bristle whiskers and dry-brush streaks
   */
  _paintStrokeSegment(x0, y0, x1, y1, angle, velocity) {
    const ctx = this.ctx;
    const dpr = this.dpr || 1;
    const radius = (this.brushSize * dpr) / 2;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';

    // 1. Draw solid central stroke ribbon
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineWidth = radius * 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.stroke();

    // 2. Draw procedural bristle striations and outer dry-brush whiskers
    const perpAngle = angle + Math.PI / 2;
    const cosPerp = Math.cos(perpAngle);
    const sinPerp = Math.sin(perpAngle);
    const cosDir = Math.cos(angle);
    const sinDir = Math.sin(angle);

    const bLen = this.bristles.length;
    for (let i = 0; i < bLen; i++) {
      const b = this.bristles[i];
      // Lateral distance from center
      const lat = b.offsetRatio * radius * 1.05;
      // Trailing length variance
      const dragLag = -b.lengthVariation * (radius * 0.55);

      const px0 = x0 + cosPerp * lat + cosDir * dragLag;
      const py0 = y0 + sinPerp * lat + sinDir * dragLag;
      const px1 = x1 + cosPerp * lat + cosDir * dragLag;
      const py1 = y1 + sinPerp * lat + sinDir * dragLag;

      ctx.beginPath();
      ctx.moveTo(px0, py0);
      ctx.lineTo(px1, py1);
      ctx.lineWidth = b.thickness * (radius * 0.08);
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(0, 0, 0, ${b.alpha})`;
      ctx.stroke();

      // Outer ragged dry-brush bristle spikes (especially visible at stroke boundaries)
      if (Math.abs(b.offsetRatio) > 0.65 && Math.random() < 0.28) {
        const spikeLen = 8 + Math.random() * (radius * 0.5);
        const spikeAngle = angle + (b.offsetRatio > 0 ? 0.35 : -0.35) + (Math.random() - 0.5) * 0.2;
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px1 + Math.cos(spikeAngle) * spikeLen, py1 + Math.sin(spikeAngle) * spikeLen);
        ctx.lineWidth = 1.2 + Math.random() * 1.8;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.stroke();
      }
    }

    // 3. Stamp textured core for organic texture
    if (this.stamp) {
      ctx.translate(x1, y1);
      ctx.rotate(angle);
      const sw = radius * 1.8;
      const sh = radius * 1.3;
      ctx.globalAlpha = 0.5;
      ctx.drawImage(this.stamp, -sw / 2, -sh / 2, sw, sh);
    }

    ctx.restore();
  }

  _paintDab(x, y, angle) {
    const ctx = this.ctx;
    const dpr = this.dpr || 1;
    const radius = (this.brushSize * dpr) / 2;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fill();
    ctx.restore();
  }

  /**
   * Unveils the entire painting with an animated dissolve
   */
  revealAll(duration = 900) {
    const start = performance.now();
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const animate = (time) => {
      const elapsed = time - start;
      const t = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - t, 3);

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${0.15 + ease * 0.35})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, w, h);
        if (this.onRevealProgress) this.onRevealProgress(100);
      }
    };

    requestAnimationFrame(animate);
  }

  setBrushSize(size) {
    this.brushSize = Math.max(25, Math.min(220, size));
    this.stamp = this._createBristleStamp(this.brushSize);
  }

  _checkProgress() {
    if (!this.onRevealProgress) return;
    const sw = this.sampleCanvas.width;
    const sh = this.sampleCanvas.height;
    this.sampleCtx.clearRect(0, 0, sw, sh);
    this.sampleCtx.drawImage(this.canvas, 0, 0, sw, sh);

    try {
      const data = this.sampleCtx.getImageData(0, 0, sw, sh).data;
      let revealed = 0;
      const total = sw * sh;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 100) revealed++;
      }
      const pct = Math.min(100, Math.round((revealed / total) * 100));
      this.onRevealProgress(pct);
    } catch (e) {
      // Sampling fallback
    }
  }
}
