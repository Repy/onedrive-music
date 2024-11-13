import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Login } from './pages/Login';
import { Main } from './pages/Main';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLDivElement
);
root.render(
  <Login>
    <Main />
  </Login>
);
