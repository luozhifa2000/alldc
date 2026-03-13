/**
 * Initialize SQLite database
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../prisma/dev.db');

// Remove existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ Removed existing database');
}

// Create new database
const db = new Database(dbPath);

console.log('📊 Creating tables...');

// Create tables
db.exec(`
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nickname TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_users_email ON users(email);

  CREATE TABLE email_verification_codes (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expiresAt DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_email_verification_codes_email_code ON email_verification_codes(email, code);
  CREATE INDEX idx_email_verification_codes_expiresAt ON email_verification_codes(expiresAt);

  CREATE TABLE moments (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    shortDescription TEXT,
    richContent TEXT NOT NULL,
    textPreview TEXT,
    impactPercent REAL NOT NULL,
    impactType TEXT NOT NULL CHECK(impactType IN ('POSITIVE', 'NEGATIVE', 'NEUTRAL')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX idx_moments_userId_createdAt ON moments(userId, createdAt);
  CREATE INDEX idx_moments_userId ON moments(userId);

  CREATE TABLE moment_images (
    id TEXT PRIMARY KEY,
    momentId TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    sortOrder INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (momentId) REFERENCES moments(id) ON DELETE CASCADE
  );

  CREATE INDEX idx_moment_images_momentId ON moment_images(momentId);
`);

console.log('✅ Database initialized successfully!');
console.log(`📁 Database location: ${dbPath}`);

db.close();

