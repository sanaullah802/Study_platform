import React from 'react';
import { FaUsers, FaBook, FaComments, FaChartLine } from 'react-icons/fa';
import { FaBookReader } from "react-icons/fa";
import Dropdown from './partials/Dropdown';
import { Link } from 'react-router-dom';
import NavBar from './partials/NavBar';
import Particles from '../components/ReactBits/Background';
import ScrollFloat from '../components/ReactBits/ScrollText';
import ScrollVelocity from '../components/ReactBits/scroll';



const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#141516] ">
      {/* Header */}
      <NavBar />

      <div className="relative w-full h-[600px] bg-black overflow-hidden">
        {/* Particles Background */}
        <div className="absolute inset-0 z-0">
          <Particles
            particleColors={['#ffffff', '#ffffff']}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>

        {/* Hero Section */}
        <section className="absolute inset-0 z-10 flex items-center justify-center text-center text-white px-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                Connect, Learn, and Grow Together
            </h1>
            <p className="text-xl mb-8 drop-shadow-lg">
              Join virtual study groups based on your subjects and interests
            </p>
            <Link
              to="/chatbot"
              className="bg-white text-black px-8 py-3 rounded-lg text-md font-semibold hover:bg-gray-100 transition duration-300 shadow-lg"
            >
              Ask With AI
            </Link>
          </div>
        </section>
      </div>



      {/* Features Section */}
      <section className="py-16 bg-[#141516] text-[#e6d9d9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <h2 className="text-md font-bold text-center mb-12">
              <ScrollFloat
                animationDuration={1}
                ease='back.inOut(2)'
                scrollStart='center bottom+=50%'
                scrollEnd='bottom bottom-=40%'
                stagger={0.06}
                className="text-xl"
              >
               Why Choose StudyGroup?
              </ScrollFloat>
            </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            <div className="bg-black text-[#e6d9d9] p-6 rounded-lg shadow-md hover:scale-105 transform transition duration-300 ease-in-out">

              <FaUsers className=" text-[#e6d9d9] text-4xl mb-4" />

              <h3 className="text-xl font-semibold mb-2">Connect with Peers</h3>
              <p className="text-gray-600 text-md">Find and join study groups with like-minded students</p>
            </div>

            <div className="bg-black text-[#e6d9d9]  p-6 rounded-lg shadow-md hover:scale-105 transform transition duration-300 ease-in-out">

              <FaBook className="text-[#e6d9d9] text-4xl mb-4" />

              <h3 className="text-xl font-semibold mb-2">Subject Focused</h3>
              <p className="text-gray-600 text-md">Groups organized by specific subjects and topics</p>
            </div>

            <div className="bg-black text-[#e6d9d9]  p-6 rounded-lg shadow-md hover:scale-105 transform transition duration-300 ease-in-out">

              <FaComments className="text-[#e6d9d9] text-4xl mb-4" />

              <h3 className="text-xl font-semibold mb-2">Interactive Learning</h3>
              <p className="text-gray-600 text-md">Engage in discussions and collaborative learning</p>
            </div>

            <div className="bg-black text-[#e6d9d9]  p-6 rounded-lg shadow-md hover:scale-105 transform transition duration-300 ease-in-out">
              <FaChartLine className="text-[#e6d9d9] text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600 text-md">Monitor your learning journey and achievements</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#141516] text-[#e6d9d9] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-center mb-12">
          <ScrollFloat
                animationDuration={1}
                ease='back.inOut(2)'
                scrollStart='center bottom+=50%'
                scrollEnd='bottom bottom-=40%'
                stagger={0.06}
                className="text-md"
              >
               How It Works
              </ScrollFloat>
            </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600 text-md">Create your account in seconds</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Groups</h3>
              <p className="text-gray-600 text-md">Browse or search for study groups</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
              <p className="text-gray-600 text-md">Join groups and begin your learning journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* dropdown Section */}
      <Dropdown />
{/* 
      <div className='my-10'>
          <ScrollVelocity
            texts={[ 'VirtualStudy', 'Study Together']} 
            velocity={30} 
            className="custom-scroll-text"
          />
      </div> */}

      {/* Footer */}
      <footer className="text-[#e6d9d9] bg-black  py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex gap-2"><FaBookReader />VirtualStudy</h3>
              <p className="text-gray-400 text-[1.2vw]">Your virtual learning companion</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-[1.2vw]">
                <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div className='text-[1.2vw]'>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-gray-400">Email: support@VirtualStudy.com</p>
              <p className="text-gray-400">Phone: +91 8723568736423</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p className='text-md'>&copy; 2024 StudyGroup. All rights reserved.</p>
          </div>
        </div>
      </footer>


    </div>
  );
};

export default LandingPage;

