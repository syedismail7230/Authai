# 🔍 AuthAI.pro - AI Content Authenticity Platform

Global trust authority for verifying AI-generated vs human-created content with legally-backed certificates.

## 🚀 Features

✅ **Multi-Modal Verification** - Text, images, audio, video, code, documents  
✅ **Digital Certificates** - SHA-256 hashed, cryptographically signed  
✅ **Tamper-Proof Badges** - PNG/SVG watermarks for content  
✅ **Blockchain Anchoring** - Polygon L2 for immutable proof  
✅ **ChatGPT-Style UI** - Conversational, distraction-free interface  
✅ **Wallet System** - ₹19 per certificate, pay-as-you-go  
✅ **Referral Program** - Earn free certificates  
✅ **Admin Portal** - Monitoring, revocation, analytics  

---

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local dev)
- Python 3.11+ (for AI service)
- Razorpay account (for payments - optional)

---

## 🏃 Quick Start

### 1. Clone & Configure

```bash
cd c:\Users\syedi\OneDrive\Desktop\AuthAI
copy .env.example .env
```

### 2. Update Environment Variables

Edit `.env` and add your Razorpay credentials:

```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret
JWT_SECRET=your_random_secret_key
```

### 3. Start with Docker

```bash
docker-compose up --build
```

### 4. Access Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |
| MongoDB | localhost:27017 |

---

## 📁 Project Structure

```
AuthAI/
├── frontend/          # React + Next.js
│   ├── pages/
│   ├── components/
│   ├── lib/
│   │   └── store/     # Zustand stores
│   └── styles/
├── backend/           # Node.js + Express
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── services/
├── ai-service/        # FastAPI (Python)
│   └── main.py
├── docker-compose.yml
└── .env
```

---

## 💳 Pricing

- **₹19** per certificate
- **5** free on signup
- **1** free per referral
- Payment via Razorpay (UPI, Cards, NetBanking)

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ AES-256 encryption
- ✅ SHA-256 content hashing
- ✅ Blockchain anchoring (Polygon L2)
- ✅ Rate limiting & WAF
- ✅ OWASP compliance

---

## 📜 Compliance

- ✅ EU AI Act transparency
- ✅ GDPR / DPDP
- ✅ IT Act 2000 (India)
- ✅ ISO 27001 readiness

---

## 🤝 Contributing

1. Create a feature branch
2. Commit changes
3. Push to GitHub
4. Create a Pull Request

---

## 📞 Support

- Email: support@authai.pro
- GitHub Issues: [authai-pro/issues](https://github.com)
- Discord: [Community Server](https://discord.com)

---

## 📄 License

MIT License - See LICENSE file

---

**Made with ❤️ by AuthAI Team**
