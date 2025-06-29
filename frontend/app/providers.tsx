'use client';

import { Provider } from 'react-redux';
import { ReactNode } from "react";
import { store } from '@/store/store';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      {children}
    </Provider>
  );
}
