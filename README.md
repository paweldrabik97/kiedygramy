# 🎲 KiedyGramy

**KiedyGramy** is a modern web platform designed to streamline the organization of Tabletop RPG sessions and board game nights. It solves the eternal problem of "scheduling conflicts," manages your game library, and enables real-time communication for your party.

![Project Banner](https://i.ibb.co/jkjG9XsW/obraz-2026-01-04-120352259.png)


## ✨ Key Features

* **3D Interactive Landing Page:** Features a physics-based dice simulation (using *Three.js* & *Cannon.js*) where dice react to UI elements (e.g., bouncing off the navigation bar).
* **Real-Time Communication:** Group chat for sessions powered by **SignalR** (WebSockets) with live notifications.
* **Player Dashboard:** Instant overview of upcoming sessions, stats, recent games, and pending invitations.
* **Session Management:** Create events, invite players, and vote on dates.
* **Secure Authentication:** Robust login system using **HttpOnly Cookies** (ASP.NET Core Identity) for maximum security (no LocalStorage tokens).
* **Game Library:** Manage your collection of RPG systems and board games.

## 🛠️ Tech Stack

### Frontend
* **React 18** (Vite)
* **Tailwind CSS** - Styling and Dark Mode support.
* **React Three Fiber (R3F)** - 3D rendering.
* **use-cannon** - Physics engine for the dice.
* **@microsoft/signalr** - WebSocket client.
* **React Router** - Client-side routing.

### Backend
* **.NET 8** (ASP.NET Core Web API)
* **Entity Framework Core** - ORM.
* **SignalR** - Real-time Hubs (Chat, Notifications).
* **PostgreSQL** - Database.
* **ASP.NET Core Identity** - Authentication & Authorization.

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [.NET SDK](https://dotnet.microsoft.com/download) (v8.0+)
* PostgreSQL (Local installation or Docker container)

### 1. Backend Setup

1.  Navigate to the server directory.
2.  Update the connection string in `appsettings.Development.json` to match your PostgreSQL credentials:
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "Host=localhost;Database=KiedyGramyDb;Username=postgres;Password=your_password"
    }
    ```
3.  Apply database migrations:
    ```bash
    dotnet ef database update
    ```
4.  Start the API:
    ```bash
    dotnet run
    ```
    *The API typically starts on `https://localhost:7008`.*

### 2. Frontend Setup

1.  Navigate to the client directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Important:** Verify your `vite.config.js` proxy settings to handle CORS and SignalR WebSockets correctly (pointing to port 7008):
    ```javascript
    // vite.config.js
    server: {
      proxy: {
        '/api': {
          target: 'https://localhost:7008',
          changeOrigin: true,
          secure: false,
        },
        '/hubs': {
          target: 'https://localhost:7008',
          changeOrigin: true,
          secure: false,
          ws: true // Crucial for SignalR WebSocket connection!
        }
      }
    }
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## 📸 Screenshots

| 3D Physics Landing Page | Dashboard |
| :---: | :---: |
| ![Landing](https://i.ibb.co/qYFFTKF7/obraz-2026-01-04-121654214.png) | ![Dashboard](https://i.ibb.co/tMCtRxMQ/obraz-2026-01-04-121252224.png) |

| Session Chat | Auth Page |
| :---: | :---: |
| ![Chat](https://i.ibb.co/bM0D7KHM/obraz-2026-01-04-121541376.png) | ![Auth](https://i.ibb.co/WNMLCR1M/obraz-2026-01-04-121749076.png) |

*(Replace these placeholders with your actual screenshots)*

## 🐛 Troubleshooting & Known Issues

* **SignalR Connection Closed / 404 Errors:** * Ensure the backend is running on port **7008**.
    * Check if `vite.config.js` has `ws: true` for the `/hubs` proxy.
    * Verify that the Hub route in `Program.cs` (e.g., `/hubs/sessionChat`) matches the client URL.
* **SSL / Certificate Errors:** * If the browser blocks the connection, visit the API URL (e.g., `https://localhost:7008/api/health`) manually and accept the self-signed developer certificate.
* **Dice Physics Barrier:**
    * The dice bounce off the navbar based on the `topBarrierOffset` prop passed to the `DicePhysicsScene` component. Ensure this matches your navbar height.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
