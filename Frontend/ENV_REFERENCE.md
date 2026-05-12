# Environment Variables Reference

## Development (.env)

```
VITE_API_URL=http://localhost:3000/api
```

- Used during local development
- Points to local backend instance
- Port: 3000 (default for NestJS backend)

## Production (.env.production)

```
VITE_API_URL=https://api.materialxchange.com/api
```

- Used when building for production
- Points to production backend
- Update this URL to match your production backend domain

## Frontend Dev Server

The frontend runs on:

- **Development**: `http://localhost:5173`
- **Build output**: `dist/` folder

## Note

- These are Vite environment variables (prefixed with VITE\_)
- They are inlined during build time
- Change backend URL before deploying to different environments
- Never commit sensitive credentials to version control

## Usage in Code

```typescript
const API_URL = import.meta.env.VITE_API_URL
```

This automatically uses the correct environment based on build mode.
