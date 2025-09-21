# EduBeacon - AI-Powered Student Dropout Prevention System

EduBeacon is a comprehensive MERN stack application designed to prevent student dropout through AI-powered counseling, personalized support, and data-driven insights.

## Features

- **AI-Powered Counseling**: 24/7 chatbot support using Gemini API
- **Role-Based Dashboards**: Separate interfaces for Admins, Mentors, and Students
- **User Management**: Admin can create and manage users with unique invitation codes
- **Analytics Dashboard**: Real-time insights and student performance tracking
- **Timetable Management**: Schedule and event planning for all user types
- **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Gemini API
- **Charts**: Recharts for data visualization

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd EduBeacon
   npm run install-all
   ```

2. **Environment Setup**
   ```bash
   cd server
   cp config.env .env
   ```
   
   Edit `.env` file with your credentials:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Start the Application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend client (port 3000).

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Usage

### 1. Create Organization (Admin)
- Visit the homepage and click "Get Started"
- Fill in the admin registration form
- Create your organization
- You'll be redirected to the admin dashboard

### 2. Add Users (Admin)
- In the admin dashboard, click "Add User"
- Create mentors and students
- Each user gets a unique 6-digit invitation code
- Share these codes with users for registration

### 3. User Login
- Users can login with their email and password
- They'll be redirected to their role-specific dashboard

### 4. AI Counseling (Students)
- Students can chat with the AI counselor
- The AI provides support and guidance
- Powered by Google Gemini API

## API Endpoints

### Authentication
- `POST /api/auth/admin-register` - Register admin and create organization
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Admin Routes
- `GET /api/admin/users` - Get all users in organization
- `POST /api/admin/users` - Create new user
- `GET /api/admin/departments` - Get all departments
- `POST /api/admin/departments` - Create department

### Student Routes
- `POST /api/student/chatbot` - Chat with AI counselor
- `GET /api/student/timetable` - Get student timetable
- `POST /api/student/timetable` - Update timetable

### Mentor Routes
- `GET /api/mentor/students` - Get all students
- `GET /api/mentor/analytics` - Get analytics data
- `GET /api/mentor/timetable` - Get mentor timetable
- `POST /api/mentor/timetable` - Update timetable

## Project Structure

```
EduBeacon/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── dashboards/ # Role-specific dashboards
│   │   │   └── ...
│   │   ├── context/        # React context
│   │   └── ...
│   └── package.json
├── server/                 # Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── config/            # Database config
│   └── server.js
└── package.json           # Root package.json
```

## Environment Variables

Create a `.env` file in the `server` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edubeacon
JWT_SECRET=your-super-secret-jwt-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

## Getting API Keys

### MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string

### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

## Features by Role

### Admin
- Create and manage users (mentors, students)
- Generate unique invitation codes
- View organization analytics
- Manage departments
- Monitor all user activity

### Mentor
- View student analytics and performance
- Track attendance and engagement
- Manage timetable and events
- Monitor at-risk students
- Access detailed reports

### Student
- Chat with AI counselor
- View personal timetable
- Access study resources
- Submit assignments
- Contact mentor

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For support, email support@edubeacon.com or create an issue in the repository.
