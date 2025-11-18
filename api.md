# Authentication API

This document provides human-friendly documentation for the REST endpoints exposed
by the NestJS authentication service that lives under the `/auth` route prefix.
Use it alongside `request.http` whenever you want concrete examples you can run
from an HTTP client such as VS Code's REST extension or `curl`.

## Base URL

The examples below use the local development server:

```
http://localhost:8080
```

Replace it with your deployed host when necessary. All routes listed here are
relative to the `/auth` controller prefix, e.g. `GET /auth/all`.

## Authentication

- `POST /auth/signin` returns a JSON Web Token (JWT) stored under `token`.
- For every route marked as **Protected** set the header
  `Authorization: Bearer <token>` where `<token>` is the JWT returned at sign-in.
- Tokens are validated with the shared secret configured in `JwtAuthGuard`.

## Endpoints

### Get All Users — `GET /auth/all` (**Protected**)

Returns every user stored in the database. Useful for administrative use cases.

**Response**

```json
[
  {
    "id": 1,
    "name": "Jane Doe",
    "email": "mail.dne@example.com",
    "password": "$2b$10$...",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
  }
]
```

> Passwords are returned as salted hashes. Avoid exposing this endpoint outside
> trusted environments unless you trim sensitive fields.

### Register — `POST /auth/register`

Creates a new user.

| Field     | Type   | Notes                                                     |
|-----------|--------|-----------------------------------------------------------|
| `name`    | string | Required, minimum 2 characters.                           |
| `email`   | string | Required, must be unique and a valid email.               |
| `password`| string | Required, 8–20 characters with mixed case & special chars.|

**Response**

```json
{
  "id": 2,
  "name": "@J1ohndoe",
  "email": "mail.dne@example.com",
  "password": "$2b$10$..."
}
```

### Sign In — `POST /auth/signin`

Authenticates a user and issues a JWT token that unlocks protected routes.

| Field     | Type   | Notes                               |
|-----------|--------|-------------------------------------|
| `email`   | string | Required, must match an existing user. |
| `password`| string | Required, validated against stored hash. |

**Response**

```json
{
  "id": 2,
  "name": "@J1ohndoe",
  "email": "mail.dne@example.com",
  "password": "$2b$10$...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

### Update Password — `PATCH /auth/update-password` (**Protected**)

Allows an authenticated user to rotate their password.

| Field         | Type   | Notes                                        |
|---------------|--------|----------------------------------------------|
| `oldPassword` | string | Required, must match the current password.   |
| `newPassword` | string | Required, same strength requirements as registration. |

A successful call returns the updated user object (with the password hash).

### Logout — `GET /auth/logout` (**Protected**)

Clears the persisted JWT token for the current user and responds with:

```json
{ "message": "User is logout successfully" }
```

Send the same `Authorization: Bearer <token>` header used for other protected
routes so the backend can determine which user to log out.

## Error Handling

All errors use standard NestJS HTTP responses. Common scenarios include:

- `400 Bad Request` — duplicate email during registration, unknown email, or
  mismatched passwords.
- `401 Unauthorized` — missing/invalid bearer token on protected routes.

The JSON payload typically looks like:

```json
{
  "statusCode": 401,
  "message": "Token missing",
  "error": "Unauthorized"
}
```

Use these messages to guide client-side error handling.
