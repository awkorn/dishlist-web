import React, { useState } from 'react';
import axios from 'axios';

const ChatGPTComponents = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/generate', { prompt });
      setResponse(res.data.result.trim());
    } catch (err) {
      console.error('Error generating response:', err);
    }
  };

  return (
    <div>
      <h2>DishList AI Chat</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
        />
        <button type="submit">Generate</button>
      </form>
      {response && <div><strong>Response:</strong> {response}</div>}
    </div>
  );
};

export default ChatGPTComponents;