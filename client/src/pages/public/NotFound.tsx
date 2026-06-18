import { Link } from 'react-router-dom';
import { buttonClasses } from '../../components/ui/Button';
import { LogoMark } from '../../components/brand/Logo';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <LogoMark size={56} />
      <p className="mt-8 font-mono text-7xl font-bold text-gradient">404</p>
      <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className={buttonClasses('primary', 'lg', 'mt-8')}>Back to home</Link>
    </div>
  );
}
