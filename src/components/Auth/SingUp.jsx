import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";

function SignUp() {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      console.log(res.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating user:", err);
      setErr(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl shadow-lg p-8 animate-fade-in transition-transform duration-500 hover:scale-[1.01]">
        <h2 className="text-center text-3xl font-extrabold text-white mb-6">
          Create your account
        </h2>

        {err && (
          <p className="text-red-400 text-center text-sm mb-4 transition-opacity duration-300">
            Something went wrong. Try again.
          </p>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800 rounded-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500 hover:bg-zinc-700">
              <FaUser className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="username"
                required
                className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                placeholder="Username"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800 rounded-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500 hover:bg-zinc-700">
              <FaEnvelope className="h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                placeholder="Email address"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800 rounded-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500 hover:bg-zinc-700">
              <FaLock className="h-5 w-5 text-gray-400" />
              <input
                type="password"
                name="password"
                minLength="6"
                required
                className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                placeholder="Password (min 6 characters)"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-lg transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-500 hover:text-indigo-400 font-medium transition-colors duration-200">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
