class waitTime{
     constructor(page) {
    this.page = page;
  }

    async waitUntilTimeSmart(targetTimeStr) {
        const [targetHour, targetMinute] = targetTimeStr.split(':').map(Number);
        const targetTime = targetHour * 60 + targetMinute;
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const currentSecs = now.getSeconds();

        const remainingMinutes = targetTime - currentMins;
       return remainingMinutes;
   }

   async beforeLogin(targetTimeStr){
       
    while (true) {
       const remainingMinutes = await this.waitUntilTimeSmart(targetTimeStr);
      let waitTime = (remainingMinutes / 2) * 60 * 1000;
      if (remainingMinutes <= 2)  break;;
      console.log(`🕒 Còn ${remainingMinutes} phút`);
      await new Promise(r => setTimeout(r, waitTime));
    }

   }
    async afterLogin(targetTimeStr){
        while (true) {
        const remainingMinutes = await this.waitUntilTimeSmart(targetTimeStr);
        if (remainingMinutes <= 0) {
            console.log(`⏰ Đã đến giờ chạy: ${targetTimeStr}`);
            break;
        }
        await new Promise(r => setTimeout(r, waitTime));
        }
   }

}
module.exports = waitTime;