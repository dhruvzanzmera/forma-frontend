# Forma E-Commerce Frontend

Responsive React + Vite storefront and protected admin workspace for the Forma e-commerce API.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if the API is not at `http://localhost:5000/api/v1`.
3. Start the backend and MongoDB. The backend CORS `CLIENT_URL` must match the frontend origin.
4. Start the frontend with `npm run dev`. Vite uses `http://localhost:3000` to match the backend's configured local client origin.

Use `npm run build` to create a production bundle and `npm run lint` to run Oxlint.

## API integration

All requests use the central Axios client in `src/api/client.js`; endpoint paths and payloads are defined in separate service modules under `src/services/`. The client attaches the persisted Bearer token, normalizes common API errors, and clears an expired session after a `401` response.

Customer and admin screens use the documented `/api/v1` endpoints. The API reference does not define an admin single-order detail endpoint, so the admin order detail screen derives its record from the documented paginated admin order list.

## Frontend structure

- `src/api/`: shared HTTP client and token handling
- `src/services/`: customer and admin API modules
- `src/context/`: authentication state
- `src/App.jsx`: routed customer and admin experiences
- `src/App.css` and `src/index.css`: responsive design system
