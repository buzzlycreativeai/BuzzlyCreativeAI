const nextConfig = { reactStrictMode: true };
module.exports = nextConfig;

New Chat
10 lines

  import { SessionProvider } from 'next-auth/react';
  export default function App({ Component, pageProps: { session, ...pageProps } }) {
    return (
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    );
  }
