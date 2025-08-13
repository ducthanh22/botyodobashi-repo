const os = require('os');
const crypto = require('crypto');

function generateDeviceId() {
  // Lấy hostname (tên máy) + username hệ thống
  const raw = os.hostname() + "_" + os.userInfo().username;
  // Băm SHA256 để tạo chuỗi duy nhất, khó đoán
  return crypto.createHash('sha256').update(raw).digest('hex');
}

module.exports = { generateDeviceId };