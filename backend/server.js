const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.resolve(__dirname, '../frontend');

// Masterpiece and Exhibition Metadata
const artworkData = {
  title: "The Abduction of Europa",
  subtitle: "Painting of the Day",
  era: "Circa 1727 (European Rococo / Late Baroque)",
  medium: "Oil on Fine Linen Canvas",
  provenance: "European Classical Heritage Archive",
  dimensions: "Original 1308 × 736 Master Capture",
  description: "An evocative mythological pastoral scene depicting Europa draped in gold and rose silk, seated upon the divine white bull as she is escorted across shimmering waters by attendants, nymphs, and playful putti beneath sunlit woodlands and romantic classical ruins.",
  techniques: [
    {
      name: "Chiaroscuro & Sfumato",
      description: "Delicate gradation between the luminous ivory flesh of the nymphs and the deep verdant shadows of ancient oak foliage."
    },
    {
      name: "Impasto Bristle Work",
      description: "Textured, heavy brush strokes defining water froth, gilded drapery highlights, and atmospheric cloud contours."
    },
    {
      name: "Lapis & Umber Glazing",
      description: "Translucent layers of ground lapis lazuli and raw umber creating depth in the distant mountain atmosphere."
    }
  ]
};

// Curated Master Palette
const paletteData = [
  { name: "Imperial Ochre", hex: "#C79D48", rgb: "199, 157, 72", role: "Golden drapery & sunlit hill highlights" },
  { name: "Verdant Woodland", hex: "#465337", rgb: "70, 83, 55", role: "Ancient canopy & riverside foliage" },
  { name: "Ethereal Azure", hex: "#A8B9C8", rgb: "168, 185, 200", role: "Atmospheric mountain sky & morning haze" },
  { name: "Blush Carnation", hex: "#E8C2B3", rgb: "232, 194, 179", role: "Radiant skin tones of Europa and nymphs" },
  { name: "Raw Umber", hex: "#423225", rgb: "66, 50, 37", role: "Bark, soil & shadowed drapery folds" },
  { name: "Alabaster Foam", hex: "#F3EDE1", rgb: "243, 237, 225", role: "The divine white bull & water spray" }
];

// In-Memory Guestbook
const guestbookEntries = [
  {
    id: 1,
    name: "Elena Rostova",
    location: "Paris, France",
    message: "The tactile sensation of revealing the nymphs with each brushstroke feels like uncovering a lost masterpiece in an old studio.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 2,
    name: "Marcus Sterling",
    location: "Florence, Italy",
    message: "Stunning bristle physics. Watching the white bull and cherubs emerge from the canvas is pure poetry.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  }
];

const subscribers = new Set(["collector@florabowley.art"]);

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Helper: send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Helper: parse request body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper: serve static file with zero caching
function serveStaticFile(req, res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': data.length,
      // Aggressive cache busting so browser always receives latest CSS/JS/images
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*'
    });

    res.end(data);
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API Routes
  if (pathname.startsWith('/api/')) {
    try {
      if (req.method === 'GET') {
        if (pathname === '/api/health') {
          return sendJSON(res, 200, { status: 'healthy', uptime: process.uptime(), time: new Date().toISOString() });
        }
        if (pathname === '/api/artwork') {
          return sendJSON(res, 200, artworkData);
        }
        if (pathname === '/api/palette') {
          return sendJSON(res, 200, paletteData);
        }
        if (pathname === '/api/guestbook') {
          return sendJSON(res, 200, guestbookEntries);
        }
        if (pathname === '/api/curator-notes') {
          return sendJSON(res, 200, {
            curator: "Flora Bowley Studio",
            notes: "The interplay of mythological passion and pastoral tranquility reflects the height of European classical art."
          });
        }
      }

      if (req.method === 'POST') {
        const body = await parseRequestBody(req);

        if (pathname === '/api/guestbook') {
          const { name, message, location } = body;
          if (!name || !message) {
            return sendJSON(res, 400, { error: 'Name and message are required.' });
          }
          const entry = {
            id: guestbookEntries.length + 1,
            name: String(name).slice(0, 80),
            location: location ? String(location).slice(0, 60) : 'Studio Visitor',
            message: String(message).slice(0, 300),
            timestamp: new Date().toISOString()
          };
          guestbookEntries.unshift(entry);
          return sendJSON(res, 201, { success: true, entry });
        }

        if (pathname === '/api/newsletter') {
          const { email } = body;
          if (!email || !email.includes('@')) {
            return sendJSON(res, 400, { error: 'Valid email address is required.' });
          }
          subscribers.add(email.toLowerCase().trim());
          return sendJSON(res, 200, { success: true, message: 'Subscribed to daily painting reveals.' });
        }
      }

      return sendJSON(res, 404, { error: 'Endpoint not found' });
    } catch (err) {
      console.error('API Error:', err);
      return sendJSON(res, 500, { error: 'Internal server error', details: err.message });
    }
  }

  // Static File Serving from ../frontend
  let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const absolutePath = path.join(FRONTEND_DIR, safePath);

  fs.stat(absolutePath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveStaticFile(req, res, absolutePath);
    } else {
      if (!path.extname(absolutePath)) {
        serveStaticFile(req, res, path.join(FRONTEND_DIR, 'index.html'));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found: ' + pathname);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🎨 Flora Bowley Studio Server is running`);
  console.log(`   URL:          http://localhost:${PORT}`);
  console.log(`   Frontend Dir: ${FRONTEND_DIR}`);
  console.log(`===============================================`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());

module.exports = server;
