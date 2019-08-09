import React from 'react';
import { useRoutes } from 'hookrouter';
import { routes } from './routes';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  const match = useRoutes(routes)
  return match || <NotFoundPage />
}
