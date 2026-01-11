const admin = require("firebase-admin");
require("dotenv").config();

// Kiểm tra nếu Firebase credentials chưa được cấu hình
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY ||
  process.env.FIREBASE_PROJECT_ID === "your-project-id"
) {
  console.warn("⚠️  Firebase credentials chưa được cấu hình trong .env");
  console.warn(
    "⚠️  Upload file sẽ không hoạt động. Xem FIREBASE_SETUP.md để cấu hình."
  );

  // Export dummy functions để không crash app
  module.exports = {
    bucket: null,
    admin: null,
    isConfigured: false,
  };
} else {
  // Xử lý private key từ environment variable
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Replace escaped newlines với actual newlines
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    // Firebase Storage Bucket
    storageBucket: "sherwoodcare-d3de5.firebasestorage.app",
  });

  // Lấy bucket để export
  const bucket = admin.storage().bucket();

  console.log("✅ Firebase Storage đã được cấu hình");

  module.exports = { bucket, admin, isConfigured: true };
}
