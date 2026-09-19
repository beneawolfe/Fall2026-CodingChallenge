Image Saving and Sharing App

Name:   Benjamin Wolfe
Email:  benjamin.e.wolfe@vanderbilt.edu


Change++ Fall 2026 Coding Challenge submission.


WHAT IT IS
----------
My application is a Pinterest-style app. You search for images, save them to
boards, and share those boards with other people.

Features:
  - Accounts: register, log in, log out (JWT authentication)
  - Search free images through the Pixabay API
  - Create, edit, and delete boards (collections)
  - Save images to boards; edit their notes and tags; remove them
  - Public/private toggle for each board
  - Collaborators: add other users by username or email as an editor
    (can change images) or viewer (read only)
  - Public share link for each board (read-only, no login needed)
  - Notifications when someone edits a board you belong to
  - Optimistic updates (the UI changes instantly and rolls back if the
    server rejects the change), lazy-loaded images, loading skeletons,
    and a responsive layout

Tech stack:
  Frontend: React, TypeScript, Vite, Material UI (MUI), React Router
  Backend:  Node.js, Express, TypeScript, PostgreSQL (pg), bcryptjs,
            jsonwebtoken


PROJECT LAYOUT
--------------
  web/      Frontend (Vite dev server, http://localhost:5173)
  server/   Backend REST API (Express, http://localhost:5001)
  server/db/schema.sql   Database schema


PREREQUISITES
-------------
  - Node.js 20 or newer (developed on Node 24) and npm
  - A PostgreSQL 13+ database. A free hosted database from
    https://neon.tech works well, and a local Postgres install works too.
  - A free Pixabay API key: create an account at https://pixabay.com and
    copy the key shown at https://pixabay.com/api/docs/


SETUP
-----
1. Get the code

     git clone <your repository URL>
     cd Fall2026-CodingChallenge

2. Create the database tables

   Open your database's SQL editor (in Neon: your project, then
   "SQL Editor"), paste the entire contents of server/db/schema.sql,
   and run it. This creates the users, collections, collection_members,
   images, and notifications tables.

   With a local Postgres and psql instead:

     psql "<your connection string>" -f server/db/schema.sql

3. Configure the backend

   Copy server/.env.example to server/.env and fill in every value:

     PORT=5001
     DATABASE_URL=<your Postgres connection string>
     JWT_SECRET=<a long random string>
     CLIENT_ORIGIN=http://localhost:5173
     PIXABAY_API_KEY=<your Pixabay key>

   For Neon, DATABASE_URL looks like:
     postgresql://user:password@host/dbname?sslmode=require

   To generate a JWT secret:

     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   Never commit server/.env. It is listed in .gitignore.

4. Configure the frontend (optional)

   The frontend talks to http://localhost:5001 by default. To use a
   different address, copy web/.env.example to web/.env and set:

     VITE_API_URL=http://localhost:5001

5. Install dependencies (one time)

     cd server
     npm install
     cd ../web
     npm install


RUNNING THE APP
---------------
The app needs two servers running at once, each in its own terminal.

Terminal 1 - backend:

     cd server
     npm run dev

  Check that http://localhost:5001/api/hello returns JSON.

Terminal 2 - frontend:

     cd web
     npm run dev

Open http://localhost:5173, click Register, create an account, and you
are in. Vite only reads web/.env at startup, and the backend only reads
server/.env at startup, so restart the matching server after editing them.

Other commands:
  server:  npm run build   (compile TypeScript to dist/)
           npm start       (run the compiled server)
  web:     npm run lint    (ESLint)
           npm run build   (production build)


USING THE APP
-------------
1. Register and log in.
2. On "My Boards", click "New board" to create a board.
3. Go to "Search", enter a term, and click "Save" on an image to add it
   to one of your boards.
4. Open a board to edit an image's note or tags, remove images, switch
   the board between public and private, or click "Copy share link".
5. Click "Collaborators" on a board you own to add another user by
   username or email as an editor or viewer. They will see the board
   under "Shared with me".
6. Anyone can open a share link (/share/<token>) without an account. It
   is read-only.
7. The bell icon in the top bar shows notifications about edits to boards
   you belong to.


API OVERVIEW
------------
All errors are returned as { "error": "message" }. Endpoints marked
(auth) need the header  Authorization: Bearer <token>.

Health
  GET    /api/hello
  GET    /api/db-check

Auth
  POST   /api/auth/register         body: email, username, password
  POST   /api/auth/login            body: email, password
  GET    /api/auth/me               (auth)

Collections (boards)
  GET    /api/collections           (auth) boards you own or collaborate on
  POST   /api/collections           (auth) body: name, description?, isPublic?
  GET    /api/collections/:id       (auth) board plus its images
  PATCH  /api/collections/:id       (auth, owner) name, description, isPublic
  DELETE /api/collections/:id       (auth, owner)

Images in a board
  POST   /api/collections/:id/images             (auth, editor+)
  PATCH  /api/collections/:id/images/:imageId    (auth, editor+) tags, note
  DELETE /api/collections/:id/images/:imageId    (auth, editor+)

Collaborators
  GET    /api/collections/:id/members            (auth, editor+)
  POST   /api/collections/:id/members            (auth, owner)
  PATCH  /api/collections/:id/members/:userId    (auth, owner) role
  DELETE /api/collections/:id/members/:userId    (auth) owner removes anyone,
                                                 members can remove themselves

Sharing
  POST   /api/collections/:id/share-token        (auth, owner) new link
  GET    /api/share/:token                       public, read-only

Search
  GET    /api/search/images?q=term&page=1        (auth) Pixabay proxy

Notifications
  GET    /api/notifications                      (auth)
  POST   /api/notifications/:id/read             (auth)
  POST   /api/notifications/read-all             (auth)

Roles: owner > editor > viewer. Anyone logged in can view a public board.


DESIGN NOTES
------------
  - The backend is a separate Express server with routes, controllers,
    middleware (auth, error handling), and services kept in separate
    folders.
  - Pixabay is called from the server so the API key is never exposed to
    the browser. Images are linked from Pixabay's servers, and each
    search page shows an "Images provided by Pixabay" credit as their
    terms require.
  - Passwords are hashed with bcrypt. Tokens are signed JWTs.


REFLECTION (under 100 words)
----------------------------

I think that this coding challenge was definitely very eye opening, into how real software development is,
and also how valuable having AI tools to help code is, as well. I was able to use my coding knowledge & Claude
to learn how to put together a reall full stack app that fits together. I learned through the in person lecture
how to even approach or attempt coding something like this, and was able to use my intuition to direct Claude 
in how to help me. The hardest part was honestly working on something like this with so many interconnected parts.


FEEDBACK ON THE CHALLENGE
-------------------------

I really like the open ended challenge, to build something that was cool and unique. The rubric was
also very helpful in giving "hints" in what to look for when implementing. I really wish the coding challenge
happened earlier though, as a lot of my classes are picking up now.