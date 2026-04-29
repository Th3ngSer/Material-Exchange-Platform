# Quick Start - Frontend Authentication

## 1-Minute Setup

### Prerequisites
- Node.js v20.19.0 or v22.12.0+
- Backend running at `http://localhost:3000`

### Start Development Server

```bash
cd Frontend
npm install  # If you haven't already
npm run dev
```

Open `http://localhost:5173` in your browser.

## Test the Authentication

### Available Routes
- `/` - Home page
- `/login` - Login form
- `/signup` - Sign-up form

### Test Credentials (if available from backend)
If your backend has test users, use them to test the login flow.

### Test User Registration
1. Go to `/signup`
2. Enter test email: `test@example.com`
3. Password must include:
   - At least 8 characters
   - One uppercase letter (e.g., A)
   - One lowercase letter (e.g., a)
   - One number (e.g., 1)
   - Example: `TestPassword123`
4. Confirm password
5. Click "Sign Up"

### Expected Behavior After Login/Signup
- Redirected to home page (`/`)
- User email displayed in welcome message
- Logout button appears
- Token stored in browser localStorage

## File Structure

**Core Auth Files:**
- `src/stores/auth.ts` - Authentication state management
- `src/services/auth.ts` - Backend API communication
- `src/components/auth/LoginForm.vue` - Login component
- `src/components/auth/SignUpForm.vue` - Registration component
- `src/types/auth.ts` - TypeScript types

**Pages:**
- `src/views/LoginView.vue`
- `src/views/SignUpView.vue`
- `src/views/HomeView.vue`

**Configuration:**
- `.env` - Development API endpoint
- `.env.production` - Production API endpoint

## Next Steps

1. **Test backend integration**: Ensure `/auth/login` and `/auth/register` endpoints work
2. **Add protected routes**: Use route guards to protect authenticated pages
3. **Implement token refresh**: Add JWT refresh token logic
4. **Add navigation guards**: Prevent access to auth pages when logged in
5. **Style customization**: Update CSS in components to match your design

## Debugging

**Check Network Tab:**
- Verify API requests to backend are made
- Check response status (200, 400, 401, 500, etc.)

**Check Console:**
- Verify no JavaScript errors
- Check error messages from auth store

**Check DevTools Application Tab:**
- Verify `authToken` is stored in localStorage after login
- Token should be removed after logout

## Documentation

See `AUTH_SETUP.md` for complete documentation including:
- Feature overview
- Component details
- API endpoint specifications
- Store usage examples
- Troubleshooting guide
