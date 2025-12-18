// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, process.env.DB_FILE || 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Inisialisasi tabel (schema)
db.serialize(() => {
  // Tabel users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK (role IN ('developer','client') OR role IS NULL),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabel profiles
  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT,
      photo_url TEXT,
      bio TEXT,
      location TEXT,
      whatsapp TEXT,
      skills TEXT, -- JSON array string
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX IF NOT EXISTS unique_user_profile ON profiles(user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS unique_user_role ON users(role, id);
  `);

  // Ensure whatsapp column exists for pre-existing databases
  db.all('PRAGMA table_info(profiles);', [], (err, rows) => {
    if (err) {
      console.error('Failed to inspect profiles schema:', err.message);
    } else {
      const hasWhatsapp = rows && rows.some(r => r.name === 'whatsapp');
      if (!hasWhatsapp) {
        db.run('ALTER TABLE profiles ADD COLUMN whatsapp TEXT;', (alterErr) => {
          if (alterErr) {
            console.error('Failed to add whatsapp column:', alterErr.message);
          } else {
            console.log('Added whatsapp column to profiles');
          }
        });
      }
    }
  });

  // Tabel portfolios (developer)
  db.run(`
    CREATE TABLE IF NOT EXISTS portfolios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      link TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Ensure updated_at column exists in portfolios for pre-existing databases
  db.all('PRAGMA table_info(portfolios);', [], (err, rows) => {
    if (err) {
      console.error('Failed to inspect portfolios schema:', err.message);
    } else {
      const hasUpdatedAt = rows && rows.some(r => r.name === 'updated_at');
      if (!hasUpdatedAt) {
        db.run('ALTER TABLE portfolios ADD COLUMN updated_at DATETIME;', (alterErr) => {
          if (alterErr) {
            console.error('Failed to add updated_at column to portfolios:', alterErr.message);
          } else {
            console.log('Added updated_at column to portfolios');
            // Set initial values for existing rows
            db.run('UPDATE portfolios SET updated_at = created_at WHERE updated_at IS NULL;', (updateErr) => {
              if (updateErr) {
                console.error('Failed to initialize updated_at values:', updateErr.message);
              }
            });
          }
        });
      }
    }
  });


  // Tabel projects (client)
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      budget REAL,
      skill_requirements TEXT,  -- JSON array
      constraints TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'done')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Ensure updated_at column exists in projects for pre-existing databases
  db.all('PRAGMA table_info(projects);', [], (err, rows) => {
    if (err) {
      console.error('Failed to inspect projects schema:', err.message);
    } else {
      const hasUpdatedAt = rows && rows.some(r => r.name === 'updated_at');
      const hasStatus = rows && rows.some(r => r.name === 'status');
      
      if (!hasUpdatedAt) {
        db.run('ALTER TABLE projects ADD COLUMN updated_at DATETIME;', (alterErr) => {
          if (alterErr) {
            console.error('Failed to add updated_at column to projects:', alterErr.message);
          } else {
            console.log('Added updated_at column to projects');
            // Set initial values for existing rows
            db.run('UPDATE projects SET updated_at = created_at WHERE updated_at IS NULL;', (updateErr) => {
              if (updateErr) {
                console.error('Failed to initialize updated_at values:', updateErr.message);
              }
            });
          }
        });
      }
      
      if (!hasStatus) {
        db.run("ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'pending';", (alterErr) => {
          if (alterErr) {
            console.error('Failed to add status column to projects:', alterErr.message);
          } else {
            console.log('Added status column to projects');
            // Set initial values for existing rows
            db.run("UPDATE projects SET status = 'pending' WHERE status IS NULL;", (updateErr) => {
              if (updateErr) {
                console.error('Failed to initialize status values:', updateErr.message);
              }
            });
          }
        });
      }
    }
  });

});

module.exports = db;
