# Quick Deployment Guide

## Prerequisites Checklist
- [ ] Node.js installed (v18+)
- [ ] Firebase account created
- [ ] Firebase project created in console

## Quick Deploy (5 Steps)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Update Project Configuration

**Edit `.firebaserc`:**
```json
{
  "projects": {
    "default": "YOUR_PROJECT_ID"
  }
}
```

**Edit `config/firebase.ts`:**
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Install Dependencies & Deploy Rules
```bash
npm install
firebase deploy --only firestore:rules,storage:rules,firestore:indexes
```

### 5. Build & Deploy
```bash
npm run build
firebase deploy --only hosting
```

## Your Site is Live! 🎉

Your URL: `https://YOUR_PROJECT_ID.web.app`

## Common Commands

```bash
# Full deployment
npm run deploy

# Deploy only hosting
npm run deploy:hosting

# Deploy only rules
npm run deploy:rules

# Local development
npm run dev

# Preview production build
npm run preview
```

## Enable Firebase Services

In Firebase Console, enable:
1. **Authentication** → Email/Password
2. **Firestore Database** → Start in production mode
3. **Storage** → Start in production mode
4. **Hosting** → Get started

## Quick Troubleshooting

**Build fails?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Permission errors?**
```bash
firebase deploy --only firestore:rules,storage:rules
```

**Can't find project?**
- Check `.firebaserc` has correct project ID
- Run `firebase projects:list` to see available projects

## Next Steps

1. Test your live site thoroughly
2. Add custom domain (optional)
3. Set up continuous deployment (optional)
4. Monitor usage in Firebase Console

For detailed instructions, see `FIREBASE_HOSTING_SETUP.md`
