// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Mint from './Mint';
import Interact from './Interact';
import Navbar from './Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* <Route path="/Mint" element={<Mint />} />
        <Route path="/Interact" element={<Interact />} /> */}
        <Route path="/*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
