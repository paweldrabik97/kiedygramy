import React, { useState } from "react";
import { register } from "../services/auth";
import { login, me } from "../services/auth";
import { useNavigate } from "react-router-dom";
import SubmitButton from "../components/ui/SubmitButton";

const AuthPage = () => {
  // State for form inputs
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    city: "",
  });

  // States for UI feedback
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Navigation hook
  const navigate = useNavigate();

  // Handler for text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handler for login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.username, formData.password);
      console.log(await me());
    } catch (err) {
      setError(`Login failed. Please check your credentials. ${err}`);
      console.error("Login failed:", err);
    }
  };

  // Handler for registration form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        city: formData.city,
      });
      navigate("/welcome");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">AuthPage</h1>
      <div className="main-section flex items-center max-w-7xl mx-auto gap-8">
        <div className="login-section ">
          <div className="login-form">
            <h2 className="text-2xl font-semibold mb-4">Login Form</h2>
            {/* Display error message if any */}
            {error && (
              <div className="error-message" style={{ color: "red" }}>
                {error}
              </div>
            )}
            <form>
              <div className="mb-4">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <SubmitButton onClick={handleLoginSubmit}>Login</SubmitButton>
            </form>
          </div>
        </div>
        <div className="register-section">
          <div className="register-form">
            <h2 className="text-2xl font-semibold mb-4">Register Form</h2>

            {/* Display error message if any */}
            {error && (
              <div className="error-message" style={{ color: "red" }}>
                {error}
              </div>
            )}

            <form>
              <div className="mb-4">
                <label htmlFor="new-username">Username:</label>
                <input
                  type="text"
                  id="new-username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2 mb-4"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="new-password">Password:</label>
                <input
                  type="password"
                  id="new-password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="confirm-password">Confirm Password:</label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="full-name">Full name:</label>
                <input
                  type="text"
                  id="full-name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="city">City:</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <SubmitButton onClick={handleRegisterSubmit} disabled={loading}>
                {loading ? "Rejestrowanie..." : "Załóż konto"}
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
