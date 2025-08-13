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
const {getRandomUserAgent}=require('../config/userAgent')
const Auth = require('../bot/account');
const Purchase = require('../bot/index');
const waitTime = require('../bot/waitTime');
const register = require('../firebase/registerDevice')
const {checkDevicePermission}  = require('../firebase/checkDevicePermission');
const{loadConfigInternally}= require('../electron/electron')
const { get } = require('http');
const{hookCheck}=require('../discord/hookcheck')

// 🔐 Khóa & IV cho mã hóa AES-256-CBC
const SECRET_KEY = crypto.createHash('sha256').update('bot_yodobashi_super_secret_key').digest(); // 32 byte
const IV = Buffer.alloc(16, 0); // 16 byte IV tĩnh

const defaultConfig = {
  LOGIN: '',
  USER_NAME: '',
  USER_PASSWORD: '',
  PRODUCT_URL: '',
  RUN_AT: '',
  QUANTITY:'',
  credit_Code: '',
  passWord: '',
  code_Confirm: '',
  url_hook: ''
};

// 🔒 Mã hóa JSON thành chuỗi hex
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

// 📂 Đường dẫn file config ẩn ngoài app
// const configPath = path.join(app.getPath('userData'), '.data');



let mainWindow;

// Đường dẫn Chrome tùy nền tảng
let executablePath = '';
const isDev = !app.isPackaged;
const appDirectory = isDev ? __dirname : path.dirname(app.getPath('exe'));
const configPath = path.join(appDirectory, '.data');

if (os.platform() === 'win32') {
  executablePath = isDev
    ? path.join(app.getAppPath(), 'chrome-win', 'chrome.exe')
    : path.join(process.resourcesPath, 'chrome-win', 'chrome.exe');
} else if (os.platform() === 'darwin') {
  executablePath = isDev
    ? path.join(app.getAppPath(), 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium')
    : path.join(process.resourcesPath, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium');
}


// ────────────────────────────────────────────────────────
// Tạo cửa sổ Electron
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../ui/ui_index.html'));
}

let hasPermission = false;

ipcMain.handle('check-permission', async () => {
  try {
    const allowed = await checkDevicePermission();
    hasPermission = allowed;
    return { success: allowed };
  } catch (err) {
    return { success: false, error: err.message };
  }
});


// ────────────────────────────────────────────────────────
// Load config từ file mã hóa
ipcMain.handle('load-config', async () => {
  if (!hasPermission) return { error: '❌ Thiết bị chưa được cấp quyền.' };
  try {
    if (!fs.existsSync(configPath)) return defaultConfig;

    const encrypted = fs.readFileSync(configPath, 'utf-8');
    const userConfig = decrypt(encrypted);
    return { ...defaultConfig, ...userConfig };
  } catch (err) {
    return { error: '❌ Lỗi khi đọc cấu hình: ' + err.message };
  }
});

// Save config vào file mã hóa
ipcMain.handle('save-config', async (_, newConfig) => {
  if (!hasPermission) return { error: '❌ Thiết bị chưa được cấp quyền.' };
  try {
    const encrypted = encrypt(newConfig);
    fs.writeFileSync(configPath, encrypted, 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
ipcMain.handle('register-device', async (_, newConfig) => {
  try {

    if (!newConfig.email || !newConfig.name) {
      throw new Error("Thiếu thông tin email hoặc tên.");
    }
    await register.registerDevice(newConfig.email, newConfig.name);

    return { success: true };
  } catch (err) {
    console.error("❌ Lỗi khi đăng ký thiết bị:", err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('hookcheck', async (_, newConfig) => {
  try {
  
    // Load config (giống như gọi lại handler load-config)
    const userConfig  = await loadConfigInternally();



    if (!newConfig.urlweb || !userConfig.url_hook) {
      throw new Error("Thiếu thông tin");
    }
    await hookCheck(newConfig.urlweb, userConfig.url_hook);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});


// ────────────────────────────────────────────────────────
// IPC gọi chạy bot
// ────────────────────────────────────────────────────────
// IPC gọi chạy bot
let currentBrowser = null;

ipcMain.handle('run-bot', async () => {
  if (!hasPermission) return { error: '❌ Thiết bị chưa được cấp quyền.' };
  let browser;

  try {
    if (!fs.existsSync(configPath)) throw new Error("Không tìm thấy file cấu hình.");

    const encrypted = fs.readFileSync(configPath, 'utf-8');
    const config = decrypt(encrypted);

    if (!config.PRODUCT_URL || !/^https?:\/\//.test(config.PRODUCT_URL))
      throw new Error('URL sản phẩm không hợp lệ hoặc trống.');
    if (!config.USER_NAME || !config.USER_PASSWORD)
      throw new Error('Thiếu thông tin tài khoản đăng nhập.');
    if (!config.RUN_AT)
      throw new Error('Thiếu thời gian chạy RUN_AT.');

    browser = await puppeteer.launch({
      headless: 'new',
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--blink-settings=imagesEnabled=false',
        '--autoplay-policy=no-user-gesture-required',
      ],
      slowMo: 10,
    });
    currentBrowser = browser;
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    const userConfig  = await loadConfigInternally();
    // const ua = new UserAgent();
    // console.log('ua',ua.userAgent)
      // await page.setUserAgent(ua.userAgent);
    // console.log('ua',getRandomUserAgent())
    
    // await page.setUserAgent(getRandomUserAgent());

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.navigator.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, 'languages', { get: () => ['ja-JP', 'ja'] });
    });

    const auth = new Auth(page);
    const purchase = new Purchase(page);
    const wait = new waitTime(page);

    const loginUrl = 'https://order.yodobashi.com/yc/login/index.html?returnUrl=https%3A%2F%2Fwww.yodobashi.com%2F%3Flogout%3Dtrue%26yclogout%3Dtrue';

    await wait.beforeLogin(config.RUN_AT);
    await auth.login(loginUrl, config.USER_NAME, config.USER_PASSWORD);
    await wait.afterLogin(config.RUN_AT);

    await purchase.goToProductPage(config.PRODUCT_URL);
    await purchase.addCart(userConfig.QUANTITY);
    await purchase.addCode(config.code_Confirm);
    await purchase.checkOrderCode();

    return { success: true };

  } catch (error) {
    console.error('❌ Lỗi run-bot:', error);
    return { error: error.message };

  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error('⚠️ Lỗi khi đóng browser:', closeErr.message);
      }
      currentBrowser = null;
    }
  }
});
ipcMain.handle('stop-bot', async () => {
  try {
    if (currentBrowser) {
      await currentBrowser.close();
      currentBrowser = null;
      return { success: true };
    } else {
      return { error: 'Bot chưa chạy hoặc đã đóng.' };
    }
  } catch (err) {
    return { error: 'Không thể dừng bot: ' + err.message };
  }
});

// ────────────────────────────────────────────────────────
// Khởi chạy Electron
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
