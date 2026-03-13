/**
 * Life Moments - Local Express Server
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
  res.json({ status: 'ok' });
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old codes
    await prisma.emailVerificationCode.deleteMany({
      where: { email },
    });

    // Save code
    await prisma.emailVerificationCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // In production, send email here
    console.log(`Verification code for ${email}: ${code}`);

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
    const verificationCode = await prisma.emailVerificationCode.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationCode) {
      return res.status(401).json({ error: 'Invalid or expired code' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          nickname: email.split('@')[0],
          passwordHash: '',
        },
      });
    }

    // Delete used code
    await prisma.emailVerificationCode.delete({
      where: { id: verificationCode.id },
    });

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
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

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

    const moment = await prisma.moment.create({
      data: {
        userId: req.userId,
        shortDescription,
        richContent: richContent || '[]',
        impactPercent: parseFloat(impactPercent),
        impactType: impactType || 'POSITIVE',
      },
    });

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
    const skip = (page - 1) * limit;

    const [moments, total] = await Promise.all([
      prisma.moment.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.moment.count({
        where: { userId: req.userId },
      }),
    ]);

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

// Get moment by ID
app.get('/moments/:id', authMiddleware, async (req, res) => {
  try {
    const moment = await prisma.moment.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        images: true,
      },
    });

    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }

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

    const moment = await prisma.moment.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }

    const updated = await prisma.moment.update({
      where: { id: req.params.id },
      data: {
        shortDescription,
        richContent,
        impactPercent: impactPercent !== undefined ? parseFloat(impactPercent) : undefined,
        impactType,
      },
    });

    res.json({ moment: updated });
  } catch (error) {
    console.error('Update moment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete moment
app.delete('/moments/:id', authMiddleware, async (req, res) => {
  try {
    const moment = await prisma.moment.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }

    await prisma.moment.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Moment deleted' });
  } catch (error) {
    console.error('Delete moment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get life progress
app.get('/moments/progress', authMiddleware, async (req, res) => {
  try {
    const moments = await prisma.moment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' },
      select: {
        impactPercent: true,
        impactType: true,
      },
    });

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

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Life Moments Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health\n`);
});

