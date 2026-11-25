# FixFlow web app

Use Node.js 24 and the npm version listed in `package.json`. Start the backend first, following the [API setup guide](../Fyp_Backend/README.md), then run:

```powershell
npm ci
npm start
```

Open `http://localhost:4200`. Development uses `http://127.0.0.1:8000/api`. Customer registration is public. Sign in to the technician or owner portal with the account created for that role.

## Checks

```powershell
npm run typecheck
npm run lint
npm test -- --watch=false
npm run build
```

The production build uses the locally bundled [Inter font and license](public/fonts). It uses a same-origin `/api` base URL. Configure the deployment host to proxy `/api/*` to FastAPI and serve non-file frontend URLs such as `/technician/jobs/FF-0001` and `/customer/requests/FF-0001/track` from `index.html`. Keep API routes and static assets ahead of the SPA rewrite.
