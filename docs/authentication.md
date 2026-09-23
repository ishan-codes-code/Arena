# Arena Authentication

## Email verification OTP

Arena uses email plus password for account creation and sign-in. Signup sends a Supabase email verification OTP; it does not use a verification link or redirect. The signup verification state calls `supabase.auth.verifyOtp({ email, token, type: "email" })` and only then uses the returned Supabase session.

The Supabase confirmation email template must render the OTP token:

```text
{{ .Token }}
```

Resending uses Supabase Auth's signup flow:

```ts
supabase.auth.resend({ type: "signup", email })
```

SMTP and email delivery configuration are managed outside this repository.