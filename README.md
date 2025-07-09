# 🙋‍♂️ Handstack

**Digital hand raising for in-person meetings**

Handstack is a mobile-friendly web application that brings the convenience of digital hand raising (like Google Meet) to in-person meetings. Perfect for classrooms, conferences, and any meeting where you need to manage speaking order efficiently.

## ✨ Features

- **Mobile-first design** - Works great on phones and tablets
- **Real-time synchronization** - All participants see updates instantly
- **Simple room system** - 4-character room codes (new rooms use unambiguous characters, but can join any alphanumeric code)
- **Admin controls** - Meeting hosts can manage the queue
- **Session persistence** - Automatically restores your session after page refresh
- **Zero-cost hosting** - Runs on Firebase for free
- **No registration required** - Just enter your name and start

## 📁 Project Structure
```
handstack/
├── src/
│   ├── components/           # React components
│   │   ├── Home.jsx         # Landing page
│   │   ├── CreateRoom.jsx   # Room creation
│   │   ├── JoinRoom.jsx     # Room joining
│   │   ├── AdminRoom.jsx    # Admin dashboard
│   │   └── UserRoom.jsx     # User interface
│   ├── services/            # Firebase services
│   │   └── firebase.js      # Database operations
│   ├── utils/               # Utility functions
│   │   └── roomCode.js      # Room code generation
│   ├── firebase/            # Firebase config
│   │   └── config.js        # Firebase setup
│   └── App.jsx              # Main app component
├── database.rules.json      # Database security rules
├── firebase.json            # Firebase configuration
└── README.md               # Full documentation
```

## 🔧 Quick Start Guide

### 1. Fork and Clone the Repository

```bash
git clone https://github.com/petecheslock/handstack.git
cd handstack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 4. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. **Create a Web App** (This step is crucial!):
   - Click the **⚙️ Settings** icon next to "Project Overview"
   - Select **Project Settings**
   - Scroll down to "Your apps" section
   - Click **Add app** and select the **Web** icon `</>`
   - Enter app nickname (e.g., "Handstack")
   - Click **Register app**
4. **Enable Realtime Database**:
   - Go to **Build** → **Realtime Database**
   - Click **Create Database**
   - Choose **Start in test mode**
   - Select your preferred location
5. **Get your Firebase config** from the web app you created:
   - Go to Project Settings → General tab
   - Scroll to "Your apps" and click on your web app
   - Copy the config object values
6. **Create a `.env` file** in the root directory (copy from `env.example`):
   ```bash
   cp env.example .env
   ```
7. **Fill in your Firebase configuration** in `.env`:
   ```bash
   VITE_FIREBASE_API_KEY=AIzaSyC...  # From firebaseConfig.apiKey
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
   ```

   **⚠️ Important**: The `.env` file is automatically ignored by Git for security. Never commit your Firebase credentials to the repository.

### 5. Initialize Firebase

```bash
firebase login
firebase init
```

During initialization:
- Select **Hosting** and **Realtime Database**
- Choose **Use an existing project** and select your Firebase project
- Set `dist` as your public directory
- Configure as a single-page app (Yes)
- Don't overwrite `dist/index.html` if it exists

### 6. Test Locally

```bash
npm run dev
```

Visit `http://localhost:5173` to test the application. You should see the Handstack home page with "Create Room" and "Join Room" buttons.

**Testing the Full Flow:**
1. Create a room with your name
2. Note the 4-character room code
3. Open a new browser tab/window and join the room with the code
4. Test raising/lowering hands and queue management

## 🚀 Deployment to Firebase

### Database Rules

The database security rules are stored in `database.rules.json` and will be automatically deployed with your project. The rules are configured to allow read/write access to room data.

### Deploy to Firebase

```bash
npm run deploy
```

This command will:
1. Build the application
2. Deploy to Firebase Hosting
3. Update database rules
4. Provide you with a live URL

Your app will be available at `https://your-project-id.web.app`

## 📱 How to Use

### For Meeting Hosts (Admins)

1. Click "Create Room"
2. Enter your name
3. Share the 4-character room code with participants
4. Monitor the queue and click "Done Speaking" to remove people
5. See all participants and their hand status

### For Participants

1. Click "Join Room"
2. Enter the room code and your name
3. Use "Raise Hand" when you want to speak
4. See your position in the queue
5. Use "Lower Hand" when you're done

## 🛠️ Technical Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Realtime Database
- **Hosting**: Firebase Hosting
- **Routing**: React Router

## 📈 Scaling Considerations

The free Firebase Realtime Database tier includes:
- 1GB storage
- 10GB/month transfer
- 100 concurrent connections

This should handle hundreds of concurrent users across multiple rooms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this for your meetings!

## 🐛 Troubleshooting

### Common Issues

1. **Firebase connection errors**: 
   - Verify your `.env` file has all required `VITE_FIREBASE_*` variables
   - Check that Realtime Database is enabled in your Firebase project
   - Ensure database rules allow read/write access to `rooms`

2. **Deployment issues**: 
   - Verify Firebase CLI is installed: `firebase --version`
   - Check that you're logged in: `firebase login`
   - Ensure your project is initialized: `firebase init`

3. **Room not found**: Ensure the room code is correct (4 alphanumeric characters).

4. **Environment variable errors**: 
   - Local development: Check your `.env` file
   - Deployment: Firebase will use your project configuration

**Need Help?** Create an issue on GitHub if you encounter problems or have suggestions for improvements.

---

## 🎉 Ready to Use!

Once you complete the Firebase setup, your Handstack will be ready to host on Firebase at zero cost. The application will handle multiple concurrent rooms and real-time updates seamlessly.

**Perfect for**: Classrooms, conferences, team meetings, workshops, and any event where you need organized hand raising!

---

**Made with ❤️ for better meetings** 