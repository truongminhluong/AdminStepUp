const functions = require("firebase-functions");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.checkExpiredVouchers = onSchedule("every day 00:01", async () => {
  const now = admin.firestore.Timestamp.now();

  const snapshot = await db.collection("vouchers")
      .where("expiredAt", "<=", now)
      .where("isActive", "==", true)
      .get();

  const batch = db.batch();

  for (const docSnap of snapshot.docs) {
    const voucher = docSnap.data();

    // Gửi FCM qua topic "vouchers"
    await admin.messaging().send({
      topic: "vouchers",
      notification: {
        title: "Voucher đã hết hạn",
        body: `Voucher ${voucher.code} đã hết hạn vào hôm qua.`,
      },
    });

    // Cập nhật trạng thái voucher
    batch.update(docSnap.ref, { isActive: false });
  }

  await batch.commit();
  console.log(`Đã cập nhật ${snapshot.size} voucher(s) thành công.`);
});
