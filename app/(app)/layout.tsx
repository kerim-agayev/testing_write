import { GlobalNav } from '@/components/layout/GlobalNav';
import { ToastContainer } from '@/components/ui/Toast';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-base">
      <GlobalNav />
      <main>{children}</main>
      <ToastContainer />
    </div>
  );
}
