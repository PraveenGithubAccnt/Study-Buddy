🎓 AI Study Buddy

AI Study Buddy is a mobile application built with React Native (Expo) to help students enhance their learning experience using AI-powered tools. It offers smart suggestions for study topics, fetches relevant YouTube videos, notes, quizzes, and answers using intelligent search.

✨ Features

🔍 AI-based educational content search

📺 Fetch YouTube videos relevant to any topic

📝 Display notes and summaries

❓ Quiz and question-answer generation (planned)

📱 Mobile-first UI using Expo and React Native

🔐 Firebase + Clerk authentication (secure login)

⚙️ Backend with Express.js + Node.js for APIs (tasks, AI search, PDF, etc.)

🗄️ MongoDB integration for storing schedules, user data, and resources

📦 Backend Overview

The backend powers the AI Study Buddy app by handling APIs, authentication, and data management.

Framework: Node.js + Express.js

Security: Helmet.js, CORS, JWT authentication

Logging: Morgan

Database: MongoDB Atlas (cloud-hosted)

Routes Implemented:

authRoutes → User authentication (with Firebase/Clerk integration)

taskRoutes → Schedule and task management

googleAIRoutes → Fetch AI-powered study suggestions

pdfRoutes → Generate and fetch notes in PDF format

youtubeRoutes → Fetch YouTube educational content

👉 The backend runs on port 3000 (default) and is consumed by the React Native frontend using Axios.

📸 Screenshots

Add screenshots or screen recordings here once available

🚀 Getting Started
Prerequisites

Node.js & npm

Expo CLI:

npm install -g expo-cli