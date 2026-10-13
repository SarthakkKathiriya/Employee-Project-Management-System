# Employee & Project Management System

This is a MERN project for storing employee details and keeping track of projects. The backend contains the main features. The frontend is intentionally basic and is mostly for signing in and viewing information.

## Features

- Register and log in with a JWT
- View employees and projects
- View dashboard totals
- Admin-only create, update, and delete API endpoints
- Validate project dates and assigned employees on the server

## Tech used

- MongoDB and Mongoose
- Node.js and Express
- React and Vite
- bcryptjs, jsonwebtoken, and express-validator

## Folder structure

```text
submission-version/
  client/   React client
  server/   Express API and database models
```

## Setup

You need Node.js and either MongoDB running locally or a MongoDB Atlas database.

1. Copy `server/.env.example` to `server/.env` and update its values.
2. In a terminal, start the API:

   ```bash
   cd server
   npm install
   npm run dev
   ```

3. In another terminal, copy `client/.env.example` to `client/.env`, then start the client:

   ```bash
   cd client
   npm install
   npm run dev
   ```

The API normally runs at `http://localhost:5000` and Vite normally runs at `http://localhost:5173`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Port used by the API |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `JWT_EXPIRES_IN` | How long a token is valid |
| `CLIENT_URL` | Frontend origin allowed by CORS |
| `VITE_API_URL` | API address used by the client |
| `ADMIN_PASSWORD` | A unique password of at least 6 characters for the initial admin account |

When the API starts, it ensures an admin account exists with the email `admin@gmail.com`. Set `ADMIN_PASSWORD` in your local `server/.env` before starting the API, then sign in with that email and the password you chose. If the account already exists as an admin, its password is not reset on restart. If it exists as a regular user, startup promotes it to admin and sets the configured password. Each person using the project should choose a different password; never commit actual `.env` files or passwords.

## API routes

Employee, project, and dashboard routes need a bearer token. Only an admin can create, edit, or delete employee and project records.

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Check that the API is running |
| POST | `/api/auth/register` | Register a regular user |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get the current user |
| GET, POST | `/api/employees` | List or create employees |
| GET, PUT, DELETE | `/api/employees/:id` | Get, update, or delete an employee |
| GET | `/api/employees/departments` | List departments |
| GET, POST | `/api/projects` | List or create projects |
| GET, PUT, DELETE | `/api/projects/:id` | Get, update, or delete a project |
| GET | `/api/dashboard/stats` | Get dashboard counts |

## Deployment

The application uses MongoDB Atlas for the database, Render for the Express API, and Vercel for the Vite frontend.

1. Create a MongoDB Atlas cluster and database user. Add the backend host's outbound IPs to the Atlas network access list (or use an appropriate restricted network policy), and copy the database connection string.
2. In Render, create a Blueprint from this repository using `render.yaml`. Set the requested `MONGO_URI`, `ADMIN_PASSWORD` (at least 6 characters), and a temporary `CLIENT_URL` such as `http://localhost:5173`. Render generates `JWT_SECRET`.
3. After Render deploys, copy the API service URL, for example `https://employee-project-management-api.onrender.com`.
4. Import the repository into Vercel with the client directory (`client`) as the Root Directory. Set `VITE_API_URL` to the Render API URL ending in `/api`, for example `https://employee-project-management-api.onrender.com/api`. Deploy the frontend and copy its public URL.
5. In Render, update `CLIENT_URL` to the exact Vercel origin (for example, `https://your-project.vercel.app`) and redeploy the API if prompted.
6. Sign in with `admin@gmail.com` and the private `ADMIN_PASSWORD` configured in Render.

Never place real connection strings, passwords, or JWT secrets in source control. The `client/vercel.json` rewrite supports client-side routes.

Run `npm run lint` and `npm run build` in the client folder for the available client checks.

## Managing employees and projects through the API

The current dashboard can display employees and projects, but it does not yet provide forms or buttons to create, edit, or delete them. Until those screens are implemented, use an API client such as Postman:

1. Sign in with `POST http://localhost:5000/api/auth/login` and a JSON body:

   ```json
   {
     "email": "admin@gmail.com",
     "password": "<the ADMIN_PASSWORD from your local server/.env>"
   }
   ```

2. Copy the token from `data.token` in the response.
3. For protected requests, set `Authorization: Bearer <token>` and `Content-Type: application/json`.
4. Create employees before projects if you want to assign employees. Use the employee MongoDB `_id` values in the project's `assignedEmployees` array.

Successful API responses use a JSON object with `success`, `message`, and `data` properties. List endpoints return the records in `data` and pagination details in `pagination`. Error responses include `success: false`, a `message`, and an `errors` array.

Send all employee and project dates in `DD-MM-YYYY` format (for example, `05-11-2026`). The API stores dates as MongoDB dates and serializes date values in responses as ISO 8601 strings. The frontend displays dates in `DD-MM-YYYY` format.

### Employee fields

Use this JSON body with `POST /api/employees` to create an employee and `PUT /api/employees/:id` to replace/update one. The update validator expects the required fields too.

| Field | Required | Details |
| --- | --- | --- |
| `name` | Yes | Employee name; trimmed |
| `email` | Yes | Valid email address; unique across employees |
| `phone` | Yes | Exactly 10 digits |
| `designation` | Yes | Job title |
| `department` | Yes | Department name |
| `joiningDate` | Yes | Valid date in `DD-MM-YYYY` format |
| `status` | No | `Active` or `Inactive`; defaults to `Active` on creation |

Example:

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "5551234567",
  "designation": "Developer",
  "department": "Engineering",
  "joiningDate": "01-10-2026",
  "status": "Active"
}
```

Employee routes:

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/employees` | List employees |
| POST | `/api/employees` | Create an employee (admin only) |
| GET | `/api/employees/:id` | Get one employee |
| PUT | `/api/employees/:id` | Update an employee (admin only) |
| DELETE | `/api/employees/:id` | Delete an employee (admin only) |
| GET | `/api/employees/departments` | List department names |

The employee list accepts `search` (matches name or email), `department`, `status`, `sortBy`, `order` (`asc` or `desc`), `page`, and `limit` query parameters. For example: `GET /api/employees?search=jane&status=Active&page=1&limit=10`.

### Project fields

Use this JSON body with `POST /api/projects` to create a project and `PUT /api/projects/:id` to update one. The update validator expects the required fields too.

| Field | Required | Details |
| --- | --- | --- |
| `name` | Yes | Project name |
| `description` | Yes | Project description |
| `startDate` | Yes | Valid date in `DD-MM-YYYY` format |
| `deadline` | Yes | Valid date in `DD-MM-YYYY` format; must not be before `startDate` |
| `priority` | Yes | `Low`, `Medium`, or `High` |
| `status` | Yes | `Pending`, `In Progress`, or `Completed` |
| `assignedEmployees` | Yes | Array of existing employee `_id` strings; use `[]` for no assignments |

Example:

```json
{
  "name": "Website Refresh",
  "description": "Refresh the company website",
  "startDate": "15-10-2026",
  "deadline": "15-12-2026",
  "priority": "High",
  "status": "Pending",
  "assignedEmployees": []
}
```

Project routes:

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/projects` | List projects; assigned employees are populated in the response |
| POST | `/api/projects` | Create a project (admin only) |
| GET | `/api/projects/:id` | Get one project |
| PUT | `/api/projects/:id` | Update a project (admin only) |
| DELETE | `/api/projects/:id` | Delete a project (admin only) |

The project list accepts `status`, `search` (matches project name), `page`, and `limit` query parameters. For example: `GET /api/projects?status=In%20Progress&page=1&limit=10`.

### Stored metadata

Both records also have MongoDB `_id`, `createdBy`, `createdAt`, and `updatedAt` fields. These are generated/managed by the backend; do not include them when creating records. Project `assignedEmployees` contains employee IDs when submitted, and the API populates employee details when returning projects.

## Pending work

- Add employee create, edit, and delete forms/actions to the frontend.
- Add employee search, department/status filters, and pagination controls to the frontend.
- Add project create, edit, and delete forms/actions to the frontend, including selecting multiple employees.
- Add project status/search filters and pagination controls to the frontend.
- Add frontend validation and user feedback for API errors and successful changes.
