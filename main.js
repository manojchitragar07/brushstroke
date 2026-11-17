/**
 * Flora Bowley Studio — Single-Screen Landing Page Controller
 * Zero scrolling, responsive mobile & desktop hover/touch brushstroke engine.
 */

import { BrushEngine } from './brushEngine.js?v=3.0';

// Elements
const heroViewport = document.getElementById('hero-viewport');
const canvas = document.getElementById('scratch-canvas');
const revealPctEl = document.getElementById('reveal-pct');
const heroSubtitle = document.getElementById('hero-subtitle');
const btnReprime = document.getElementById('btn-reprime');
const btnRevealAll = document.getElementById('btn-reveal-all');

// Mobile Menu Elements
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

let brushEngine = null;

/**
 * Bootstrap Application
 */
function init() {
  // Initialize Brush / Scratch Engine
  brushEngine = new BrushEngine(canvas, {
    brushSize: 85,
    bgColor: '#FAF7F2',
    onRevealProgress: (percent) => {
      if (revealPctEl) revealPctEl.textContent = percent;
    }
  });

  // Handle window resizing
  window.addEventListener('resize', () => {
    brushEngine.resize();
  });

  // Handle screen orientation changes (mobile rotate)
  window.addEventListener('orientationchange', () => {
    setTimeout(() => brushEngine.resize(), 150);
  });

  // Bind cursor hover and mobile touch interactions
  initHoverAndTouchGestures();

  // Bind corner quick actions
  initControls();

  // Bind mobile navigation
  initMobileNav();
}

/**
 * Cursor Hover & Mobile Touch Scratch Gestures
 */
function initHoverAndTouchGestures() {
  // Check for touch device to customize instructions
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice && heroSubtitle) {
    heroSubtitle.textContent = 'Scratch (by touching) to reveal';
  }

  // 1. Desktop Hover Gesture: Moving cursor over hero scratches automatically
  heroViewport.addEventListener('mousemove', (e) => {
    brushEngine.scratchAt(e.clientX, e.clientY);
  });

  heroViewport.addEventListener('mouseleave', () => {
    brushEngine.stopScratch();
  });

  // 2. Mobile Touch Gesture: Dragging finger over canvas scratches seamlessly
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      brushEngine.scratchAt(touch.clientX, touch.clientY);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevents page scrolling while scratching
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      brushEngine.scratchAt(touch.clientX, touch.clientY);
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    brushEngine.stopScratch();
  });

  canvas.addEventListener('touchcancel', () => {
    brushEngine.stopScratch();
  });
}

/**
 * Controls (Reset, Reveal All)
 */
function initControls() {
  if (btnReprime) {
    btnReprime.addEventListener('click', () => {
      brushEngine.fillCanvas();
    });
  }

  if (btnRevealAll) {
    btnRevealAll.addEventListener('click', () => {
      brushEngine.revealAll(800);
    });
  }
}

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileNav() {
  if (mobileMenuToggle && mobileNavDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileNavDrawer.classList.toggle('open');
    });

    // Close when clicking a link
    mobileNavDrawer.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('open');
      });
    });
  }
}

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
