const axios = require('axios');

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1400359986357469224/C9jw0XsPHuriUbC0vxSbw5CFYegsk3_1f5gNxV56kLbeep-Xsp8sXjSPqDeFEdbEC7sW'; // Dán URL webhook thật vào đây

async function sendToDiscord(message) {
  try {
    await axios.post(WEBHOOK_URL, {
      content: message
    });
    console.log('✅ Đã gửi message về Discord.');
  } catch (error) {
    console.error('❌ Lỗi gửi message về Discord:', error.message);
  }
}

async function sendUser(url,mes) {
  try { 
    await axios.post(url,{
      content: mes
    })}
    catch(err){
      throw err.message;
    }
  
}

module.exports = { sendToDiscord, sendUser };
