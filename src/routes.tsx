import React from 'react'
import { A } from 'hookrouter';
import { Home } from './pages/Home';

export const routes = {
  '/': () => <Home />,
  '/test': () => <A href="/">home</A>,
}