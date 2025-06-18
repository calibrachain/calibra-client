import React from 'react';
import Header from './components/Header';
import CertificateWorkflow from './components/CertificateWorkflow';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <CertificateWorkflow />
      </main>
    </div>
  );
}

export default App;