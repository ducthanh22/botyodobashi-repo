const { db, collection, query, where, getDocs, addDoc } = require('./firebase');
const os = require('os');
const { generateDeviceId } = require('./genarateID');

async function registerDevice(email, ten) {
  const usersRef = collection(db, 'users');
  const deviceId = generateDeviceId();
  console.log('id',deviceId)

  const q = query(usersRef, where('deviceId', '==', deviceId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    console.log("⚠️ Thiết bị đã đăng ký. Chờ duyệt.");
    throw new Error("⚠️ Thiết bị đã đăng ký. Chờ duyệt.");
  }

  await addDoc(usersRef, {
    email,
    deviceId,
    ten,
    username:os.userInfo().username,
    hostname: os.hostname(),
    version:"1.0.0",
    allow: false,
    lastUsed: "",
    delete: false,
  });

  console.log("✅ Đăng ký thiết bị thành công. Chờ admin duyệt.");
}
module.exports = { registerDevice };