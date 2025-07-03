# Luxury Apartment Booking

This project is split into two parts:

-   Client (React + Vite)
-   Server (Express.js)

## Setup

1. Install client dependencies:

```bash
npm install
```

2. Install server dependencies:

```bash
cd server && npm install
```

## Development

### Start both client and server:

```bash
npm run dev        # Starts Vite dev server
cd server
npm run dev        # In a separate terminal, starts Express server
```

### Client only:

-   Development server: `npm run dev` (http://localhost:5173)
-   Build: `npm run build`
-   Preview build: `npm run preview`

### Server only:

-   Development: `cd server && npm run dev` (http://localhost:3001)
-   Production: `cd server && npm start`
