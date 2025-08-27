import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';

function ContactUs() {
  const navigate = useNavigate();
  const [result, setResult] = useState("");
  const [submit, SetSubmit] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending...");
    const formData = new FormData(event.target);

    formData.append("access_key", "76aa202c-ce09-4bc3-a78c-bea6237300c6");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("Form Submitted Successfully");
      SetSubmit(true);
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden w-screen bg-black text-white flex flex-col items-center overflow-y-auto px-4 sm:px-10 py-10">
      <div className="w-full max-w-2xl">
        <div className="flex items-center mb-6">
          <i
            onClick={() => navigate(-1)}
            className="hover:text-indigo-400 text-white text-3xl mr-3 ri-arrow-left-line cursor-pointer transition-colors duration-300"
          ></i>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center">
            <i className="ri-phone-fill text-indigo-500 mr-2"></i>
            Contact Us
          </h1>
        </div>

        <div className="h-[1px] bg-zinc-700 mb-6"></div>

        {/* 🌀 Animated Form Only */}
        <motion.form
          onSubmit={onSubmit}
          className="bg-zinc-900 p-6 rounded-xl shadow-md flex flex-col gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div>
            <label htmlFor="name" className="text-lg uppercase block mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full bg-black text-white outline-none px-5 py-2 rounded-lg text-lg border border-zinc-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-lg uppercase block mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-black text-white outline-none px-5 py-2 rounded-lg text-lg border border-zinc-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="message" className="text-lg uppercase block mb-1">
              Enter your issue
            </label>
            <textarea
              name="message"
              required
              rows="4"
              className="w-full bg-black text-white outline-none px-5 py-2 rounded-lg text-lg border border-zinc-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Type your message here..."
            ></textarea>
          </div>

          {submit ? (
            <div className="py-2 bg-green-600 text-white rounded text-lg text-center w-full sm:w-[50%] mx-auto">
              Done 👍🏻
            </div>
          ) : (
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 px-6 py-2 rounded text-lg text-white w-full sm:w-[50%] mx-auto"
            >
              Submit
            </button>
          )}
        </motion.form>

        {result && (
          <p className="mt-4 text-center text-sm text-indigo-400 transition-opacity duration-300">
            {result}
          </p>
        )}
      </div>
    </div>
  );
}

export default ContactUs;
