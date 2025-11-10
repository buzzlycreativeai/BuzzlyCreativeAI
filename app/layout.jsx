import './globals.css';

export const metadata = {
  title: 'BuzzlyCreative AI',
  description: 'Asistente creativo para TikTok - Dark Moderno'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
