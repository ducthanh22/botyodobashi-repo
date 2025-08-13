const fs = require('fs');
const path = './cookies.json';
const { sendToDiscord } = require('../discord/hook');

class Auth {
  constructor(page) {
    this.page = page;
  }

  deleteCookieFileIfExists() {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
      console.log('✅ Cookie cũ đã bị xóa.');
    } else {
      console.log('ℹ️ Không có file cookie để xóa.');
    }
  }

  async login(loginUrl, userName, userPassword) {
  try {
    await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
    const insertName = 'input#memberId';
    const insertPassword = 'input#password';
    const loginButton = 'a.btnRed';
    const errorSelector = 'div.errBox';
    await this.page.waitForSelector(insertName);
    await this.page.waitForSelector(insertPassword);
    await this.page.type(insertName, userName);
    await this.page.type(insertPassword, userPassword);
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.page.click(loginButton)
    ]);
    // Kiểm tra thông báo lỗi đăng nhập
    const errorBox = await this.page.$(errorSelector);
    if (errorBox) {
      const errorText = await this.page.evaluate(el => el.innerText, errorBox);
      if (errorText.includes("正しく入力されていない項目があります")) {
        await this.page.close();
        throw new Error("❌ Sai tài khoản hoặc mật khẩu.");
      }
    }

    console.log("✅ Đăng nhập thành công");

  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new Error("❌ Mạng chậm khi xác nhận đơn.");
    }
    throw err;
  }
}


  async saveCookies() {
    const cookies = await this.page.cookies();
    fs.writeFileSync(path, JSON.stringify(cookies, null, 2));
    console.log('✅ Cookie đã được lưu vào cookies.json');
  }
}

module.exports = Auth;
