import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { Game } from './game';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
); 