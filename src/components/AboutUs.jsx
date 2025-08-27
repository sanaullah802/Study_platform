import React from 'react';
import { FaBookReader, FaUsers, FaLightbulb, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import NavBar from './partials/NavBar';

const AboutUs = () => {
  const teamMembers = [
    { name: 'Nikhil Kumar', role: 'Frontend & Backend (Leader)' },
    { name: 'Vicky Kumar', role: 'Frontend' },  
    { name: 'Sanjay', role: 'Backend' },
    { name: 'Deependra', role: 'Backend' },
    { name: 'Nasbulain Ansari', role: 'UI/UX Designer' },
    { name: 'Ankush', role: 'Testing' },
    { name: 'Rohit', role: 'Research' },
    { name: 'Pashupati', role: 'Research' },
    { name: 'Amay', role: 'Presentation' },
  ]
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
      <NavBar />

      {/* Header */}
      <div className="bg-[#2B2B2B] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">About VirtualStudy</h1>
          <p className="text-lg md:text-xl">
            Empowering students through collaborative virtual learning
          </p>
        </div>
      </div>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <FaUsers />, title: "Community", desc: "Building strong learning communities." },
              { icon: <FaBookReader />, title: "Education", desc: "Delivering quality educational resources." },
              { icon: <FaLightbulb />, title: "Innovation", desc: "Adopting new learning technologies." },
              { icon: <FaStar />, title: "Excellence", desc: "Pursuing the highest standards." }
            ].map((value, idx) => (
              <div key={idx} className="bg-gray-100 p-6 rounded-xl text-center shadow hover:shadow-md transition duration-300">
                <div className="text-indigo-600 text-4xl mb-4 mx-auto">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <p className="text-lg text-gray-600">
            VirtualStudy was founded with a mission to make education accessible through
            collaboration. We believe that learning together builds stronger understanding,
            encourages engagement, and leads to lasting knowledge.
          </p>
        </div>
      </section>

      {/* Our Team */}
      {/* <section className="py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
        <div className="overflow-x-auto w-screen px-4">
          <div className="flex gap-6 w-max px-4">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-gray-100 p-6 rounded-lg shadow-md text-center min-w-[250px] hover:shadow-lg transition duration-300">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Contact CTA */}
      <section className="bg-[#2B2B2B] text-white py-16">
        <div className="max-w-7xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-lg mb-8">Have questions? We'd love to hear from you.</p>
          <Link
            to="/contact"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
