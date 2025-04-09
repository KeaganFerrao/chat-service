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

4. **Create & Migrate the Database:**
    Go into the dist diectory and run the following commands. (Only if using PostgeSQL, not needed for MongoDB)
   ```bash
   npm run create
   npm run migrate
   ```
   This will create the database and run the migrations.

5. **Start the Server:**
   ```bash
   npm start
   ```
   This will start the server in development mode.

---

## Socket events:

1. message:send
2. message:new
3. message:list
4. message:ack
5. message:attachment:download
6. user:list
7. user:reach
8. channel:list
9. notification:list
10. notification:unreadcount
11. notification:ack

## API's:

1. POST /api/v1/upload-attachment

## Notes

1. Ensure the .env file is present and has the proper configuration.
2. Please use this service with PostgreSQL as the database, since the MongoDB implementation is not tested yet.

## Future work

1. Add multiple-tenant support. Each new tenant can have the option to specify its database. (Can share a database or use a new database all together)

2. Abstract file I/O operations so that we can support multiple file systems (Local/Cloud).

3. Abstract API authentication so that we can support multiple authentication stratergies.

4. Impove folder structure.

5. Add user management APIs.

6. Add tenant management APIs.

7. Write Unit/integration/e2e tests.
