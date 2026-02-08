const QRCode = require('qrcode');
const { makeString } = require('@agungjsp/qris-dinamis');

module.exports = async (req, res) => {
  // CORS full open
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { amount } = req.query;

  // Validasi longgar: cuma cek amount ada dan positif
  const numAmount = Number(amount);
  if (!amount || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Nominal harus angka positif (bisa mulai dari 1 rupiah)' });
  }

  // Batas max bisa lo atur sendiri, misal 50jt
  if (numAmount > 50000000) {
    return res.status(400).json({ success: false, error: 'Maksimal 50.000.000' });
  }

  const STATIC_QRIS = "00020101021126570011ID.DANA.WWW011893600915380278851102098027885110303UMI51440014ID.CO.QRIS.WWW0215ID10243638102420303UMI5204481453033605802ID5911Toko Gulbat6014Kab. Indramayu610545253630441A3";

  try {
    // amount bisa desimal (misal 0.01), tapi QRIS biasanya integer rupiah
    // library makeString nerima string, jadi kita format ke 2 desimal
    const amountStr = numAmount.toFixed(2);

    const dynamicQris = makeString(STATIC_QRIS, { nominal: amountStr });

    const qrImage = await QRCode.toDataURL(dynamicQris, { width: 300 });

    res.status(200).json({
      success: true,
      dynamic_qris: dynamicQris,
      qr_image_base64: qrImage,
      amount: numAmount,
      merchant: "Toko Gulbat",
      expired_in: "15 menit"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
