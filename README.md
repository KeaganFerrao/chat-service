# Chat Microservice

This README provides details on the APIs and how to set it up.

## Setup Instructions

Follow these steps to set up the repository:

1. **Install Node.js:**
   Ensure you have Node.js version **20 or greater** installed and compatible npm version.

2. **Install the Dependencies:**
   ```bash
   npm install
   ```
   This will install all the dependencies.

3. **Build TypeScript to JavaScript:**
   ```bash
   npm run build
   ```
   This will compile the TypeScript files into JavaScript and create a dist directory.

4. **Create& Migrate the Database:**
    Go into the dist diectory and run the following commands.
   ```bash
   npm run create
   npm run migrate
   ```
   This will create the database and run the migrations.

5. **Seed the Database if required:**
   ```bash
   npm run seed
   ```
   This will insert initial data into the database.

6. **Start the Server:**
   ```bash
   npm start
   ```
   This will start the server in development mode.

---

## Notes

1. Ensure the .env file is present and has the proper configuration.

## Future work

1. Add multiple-tenant support. Each new tenant can have the option to specify its database. (Can share a database or use a new database all together)

2. Abstract file I/O operations so that we can support multiple file systems (Local/Cloud).

3. Abstract API authentication so that we can support multiple authentication stratergies.

4. Add suport to run the service in multiple nodejs clusters to share websockets connections for load balancing.

5. Impove folder structure.

6. Add user management APIs.

7. Add tenant management APIs.

8. Write Unit/integration/e2e tests.
