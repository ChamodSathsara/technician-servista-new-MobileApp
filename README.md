# ServVista Technician Mobile

Expo/React Native app for ServVista field technicians.

## Features

- Technician-only login with persisted JWT and refresh-token rotation
- Installation, breakdown, and site-visit job lists
- Job details, start, meter capture, notes, and completion actions
- Draft estimate creation
- Profile, password change, and sign out

## Run

1. Install Node.js 20+ and Expo Go on the test phone.
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to the backend URL reachable by the phone (for example `http://192.168.1.20:8080`).
3. Run `npm install`.
4. Run `npm start`, then scan the Expo QR code.

Android emulator uses `http://10.0.2.2:8080` by default. A physical phone cannot use `localhost`; use the computer's LAN IP or an HTTPS deployment.

## Backend work required

The current ServVista backend allows `TECHNICIAN` on service schedules, but these controllers are still ADMIN-only: installation jobs, breakdowns, estimates, and meter-reading history. It also does not currently expose `/api/technician/me/password`.

Before production use, add technician-scoped endpoints that derive the technician identity from the JWT. Do not return all company jobs to a technician. Recommended endpoints:

- `GET /api/technician/me/installation-jobs`
- `PATCH /api/technician/me/installation-jobs/{id}/start`
- `POST /api/technician/me/installation-jobs/{id}/complete`
- `GET /api/technician/me/breakdowns`
- `PATCH /api/technician/me/breakdowns/{id}/start`
- `PATCH /api/technician/me/breakdowns/{id}/complete`
- `GET /api/technician/me/service-schedules`
- `PATCH /api/technician/me/service-schedules/{id}/start`
- `PATCH /api/technician/me/service-schedules/{id}/complete`
- `POST /api/technician/me/estimates`
- `PATCH /api/technician/me/password`

The current client paths mirror existing endpoints where possible, so they can be tested after permissions are safely updated. Update `src/api/client.ts` when dedicated `/me` endpoints are added.
