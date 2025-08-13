window.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('env-form');
  const runBtn = document.getElementById('runBtn');
  const output = document.getElementById('output');
  const stopBtn = document.getElementById('stopBtn');


  // Load config và gán vào form (nếu có form)
  if (form) {
     const permission = await window.permissionAPI.check();

    if (!permission.success) {
      output.textContent = '❌ Thiết bị chưa được duyệt: ' + (permission.error || 'vui lòng đợi admin duyệt');
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
    document.getElementById('time').value = config.RUN_AT || '';
    document.getElementById('credit_Code').value = config.credit_Code || '';
    document.getElementById('password_Credit').value = config.passWord || '';
    document.getElementById('code_Confirm').value = config.code_Confirm || '';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newConfig = {
        LOGIN: config.LOGIN,
        PRODUCT_URL: document.getElementById('productUrl').value,
        USER_NAME: document.getElementById('username').value,
        USER_PASSWORD: document.getElementById('password').value,
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

  // Gán sự kiện nút chạy bot
  if (runBtn && output) {
    console.log('⚙️ Gán sự kiện runBtn');
    runBtn.addEventListener('click', async () => {
  output.textContent = '🟡 Đang kiểm tra quyền thiết bị...';

  try {
    const permission = await window.permissionAPI.check();

    if (!permission.success) {
      output.textContent = '❌ Thiết bị chưa được duyệt: ' + (permission.error || 'vui lòng đợi admin duyệt');
      return;
    }

    output.textContent = '🟡 Đang chạy bot...';

    const result = await window.botAPI.run();
    console.log('📥 Kết quả:', result);

    if (result.error) {
      output.textContent = '❌ Lỗi khi chạy bot: ' + result.error;
    } else {
      output.textContent = '✅ Bot đã chạy thành công!';
    }
  } catch (e) {
    output.textContent = '❌ Lỗi hệ thống khi chạy bot.';
    console.error(e);
  }
});

  } else {
    console.warn('⚠️ Không tìm thấy runBtn hoặc output trong DOM');
  }
});
