# Canary Backend Deployment Instructions

## Prerequisites

- Node.js
- npm or pnpm (package manager)
- A PostgreSQL database (if using the PostgreSQL connection string)

## Steps to Deploy

1. **Clone the Repository**
   Open your terminal and run the following command to clone the repository:
   git clone <repository-url>
   cd canary-backend

2. **Install Dependencies**
   Use npm or pnpm to install the project dependencies:
   ```npm install```
   or
   ```pnpm install```

3. **Set Up Environment Variables**
   Create a `.env` file in the root directory of the project. You can use the provided `.env` file as a template. Make sure to set the following variables:
   ```DATABASE_URL="file:./dev.db" # For local SQLite DB
   JWT_SECRET="your_jwt_secret" # Set your JWT secret
   BACK_HOST="localhost" # Set the backend host
   BACK_PORT=3000 # Set the backend port
   FRONT_HOST="localhost" # Set the frontend host
   FRONT_PORT=5173 # Set the frontend port```

4. **Run Database Migrations (if applicable)**
   If you are using a PostgreSQL database, ensure that you run the necessary migrations to set up your database schema.

5. **Generate Prisma Client**
   Run the following command to generate the Prisma client:
   ```npx prisma generate```
   or
   ```pnpm prisma generate```


6. **Start the Application**
   To start the application in development mode, run:
   ```npm run dev```
   or
   ```pnpm run dev```

7. **Access the Application**
   Open your web browser and navigate to `http://localhost:3000` (or the host and port you configured) to access the application.

8. **API Documentation**
   The API documentation is available at `http://localhost:3000/docs`.
