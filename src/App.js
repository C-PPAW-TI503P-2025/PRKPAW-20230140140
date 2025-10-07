import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [nama, setNama] = useState('');
  const [submittedNama, setSubmittedNama] = useState('');
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000')
      .then(response => response.json())
      .then(data => setServerMessage(data.message))
      .catch(error => console.error('Error fetching server message:', error));
  }, []);

  const handleInputChange = (e) => {
    setNama(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedNama(nama);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Masukkan nama Anda"
            value={nama}
            onChange={handleInputChange}
          />
          <button type="submit">Kirim</button>
        </form>

        {submittedNama && (
          <h2>Hello, {submittedNama}!</h2>
        )}
        {serverMessage && (
          <p>Pesan dari server: {serverMessage}</p>
        )}

        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
