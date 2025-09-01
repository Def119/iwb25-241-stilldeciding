# 🔗 P2P Chat App with Ballerina Signalling Server & React Native (Expo)

A **peer-to-peer (P2P) messaging platform** prototype built using:

- **Ballerina** → signalling server for establishing WebRTC connections  
- **React Native (Expo)** → mobile app for user interface & P2P communication  
- **Supabase Auth** → authentication & email verification  
- **WebRTC** → decentralized messaging

  frontend repo : [https://github.com/Def119/p2pchat-frontend](https://github.com/Def119/p2pchat-frontend)
  backend repo : [https://github.com/Def119/p2pchat-backend](https://github.com/Def119/p2pchat-backend)

⚠️ **Prototype stage**: Messaging is functional only for testing via `client.html`.  
Currently working: account creation, login, profile setup, RSA key generation, QR (user id + public key) contact sharing, and peer connection test.  

---

## 📦 Features (Prototype Stage)

- ✅ User registration & login (Supabase Auth)  
- ✅ Email verification flow  
- ✅ Generate & share public keys via QR code via the mobile app
- ✅ Contact sharing via QR (contains email & public key)  
- 🔄 Connect to peers via **WebRTC** test page (`client.html`)  
- 🔒 Planned : Messages encrypted using **peer public keys**  
- 🕓 Planned: Fallback DB to store messages when peer is offline  

---

## 🧠 How It Works

1. User signs up with **email + password** in the mobile app  
2. Supabase sends a **verification email** → after confirmation, user can log in  
3. On profile setup → a **public key** is generated for the user  
4. This key (with email) can be shared via **QR code**  
5. For testing → open `frontend/webdemo/client.html` in two browser windows  
6. Exchange session details manually (WebRTC offer/answer)  
7. A **P2P WebRTC connection** is established directly between peers  
8. Messages are encrypted with **public/private key pairs** before sending  

---

## 🏁 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Def119/iwb25-241-stilldeciding.git
cd iwb25-241-stilldeciding
```

### 2. Setup & Run the Mobile App (React Native + Expo)
```bash
cd p2p-frontend
npm install
npx expo start or npm start
```
- Scan the QR code with **Expo Go app** on your iOS/Android device to run it.  
- Make sure you have the **Supabase project URL & anon/public API key** inside the app’s `.env` file.  

Example `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xyzsomething.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the Signalling Server (Ballerina)
```bash
cd p2p-backend
bal run
``` 


### 4. Run the WebRTC Demo (No Signalling Server Needed)
Currently, you can test messaging without the signalling/central server.

```bash
cd p2p-frontend/webdemo
open client.html   # or double-click to open in browser
```
- Open `client.html` in **two browser tabs or windows**  
- Decide on 2 user IDs. Proposed solution uses email as the user identification for the signalling server. 
- Put two user emails, each in the two browser tabs.  
- Click on connect button to send a webrtc connection offer to the target user. 
- Once connected, you can send encrypted messages directly via WebRTC (even whith the signalling server turned down, giving you the proper p2p direct communication).  


### 4. Testing webrtc communication with mobile app (not implemented completely)

---

## 📂 Project Structure

```
iwb25-241-stilldeciding/
│
├── p2p-backend/   # Ballerina-based WebRTC signalling server
│   └── main.bal
│
├── p2p-frontend/          # React Native (Expo) client app
│   ├── src/
│   │   ├── auth/        # Supabase auth flows
│   │   ├── components/  # UI components
│   │   ├── screens/     # App screens (Login, Profile, Chat, etc.)
│   │   └── webrtc/      # WebRTC connection logic
│   ├── package.json
│   └── app.json          
│   └── webdemo/         # Web demo for testing P2P connections
│       └── client.html
│
└── README.md            # Project documentation
```

---

## 🔧 Tech Stack

- **Frontend:** React Native (Expo)  
- **Backend (Signalling):** Ballerina  
- **Auth & DB:** Supabase  
- **Messaging:** WebRTC (peer-to-peer, encrypted with public keys (not implemented yet) )  

---

## 🚧 Roadmap

- [ ] Full functional messaging inside the mobile app  
- [ ] Add fallback DB for offline messages  
- [ ] Add RSA key generation in the signalling server itself for faster generation (currently takes a long time due to react native processing)
- [ ] Proper encryption of meessages using the recipient's public key  
- [ ] Improve QR code-based contact sharing  
- [ ] UI/UX improvements  

---
