import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css';


function App() {
  const [testCases, setTestCases] = useState([]);

  useEffect(() => {
    const socket = socketIOClient(process.env.REACT_APP_API_KEY);
    socket.on('FromAPI', (data) => {
      setTestCases(data);
      console.log("Fromaap" , data)
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Synechron Real-Time live Test Cases Result POC</h1>
      </header>
      <main>
        <ul className="test-cases">
          {testCases.map((testCase, index) => (
            <li key={index} className={`test-case ${testCase.status}`}>
              <h2>{testCase.name}</h2>
              <p className="status">Status: {testCase.status}</p>
              <div className="logs">
                <p>Logs:</p>
                <ul>
                  {testCase.logs.map((log, logIndex) => (
                    <li key={logIndex}>{log}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;
