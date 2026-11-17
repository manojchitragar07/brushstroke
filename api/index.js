// Vercel Serverless Function Handler
// Handles /api/artwork, /api/palette, /api/guestbook, /api/newsletter, /api/health

const artworkData = {
  title: "The Abduction of Europa",
  subtitle: "Painting of the Day",
  era: "Circa 1727 (European Rococo / Late Baroque)",
  medium: "Oil on Fine Linen Canvas",
  provenance: "European Classical Heritage Archive",
  dimensions: "Original 1308 × 736 Master Capture",
  description: "An evocative mythological pastoral scene depicting Europa draped in gold and rose silk, seated upon the divine white bull as she is escorted across shimmering waters by attendants, nymphs, and playful putti beneath sunlit woodlands and romantic classical ruins."
};

const paletteData = [
  { name: "Imperial Ochre", hex: "#C79D48", role: "Golden drapery & sunlit hill highlights" },
  { name: "Verdant Woodland", hex: "#465337", role: "Ancient canopy & riverside foliage" },
  { name: "Ethereal Azure", hex: "#A8B9C8", role: "Atmospheric mountain sky & morning haze" },
  { name: "Blush Carnation", hex: "#E8C2B3", role: "Radiant skin tones of Europa and nymphs" },
  { name: "Raw Umber", hex: "#423225", role: "Bark, soil & shadowed drapery folds" },
  { name: "Alabaster Foam", hex: "#F3EDE1", role: "The divine white bull & water spray" }
];

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

module.exports = async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const url = req.url || '';
  const pathname = url.split('?')[0];

  if (req.method === 'GET') {
    if (pathname.endsWith('/health') || pathname === '/api') {
      return sendJSON(res, 200, { status: 'healthy', time: new Date().toISOString() });
    }
    if (pathname.endsWith('/artwork')) {
      return sendJSON(res, 200, artworkData);
    }
    if (pathname.endsWith('/palette')) {
      return sendJSON(res, 200, paletteData);
    }
    if (pathname.endsWith('/guestbook')) {
      return sendJSON(res, 200, guestbookEntries);
    }
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    if (pathname.endsWith('/guestbook')) {
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

    if (pathname.endsWith('/newsletter')) {
      const { email } = body;
      if (!email || !email.includes('@')) {
        return sendJSON(res, 400, { error: 'Valid email address is required.' });
      }
      return sendJSON(res, 200, { success: true, message: 'Subscribed to daily painting reveals.' });
    }
  }

  return sendJSON(res, 404, { error: 'Not found: ' + pathname });
};
