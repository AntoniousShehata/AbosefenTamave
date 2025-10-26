# 🚀 Quick Start Guide

## ⚡ Start Your Project (5 Steps)

### 1️⃣ Start Backend
```powershell
cd backend
docker-compose up -d
```

### 2️⃣ Start Ngrok
```powershell
ngrok http 8080 --host-header=rewrite
```

**Copy the Forwarding URL:**
```
https://abc123def456.ngrok-free.app
```

### 3️⃣ Update Vercel
1. Go to: https://vercel.com/antoniousshehatas-projects/abosefen-tamave/settings/environment-variables
2. Edit `VITE_API_URL` = `https://abc123def456.ngrok-free.app` (your ngrok URL)
3. Save

### 4️⃣ Redeploy Vercel
1. Go to Deployments
2. Click "..." → "Redeploy"
3. **Uncheck** "Use existing build cache"
4. Wait 2-3 minutes

### 5️⃣ Test!
- **URL**: https://abosefen-tamave.vercel.app
- **Login**: admin@abosefen.com / Tmaher123@

---

## 🔄 When Ngrok Restarts

**The URL changes every time!** You must:

1. ✅ Get new ngrok URL from terminal
2. ✅ Update `VITE_API_URL` in Vercel  
3. ✅ Redeploy Vercel (fresh build)

---

## 💡 Important Notes

- ⚠️ Keep ngrok window **open** while using the app
- ⚠️ Your **laptop must be on** with Docker running
- ⚠️ Free ngrok tier = **1 tunnel** at a time
- ⚠️ Ngrok URL **changes** every restart

---

## 🆘 Common Issues

### Products Not Loading?
- Check if `VITE_API_URL` in Vercel matches current ngrok URL
- Redeploy Vercel with fresh build

### Login Failed?
- Verify Docker services are running: `docker-compose ps`
- Check ngrok is active: visit http://localhost:4040

### "Only 1 Tunnel Allowed"?
```powershell
Get-Process ngrok | Stop-Process
ngrok http 8080 --host-header=rewrite
```

---

## 📚 Full Documentation

See **README.md** for complete guide including:
- Complete ngrok setup
- Troubleshooting all issues
- Architecture details
- API documentation

---

## 🔗 Quick Links

- **Production App**: https://abosefen-tamave.vercel.app
- **Vercel Dashboard**: https://vercel.com/antoniousshehatas-projects/abosefen-tamave
- **Ngrok Dashboard**: http://localhost:4040 (when running)
- **MongoDB Admin**: http://localhost:8081/mongo-admin/ (admin/admin)

