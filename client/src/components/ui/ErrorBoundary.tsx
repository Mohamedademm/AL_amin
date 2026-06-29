import { Component, type ErrorInfo, type ReactNode } from "react";
import { buttonClasses } from "./Button";
import { LogoMark } from "../brand/Logo";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// App-wide safety net: catches any render/runtime error in the React tree so a
// single broken component shows a recoverable screen instead of a blank page.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  // Flip to the fallback UI on the next render when a child throws.
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  // Last-resort logging hook — wire this to Sentry/pino later.
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught UI error:", error, info.componentStack);
  }

  // Full reload is the safest reset for an unknown corrupted state.
  private reset = () => {
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="container-page flex min-h-screen flex-col items-center justify-center text-center">
        <LogoMark size={56} />
        <p className="mt-8 font-mono text-7xl font-bold text-gradient">500</p>
        <h1 className="mt-4 text-3xl font-bold">Something went wrong</h1>
        <p className="mt-2 max-w-sm text-muted">
          An unexpected error occurred. You can return home and try again.
        </p>
        <button
          onClick={this.reset}
          className={buttonClasses("primary", "lg", "mt-8")}
        >
          Back to home
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
