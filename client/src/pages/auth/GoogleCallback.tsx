import { useEffect, useRef } from "react";
import { PageLoader } from "../../components/ui/Spinner";

// Google OAuth callback — the server redirects here with ?token=<jwt>. We store
// it for Bearer auth (works across the two *.vercel.app domains) then full-reload
// so AuthContext re-hydrates the session from the token.
export default function GoogleCallback() {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.location.replace("/");
    } else {
      window.location.replace("/login?error=google_failed");
    }
  }, []);

  return <PageLoader label="Completing Google sign-in…" />;
}
