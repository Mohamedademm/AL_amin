import { useRegisterSW } from "virtual:pwa-register/react";
import { Download, RefreshCw, X } from "lucide-react";
import { Button } from "../ui/Button";

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered", r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up rounded-2xl border border-line bg-surface p-4 shadow-xl">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-content">
            {offlineReady
              ? "App ready to work offline"
              : "New update available"}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {offlineReady
              ? "You can now use the app without an internet connection."
              : "Click reload to apply the latest features and fixes."}
          </p>
        </div>
        <button onClick={close} className="text-muted hover:text-content">
          <X size={16} />
        </button>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={close}>
          Close
        </Button>
        {needRefresh ? (
          <Button size="sm" onClick={() => updateServiceWorker(true)}>
            <RefreshCw size={14} className="mr-1.5" /> Reload app
          </Button>
        ) : (
          <Button size="sm" onClick={close}>
            <Download size={14} className="mr-1.5" /> Got it
          </Button>
        )}
      </div>
    </div>
  );
}
