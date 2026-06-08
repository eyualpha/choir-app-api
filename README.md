# Choir App API (Frontend Reference)

This Express + MongoDB backend exposes everything a Choir web client needs to authenticate users, manage members, publish announcements/resources, and organize choir assignments. Use the endpoints below once you have a server URL (defaults to `http://localhost:3000`).

## Getting started

1. `npm install`
2. Copy `.env.example` to `.env` and provide the following values:
   - `PORT` – server port (default 3000)
   - `MONGODB_URI` – MongoDB connection string
   - `JWT_SECRET` – used to sign JSON Web Tokens
   - `EMAIL_USER`, `EMAIL_PASS` – nodemailer credentials for sending temporary passwords/assignment emails
   - `CLOUDINARY_*` – (name, key, secret) used by uploads
3. `npm run dev` to start with `nodemon` (or `npm start` for production-ready run)

## Tests

```bash
npm test
npm run test:coverage
```

Tests use Jest, Supertest, and an in-memory MongoDB instance. External email and Cloudinary calls are mocked.

## Docker

```bash
docker build -t choir-app-api .
docker run --env-file .env -p 3000:3000 choir-app-api
```

The image copies the full repository (including `.git/`) and installs production dependencies with `npm ci`.

The API mounts under `/api`. All protected routes require the `Authorization: Bearer <token>` header issued by the login endpoint. Tokens expire after 12 hours.

## Authentication

| Endpoint                     | Method | Auth     | Body                                 | Notes                                                                                                                           |
| ---------------------------- | ------ | -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `/api/auth/register`         | `POST` | Public   | `{ name, email, role?, voicePart? }` | Creates user, hashes a random password, emails the temporary password. `role` defaults to `member`.                             |
| `/api/auth/login`            | `POST` | Public   | `{ email, password }`                | Returns `{ token, user: { id, name, email, role, voicePart, isPasswordChanged } }`. Use `token` for the `Authorization` header. |
| `/api/users/change-password` | `POST` | Required | `{ password, confirmPassword }`      | Allows authenticated users to set their own password. Passwords must match and be ≥6 characters.                                |

## Users

| Endpoint         | Method   | Auth         | Query/Body | Notes                                                            |
| ---------------- | -------- | ------------ | ---------- | ---------------------------------------------------------------- |
| `/api/users`     | `GET`    | Bearer token | none       | Returns `{ count, users }` where each user omits `passwordHash`. |
| `/api/users/:id` | `DELETE` | Admin only   | path `id`  | Removes a user and their Cloudinary profile image if present.    |

## Announcements

| Endpoint                 | Method   | Auth         | Body/Files                                                                            | Notes                                                             |
| ------------------------ | -------- | ------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `/api/announcements`     | `POST`   | Admin only   | `multipart/form-data` with `title`, `message`, optional `attachments` (up to 5 files) | Stores announcement metadata and attachment URLs from Cloudinary. |
| `/api/announcements`     | `GET`    | Bearer token | none                                                                                  | Returns active announcements sorted by newest first.              |
| `/api/announcements/:id` | `DELETE` | Admin only   | path `id`                                                                             | Removes the announcement document.                                |

## Assignments

| Endpoint               | Method   | Auth         | Body                   | Notes                                                                                                                     |
| ---------------------- | -------- | ------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/api/assignments`     | `GET`    | Bearer token | none                   | Returns the single assignment document with populated lead/backup/prayer team members.                                    |
| `/api/assignments`     | `POST`   | Admin only   | `{ userId, category }` | Adds a user to a category (`leadSingers`, `backupSingers`, `prayerTeam`). Sends an email notification.                    |
| `/api/assignments/:id` | `DELETE` | Admin only   | `{ userId, category }` | Removes a user from the specified category. `:id` can be ignored (assignment doc is singleton) but the route enforces it. |

## Resources

| Endpoint                | Method   | Auth         | Body/Tags                                                                                                                                           | Notes                                                                                                     |
| ----------------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `/api/resources/upload` | `POST`   | Bearer token | `multipart/form-data` — `title` (required), `description`, optional `type` (`lyrics`, `pdf`, `audio`, `video`), files field named `files` (max 20). | Files are stored on Cloudinary; each saved resource infers type from MIME. Returns created resource docs. |
| `/api/resources`        | `GET`    | Bearer token | none                                                                                                                                                | Returns all uploaded resources sorted by newest first, with `uploadedBy` populated.                       |
| `/api/resources/:id`    | `DELETE` | Admin only   | path `id`                                                                                                                                           | Deletes both the DB document and the Cloudinary file.                                                     |

### File upload tips

- Always send `multipart/form-data` when uploading announcements/resources. Use the field names shown (`attachments` for announcements, `files` for resources).
- You may optionally provide `type` when uploading resources; otherwise the server guesses based on MIME (audio/video/pdf/text).

## Errors & common responses

- Most endpoints return `{ success: true/false, message, ... }`. Check `message` for user-friendly reasons (invalid category, missing title, unauthorized, etc.).
- Validation failures respond with `400`, auth failures with `401`/`403`, and server issues with `500`.

## Frontend-specific notes

1. After login, persist `token` and refresh it every 12 hours (or prompt a re-login).
2. Include `_id` values returned from `/api/users` and `/api/assignments` when referencing members.
3. Categories for assignments are limited to `leadSingers`, `backupSingers`, and `prayerTeam`; the backend checks this list.
4. Attachments/routes use Cloudinary-backed URLs, so clients can directly embed the `url` field when rendering files.
5. The server exposes static files under `/uploads` if you ever need to serve raw uploads locally.

Let me know if you want example requests (Postman, curl) or JSON schemas for any of the resources.
