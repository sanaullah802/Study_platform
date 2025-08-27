import axios from 'axios';
import React, { useState } from 'react';

function Prepration() {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [synonyms, setSynonyms] = useState([]);
  const [antonyms, setAntonyms] = useState([]);
  const [audio, setAudio] = useState('');
  const [error, setError] = useState('');

  const getAnswer = async () => {
    if (!word.trim()) return;
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = response.data[0];
      const firstMeaning = data.meanings[0];
      const firstDefinition = firstMeaning.definitions[0].definition;

      setDefinition(firstDefinition);
      setSynonyms(firstMeaning.synonyms || []);
      setAntonyms(firstMeaning.antonyms || []);

      const audioURL = data.phonetics.find(p => p.audio)?.audio || '';
      setAudio(audioURL);
      setError('');
    } catch (err) {
      console.error("API Error:", err);
      setDefinition('');
      setSynonyms([]);
      setAntonyms([]);
      setAudio('');
      setError('No results found. Please try another word.');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">📘 Dictionary Lookup</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Enter a word"
          className="border border-gray-300 px-4 py-2 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={getAnswer}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-600 text-center font-medium mb-4">{error}</p>}

      {(definition || synonyms.length || antonyms.length || audio) && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6 animate-fade-in border border-gray-200">
          {definition && (
            <div>
              <h2 className="text-xl font-semibold text-indigo-600 mb-1">📖 Definition</h2>
              <p className="text-gray-800">{definition}</p>
            </div>
          )}

          {synonyms.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-green-600 mb-1">🟢 Synonyms</h2>
              <ul className="list-disc list-inside text-gray-700 grid grid-cols-2 md:grid-cols-3 gap-x-4">
                {synonyms.map((syn, index) => (
                  <li key={index}>{syn}</li>
                ))}
              </ul>
            </div>
          )}

          {antonyms.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-red-600 mb-1">🔴 Antonyms</h2>
              <ul className="list-disc list-inside text-gray-700 grid grid-cols-2 md:grid-cols-3 gap-x-4">
                {antonyms.map((ant, index) => (
                  <li key={index}>{ant}</li>
                ))}
              </ul>
            </div>
          )}

          {audio && (
            <div>
              <h2 className="text-xl font-semibold text-blue-600 mb-1">🔊 Pronunciation</h2>
              <audio controls src={audio} className="w-full mt-2">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Prepration;
