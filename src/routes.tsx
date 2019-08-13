import React from 'react'
import { A } from 'hookrouter'
import { Home } from './pages/Home'
import { Welcome } from './pages/Welcome'

export const routes = {
  '/': () => <Welcome />,
  '/home': () => <Home />,
  '/test': () => <A href="/">home</A>,
}
