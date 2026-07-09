# Classroom Warden

Live noise intelligence console for schools — with a cinematic landing page, calm audio/motion engine, and real account sign-up.

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:5173/** — you'll see the marketing landing page. Sign up, then launch the Warden Console.

## Real sign-up (production)

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. In Supabase → **Authentication** → enable Email provider.
4. Run `supabase/schema.sql` in the SQL Editor (optional profiles table).
5. Restart `npm run dev`.

Without `.env`, accounts are stored **locally in the browser** (works for demos, not shared across devices).

## Social sign-in (Google, GitHub, Yahoo)

1. In Supabase → **Authentication** → **Providers**:
   - Enable **Google** and **GitHub** (paste client ID/secret from each provider’s developer console).
   - For **Yahoo**: add a [custom OAuth provider](https://supabase.com/docs/guides/auth/social-login/auth-custom-oauth) with slug `yahoo` (Yahoo Developer Network OAuth2).
2. In Supabase → **Authentication** → **URL Configuration**, add redirect URLs:
   - `http://localhost:5173/console`
   - `https://classroom-warden.vercel.app/console`
3. Deploy the same `VITE_SUPABASE_*` vars on Vercel.

The landing page sign-in modal shows **Continue with Google / Yahoo / GitHub** when Supabase is configured.

### Where the landing UI lives (vs Lovable export)

| What you see in Lovable | Your project (React + Vite) |
|-------------------------|-----------------------------|
| `src/routes/` or `src/pages/` (TanStack Start) | `src/pages/LandingPage.jsx` |
| Hero + nav + CTAs | Same file + `src/styles/Landing.css` |
| Constellation background | `src/components/landing/ConstellationBg.jsx` |
| Sign-in / sign-up modal | `src/components/landing/AuthModal.jsx` |
| Social buttons | `src/components/landing/SocialAuthButtons.jsx` |
| Auth logic | `src/context/AuthContext.tsx` |

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page — sign in / sign up |
| `/console` | Protected dashboard (requires login) |

## Stack

- React 19 + Vite
- Framer Motion (WardenCalmEngine)
- Web Audio UI sounds
- Supabase Auth (or local fallback)
- React Router

## Deploy

```bash
npm run build
```

Set the same `VITE_*` env vars in Vercel project settings before deploying.
