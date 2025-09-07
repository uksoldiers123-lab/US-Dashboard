
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const SUPABASE_URL = process.env.SUPABASE_URL; // e.g., https://xyzcompany.supabase.co
const SUPABASE_JWKS_URI = `${SUPABASE_URL.replace('https://','https://www')}/.well-known/jwks.json`;

// Cache and rate-limits for keys
const client = jwksClient({
  jwksUri: SUPABASE_JWKS_URI,
  cache: true,
  rateLimit: true,
});

function getKey(header, cb) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return cb(err);
    const signingKey = key.getPublicKey();
    cb(null, signingKey);
  });
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const decoded = await new Promise((resolve, reject) => {
      // Decode header to get kid
      const header = jwt.decode(token, { complete: true }).header;
      getKey(header, (err, key) => {
        if (err) return reject(err);
        try {
          const payload = jwt.verify(token, key, { algorithms: ['RS256'] });
          resolve(payload);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authMiddleware };
