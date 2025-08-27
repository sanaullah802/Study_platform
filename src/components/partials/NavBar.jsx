import React, { useState } from 'react';
import { FaBookReader } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Link } from 'react-router-dom';
import GooeyNav from '../ReactBits/NavStyle';
import { IoMenu } from "react-icons/io5";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <header className="bg-[#202124] text-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          {/* Logo */}
          <h1 className="text-2xl flex items-center gap-2 font-bold">
            <FaBookReader /> VirtualStudy
          </h1>

          {/* Desktop Links */}
          <div className='hidden md:flex gap-3 text-md'>
            <Link className='px-3 py-[0.5vw] rounded-md text-black bg-white ' to='/'>Home</Link>
            <Link className='px-3 py-[0.5vw] rounded-md' to='/about'>About</Link>
            <Link className='px-3 py-[0.5vw] rounded-md' to='/contact'>Contact</Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="bg-zinc-900 text-white text-md px-5 py-2 rounded-lg hover:bg-gray-800 transition duration-300 shadow-md"
            >
              Login
            </Link>
            <Link
              to="/singup"
              className="bg-zinc-900 text-white text-md px-5 py-2 rounded-lg hover:bg-gray-800 transition duration-300 shadow-md"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {/* <HiOutlineDotsVertical className="text-3xl" /> */}
              <IoMenu className="text-3xl"  />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#2c2c2c] px-4 py-3 flex flex-col gap-3 shadow-lg">
            <Link className='text-white' to='/' onClick={() => setMenuOpen(false)}>Home</Link>
            <Link className='text-white' to='/about' onClick={() => setMenuOpen(false)}>About</Link>
            <Link className='text-white' to='/contact' onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link className='text-white' to='/login' onClick={() => setMenuOpen(false)}>Login</Link>
            <Link className='text-white' to='/singup' onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </div>
        )}
      </header>
    </div>
  );
}

export default NavBar;
