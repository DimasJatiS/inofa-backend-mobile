import { Request, Response } from 'express';

export const getWhatsappLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, message } = req.query;

    if (!phone || typeof phone !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
      return;
    }

    const baseUrl = 'https://wa.me/';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    let link = baseUrl + cleanPhone;

    if (message && typeof message === 'string') {
      const encodedMessage = encodeURIComponent(message);
      link += `?text=${encodedMessage}`;
    }

    res.status(200).json({
      success: true,
      data: { link },
    });
  } catch (error) {
    console.error('WhatsApp link error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate WhatsApp link' });
  }
};
