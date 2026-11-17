# 🎨 Atelier Baroque — Interactive Brushstroke Reveal Landing Page

An interactive fine-art landing page where moving your cursor or gliding your finger across a primed linen canvas paints away the dark veil with **realistic physical oil brush strokes**, revealing the 18th-century Baroque/Rococo oil painting (*The Abduction of Europa*).

---

## 🌟 Key Features

### 1. Realistic Multi-Bristle Brush Engine (`frontend/brushEngine.js`)
* **Multi-Bristle Physics Simulation**: Models 42+ individual bristle hairs with lateral spacing, length variations, individual drag marks, and core impasto density.
* **Continuous Tangent Orientation**: Tracks cursor velocity vector and smoothly lerps the brush angle ($\theta = \operatorname{atan2}(\Delta y, \Delta x)$) so the bristle fan naturally pivots and drags behind the ferrule.
* **Sub-Pixel Path Interpolation**: Interpolates points along rapid sweeps at intervals of $\approx 1.8\text{px}$, ensuring creamy, unbroken coverage even during swift hand movements.
* **Multiple Master Brush Styles**:
  * 🖌️ **Oil Bristle**: Coarse striations, individual hair paths, authentic oil painting feel.
  * 💧 **Aquarelle (Watercolor)**: Feathered, soft-bleeding edges with translucent glaze buildup.
  * 🔪 **Palette Knife**: Chiseled rectangular edges with impasto scraping.
  * ✒️ **Fine Liner**: Tapered calligraphic strokes for revealing delicate faces and drapery.
* **Dynamic Paint Micro-Splatters**: Generates organic paint flecks along high-speed brush flourishes.
* **Canvas Modes**:
  * **Permanent Reveal**: Uncovers the painting permanently as you paint.
  * **Dream Fade (Ephemeral)**: Strokes glow and reveal the painting, then slowly mist back over with atmospheric fog.

### 2. Procedural Canvas ASMR Sound Engine (`frontend/audioEngine.js`)
* Generates realistic, tactile friction sounds of hog bristles sweeping across stretched canvas using the **Web Audio API**.
* Frequency and volume are dynamically modulated by cursor velocity.
* 100% procedural — requires zero external audio files and works entirely offline.
* Includes sound toggle and respect for browser autoplay policies.

### 3. Mobile & Touch Responsive
* Complete support for `touchstart`, `touchmove`, and `touchend` events.
* `touch-action: none` prevents mobile screen scrolling/bouncing while painting.
* Responsive viewport layout supporting both portrait mobile screens and landscape desktop displays.
* **Rotate 90° Canvas Toggle**: Allows viewing the original painting either cropped vertically for mobile wallpaper mode or rotated into its natural horizontal landscape orientation!

### 4. Separated Frontend and Backend
* **`frontend/`**:
  * `index.html`: Semantic, accessible structure with floating glassmorphic artist dock, curator drawer, live reveal percentage gauge, and celebration modal.
  * `style.css`: Luxury fine-art museum styling with custom cursors, animations, and responsive breakpoints.
  * `brushEngine.js`: High-performance canvas physics & bristle engine.
  * `audioEngine.js`: Web Audio synthesizer for tactile canvas friction.
  * `main.js`: Main application controller and API client.
  * `assets/background.jpeg`: Clean copy of the uploaded artwork (`_ (38).jpeg`).
* **`backend/`**:
  * `server.js`: Native Node.js REST API and static server (zero external dependencies required!).
  * REST API Endpoints:
    * `GET /api/artwork`: Masterpiece metadata, provenance, description, techniques.
    * `GET /api/palette`: Extracted harmonic color palette (Imperial Ochre, Verdant Woodland, Ethereal Azure, Blush Carnation, Raw Umber, Alabaster Foam).
    * `GET /api/curator-notes`: Curatorial commentary and historical context.
    * `GET /api/guestbook`: Recent visitor signatures and impressions.
    * `POST /api/guestbook`: Submit new guestbook signature.
    * `POST /api/newsletter`: Subscribe to private exhibition previews.
    * `GET /api/health`: Server health check.

---

## 🚀 Quick Start

### Option 1: Run with Backend Server (Recommended)
From the project root:
```bash
npm start
# OR: node backend/server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option 2: Run Frontend and Backend Separately
* **Run Backend (Port 3000)**:
  ```bash
  cd backend
  node server.js
  ```
* **Run Frontend**:
  You can serve the `frontend/` folder with any web server (e.g., Live Server, Vite, or Python):
  ```bash
  cd frontend
  python3 -m http.server 5173
  ```
  Open **[http://localhost:5173](http://localhost:5173)**. The frontend will communicate with the backend API on port 3000.

---

## 🎨 Interactive Controls & Shortcuts
| Action | Description |
|---|---|
| **Brush Drag / Touch** | Paint away the dark primed linen to unveil the classical painting |
| **Brush Styles** | Switch between Oil Bristle, Aquarelle, Palette Knife, and Fine Liner |
| **Width Slider** | Adjust stroke width from 15px to 160px |
| **Canvas Mode** | Toggle between Permanent Reveal and Ephemeral Dream Fade |
| **Rotate 90°** | Toggle between vertical mobile fit and horizontal painting orientation |
| **Reveal All** | Animated complete unveiling of the masterpiece |
| **Re-prime** | Coat the canvas with fresh dark gesso to paint again |
| **Export Snapshot** | Download high-res PNG image of your painted canvas |
| **Audio Toggle** | Turn on/off tactile canvas brush friction sound effects |
| **Curator's Notes** | Open the exhibition drawer to explore techniques, color palette, and sign the guestbook |
