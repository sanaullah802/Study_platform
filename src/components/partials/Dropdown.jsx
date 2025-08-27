
import React, { useState } from 'react';

const Dropdown = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (index) => {
    if (openSection === index) {
      setOpenSection(null);
    } else {
      setOpenSection(index);
    }
  };

  const sections = [
    {
      question: "How do I join a study group?",
      answer: "To join a study group, simply browse available groups, click on one that interests you, and select 'Join Group'. You'll get immediate access to the group's resources and discussions."
    },
    {
      question: "What subjects are available?", 
      answer: "We offer study groups across a wide range of subjects including Mathematics, Sciences, Languages, Computer Science, Engineering, Business, and more. New groups are created regularly based on student demand."
    },
    {
      question: "How do virtual study sessions work?",
      answer: "Virtual study sessions are conducted through our integrated video platform. Group members can schedule sessions, share screens, use virtual whiteboards, and participate in real-time discussions."
    },
    {
      question: "Is there a limit to how many groups I can join?",
      answer: "No, there's no limit! You can join as many study groups as you'd like to support your learning journey. We encourage exploring different groups to find the best fit for your needs."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 my-10 ">
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className=" rounded-lg overflow-hidden bg-black text-[#e6d9d9]">
            <button
              className="w-full border-none px-6 py-2 text-left  flex justify-between items-center"
              onClick={() => toggleSection(index)}
            >
              <span className="font-medium text-xl">{section.question}</span>
              <span className="transform transition-transform duration-200">
                {openSection === index ? '−' : '+'}
              </span>
            </button>
            {openSection === index && (
              <div className="px-6 py-4 bg-white">
                <p className="text-gray-600 text-md">{section.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
