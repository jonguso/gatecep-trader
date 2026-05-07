# Gatecep Signup Email + Password Flow

Signup now works like this:

1. User enters trading account, ID, and email.
2. Backend creates a customer number.
3. Email becomes the username.
4. Backend generates a temporary password.
5. Backend sends the password to the user's email.
6. User logs in using email + temporary password.

## Install backend email dependency

```bash
cd backend
npm install nodemailer
```

## Add Railway / .env variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="Gatecep Capital Markets <your_email@gmail.com>"
```

For Gmail, use an App Password.

## Patch backend/server.js

See:

```text
backend/src/docs/AUTH_SERVER_PATCH.md
```

## Mobile files updated

```text
mobile/src/auth/AuthContext.js
mobile/app/signup.js
mobile/app/login.js
```
