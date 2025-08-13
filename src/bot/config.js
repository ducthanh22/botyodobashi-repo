require('dotenv').config();
const configs = require('../config/config')

function getConfig() {
//   const { LOGIN, PRODUCT_URL, USER_NAME, USER_PASSWORD, RUN_AT } = process.env;
//   if (!LOGIN || !PRODUCT_URL || !USER_NAME || !USER_PASSWORD) {
//     console.error("❌ Thiếu biến môi trường trong file .env");
//     return null;
//   }
//   return { login: LOGIN, productUrl: PRODUCT_URL, userName: USER_NAME, userPassword: USER_PASSWORD, runAt: RUN_AT };
// }
  
  if (!configs.LOGIN || !configs.PRODUCT_URL || !configs.USER_NAME || !configs.USER_PASSWORD || !configs.RUN_AT||!configs.credit_Code||!configs.passWord||!configs.code_Confirm) {
    console.error("❌ Thiếu biến môi trường trong file .env");
    return null;
  }
  return { login: configs.LOGIN, productUrl: configs.PRODUCT_URL, userName: configs.USER_NAME, userPassword: configs.USER_PASSWORD, runAt: configs.RUN_AT ,credit_Code:configs.credit_Code,passWord:configs.passWord,code_Confirm:configs.code_Confirm};
}
module.exports = { getConfig };
