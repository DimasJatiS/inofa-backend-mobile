// Script untuk mengubah URL absolut menjadi path relatif
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, process.env.DB_FILE || 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Mengubah URL gambar menjadi path relatif...\n');

// Fix portfolios
db.all('SELECT id, image_url FROM portfolios WHERE image_url IS NOT NULL', [], (err, rows) => {
  if (err) {
    console.error('Error reading portfolios:', err);
    return;
  }

  console.log(`Ditemukan ${rows.length} portfolio dengan gambar`);

  rows.forEach(row => {
    let newUrl = row.image_url;
    
    // Extract path dari URL absolut (http://192.168.x.x:4000/uploads/... -> /uploads/...)
    if (newUrl && (newUrl.startsWith('http://') || newUrl.startsWith('https://'))) {
      const match = newUrl.match(/\/uploads\/.+$/);
      if (match) {
        newUrl = match[0];
        
        db.run('UPDATE portfolios SET image_url = ? WHERE id = ?', [newUrl, row.id], (err) => {
          if (err) {
            console.error(`Error updating portfolio ${row.id}:`, err);
          } else {
            console.log(`✓ Portfolio ${row.id}: ${row.image_url} -> ${newUrl}`);
          }
        });
      }
    }
  });
});

// Fix profiles
db.all('SELECT id, photo_url FROM profiles WHERE photo_url IS NOT NULL', [], (err, rows) => {
  if (err) {
    console.error('Error reading profiles:', err);
    return;
  }

  console.log(`\nDitemukan ${rows.length} profile dengan foto`);

  rows.forEach(row => {
    let newUrl = row.photo_url;
    
    if (newUrl && (newUrl.startsWith('http://') || newUrl.startsWith('https://'))) {
      const match = newUrl.match(/\/uploads\/.+$/);
      if (match) {
        newUrl = match[0];
        
        db.run('UPDATE profiles SET photo_url = ? WHERE id = ?', [newUrl, row.id], (err) => {
          if (err) {
            console.error(`Error updating profile ${row.id}:`, err);
          } else {
            console.log(`✓ Profile ${row.id}: ${row.photo_url} -> ${newUrl}`);
          }
        });
      }
    }
  });

  // Close DB setelah selesai
  setTimeout(() => {
    db.close();
    console.log('\n✓ Selesai! Database telah diupdate.');
  }, 1000);
});
