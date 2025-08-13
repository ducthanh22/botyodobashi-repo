window.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('env-form');


  // Load config và gán vào form (nếu có form)
  if (form) {
     const permission = await window.permissionAPI.check();

    if (!permission.success) {
      window.location.href='../ui/register.html'
      alert ('❌ Thiết bị chưa được duyệt: ' + (permission.error || 'vui lòng đợi admin duyệt')) ;
      return;
    }
    const config = await window.configAPI.load();

    if (config.error) {
      alert('❌ Lỗi khi tải cấu hình: ' + config.error);
      return;
    }

    document.getElementById('username').value = config.USER_NAME || '';
    document.getElementById('password').value = config.USER_PASSWORD || '';
    document.getElementById('productUrl').value = config.PRODUCT_URL || '';
    document.getElementById('quantity').value = config.QUANTITY || '';
    document.getElementById('urlhook').value = config.url_hook || '';
    document.getElementById('time').value = config.RUN_AT || '';
    document.getElementById('credit_Code').value = config.credit_Code || '';
    document.getElementById('password_Credit').value = config.passWord || '';
    document.getElementById('code_Confirm').value = config.code_Confirm || '';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newConfig = {
        LOGIN: config.LOGIN,
        PRODUCT_URL: document.getElementById('productUrl').value,
        url_hook: document.getElementById('urlhook').value,
        USER_NAME: document.getElementById('username').value,
        USER_PASSWORD: document.getElementById('password').value,
        QUANTITY: document.getElementById('quantity').value,

        RUN_AT: document.getElementById('time').value,
        credit_Code: document.getElementById('credit_Code').value,
        passWord: document.getElementById('password_Credit').value,
        code_Confirm: document.getElementById('code_Confirm').value
      };

      console.log('💾 Saving config:', newConfig);

      const result = await window.configAPI.save(newConfig);
      if (result.success) {
        alert('✅ Đã lưu cấu hình!');
      } else {
        alert('❌ Lỗi khi lưu: ' + result.error);
      }
    });
  }


});
