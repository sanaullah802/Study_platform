import React, { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { Link } from 'react-router-dom';

function Login() {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setErr(true);
      console.log(error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl shadow-lg p-8 animate-fade-in transition-transform duration-500 hover:scale-[1.01]">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white mb-8 transition-colors duration-300">
            Login to your account
          </h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800 rounded-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500 hover:shadow-md hover:bg-zinc-700">
              <FaUser className="h-5 w-5 text-gray-400 transition-colors duration-300 group-hover:text-white" />
              <input
                type="email"
                name="email"
                required
                className="w-full bg-transparent outline-none text-white placeholder-gray-400 transition-colors duration-300"
                placeholder="Email"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800 rounded-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500 hover:shadow-md hover:bg-zinc-700">
              <FaLock className="h-5 w-5 text-gray-400 transition-colors duration-300" />
              <input
                type="password"
                name="password"
                required
                className="w-full bg-transparent outline-none text-white placeholder-gray-400 transition-colors duration-300"
                placeholder="Password"
              />
            </div>
          </div>

          {err && <p className="text-red-400 text-sm transition-opacity duration-300">Invalid credentials. Try again.</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-lg transition-all duration-300"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don’t have an account?{' '}
            <Link
              to="/singup"
              className="text-indigo-500 hover:text-indigo-400 font-medium transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
