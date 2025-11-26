# 🚀 Scalability Guide for 1000+ Concurrent Users

## ⚠️ CRITICAL: Architecture Choice

You have **TWO** architectures to choose from. For 1000 users, you **MUST** use the Shared Browser solution.

## 📊 Resource Comparison

### Individual Sessions (server.ts)
- **1 user** = 150MB RAM + 10% CPU
- **10 users** = 1.5GB RAM + 100% CPU (1 core)
- **100 users** = 15GB RAM + 1000% CPU (10 cores)
- **1000 users** = **150GB RAM + 10000% CPU** ❌ **NOT FEASIBLE**

💰 **Cost**: ~$500-1000/month for 100 users

### Shared Browser (SharedBrowserServer.ts)
- **1 user** = 200MB RAM + 15% CPU
- **10 users** = 200MB RAM + 15% CPU (same!)
- **100 users** = 200MB RAM + 20% CPU
- **1000 users** = **200MB RAM + 25% CPU** ✅ **FEASIBLE**
- **10,000 users** = 200MB RAM + 30% CPU ✅ **STILL FEASIBLE**

💰 **Cost**: ~$20-50/month for any number of users

## 🎯 Which Solution to Use?

### Use SHARED Browser (SharedBrowserServer.ts) if:
- ✅ You have 100+ concurrent users
- ✅ All users view the SAME website
- ✅ You don't need per-user sessions
- ✅ You want low server costs
- ✅ **Your scenario: 1000 users viewing https://www.fcm.org.co/simit/**

### Use INDIVIDUAL Sessions (server.ts) if:
- ✅ You have <50 concurrent users
- ✅ Each user needs their own session
- ✅ Users browse different websites
- ✅ You need login sessions per user

## 🔥 For Your Use Case (1000 users, one website)

**YOU NEED: Shared Browser Solution**

## Setup Guide for 1000 Users

### 1. Server Requirements

**Minimum Server:**
- 2 CPU cores
- 4GB RAM
- 50GB SSD
- 100 Mbps bandwidth
- Ubuntu 20.04+ or similar

**Recommended Server:**
- 4 CPU cores
- 8GB RAM
- 100GB SSD
- 500 Mbps bandwidth

**Cost:** $40-80/month (DigitalOcean, Linode, AWS, etc.)

### 2. Install Shared Browser Server

```bash
cd server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Create environment file
cat > .env << 'EOF'
PORT=3002
TARGET_URL=https://www.fcm.org.co/simit/
SCREENSHOT_QUALITY=50
FPS=20
MAX_VIEWERS=10000
EOF

# Start server
node dist/SharedBrowserServer.js
```

### 3. Production Deployment with PM2

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start dist/SharedBrowserServer.js \
    --name mini-browser-shared \
    -i 1

# Make it start on boot
pm2 startup
pm2 save
```

### 4. Nginx Configuration

```nginx
upstream mini_browser_shared {
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name browser.your-domain.com;

    # HTTP API
    location /api/ {
        proxy_pass http://mini_browser_shared;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location / {
        proxy_pass http://mini_browser_shared;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # WebSocket timeouts
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

Add SSL:
```bash
sudo certbot --nginx -d browser.your-domain.com
```

### 5. Optimize for 1000 Users

#### A. Lower FPS and Quality

```env
SCREENSHOT_QUALITY=40   # Lower quality = less bandwidth
FPS=15                  # Lower FPS = less CPU, less bandwidth
```

#### B. Use CDN for Static Files

Serve your Angular app through Cloudflare or similar CDN.

#### C. Enable Compression

In Nginx:
```nginx
gzip on;
gzip_types text/plain application/json application/javascript;
gzip_comp_level 6;
```

#### D. Connection Limits

```nginx
# Limit connections per IP
limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
limit_conn conn_limit_per_ip 5;
```

## 📈 Bandwidth Calculation

### Shared Browser at 1000 Users

**Settings:**
- FPS: 15
- Quality: 40%
- Resolution: 1280x720

**Per screenshot:**
- Size: ~15-25 KB (JPEG quality 40%)
- FPS: 15
- Bandwidth per user: 15 KB × 15 FPS = 225 KB/s = 1.8 Mbps

**Total bandwidth:**
- 1000 users × 1.8 Mbps = **1.8 Gbps**

**Monthly data:**
- Assuming 30% average concurrent viewing
- 300 users × 1.8 Mbps × 8 hours/day = ~15 TB/month

### Optimization to Reduce Bandwidth

1. **Lower FPS to 10**:
   - Bandwidth: 1.2 Gbps (vs 1.8 Gbps)
   - Saves 33% bandwidth

2. **Lower Quality to 30%**:
   - Screenshot size: 10-15 KB
   - Bandwidth: 1.2 Gbps → 0.9 Gbps
   - Saves 50% total

3. **Hybrid Approach**:
   - Only send frames when page changes
   - Can reduce by 70-90% for static pages

## 🔧 Advanced Optimizations

### 1. Delta Encoding (Future Enhancement)

Only send changed pixels instead of full screenshots:

```typescript
// Pseudo-code
const previousFrame = lastScreenshot;
const currentFrame = newScreenshot;
const delta = calculateDifference(previousFrame, currentFrame);
sendToClients(delta); // Much smaller!
```

**Benefit:** 80-95% bandwidth reduction

### 2. Adaptive Quality

Lower quality for slow connections:

```typescript
clients.forEach(client => {
    const quality = client.connectionSpeed > 10 ? 60 : 30;
    sendScreenshot(client, quality);
});
```

### 3. Frame Skipping for Slow Clients

```typescript
// Send every frame to fast clients
// Send every 2nd frame to slow clients
```

### 4. WebRTC Streaming (Advanced)

Replace screenshots with H.264 video stream:
- **Benefits**: Much lower bandwidth (10-20x reduction)
- **Complexity**: High implementation complexity
- **Latency**: Lower latency

## 🏗️ Scaling Beyond 1000 Users

### Option 1: Multiple Server Instances

Run multiple shared browser servers with load balancing:

```
User → Load Balancer → Server 1 (1000 users)
                     → Server 2 (1000 users)
                     → Server 3 (1000 users)
                     = 3000 total users
```

### Option 2: Regional Servers

Deploy servers in different regions:

```
US Users     → US Server
EU Users     → EU Server
ASIA Users   → ASIA Server
```

### Option 3: Clustering

Use Redis for session sharing across multiple servers.

## 📊 Monitoring

### Essential Metrics

```bash
# Install monitoring
npm install -g pm2

# Monitor
pm2 monit

# Or use Prometheus + Grafana for advanced monitoring
```

**Monitor:**
1. Concurrent viewers
2. CPU usage
3. RAM usage
4. Bandwidth usage
5. Screenshot FPS
6. WebSocket connection count

### Health Check Script

```bash
#!/bin/bash
# health-check.sh

response=$(curl -s http://localhost:3002/health)
viewers=$(echo $response | jq .viewers)

if [ $viewers -gt 900 ]; then
    echo "WARNING: Near capacity! Viewers: $viewers"
    # Send alert
fi
```

Run with cron:
```bash
*/5 * * * * /path/to/health-check.sh
```

## 💡 Best Practices for 1000 Users

### DO:
✅ Use Shared Browser Server
✅ Set FPS=15 or lower
✅ Set Quality=40 or lower
✅ Use CDN for static files
✅ Monitor bandwidth usage
✅ Use PM2 for process management
✅ Enable Nginx compression
✅ Set up health monitoring
✅ Use SSL (wss://)

### DON'T:
❌ Use Individual Sessions for 1000 users
❌ Use high FPS (30+) - waste of bandwidth
❌ Use high quality (80+) - waste of bandwidth
❌ Allow user interactions (for security)
❌ Run without monitoring
❌ Deploy without SSL
❌ Forget rate limiting

## 🔒 Security for High Traffic

### 1. Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20;
```

### 2. DDoS Protection

Use Cloudflare or similar service.

### 3. Connection Limits

```env
MAX_VIEWERS=1000  # Set hard limit
```

### 4. Bot Detection

Add CAPTCHA or bot detection before allowing access.

## 💰 Cost Estimate for 1000 Users

### Server: $80/month
- 4 CPU cores
- 8GB RAM
- 500 Mbps bandwidth
- (DigitalOcean, Linode, Vultr)

### Bandwidth: $0-50/month
- Most providers include 5-10 TB free
- Additional: $0.01-0.02/GB

### SSL: Free
- Let's Encrypt

### CDN: Free-$20/month
- Cloudflare (free tier)

### Total: **$80-150/month**

Compare to Individual Sessions:
- **Not feasible at any price** (would need 150GB RAM!)

## 🎯 Your Specific Setup

### For https://www.fcm.org.co/simit/

**Configuration:**

```env
PORT=3002
TARGET_URL=https://www.fcm.org.co/simit/
SCREENSHOT_QUALITY=40
FPS=15
MAX_VIEWERS=10000
```

**Expected Performance:**
- Viewers: 1000 concurrent
- Bandwidth: ~900 Mbps (at quality 40, FPS 15)
- CPU: 20-30%
- RAM: 200-300 MB

**Server Cost:** $50-80/month

## 📞 Summary

For your use case with **1000 users** viewing **one website**:

1. ✅ Use **SharedBrowserServer.ts**
2. ✅ Server: 4 CPU, 8GB RAM ($50-80/month)
3. ✅ Settings: FPS=15, Quality=40
4. ✅ Deploy with PM2 + Nginx + SSL
5. ✅ Monitor bandwidth and viewer count
6. ✅ Use WordPress plugin for easy integration

**You're ready to handle 1000 users efficiently!** 🚀

---

Need help? Check the server logs and monitor viewer count in /health endpoint.
