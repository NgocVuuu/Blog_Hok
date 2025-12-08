# 📅 HoK Meta Auto-Sync Scheduling Guide

Hướng dẫn setup tự động cập nhật hero meta **mỗi tuần 1 lần**.

---

## 🎯 Phương pháp

Có 2 cách để schedule auto-sync:

### **Phương pháp 1: Node-cron (Recommended) ⭐**
- Chạy trong Node.js server
- Tự động khi server running
- Dễ monitor và debug

### **Phương pháp 2: Windows Task Scheduler**
- Chạy độc lập, không cần server
- Chạy ngay cả khi server tắt
- Dùng Task Scheduler của Windows

---

## 📋 Phương pháp 1: Node-cron (Trong Server)

### Cấu hình

File đã được tạo: `services/hokMetaScheduler.js`

### Tích hợp vào Server

**Thêm vào `server.js`:**

```javascript
// Import scheduler
const { scheduler } = require('./services/hokMetaScheduler');

// Sau khi connect DB thành công
connectDB().then(() => {
  console.log('✅ MongoDB connected');
  
  // Start scheduler - Mỗi Chủ nhật 3:00 AM
  if (process.env.ENABLE_AUTO_SYNC === 'true') {
    scheduler.start('0 3 * * 0');  // Cron expression
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  scheduler.stop();
  process.exit(0);
});
```

### Cấu hình Schedule

**Trong `.env`:**

```env
# Enable auto-sync
ENABLE_AUTO_SYNC=true

# Optional: Custom schedule (cron expression)
# HOK_SYNC_SCHEDULE=0 3 * * 0
```

### Cron Expression Examples

| Expression | Meaning |
|------------|---------|
| `0 3 * * 0` | Mỗi Chủ nhật lúc 3:00 AM |
| `0 3 * * 1` | Mỗi Thứ 2 lúc 3:00 AM |
| `0 2 * * 0,3` | Chủ nhật và Thứ 4 lúc 2:00 AM |
| `0 0 1 * *` | Ngày 1 hàng tháng lúc 0:00 |
| `0 */6 * * *` | Mỗi 6 giờ |

### API Endpoints (Optional)

Thêm routes để control scheduler:

```javascript
// In routes/meta.js
router.get('/sync/status', (req, res) => {
  const status = scheduler.getStatus();
  res.json(status);
});

router.post('/sync/run-now', async (req, res) => {
  scheduler.runSync();
  res.json({ message: 'Sync started' });
});
```

### Check Status

```javascript
const status = scheduler.getStatus();
console.log(status);
/*
{
  running: true,
  isCurrentlyRunning: false,
  lastRun: 2025-12-08T03:00:00.000Z,
  lastResult: { success: true, matched: 109, ... },
  nextRun: 2025-12-15T03:00:00.000Z
}
*/
```

---

## 📋 Phương pháp 2: Windows Task Scheduler

### Bước 1: Tạo Scheduled Task

1. **Mở Task Scheduler:**
   ```
   Windows Key + R → taskschd.msc → Enter
   ```

2. **Create Basic Task:**
   - Click "Create Basic Task" (bên phải)
   - Name: `HoK Meta Auto-Sync`
   - Description: `Weekly hero meta data synchronization`

3. **Trigger:**
   - Chọn: `Weekly`
   - Day: `Sunday`
   - Time: `3:00 AM`
   - Recur every: `1 weeks`

4. **Action:**
   - Chọn: `Start a program`
   - Program/script: `cmd.exe`
   - Add arguments:
     ```
     /c "C:\Users\ADMIN\OneDrive - swqpz\Desktop\BlogHok\apps\server\scripts\runHoKSync.bat"
     ```
   - Start in:
     ```
     C:\Users\ADMIN\OneDrive - swqpz\Desktop\BlogHok\apps\server
     ```

5. **Settings:**
   - ✅ Run whether user is logged on or not
   - ✅ Run with highest privileges
   - ✅ If task fails, restart every: 10 minutes (max 3 attempts)

### Bước 2: Test Task

**Run manually:**
```
Right-click task → Run
```

**Check logs:**
```bash
type logs\hok-sync.log
```

### Bước 3: Monitor

**View task history:**
```
Task Scheduler → Select task → History tab
```

---

## 📊 So sánh 2 phương pháp

| Feature | Node-cron | Task Scheduler |
|---------|-----------|----------------|
| **Setup** | Dễ (code) | Khó (UI) |
| **Monitor** | Dễ (logs) | Khó (Event Viewer) |
| **Dependencies** | Cần server running | Độc lập |
| **Flexibility** | Cao (code) | Thấp (UI) |
| **Restart** | Auto (với server) | Manual |
| **Resources** | Chia sẻ với server | Riêng biệt |

**Recommend:** Dùng **Node-cron** nếu server luôn chạy, dùng **Task Scheduler** nếu cần độc lập.

---

## 🔍 Monitoring & Logs

### Node-cron Logs

Logs tự động được ghi trong console server:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 [HoK Scheduler] Starting scheduled sync...
⏰ Time: 2025-12-08T03:00:00.000Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[HoK Puppeteer] Launching browser...
[HoK Puppeteer] ✅ Captured getranklist API response!
✅ Fetch completed in 7368ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ [HoK Scheduler] Sync completed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Task Scheduler Logs

Location: `logs/hok-sync.log`

```
[12/08/2025 03:00:15] Sync completed with exit code 0
[12/15/2025 03:00:22] Sync completed with exit code 0
[12/22/2025 03:00:18] Sync completed with exit code 0
```

---

## ⚠️ Troubleshooting

### Node-cron Issues

**Scheduler không chạy:**
```env
# Check env variable
ENABLE_AUTO_SYNC=true

# Check server logs
npm start
# Should see: [HoK Scheduler] Starting with schedule...
```

**Sync fails:**
```javascript
// Check status
GET /api/meta/sync/status

// View last error
scheduler.getStatus().lastResult
```

### Task Scheduler Issues

**Task không chạy:**
1. Check task is enabled
2. Check user has permissions
3. Check Start in directory is correct
4. Run manually to test

**Script errors:**
```bash
# Test script manually
cd apps\server
scripts\runHoKSync.bat
```

---

## 🔔 Notifications (Optional)

### Email Notification

Thêm vào `hokMetaScheduler.js`:

```javascript
async _sendNotification(result) {
  // Use nodemailer or similar
  await sendEmail({
    to: 'admin@example.com',
    subject: '✅ HoK Meta Sync Completed',
    body: `
      Sync completed successfully!
      - Matched: ${result.stats.matched}
      - Updated: ${result.stats.updated}
      - Time: ${result.totalTime}ms
    `
  });
}
```

### Discord Webhook

```javascript
async _sendNotification(result) {
  await axios.post(process.env.DISCORD_WEBHOOK_URL, {
    content: `✅ HoK Meta synced! Updated ${result.stats.updated} heroes.`
  });
}
```

---

## 📝 Best Practices

1. **Backup before sync:** Always use `--save-file` flag
2. **Test with dry-run** first: `npm run sync-hok:auto:dry`
3. **Monitor logs** regularly
4. **Set up error notifications** for production
5. **Schedule during low-traffic** hours (3-4 AM)
6. **Keep heroNameMap.json** updated for new heroes

---

## 🎯 Quick Reference

```bash
# Manual run
npm run sync-hok:auto

# Check schedule status (if using Node-cron)
GET /api/meta/sync/status

# View Windows Task
taskschd.msc

# Check logs
type logs\hok-sync.log

# Test batch script
scripts\runHoKSync.bat
```

---

## 🚀 Next Steps

1. ✅ Choose scheduling method (Node-cron or Task Scheduler)
2. ✅ Configure schedule (weekly Sunday 3AM recommended)
3. ✅ Test run manually
4. ✅ Monitor first automatic run
5. ✅ Set up notifications (optional)
6. ✅ Document any unmatched heroes

---

**Happy automating! 🤖**
