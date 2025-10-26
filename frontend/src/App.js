import React, { useState, useEffect } from 'react';

// Basic inline styling for the app
const appStyle = {
  fontFamily: 'Arial, sans-serif',
  textAlign: 'center',
  padding: '2rem',
  backgroundColor: '#f4f4f4',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#333'
};

const cardStyle = {
  background: '#fff',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
};

const buttonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1rem',
  marginTop: '1rem'
};

function App() {
  const [message, setMessage] = useState('Loading message from backend...');

  const fetchApiData = () => {
    setMessage('Fetching...');
    
    // We use '/api/hello' because our Nginx gateway routes
    // all '/api/' requests to the backend service.
    fetch('/api/hello')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Assume the backend returns data like { "message": "Hello from Python!" }
        setMessage(data.message || data.detail);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setMessage('Failed to fetch message. Is the backend running?');
      });
  };

  // useEffect with an empty dependency array [] runs once when
  // the component first mounts, just like componentDidMount.
  useEffect(() => {
    fetchApiData();
  }, []); // The empty array means this effect runs only once.

  return (
    <div style={appStyle}>
      <div style={cardStyle}>
        <h1>Welcome to the React Frontend!</h1>
        <p>This content is being served by React, built by Docker.</p>
        
        <h2>Message from Backend:</h2>
        <p>
          <code>{message}</code>
        </p>
        
        <button style={buttonStyle} onClick={fetchApiData}>
          Refresh Message
        </button>
      </div>
    </div>
  );
}

export default App;