/**
 * Atelier Baroque - Procedural Canvas Friction & Bristle Audio Synthesizer
 * Uses Web Audio API to procedurally generate the tactile ASMR sound of
 * oil brush bristles sweeping across stretched linen canvas.
 * Zero external audio assets required.
 */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.noiseNode = null;
    this.filterNode = null;
    this.gainNode = null;
    this.isEnabled = false;
    this.isMuted = false;
    this.targetGain = 0;
    this.currentGain = 0;
  }

  /**
   * Initializes audio context on first user interaction to comply with browser autoplay policy
   */
  init() {
    if (this.ctx) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Create 2-second looped pink/textured noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Paul Kellet's filtered pink noise algorithm for warm organic texture
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Resonant bandpass filter simulating canvas acoustic body
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.value = 1600;
      this.filterNode.Q.value = 2.2;

      // High shelf to soften digital highs
      this.highShelf = this.ctx.createBiquadFilter();
      this.highShelf.type = 'highshelf';
      this.highShelf.frequency.value = 3800;
      this.highShelf.gain.value = -6;

      // Master gain node
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0;

      // Connect graph: Noise -> Bandpass -> HighShelf -> Gain -> Destination
      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(this.highShelf);
      this.highShelf.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.noiseNode.start();
      this.isEnabled = true;
    } catch (e) {
      console.warn('Web Audio could not be initialized:', e);
    }
  }

  /**
   * Modulates sound envelope and frequency according to stroke speed
   */
  updateStroke(velocity) {
    if (!this.isEnabled || this.isMuted || !this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const clampedVel = Math.min(2.5, Math.max(0, velocity));

    if (clampedVel > 0.05) {
      // Modulate frequency based on brush speed (1200Hz - 2600Hz)
      const targetFreq = 1200 + clampedVel * 600;
      this.filterNode.frequency.setTargetAtTime(targetFreq, now, 0.04);

      // Volume based on speed
      const targetVol = Math.min(0.28, clampedVel * 0.16);
      this.gainNode.gain.setTargetAtTime(targetVol, now, 0.04);
    } else {
      this.stop();
    }
  }

  stop() {
    if (!this.gainNode || !this.ctx) return;
    this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}
