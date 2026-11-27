<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/67bc4c55-730f-48ff-b37f-9addb9e46e1e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Fill in your Firebase Web App credentials (`VITE_FIREBASE_*`) in the root [.env](../.env) file (Vite loads `envDir` from the project root).
3. Run the app:
   `npm run dev`

## Firebase Authentication Setup

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Register a Web App under **Project Settings -> General -> Your apps** and copy the SDK config values into the root `.env` (`anime-store/.env`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. In **Authentication -> Sign-in method**, enable:
   - **Email/Password**
   - **Google** (select a project support email)
4. In **Authentication -> Settings -> Authorized domains**, ensure `localhost` is listed for local development.
5. **Admin Role Assignment (Trusted Only)**:
   Admin routes (`/admin/*`) require a verified email and trusted admin authorization validated from Firebase ID token custom claims (`role: "admin"`) or the backend `/api/v1/auth/firebase-role` lookup against the database `users` table (`role IN ('admin', 'super_admin')`).
   To enable backend ID token verification, set `FIREBASE_PROJECT_ID` and `FIREBASE_API_KEY` in the root `.env` used by the FastAPI backend.
