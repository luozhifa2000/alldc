/**
 * Life Moments - Local Express Server with SQLite
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');
require('dotenv').config();

const app = express();
const db = new Database(path.join(__dirname, '../prisma/dev.db'));
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/health', (req, res) => {
  try {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ AUTH ROUTES ============

// Register
app.post('/auth/register', async (req, res) => {
  try {
    const { email, nickname, password } = req.body;

    if (!email || !nickname || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = randomUUID();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO users (id, email, nickname, passwordHash, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, email, nickname, passwordHash, now, now);

    // Generate JWT
    const token = jwt.sign({ userId, email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      user: {
        id: userId,
        email,
        nickname,
        createdAt: now,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send verification code
app.post('/auth/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
    const codeId = randomUUID();
    const now = new Date().toISOString();

    // Delete old codes
    db.prepare('DELETE FROM email_verification_codes WHERE email = ?').run(email);

    // Save code
    db.prepare(`
      INSERT INTO email_verification_codes (id, email, code, expiresAt, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(codeId, email, code, expiresAt, now);

    // In production, send email here
    console.log(`✉️  Verification code for ${email}: ${code}`);

    res.json({ message: 'Verification code sent', code }); // Remove code in production
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify code and login
app.post('/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Find code
    const verificationCode = db.prepare(`
      SELECT * FROM email_verification_codes
      WHERE email = ? AND code = ? AND expiresAt > datetime('now')
    `).get(email, code);

    if (!verificationCode) {
      return res.status(401).json({ error: 'Invalid or expired code' });
    }

    // Find or create user
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      const userId = randomUUID();
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO users (id, email, nickname, passwordHash, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, email, email.split('@')[0], '', now, now);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    // Delete used code
    db.prepare('DELETE FROM email_verification_codes WHERE id = ?').run(verificationCode.id);

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ MOMENTS ROUTES ============

// Create moment
app.post('/moments', authMiddleware, async (req, res) => {
  try {
    const { shortDescription, richContent, impactPercent, impactType } = req.body;

    if (!shortDescription || impactPercent === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const momentId = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO moments (id, userId, shortDescription, richContent, impactPercent, impactType, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      momentId,
      req.userId,
      shortDescription,
      richContent || '[]',
      parseFloat(impactPercent),
      impactType || 'POSITIVE',
      now,
      now
    );

    const moment = db.prepare('SELECT * FROM moments WHERE id = ?').get(momentId);
    res.json({ moment });
  } catch (error) {
    console.error('Create moment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get moments
app.get('/moments', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const moments = db.prepare(`
      SELECT * FROM moments
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `).all(req.userId, limit, offset);

    const { total } = db.prepare('SELECT COUNT(*) as total FROM moments WHERE userId = ?').get(req.userId);

    res.json({
      moments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get moments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get life progress (must be before /:id route)
app.get('/moments/progress', authMiddleware, async (req, res) => {
  try {
    const moments = db.prepare(`
      SELECT impactPercent, impactType
      FROM moments
      WHERE userId = ?
      ORDER BY createdAt ASC
    `).all(req.userId);

    let progress = 1.0;
    moments.forEach((moment) => {
      const impact = moment.impactType === 'POSITIVE'
        ? moment.impactPercent / 100
        : -moment.impactPercent / 100;
      progress = progress * (1 + impact);
    });

    res.json({
      progress,
      totalMoments: moments.length,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get moment by ID
app.get('/moments/:id', authMiddleware, async (req, res) => {
  try {
    const moment = db.prepare('SELECT * FROM moments WHERE id = ? AND userId = ?').get(req.params.id, req.userId);

    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }

    const images = db.prepare('SELECT * FROM moment_images WHERE momentId = ? ORDER BY sortOrder').all(req.params.id);
    moment.images = images;

    res.json({ moment });
  } catch (error) {
    console.error('Get moment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update moment
app.put('/moments/:id', authMiddleware, async (req, res) => {
  try {
    const { shortDescription, richContent, impactPercent, impactType } = req.body;

    const moment = db.prepare('SELECT * FROM moments WHERE id = ? AND userId = ?').get(req.params.id, req.userId);

    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE moments
      SET shortDescription = ?, richContent = ?, impactPercent = ?, impactType = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      shortDescription || moment.shortDescription,
      richContent || moment.richContent,
      impactPercent !== undefined ? parseFloat(impactPercent) : moment.impactPercent,
      impactType || moment.impactType,
      now,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM moments WHERE id = ?').get(req.params.id);
    res.json({ moment: updated });
  } catch (error) {
    console.error('Update moment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete moment
app.delete('/moments/:id', authMiddleware, async (req, res) => {
  try {
    const moment = db.prepare('SELECT * FROM moments WHERE id = ? AND userId = ?').get(req.params.id, req.userId);

    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }

    db.prepare('DELETE FROM moments WHERE id = ?').run(req.params.id);
    res.json({ message: 'Moment deleted' });
  } catch (error) {
    console.error('Delete moment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Life Moments Server');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Database: ${path.join(__dirname, '../prisma/dev.db')}\n`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

