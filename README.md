# Katchup Project Setup Guide

This guide will help you set up and run the Katchup project, which consists of a React Native frontend (using Expo) and a Node.js backend with MongoDB.

## Prerequisites

- Node.js (v18.x LTS)
- npm or yarn

## Project Structure
```
Katchup/
├── backend/         # Node.js/Express backend
└── frontend/        # React Native (Expo) frontend
```

## Backend Setup

1. Navigate to the backend directory:
   cd backend


2. Install dependencies:
   npm install


3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5001
   MONGO_URI= URI는 몽고디비에서 찾을수있음.
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   ```

4. Start the backend server:
   npm run dev


The backend should now be running on `http://localhost:5001`

## Frontend Setup

1. Navigate to the frontend directory:
   cd frontend

2. Install dependencies:
   npm install

3. Start the Expo development server:
   npx expo start

4. To run the app:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for Web view (if not available -> npx expo install react-dom react-native-web @expo/metro-runtime)
   - Scan the QR code with Expo Go app on your phone

## Testing the Connection

1. Make sure the backend is running on port 5001
2. Launch the frontend app
3. The app should automatically check the backend connection
4. You should see the server and database status displayed


## Available Scripts
### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload

### Frontend
- `npx expo start` - Start the Expo development server
- `npx expo start -c` - Start with cleared cache