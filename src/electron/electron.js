const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const puppeteerCore = require('puppeteer-core');
const { addExtra } = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = addExtra(puppeteerCore);
puppeteer.use(StealthPlugin());
const Auth = require('../bot/account');
const Purchase = require('../bot/index');
const waitTime = require('../bot/waitTime');
const register = require('../firebase/registerDevice')
const {checkDevicePermission}  = require('../firebase/checkDevicePermission');
const configPath = path.join(app.getPath('userData'), '.data');

const defaultConfig = {
  LOGIN: '',
  USER_NAME: '',
  USER_PASSWORD: '',
  PRODUCT_URL: '',
  RUN_AT: '',
  credit_Code: '',
  passWord: '',
  code_Confirm: '',
  url_hook: ''
};

// 🔐 Khóa & IV cho mã hóa AES-256-CBC
const SECRET_KEY = crypto.createHash('sha256').update('bot_yodobashi_super_secret_key').digest(); // 32 byte
const IV = Buffer.alloc(16, 0); // 16 byte IV tĩnh

function encrypt(data) {
  const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, IV);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// 🔓 Giải mã chuỗi hex thành object
function decrypt(encryptedData) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, IV);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

async function loadConfigInternally() {
//   if (!hasPermission) throw new Error('❌ Thiết bị chưa được cấp quyền.');
  if (!fs.existsSync(configPath)) return defaultConfig;

  const encrypted = fs.readFileSync(configPath, 'utf-8');
  const userConfig = decrypt(encrypted);
  return { ...defaultConfig, ...userConfig };
}

module.exports= {loadConfigInternally}