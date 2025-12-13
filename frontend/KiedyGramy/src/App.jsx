import { useState } from "react";
import "./App.css";
import AuthPage from "./pages/AuthPage.jsx";
import GamesPage from "./pages/GamesPage.jsx";
import NewGamePage from "./pages/NewGamePage.jsx";
import Layout from "./layouts/Layout.jsx";
import { Routes, Route } from "react-router";

function App() {
  return (
    <div className="App position-relative min-vh-100">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route path="/*" element={<Layout />} >
          <Route path="games" element={<GamesPage />} />
          <Route path="games/new" element={<NewGamePage />} />
        </Route>
      </Routes>
    </div>

  );
}

export default App;
