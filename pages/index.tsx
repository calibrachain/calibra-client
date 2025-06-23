import React from 'react';
import Header from '../src/components/Header';
import CertificateWorkflow from '../src/components/CertificateWorkflow';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <CertificateWorkflow />
      </main>
    </div>
  );
}
