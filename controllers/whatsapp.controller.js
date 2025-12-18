const db = require('../db');

exports.getWhatsappLink = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ success: false, message: "user_id is required" });
  }

  const userId = Number(user_id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ success: false, message: 'user_id must be a positive integer' });
  }

  try {
    const profile = await db.profile.findUnique({
      where: { userId },
      select: { name: true, whatsapp: true },
    });

    if (!profile || !profile.whatsapp) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp number not found',
      });
    }

    const message = encodeURIComponent('Halo, saya ingin menghubungi Anda');
    const link = `https://wa.me/${profile.whatsapp}?text=${message}`;

    return res.json({
      success: true,
      data: {
        name: profile.name,
        whatsapp: profile.whatsapp,
        link,
      },
    });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};
