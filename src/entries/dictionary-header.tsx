import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Component, type ReactNode } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import css from "@/styles.css?inline";

// Render the real shared header, isolated from the legacy dictionary styles.
// Keep the existing static navigation if this bundle fails to load.
const fallback = document.querySelector<HTMLElement>(".knowledge-header");
if (fallback) {
  const host = document.createElement("div");
  host.style.cssText = "position:sticky;top:0;z-index:50;display:block";
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = css.replace(/:root\b/g, ":host") + "\n:host{font-family:Archivo, sans-serif;color:#111;font-size:16px;line-height:1.5} header{position:relative!important}";
  const mount = document.createElement("div");
  shadow.append(style, mount);
  class HeaderBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    override state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    override componentDidCatch() {
      document.documentElement.removeAttribute("data-shared-header-pending");
      host.replaceWith(fallback!);
    }
    override render() { return this.state.failed ? null : this.props.children; }
  }
  fallback.replaceWith(host);
  flushSync(() => createRoot(mount).render(<HeaderBoundary><SiteNav nativeNavigation /></HeaderBoundary>));
  document.documentElement.removeAttribute("data-shared-header-pending");
}
