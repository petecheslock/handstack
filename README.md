# 🙋‍♂️ Handstack

**Digital hand raising for in-person meetings**

Handstack is a mobile-friendly web application that brings the convenience of digital hand raising (like Google Meet) to in-person meetings. Perfect for classrooms, conferences, and any meeting where you need to manage speaking order efficiently.

## ✨ Features

- **Mobile-first design** - Works great on phones and tablets
- **Real-time synchronization** - All participants see updates instantly
- **Simple room system** - 4-character room codes (new rooms use unambiguous characters, but can join any alphanumeric code)
- **Admin controls** - Meeting hosts can manage the queue
- **Session persistence** - Automatically restores your session after page refresh
- **Zero-cost hosting** - Runs on GitHub Pages for free
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
├── .github/workflows/       # GitHub Actions
│   └── deploy.yml           # Auto-deployment
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

### 3. Firebase Configuration

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
5. **Set database rules** (in Realtime Database → Rules tab):
   ```json
   {
     "rules": {
       "rooms": {
         "$roomCode": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   ```
6. **Get your Firebase config** from the web app you created:
   - Go to Project Settings → General tab
   - Scroll to "Your apps" and click on your web app
   - Copy the config object values
7. **Create a `.env` file** in the root directory (copy from `env.example`):
   ```bash
   cp env.example .env
   ```
8. **Fill in your Firebase configuration** in `.env`:
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

### 4. Update GitHub Pages Configuration

1. Update `package.json` homepage field to match your GitHub username:
   ```json
   "homepage": "https://yourgithubuser.github.io"
   ```

2. In your GitHub repository settings:
   - Go to **Settings** → **Pages**
   - Set **Source** to "Deploy from a branch"
   - Set **Branch** to "main" and **Folder** to "/ (root)"
   
   **Note**: This configuration serves from your main GitHub Pages domain (`petecheslock.github.io`). If you want to serve from a subdirectory like `/handstack`, you can create a repository named `handstack` and it will be available at `petecheslock.github.io/handstack`.

### 5. Test Locally

```bash
npm run dev
```

Visit `http://localhost:5173` to test the application. You should see the Handstack home page with "Create Room" and "Join Room" buttons.

**Testing the Full Flow:**
1. Create a room with your name
2. Note the 4-character room code
3. Open a new browser tab/window and join the room with the code
4. Test raising/lowering hands and queue management

## 🚀 Deployment to GitHub Pages

### GitHub Secrets Configuration

Before deploying, you need to add your Firebase configuration as GitHub Secrets:

1. Go to your GitHub repository Settings > Secrets and variables > Actions
2. Add the following secrets with your Firebase config values:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### Option 1: Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Go to your repository Settings > Pages
3. Choose "GitHub Actions" as the source
4. The workflow in `.github/workflows/deploy.yml` will automatically deploy on push to main
5. Your app will be available at `https://petecheslock.github.io`

### Option 2: Manual Deployment

```bash
npm run build
npm run deploy
```

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
- **Hosting**: GitHub Pages
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
   - Verify all GitHub Secrets are added to your repository
   - Check that your GitHub Pages settings use "GitHub Actions" as source

3. **Room not found**: Ensure the room code is correct (4 alphanumeric characters).

4. **Environment variable errors**: 
   - Local development: Check your `.env` file
   - Deployment: Check your GitHub repository secrets

**Need Help?** Create an issue on GitHub if you encounter problems or have suggestions for improvements.

---

## 🎉 Ready to Use!

Once you complete the Firebase setup, your Handstack will be ready to host on GitHub Pages at zero cost. The application will handle multiple concurrent rooms and real-time updates seamlessly.

**Perfect for**: Classrooms, conferences, team meetings, workshops, and any event where you need organized hand raising!

---

**Made with ❤️ for better meetings** 