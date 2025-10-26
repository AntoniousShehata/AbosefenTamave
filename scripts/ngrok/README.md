# 🌐 Ngrok Tunnel Scripts

Quick-start scripts for exposing your local Abosefen services to the internet using ngrok.

## ⚡ Quick Start (First Time Users)

**Haven't installed ngrok yet?** Read: `../../START_HERE.md`

**Already have ngrok?** Jump to: [Available Scripts](#-available-scripts)

## 📋 Prerequisites

1. **Install Ngrok**
   
   Download from: https://ngrok.com/download
   Extract to: `C:\Users\YOUR_USERNAME\ngrok\ngrok.exe`
   
   **Note:** Our scripts automatically find ngrok in common locations:
   - System PATH
   - `%USERPROFILE%\ngrok\`
   - Project folder
   - Current directory

2. **Get Ngrok Authtoken**
   - Sign up: https://dashboard.ngrok.com/signup
   - Get token: https://dashboard.ngrok.com/get-started/your-authtoken
   - Configure:
   ```powershell
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

3. **Start Docker Services**
   ```powershell
   cd backend
   docker-compose up -d
   ```

## 🚀 Available Scripts

### 1. MongoDB Tunnel (TCP)
Expose MongoDB database directly:
```powershell
.\scripts\ngrok\start-mongodb-tunnel.ps1
```

**What you get:**
- Direct MongoDB connection from anywhere
- URL like: `tcp://0.tcp.ngrok.io:12345`
- Connect with any MongoDB client (Compass, Shell, Code)

**Connection String:**
```
mongodb://admin:AbosefenMongo2024!@0.tcp.ngrok.io:12345/abosefen-catalog?authSource=admin
```

### 2. Mongo Express UI Tunnel (HTTP)
Expose MongoDB web admin interface:
```powershell
.\scripts\ngrok\start-mongo-express-tunnel.ps1
```

**What you get:**
- Web-based MongoDB admin interface
- URL like: `https://xxxx-xx-xx-xx.ngrok-free.app`
- Access from any browser worldwide

**Login Credentials:**
- Username: `admin`
- Password: `admin`

### 3. All Tunnels (Multiple Services)
Start multiple tunnels simultaneously:
```powershell
.\scripts\ngrok\start-all-tunnels.ps1
```

**What you get:**
- MongoDB (TCP) + Mongo Express (HTTP) + API Gateway (HTTP)
- All services accessible via their own URLs
- Centralized monitoring

## 📊 Monitoring

### Ngrok Web Interface
```
http://127.0.0.1:4040
```

View:
- Active tunnels and their URLs
- Real-time request/response logs
- Connection statistics
- Traffic inspection

## 🔒 Security Tips

1. **Change Default Passwords**
   ```yaml
   # In docker-compose.yml
   MONGO_INITDB_ROOT_PASSWORD: YourStrongPassword123!
   ```

2. **Add HTTP Authentication**
   ```powershell
   ngrok http 8081 --auth "user:password"
   ```

3. **Use Only When Needed**
   - Start tunnels only when required
   - Stop when done: `Ctrl+C`
   - Monitor access logs

4. **Consider Paid Plan for Production**
   - Reserved domains
   - IP whitelisting
   - Better security features

## 🎯 Common Use Cases

### Remote Development
```powershell
# Expose Mongo Express for team access
.\scripts\ngrok\start-mongo-express-tunnel.ps1
```

### Client Demo
```powershell
# Show full system (API + Database UI)
.\scripts\ngrok\start-all-tunnels.ps1
```

### External Integration Testing
```powershell
# Expose MongoDB for external app testing
.\scripts\ngrok\start-mongodb-tunnel.ps1
```

### Mobile App Testing
```powershell
# API Gateway for mobile app
ngrok http 8080
```

## 🛠️ Troubleshooting

### "Docker container not running"
```powershell
cd backend
docker-compose up -d
docker ps  # Verify services are running
```

### "Ngrok not found"
```powershell
# Check installation
ngrok version

# Install if needed
choco install ngrok
```

### "Connection refused"
```powershell
# Check if service is listening
netstat -an | findstr "27017"  # MongoDB
netstat -an | findstr "8081"   # Mongo Express
```

### "Tunnel failed to start"
```powershell
# Check if authtoken is configured
ngrok config check

# Add token
ngrok config add-authtoken YOUR_TOKEN
```

## 📚 Examples

### Connect from MongoDB Compass
1. Start tunnel:
   ```powershell
   .\scripts\ngrok\start-mongodb-tunnel.ps1
   ```

2. Copy ngrok URL (e.g., `0.tcp.ngrok.io:12345`)

3. In Compass, use connection string:
   ```
   mongodb://admin:AbosefenMongo2024!@0.tcp.ngrok.io:12345/abosefen-catalog?authSource=admin
   ```

### Access via Web Browser
1. Start tunnel:
   ```powershell
   .\scripts\ngrok\start-mongo-express-tunnel.ps1
   ```

2. Copy HTTPS URL from ngrok output

3. Open in browser, login with:
   - Username: `admin`
   - Password: `admin`

### Node.js Application
```javascript
// After starting MongoDB tunnel
const mongoose = require('mongoose');

const NGROK_URL = 'mongodb://admin:AbosefenMongo2024!@0.tcp.ngrok.io:12345/abosefen-catalog?authSource=admin';

mongoose.connect(NGROK_URL)
  .then(() => console.log('Connected via ngrok!'))
  .catch(err => console.error('Error:', err));
```

## 🌟 Pro Tips

1. **Keep Terminal Open**
   - Ngrok requires the terminal to stay open
   - Closing terminal stops the tunnel

2. **Save URLs**
   - Free plan gives random URLs each time
   - Copy and save the URL for your session
   - Paid plan gives permanent URLs

3. **Monitor Traffic**
   - Use http://127.0.0.1:4040 to see all requests
   - Great for debugging

4. **Test Locally First**
   - Always test locally before exposing
   - Verify Docker services are healthy

5. **Use Environment Variables**
   - Don't hardcode ngrok URLs in code
   - Use `.env` files for configuration

## 🔗 Useful Links

- Ngrok Documentation: https://ngrok.com/docs
- Ngrok Dashboard: https://dashboard.ngrok.com
- MongoDB Docs: https://www.mongodb.com/docs
- Docker Compose Reference: https://docs.docker.com/compose

---

**Happy Tunneling! 🚀**

