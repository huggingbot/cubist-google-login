# Google Login + CubeSigner Token Flow Test

This app is a browser test harness for a focused token flow:

- Google OIDC sign-in (`id_token`)
- ID token -> CubeSigner identity proof
- identity proof -> local registration service (`ensure-user`)
- ID token -> CubeSigner session token exchange

It provides:

- a **tabbed interface** with each step as an independent tab (own inputs, outputs)
- a **one-click full flow** tab that only shows the final session token

## Local MetaMask MFA SDK tarballs

This repo consumes local tarballs for `@metamask/mfa-wallet-recovery` and its
workspace dependencies from `.local-tarballs/`.

When the SDK changes, rebuild + repack from
`/Users/weechien/metamask/mfa-wallet-sdk`:

```bash
yarn install
yarn build
npm pack ./packages/mfa-wallet-interface --pack-destination /Users/weechien/myproject/test-google-login/.local-tarballs
npm pack ./packages/mfa-wallet-e2ee --pack-destination /Users/weechien/myproject/test-google-login/.local-tarballs
npm pack ./packages/mfa-wallet-network --pack-destination /Users/weechien/myproject/test-google-login/.local-tarballs
npm pack ./packages/mfa-wallet-recovery --pack-destination /Users/weechien/myproject/test-google-login/.local-tarballs
```

Then in this repo:

```bash
YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install
```

## Local development

```bash
yarn install
cp .env.example .env.local
yarn dev
```

Open `http://localhost:3010`.
(`3010` is used so local registration service can run on `3000`.)

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_DEFAULT_ORG_ID` | Pre-fills the CubeSigner Org ID field |
| `VITE_DEFAULT_GOOGLE_CLIENT_ID` | Pre-fills the Google Client ID field |

Example `.env.local`:

```
VITE_DEFAULT_ORG_ID=Org#your-org-id
VITE_DEFAULT_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Registration service settings

Registration settings are hardcoded to match
`va-mmcx-recovery-registration-service-api`:

- **Path**: `/recovery/registration/ensure-user`
- **Provider verifier**: `cubist`
- **Base URL**: `http://localhost:3000`

## Using the app

Required config in UI:

- **CubeSigner Org ID**: your `Org#...`
- **Google Client ID**: your Google OAuth Web Client ID
- **Scopes**: default is `sign:*,manage:*,export:*`

### Tabbed interface

The UI is organized into independent tabs. Each tab has its own input and output.
Outputs from one tab automatically fill the input of the next, but you can also
paste values manually to test any step in isolation.

| Tab | Input | Action | Output |
| --- | --- | --- | --- |
| **1. Google Login** | — (Google button) | Sign in with Google | ID token |
| **2. Identity Proof** | Google ID token | Create Identity Proof | Identity proof JSON |
| **3. Create User** | Identity proof JSON | Create User | Registration result |
| **4. Session Token** | Google ID token | Create Session Token | Session token |
| **Full Flow** | — (Google button) | Run Full Flow | Session token |

### One-click full flow

Click **Run Full Flow** in the Full Flow tab:

1. starts a fresh Google sign-in,
2. runs proof creation + user creation + session exchange automatically,
3. shows only the final session token output.

If the Google popup is blocked, use the rendered Google button to continue.

## GitHub Pages build

Set a base path and build:

```bash
VITE_BASE_PATH=/your-repo-name/ yarn build
```

Or:

```bash
yarn build:pages
```

Override default repo name:

```bash
PAGES_REPO=your-repo-name yarn build:pages
```

This repo includes `.github/workflows/deploy.yml` for GitHub Pages. It sets:

- `VITE_BASE_PATH=/${{ github.event.repository.name }}/`
- deployment via `actions/deploy-pages`

The workflow reads `VITE_DEFAULT_ORG_ID` and `VITE_DEFAULT_GOOGLE_CLIENT_ID`
from GitHub Actions secrets.

## Deployment notes

- Add your Pages origin to Google OAuth **Authorized JavaScript origins**.
- Ask Cubist to allow your Pages origin for browser OIDC/session testing.
