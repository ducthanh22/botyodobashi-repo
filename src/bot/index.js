
const { sendToDiscord,sendUser } = require('../discord/hook');
const {generateDeviceId}=require("../firebase/genarateID")
class Bot {
  constructor(page) {
    this.page = page;
  }

  async goToProductPage(productUrl) {
    try {
      await this.page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      // console.log('✅ Đã vào trang sản phẩm');
    } catch (err) {
      if (err.name === 'TimeoutError') {
        throw new Error('❌ Mạng chậm, vui lòng thử lại sau');
      }
      throw err;
    }
  }
  async addCart(quantity) {
    try {
      await this.page.waitForSelector('#qtySel', { timeout: 8000 });
      await this.page.select('#qtySel', quantity);
    } catch (err){
     return { error: '❌ Sản phẩm hết hàng hoặc không chọn được số lượng' };
    }

    const addToCartSelector = 'a#js_m_submitRelated';
    let maxRetry = 3;

    for (let retry = 1; retry <= maxRetry; retry++) {
      try {
        await this.page.waitForSelector(addToCartSelector, { timeout: 60000 });
        await Promise.all([
          this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
          this.page.click(addToCartSelector),
        ]);
        // console.log("🛒 Đã click nút thêm vào giỏ hàng!");
        break;
      } catch (error) {
        if (error.name === 'TimeoutError') {
          console.warn(`⚠️ Lần ${retry}: Mạng chậm -> reload lại trang...`);
        } else {
          console.warn(`⚠️ Lần ${retry}: Lỗi không xác định ->`, error.message);
        }

        await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
        await new Promise(r => setTimeout(r, 1000));
      }

      if (retry === maxRetry) {
        throw new Error("❌ Thử nhiều lần nhưng vẫn không thấy nút thêm vào giỏ.");
      }
    }
    // Click "購入手続きに進む"
    try {
      await this.page.waitForSelector('li.ml05 div.strcBtn30 a.btnRed', { timeout: 60000 });
    } catch {
      throw new Error("❌ Mạng chậm, không load được nút thanh toán.");
    }
    const buttons = await this.page.$$('li.ml05 div.strcBtn30 a.btnRed');
    let clicked = false;
    for (const btn of buttons) {
      const spanText = await btn.$eval('span', el => el.textContent.trim());
      if (spanText === '購入手続きに進む') {
        try {
          await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
            btn.click(),
          ]);
          clicked = true;
          break;
        } catch (err) {
          if (err.name === 'TimeoutError') {
            throw new Error("❌ Mạng chậm, không vào được trang thanh toán.");
          }
          throw err;
        }
      }
    }
    if (!clicked) throw new Error("❌ Không tìm thấy nút '購入手続きに進む'");
    // Vào tài khoản nếu có
    const addToAccountSelector = 'a.yBtnText';
    let canGoAccount;
    try {
      canGoAccount = await this.page.waitForSelector(addToAccountSelector, { timeout: 600000 });
    } catch {
      throw new Error("❌ Mạng chậm vui lòng thử lại sau");
    }
    if (canGoAccount) {
      try {
        await Promise.all([
          this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 600000 }),
          this.page.click(addToAccountSelector)
        ]);
      } catch (err) {
        if (err.name === 'TimeoutError') {
          throw new Error("❌ Mạng chậm vui lòng thử lại sau");
        }
        throw err;
      }
    }
  }

  async addCode(bacode) {
    // console.log("➡️ Đã vào trang thanh toán");
    const inputSelector = 'input[name="creditCard.securityCode"]';
    const confirmSelector = 'a.btnRed';
    const canInsertCode = await this.page.waitForSelector(inputSelector, { timeout: 600000 }).catch(() => null);
    const canConfirm = await this.page.waitForSelector(confirmSelector, { timeout: 600000 }).catch(() => null);

    if (canInsertCode && canConfirm) {
      await this.page.evaluate((sel) => {
        document.querySelector(sel).value = '';
      }, inputSelector);
      try {
        await Promise.all([
          this.page.type(inputSelector, bacode),
          this.page.click(confirmSelector),
          this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 })
        ]);
        // console.log("✅ đã nhập mã thẻ thành công!");
      } catch (err) {
        if (err.name === 'TimeoutError') {
          throw new Error("❌ Mạng chậm khi xác nhận đơn.");
        }
        throw err;
      }
    } else {
      throw new Error("❌ Không thấy input hoặc nút xác nhận.");
    }
  }
async checkOrderCode() {
  try {
    const deviceID=generateDeviceId()
    const orderCode = '.orderFinishItemInfo strong.fs12.red.ml15.alignM';
    if(orderCode){
       // Chờ phần tử chứa mã đơn hàng xuất hiện
    await this.page.waitForSelector(orderCode, { timeout: 60000 });
    // Lấy nội dung văn bản
    const orderText = await this.page.$eval(orderCode, el => el.textContent.trim());
    // Tách mã đơn hàng bằng regex
    const match = orderText.match(/ご注文番号：(\d+)/);
    // console.log('match',match)
    if (match && match[1]) {
      const orderCode = match[1];
      await sendToDiscord(`🔔 Bot đã mua xong sản phẩm cho thiết bị: ${deviceID}\n✅ Mã đơn hàng: ${orderCode}`);
      await sendUser(`https://www.yodobashi.com/\n❌ Đặt đơn thất bại`)
      // console.log("✅ Mã đơn hàng:", orderCode);
      // console.log("✅ Xác nhận chốt đơn!");
      return orderCode;
    } else {
         await sendUser(`https://www.yodobashi.com/\n❌ Đặt đơn thất bại`)
      throw new Error("❌ Đặt hàng thất bại");
    }
    }
  } catch (err) {
      await sendUser(`https://www.yodobashi.com/\n❌ Đặt đơn thất bại`)
    throw new Error("❌ Đặt hàng thất bại");
    // console.error("❌ Lỗi khi lấy mã đơn hàng:", err);
    // return null;
  }
}

}

module.exports = Bot;
