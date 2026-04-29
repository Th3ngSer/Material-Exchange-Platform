# Material Xchange Platform - Phase 1 Frontend Authentication

This document describes the frontend authentication implementation for Phase 1 of the Material Xchange Platform.

## Overview

The authentication system includes:

- **Login Form** - User login with email and password
- **Sign-Up Form** - User registration with password strength indicator
- **Auth Store (Pinia)** - Centralized state management for authentication
- **API Service** - Communicates with backend auth endpoints
- **Validation Utils** - Email, password, and form validation functions
- **Auth Pages** - Login, Sign-Up, and Home pages with routing

## Project Structure

```
src/
├── components/
│   └── auth/
│       ├── LoginForm.vue          # Login form component
│       └── SignUpForm.vue         # Sign-up form with strength indicator
├── services/
│   └── auth.ts                    # API service for auth endpoints
├── stores/
│   └── auth.ts                    # Pinia store for auth state
├── types/
│   └── auth.ts                    # TypeScript interfaces
├── utils/
│   └── validation.ts              # Form validation utilities
├── views/
│   ├── LoginView.vue              # Login page
│   ├── SignUpView.vue             # Sign-up page
│   └── HomeView.vue               # Home/dashboard page
├── router/
│   └── index.ts                   # Route configuration
├── App.vue                        # Main app component
└── main.ts                        # App entry point
```

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already in `package.json`:

```bash
cd Frontend
npm install
```

### 2. Configure Backend API URL

Edit `.env` to point to your backend API:

```
VITE_API_URL=http://localhost:3000/api
```

For production, update `.env.production`.

### 3. Start the Development Server

```bash
npm run dev
```

The application will run at `http://localhost:5173` (or another available port).

## Features

### Authentication Pages

#### Login Page (`/login`)
- Email validation
- Password input
- Loading state during submission
- Error message display
- Link to sign-up page

#### Sign-Up Page (`/signup`)
- Email validation with format check
- Password validation with strength indicator
- Real-time password strength feedback
- Confirm password input
- Password requirements display:
  - Minimum 8 characters
  - One uppercase letter
  - One lowercase letter
  - One number
- Link to login page

#### Home Page (`/`)
- Displays user email when authenticated
- Logout button
- Navigation between auth pages

### Form Validation

All forms include real-time validation:

- **Email**: Must be valid email format
- **Password**: Must meet strength requirements
- **Confirm Password**: Must match password

### Error Handling

- User-friendly error messages
- Validation errors shown per field
- API errors displayed in form
- Error messages persist until form submission is attempted again

### Loading States

- Submit button shows loading indicator while request is in progress
- Form inputs are disabled during submission
- Loading text replaces button text

## API Integration

### Backend Endpoints Required

The implementation expects these endpoints from the backend:

#### POST `/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/auth/register`
**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "new_user_id",
    "email": "newuser@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Store Usage

### Pinia Auth Store

```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// State
authStore.user              // Current user or null
authStore.isLoading        // true while API request is in progress
authStore.error            // Error message or null
authStore.isAuthenticated  // true if user is logged in

// Methods
await authStore.login(credentials)
await authStore.register(credentials)
authStore.logout()
authStore.clearError()
authStore.initializeAuth()
```

## Authentication Flow

1. **Login/Registration**:
   - User enters credentials
   - Form validates input
   - API call made to backend
   - On success: token stored, user set, redirect to home
   - On error: error message displayed

2. **Token Storage**:
   - JWT token stored in `localStorage` as `authToken`
   - Used for subsequent authenticated requests

3. **Session Initialization**:
   - On app startup, `initializeAuth()` checks for token
   - If no token, user remains logged out
   - Future implementation: validate token or fetch user data

## Testing the Authentication

### Test Login Flow
1. Start backend at `http://localhost:3000`
2. Run `npm run dev` in Frontend
3. Navigate to `http://localhost:5173/login`
4. Enter test credentials
5. Should redirect to home page showing logged-in user

### Test Sign-Up Flow
1. Navigate to `http://localhost:5173/signup`
2. Enter new email and password
3. Password strength indicator shows real-time feedback
4. Submit form
5. Should redirect to home page after successful registration

### Test Validation
1. Try submitting empty forms - validation errors appear
2. Try invalid email - validation error shows
3. Try weak password - strength indicator shows "weak"
4. Try mismatched passwords - confirmation error shows

## TypeScript Types

See `src/types/auth.ts` for all TypeScript interfaces:

- `User` - User object structure
- `LoginCredentials` - Login form data
- `RegisterCredentials` - Sign-up form data
- `AuthResponse` - Backend response structure
- `AuthState` - Store state structure
- `ApiError` - API error structure

## Future Enhancements

- [ ] Persist user session across page refreshes
- [ ] Add "Remember Me" functionality
- [ ] Implement password reset flow
- [ ] Add 2FA/MFA support
- [ ] Token refresh logic
- [ ] Social authentication (Google, GitHub)
- [ ] Email verification
- [ ] Protected routes/navigation guards
- [ ] Rate limiting for login attempts
- [ ] Account lockout after failed attempts

## Troubleshooting

### API Connection Issues
- Ensure backend is running on correct port (default: 3000)
- Check `VITE_API_URL` in `.env` matches backend URL
- Check browser console for CORS errors

### Form Not Submitting
- Check browser console for errors
- Verify all validation errors are resolved
- Check network tab to see API request status

### Token Not Persisting
- Check if `localStorage` is enabled
- Check if token was returned from backend
- Check Application tab in DevTools for `authToken`

## Additional Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
