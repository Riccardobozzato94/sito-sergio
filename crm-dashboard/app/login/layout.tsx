import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accedi — CRM Da Sergio',
  description: 'Login per CRM Panificio Da Sergio',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
