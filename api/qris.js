const QRCode = require('qrcode');
const { makeString } = require('@agungjsp/qris-dinamis');

module.exports = async (req, res) => {
  // CORS headers (manual biar pasti)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { amount } = req.query;

  if (!amount || isNaN(amount) || amount < 10000 || amount > 10000000) {
    return res.status(400).json({ success: false, error: "Nominal harus 10.000 - 10.000.000" });
  }

  // QRIS statis lo (dari DANA/Toko Gulbat)
  const STATIC_QRIS = "00020101021126570011ID.DANA.WWW011893600915380278851102098027885110303UMI51440014ID.CO.QRIS.WWW0215ID10243638102420303UMI5204481453033605802ID5911Toko Gulbat6014Kab. Indramayu610545253630441A3";

  try {
    // Generate dynamic string
    const dynamicQris = makeString(STATIC_QRIS, { nominal: amount.toString() });

    // Generate QR gambar base64
    const qrImage = await QRCode.toDataURL(dynamicQris, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    });

    res.status(200).json({
      success: true,
      dynamic_qris: dynamicQris,
      qr_image_base64: qrImage,
      amount: parseInt(amount),
      merchant: "Toko Gulbat",
      expired_in: "15 menit (manual check ya)"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Gagal generate QRIS: " + err.message });
  }
};
