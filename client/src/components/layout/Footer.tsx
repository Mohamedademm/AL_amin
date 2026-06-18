import { Link } from 'react-router-dom';
import { Globe, Send, MessageCircle } from 'lucide-react';
import { Logo } from '../brand/Logo';

// Site footer with brand, quick links and social icons.
export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface/40">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo size={38} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            A high-end B2C storefront and distributed inventory platform — flexible pricing,
            smart logistics and precise order fulfilment, from the central warehouse to every boutique.
          </p>
          <div className="mt-5 flex gap-2">
            {[Globe, Send, MessageCircle].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-primary/50 hover:text-primary"
                aria-label="social link"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/catalog" className="text-content/80 transition-colors hover:text-primary">Catalog</Link></li>
            <li><Link to="/cart" className="text-content/80 transition-colors hover:text-primary">Cart</Link></li>
            <li><Link to="/orders" className="text-content/80 transition-colors hover:text-primary">My Orders</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Account</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/login" className="text-content/80 transition-colors hover:text-primary">Sign in</Link></li>
            <li><Link to="/register" className="text-content/80 transition-colors hover:text-primary">Create account</Link></li>
            <li><Link to="/profile" className="text-content/80 transition-colors hover:text-primary">Profile</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Al Amine Management System. All rights reserved.</p>
          <p className="font-mono uppercase tracking-[0.15em]">Cyber Serif · Surgical Emerald</p>
        </div>
      </div>
    </footer>
  );
}
