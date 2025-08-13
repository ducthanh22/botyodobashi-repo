window.addEventListener('DOMContentLoaded', async () => {
  const register = document.getElementById('register-form');

   register.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newConfig = {
        email:document.getElementById('email').value,
        name: document.getElementById('name').value,
      };

      console.log('💾 Register config:', newConfig);

      const result = await window.deviceAPI.register(newConfig);
      if (result.success) {
        alert('✅ Đã đăng kí đợi admin duyệt!');
      } else {
        alert('❌ Lỗi khi lưu: ' + result.error);
      }
    });

})