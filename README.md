# DishList Web App

## Overview

DishList is a private web application that allows users to create, manage, and organize their DishLists. Users can add, remove, and pin DishLists, as well as search for recipes using AI-powered suggestions.

## Features

- **User Authentication:** Sign in and sign up using Firebase Authentication.
- **DishList Management:** Users can create, edit, remove, and pin their DishLists.
- **Global Menu Actions:** Single menu icon for managing DishLists.
- **Persistent Storage:** DishLists are stored in MongoDB for each authenticated user.
- **AI-Powered Features:** OpenAI API integration for smart recipe suggestions.
- **Responsive UI:** Built with React and CSS Modules for a seamless experience.

## Technology Stack

### Front End:

- React
- CSS Modules
- JavaScript

### Back End:

- Node.js with Express.js
- REST API
- MongoDB (NoSQL Database)

### Other Tools:

- Firebase Authentication (User Management)
- Version Control with Git
- Continuous Integration (CI) and Deployment (CD) with GitHub Actions
- OpenAI API (for AI-powered features)

## Installation & Setup

### Prerequisites:

- Node.js installed
- MongoDB cluster setup (or use a local MongoDB instance)
- Firebase project configured

### Clone the repository:

```bash
git clone https://github.com/awkorn/dishlist-web
```

### Install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Environment Variables:

Create a `.env` file in the `backend` directory with the following:

```
MONGO_URI=your-mongodb-connection-string
FIREBASE_API_KEY=your-firebase-api-key
OPENAI_API_KEY=your-openai-api-key
```

### Running the Application:

```bash
# Start the backend server
cd backend
npm start

# Start the frontend server
cd ../frontend
npm start
```

## API Endpoints

### DishLists API:

- **GET `/api/dishlists`** - Fetch all DishLists for the authenticated user.
- **POST `/api/dishlists`** - Create a new DishList.
- **PUT `/api/dishlists/:id`** - Edit an existing DishList title.
- **DELETE `/api/dishlists/:id`** - Remove a DishList.

## Privacy Notice

This application is **private** and not intended for public distribution or use. All data is restricted to authenticated users, and unauthorized access is prohibited.
