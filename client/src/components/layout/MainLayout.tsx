import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Public-facing shell: sticky navbar, page content and footer.
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-content">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
