Project: PG / Property Management App
Stack: Django + Django REST Framework + React

Authentication:
- Custom Django user model using email
- JWT authentication (SimpleJWT)
- Access + Refresh tokens
- Tokens stored in localStorage
- authFetch wrapper handles Authorization header
- Refresh token logic implemented
- ProtectedRoute in React

Backend Architecture:
- accounts app → authentication
- management app → business logic

Security:
- Global DRF authentication enabled
- DEFAULT_PERMISSION_CLASSES = IsAuthenticated
- owner field added to Property model
- Data filtered by request.user
- perform_create assigns owner automatically

Frontend:
- React Router
- Login page implemented
- Loading state added for login
- Tokens saved in localStorage
- Redirect to homepage after login

Current Features:
- Create property
- List properties
- Delete property

Next Planned Modules:
- Rooms
- Tenants
- Payments
- Maintenance requests



Current architecture:
- JWT authentication using SimpleJWT
- access + refresh tokens
- authFetch wrapper for API calls
- ProtectedRoute in React
- global DRF authentication enabled
- owner-based data isolation implemented