import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChatGPTComponents from './components/ChatGPTComponents';

function App() {
  const [backendMessage, setBackendMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000')
      .then(response => setBackendMessage(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>DishList App</h1>
      <p>{backendMessage}</p>
      <ChatGPTComponents></ChatGPTComponents>
    </div>
  );
}

export default App;
