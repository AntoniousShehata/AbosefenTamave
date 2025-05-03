import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Categories from './pages/Categories';
import Products from './pages/Products';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Categories />} />
        <Route path="/products/:category" element={<Products />} />
      </Routes>
    </Router>
  );
}

export default App;

