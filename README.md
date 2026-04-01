
# Pathly - Intelligent Link Management Platform

**Shorten · Track · Understand · Control**

## 🚀 Live Demo  
👉 https://aruthrasathishkumar.github.io/url-shortener/

> ⚠️ Full functionality requires running the backend locally

## 💡 Overview  
Pathly is a production-style URL shortener with analytics, smart link control, and bio pages - built to demonstrate real-world system design and backend performance.

## ✨ Features  
- 🔗 URL shortening using Base62 (collision-free)  
- ⚡ Fast redirects with Redis caching (<1ms for hot links)  
- 📊 Real-time analytics (device, browser, referrer)  
- ⏱️ Smart expiry (time, clicks, one-time use)  
- 🌐 Link-in-bio pages (`/@username`)  

## 🧠 Architecture  

```
React → FastAPI → Redis + MySQL
```

## ⚙️ Local Setup  

### Backend
```bash
git clone https://github.com/Aruthrasathishkumar/url-shortener.git
cd url-shortener/backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd ../frontend
npm install
npm run dev
```

👉 App: http://localhost:5173  

## 📸 Screenshots

<img src="./screenshots/Screenshot 2026-04-01 172217.png" width="800"/>

<img src="./screenshots/Screenshot 2026-04-01 172257.png" width="800"/>

<img src="./screenshots/Screenshot 2026-04-01 172334.png" width="800"/>

