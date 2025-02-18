# DishList Web App

## Overview
DishList is a private web application that allows users to create, manage, and organize their DishLists. Users can add, remove, and pin DishLists, as well as search for recipes using AI-powered suggestions.

## Features
- **User Authentication:** Sign in and sign up using Firebase Authentication.
- **DishList Management:** Users can create, edit, remove, and pin their DishLists.
- **Global Menu Actions:** Single menu icon for managing DishLists.
- **Persistent Storage:** DishLists are stored in MongoDB for each authenticated user.
- **AI-Powered Features:** OpenAI API integration for smart recipe suggestions.
- **GraphQL API:** Uses Apollo Server and Apollo Client for efficient data fetching.
- **Responsive UI:** Built with React and CSS Modules for a seamless experience.

## Technology Stack

### Front End:
- React
- CSS Modules
- JavaScript
- Apollo Client (GraphQL)

### Back End:
- Node.js with Express.js
- GraphQL with Apollo Server
- MongoDB (NoSQL Database)

### Other Tools:
- Firebase Authentication (User Management)
- Version Control with Git
- Continuous Integration (CI) and Deployment (CD) with GitHub Actions
- OpenAI API (for AI-powered features)

## API Endpoints
### GraphQL API:
- **Endpoint:** `/graphql`
- **Queries:**
  - `getDishLists(userId: String!): [DishList]` - Fetches all DishLists for the authenticated user.
- **Mutations:**
  - `addDishList(userId: String!, title: String!): DishList` - Creates a new DishList.
  - `editDishList(id: ID!, title: String!): DishList` - Edits an existing DishList title.
  - `removeDishList(id: ID!): String` - Removes a DishList.
  - `pinDishList(id: ID!): DishList` - Pins a DishList to the top.

### OpenAI API:
- **POST `/api/generate`** - Generates AI-powered recipe suggestions based on user input.

## Privacy Notice
This application is **private** and not intended for public distribution or use. All data is restricted to authenticated users, and unauthorized access is prohibited.
