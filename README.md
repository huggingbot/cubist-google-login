# Google Login + CubeSigner Test (Vite)

This app is a browser test harness for:

- Google OIDC sign-in (`id_token`)
- CubeSigner OIDC session creation
- Key/share operations through CubeSigner SDK

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

Registration service settings are hardcoded to match
`va-mmcx-recovery-registration-service-api`:

- **Path**: `/recovery/registration/ensure-user`
- **Provider verifier**: `cubist`
- **Base URL**: `https://recovery-registration.dev-api.cx.metamask.io`

## Required config in UI

- **CubeSigner Org ID**: your `Org#...`
- **Google Client ID**: the Google OAuth Web Client ID
- **Scopes**: default is `sign:*,manage:*,export:*`

When you click Google Sign-In, the app:

1. receives Google `credential` (ID token),
2. decodes and displays token payload details,
3. calls `CubistProvider.createCubistIdentityProof(...)` to create an identity proof,
4. logs the identity proof payload,
5. forwards the proof to the registration service (`ensure-user`) so the backend can create/confirm the user,
6. calls `CubeSignerClient.createOidcSession(...)` with the same ID token,
7. creates a CubeSigner client session and enables key/share actions.

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
