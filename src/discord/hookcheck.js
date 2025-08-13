
const { sendToDiscord,sendUser } = require('../discord/hook');
const {generateDeviceId}=require("../firebase/genarateID")
const axios = require('axios');
const cheerio = require('cheerio');


  async function hookCheck(urlweb, urlhook) {
  try {
    const response = await axios.get(urlweb, {
      headers: {
        'User-Agent': 'Mozilla/5.0', // tránh bị chặn
      },
      timeout: 15000,
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const addToCart = $('a#js_m_submitRelated');

    if (addToCart.length > 0) {
      await sendUser(urlhook, `✅ Sản phẩm đã mở bán\n${urlweb}`);
    } else {
      await sendUser(urlhook, `⚠️ Sản phẩm hết hàng\n${urlweb}`);
    }

    // return { success: true };
  } catch (err) {
    console.error('❌ Lỗi khi kiểm tra sản phẩm:', err.message);
    await sendUser(urlhook, `❌ Lỗi khi kiểm tra sản phẩm: ${err.message}`);
    // return { success: false, error: err.message };
  }
  }
  module.exports = {
    hookCheck,
  };