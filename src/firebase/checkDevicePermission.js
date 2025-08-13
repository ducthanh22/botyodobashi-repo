const { db, collection, query, where, getDocs, updateDoc } = require('./firebase');
const os = require('os');
const { generateDeviceId } = require('./genarateID');


async function checkDevicePermission() {
  const deviceId = generateDeviceId();
  const usersRef = collection(db, 'users');
  const q = query(usersRef,
    where('deviceId', '==', deviceId),
    where('allow', '==', true)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.error("❌ Thiết bị chưa được duyệt.");
    return false;
  }

  const docRef = snapshot.docs[0].ref;
  await updateDoc(docRef, {
    lastUsed: new Date().toISOString(),
    hostname: os.hostname(),
    version:'1.0.0'
  });

  console.log("✅ Thiết bị được phép chạy bot.");
  return true;
}
module.exports = { checkDevicePermission };