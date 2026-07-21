import AuthGuard from '@/components/AuthGuard';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}