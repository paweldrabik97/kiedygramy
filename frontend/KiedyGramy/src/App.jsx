import { useState } from "react";
import "./App.css";
import AuthPage from "./pages/AuthPage.jsx";
import GamesPage from "./pages/GamesPage.jsx";
import NewGamePage from "./pages/NewGamePage.jsx";
import SessionsPage from './pages/SessionsPage';
import SessionDetailsPage from './pages/SessionDetailsPage.jsx';
import DashboardPage from "./pages/DashboardPage.jsx";
import Layout from "./layouts/Layout.jsx";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import NotificationsPage from "./features/notifications/components/NotificationsPage";

function App() {
  return (
    <div className="App position-relative min-vh-100">
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/*" element={ <Layout /> }>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="games/new" element={<NewGamePage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="sessions/:id" element={<SessionDetailsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
      

    </div>

  );
}

export default App;
