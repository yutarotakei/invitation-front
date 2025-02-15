import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './HomePage';
import { InvitationCreationPage } from './InvitationCreationPage';
import { InvitationViewPage } from './InvitationViewPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<InvitationCreationPage />} />
        <Route path="/view" element={<InvitationViewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
