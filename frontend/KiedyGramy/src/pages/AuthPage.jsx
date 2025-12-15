import React, { useState } from "react";
import { register, login, me } from "../features/auth/services/auth.js";
import { useNavigate } from "react-router-dom";
import SubmitButton from "../components/ui/SubmitButton";

const AuthPage = () => {
  // State for switching between panels
  const [isRegisterActive, setIsRegisterActive] = useState(false);

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
    setError(null);
    try {
      await login(formData.username, formData.password);
      navigate("/dashboard"); 
    } catch (err) {
      setError(`Login failed. Please check your credentials.`);
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
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl min-h-[600px]">
        
        {/* --- LOGIN SECTION (Left side) --- */}
        <div className="absolute top-0 left-0 h-full w-1/2 flex items-center justify-center p-8 bg-white z-10">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Zaloguj się</h2>
            
            {error && !isRegisterActive && (
              <div className="mb-4 p-2 bg-red-100 text-red-600 rounded text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="text-gray-800">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-100 border border-gray-300 rounded px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-100 border border-gray-300 rounded px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <SubmitButton type="submit" className="w-full">Login</SubmitButton>
            </form>
          </div>
        </div>

        {/* --- REGISTER SECTION (Right side) --- */}
        <div className="absolute top-0 right-0 h-full w-1/2 flex items-center justify-center p-8 bg-white z-10">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Załóż konto</h2>

            {error && isRegisterActive && (
              <div className="mb-4 p-2 bg-red-100 text-red-600 rounded text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="text-gray-800">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-100 border border-gray-300 rounded px-4 py-3 outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-100 border border-gray-300 rounded px-4 py-3 outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-100 border border-gray-300 rounded px-4 py-3 outline-none focus:border-green-500 transition-colors"
                />
                <input
                  type="password"
                  placeholder="Confirm"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-100 border border-gray-300 rounded px-4 py-3 outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-1/2 bg-gray-100 border border-gray-300 rounded px-4 py-3 outline-none focus:border-green-500 transition-colors"
                />
                <input
                  type="text"
                  placeholder="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-1/2 bg-gray-100 border border-gray-300 rounded px-4 py-3 outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <SubmitButton type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                {loading ? "Rejestrowanie..." : "Zarejestruj się"}
              </SubmitButton>
            </form>
          </div>
        </div>

        {/* --- OVERLAY SLIDING PANEL --- */}
        <div 
          className={`absolute top-0 right-0 h-full w-1/2 z-50 transition-transform duration-700 ease-in-out ${
            isRegisterActive ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          {/* WARSTWA 0: Biała baza pod gradienty */}
          <div className="absolute inset-0 bg-white" />

          {/* WARSTWA 1: Gradient Niebieski (Logowanie) */}
          {/* Jest widoczna tylko gdy isRegisterActive === false */}
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 transition-opacity duration-700 ease-in-out ${
              isRegisterActive ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* WARSTWA 2: Gradient Zielony (Rejestracja) */}
          {/* Jest nałożona na niebieską, ale domyślnie niewidoczna. Pojawia się przy rejestracji. */}
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 transition-opacity duration-700 ease-in-out ${
              isRegisterActive ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* TREŚĆ (musi być relative i z-10, żeby była NAD tłami) */}
          <div className="relative z-10 h-full w-full flex items-center justify-center text-white px-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                {isRegisterActive ? "Masz już konto?" : "Nie masz jeszcze konta?"}
              </h2>
              <p className="mb-8 text-white/90">
                {isRegisterActive 
                  ? "Aby pozostać w kontakcie z nami, zaloguj się swoimi danymi osobowymi." 
                  : "Wpisz swoje dane osobowe i rozpocznij podróż z nami."}
              </p>
              <button
                onClick={() => {
                  setIsRegisterActive(!isRegisterActive);
                  setError(null);
                }}
                className="border-2 border-white rounded-full px-10 py-3 font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                {isRegisterActive ? "Zaloguj się" : "Załóż konto"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;