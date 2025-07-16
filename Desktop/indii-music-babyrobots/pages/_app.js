import '../src/styles/globals.css';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/contexts/AuthContext';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}