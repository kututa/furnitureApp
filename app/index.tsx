

import React, { useState } from 'react';
import BuyerInterface from '../components/buyer-interface/buyer-interface';
import Login from '../components/login/login';
import Register from '../components/register/register';
import SellerInterface from '../components/seller-interface/seller-interface';

export default function Index() {
  const [screen, setScreen] = useState<'login' | 'register' | 'buyer' | 'seller'>('login');

  if (screen === 'buyer') {
    return <BuyerInterface />;
  }
  if (screen === 'seller') {
    return <SellerInterface onBack={() => setScreen('login')} />;
  }
  if (screen === 'register') {
    return <Register onShowLogin={() => setScreen('login')} />;
  }
  return (
    <Login
      onShowRegister={() => setScreen('register')}
      onLogin={({ role }) => {
        if (role === 'buyer') setScreen('buyer');
        else if (role === 'seller') setScreen('seller');
      }}
    />
  );
}
