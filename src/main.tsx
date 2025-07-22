// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/tanstack-query';
import { router } from './router';
import './index.css'; // Tailwind CSS import

// Render the React application
ReactDOM.createRoot(document.getElementById('root')!).render( // Use non-null assertion as 'root' element is guaranteed to exist
  <React.StrictMode>
    {/* Provide the Tanstack Query client to the entire application */}
    <QueryClientProvider client={queryClient}>
      {/* Provide the Tanstack Router to the entire application */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
