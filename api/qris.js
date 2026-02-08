const QRCode = require('qrcode');
const { makeString } = require('@agungjsp/qris-dinamis');

module.exports = async (req, res) => {
  // CORS manual (backup kalo vercel.json ga jalan)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { amount } = req.query;

  if (!amount || isNaN(amount) || Number(amount) < 10000 || Number(amount) > 10000000) {
    return res.status(400).json({ success: false, error: 'Nominal 10k - 10jt!' });
  }

  const STATIC_QRIS = "00020101021126570011ID.DANA.WWW011893600915380278851102098027885110303UMI51440014ID.CO.QRIS.WWW0215ID10243638102420303UMI5204481453033605802ID5911Toko Gulbat6014Kab. Indramayu610545253630441A3";

  try {
    const dynamicQris = makeString(STATIC_QRIS, { nominal: amount.toString() });

    const qrImage = await QRCode.toDataURL(dynamicQris, { width: 300 });

    res.status(200).json({
      success: true,
      dynamic_qris: dynamicQris,
      qr_image_base64: qrImage,
      amount: Number(amount),
      merchant: "Toko Gulbat",
      expired_in: "15 menit (manual check)"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
