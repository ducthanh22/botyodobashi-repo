window.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('hook-form');


  // Load config và gán vào form (nếu có form)
  if (form) {
     const permission = await window.permissionAPI.check();

    if (!permission.success) {
      window.location.href='../ui/register.html'
      alert ('❌ Thiết bị chưa được duyệt: ' + (permission.error || 'vui lòng đợi admin duyệt')) ;
      return;
    }

    // document.getElementById('urlhook').value = config.urlhook || '';

   form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const modal = document.getElementById('loadingModal');
  modal.style.display = 'block'; // 👉 Hiện modal

  const newConfig = {
    urlweb: document.getElementById('urlweb').value,
  };

  try {
    const result = await window.hookUserAPI.check(newConfig);

    modal.style.display = 'none'; // 👉 Ẩn modal

    if (result.success) {
      alert('✅ Đã gửi về Discord!');
    } else {
      alert('❌ Lỗi khi gửi: ' + result.error);
    }
  } catch (err) {
    modal.style.display = 'none'; // 👉 Ẩn modal
    alert('❌ Lỗi không xác định: ' + (err.message || err));
  }
});

  }


});
