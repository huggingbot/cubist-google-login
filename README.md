# Google Login + CubeSigner Test (Vite)

This app is a browser test harness for:

- Google OIDC sign-in (`id_token`)
- CubeSigner OIDC session creation
- Key/share operations through CubeSigner SDK

## Local development

```bash
yarn install
cp .env.example .env.local   # then fill in your values
yarn dev
```

Open `http://localhost:3000`.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_DEFAULT_ORG_ID` | Pre-fills the CubeSigner Org ID field |
| `VITE_DEFAULT_GOOGLE_CLIENT_ID` | Pre-fills the Google Client ID field |

Create a `.env.local` file (git-ignored) for local development:

```
VITE_DEFAULT_ORG_ID=Org#your-org-id
VITE_DEFAULT_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Required config in UI

- **CubeSigner Org ID**: your `Org#...`
- **Environment**: `gamma`, `beta`, or `prod`
- **Google Client ID**: the Google OAuth Web Client ID
- **Scopes**: default is `sign:*,manage:*,export:*`

When you click Google Sign-In, the app:

1. receives Google `credential` (ID token),
2. decodes and displays token payload details,
3. calls `CubeSignerClient.createOidcSession(...)` with that ID token,
4. creates a CubeSigner client session and enables key/share actions.

## GitHub Pages build

Set a base path and build:

```bash
VITE_BASE_PATH=/your-repo-name/ yarn build
```

Or use:

```bash
yarn build:pages
```

Override the default repo name with:

```bash
PAGES_REPO=your-repo-name yarn build:pages
```

This repo already includes `.github/workflows/deploy.yml` for GitHub Pages.
It sets:

- `VITE_BASE_PATH=/${{ github.event.repository.name }}/`
- Pages source via `actions/deploy-pages`

The workflow reads `VITE_DEFAULT_ORG_ID` and `VITE_DEFAULT_GOOGLE_CLIENT_ID`
from **GitHub repository secrets**. Add them in **Settings > Secrets and variables > Actions**.

## Deployment notes

- Add your Pages origin to Google OAuth **Authorized JavaScript origins**.
- Ask Cubist to allow your Pages origin for browser OIDC/session testing.
