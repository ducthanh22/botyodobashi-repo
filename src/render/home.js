window.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('env-form');
  const runBtn = document.getElementById('runBtn');
  const output = document.getElementById('output');
  const stopBtn = document.getElementById('stopBtn');

  // Gán sự kiện nút chạy bot
  if (runBtn && output) {
    console.log('⚙️ Gán sự kiện runBtn');
    runBtn.addEventListener('click', async () => {
  output.textContent = '🟡 Đang kiểm tra quyền thiết bị...';

  try {
    const permission = await window.permissionAPI.check();
    if (!permission.success) {
      window.location.href='../ui/register.html';

      alert ('❌ Thiết bị chưa được duyệt: ' + (permission.error || 'vui lòng đợi admin duyệt')) ;
      return;
    }

    output.textContent = '🟡 Đang chạy bot...';

    const resultrun = await window.botAPI.run();
    console.log('📥 Kết quả:', resultrun);

    if (resultrun.error) {
      output.textContent = '❌ Lỗi khi chạy bot: ' + result.error;
    } else {
      output.textContent = '✅ Bot đã chạy thành công!';
    }
  } catch (e) {
    output.textContent = '❌ Lỗi hệ thống khi chạy bot.';
    console.error(e);
  }
});

  } 
  if (stopBtn && output) {
    console.log('⚙️ Gán sự kiện runBtn');
    stopBtn.addEventListener('click', async () => {
  output.textContent = '🟡 Đang kiểm tra quyền thiết bị...';

  try {
    const permission = await window.permissionAPI.check();

    if (!permission.success) {
      window.location.href='../ui/register.html';
      alert ('❌ Thiết bị chưa được duyệt: ' + (permission.error || 'vui lòng đợi admin duyệt')) ;
      return;
    }


    const result = await window.stopBotAPI.stop();
    console.log('📥 Kết quả:', result);

    if (result.error) {
      output.textContent = '❌ Lỗi khi chạy bot: ' + result.error;
    } else {
      output.textContent = '🟡 Bot đã dừng thành công!';
    }
  } catch (e) {
    output.textContent = '❌ Lỗi hệ thống khi chạy bot.';
    console.error(e);
  }
});

  } 
  
  
  else {
    console.warn('⚠️ Không tìm thấy runBtn hoặc output trong DOM');
  }
});
