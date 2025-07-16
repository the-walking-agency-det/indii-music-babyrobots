"use client";

import React from 'react';
import RootLayout from '../src/components/Layout/RootLayout';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
}
