const db = require('../db');

exports.getWhatsappLink = (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ success: false, message: "user_id is required" });
  }

  const query = `
    SELECT name, whatsapp
    FROM profiles
    WHERE user_id = ?
  `;

  db.get(query, [user_id], (err, profile) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });

    if (!profile || !profile.whatsapp) {
      return res.status(404).json({
        success: false,
        message: "WhatsApp number not found"
      });
    }

    const message = encodeURIComponent("Halo, saya ingin menghubungi Anda");
    const link = `https://wa.me/${profile.whatsapp}?text=${message}`;

    return res.json({
      success: true,
      data: {
        name: profile.name,
        whatsapp: profile.whatsapp,
        link
      }
    });
  });
};
