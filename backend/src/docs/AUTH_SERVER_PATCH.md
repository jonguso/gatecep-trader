# Auth server.js patch

Install:

```bash
npm install nodemailer
```

Add import:

```js
import { authRouter } from "./routes/authRoutes.js";
```

Add after `app.use(express.json())`:

```js
app.use("/auth", authRouter);
```

Railway variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="Gatecep Capital Markets <your_email@gmail.com>"
```
