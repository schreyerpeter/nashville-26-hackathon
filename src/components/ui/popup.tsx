"use client";

import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import SimpleBar from "simplebar-react";

import "simplebar-react/dist/simplebar.min.css";
import "./popup.css";

// A port of the design system's centered `Popup` (src/components/popup/Popup.tsx and
// PopupTrayContent.tsx), the modal patient-web uses: a fading overlay, a panel that
// scales in, a sticky header and footer that pick up a shadow while the body scrolls
// under them, and SimpleBar's thin scrollbar. The mobile tray and close icon aren't
// ported yet.

export type PopupProps = {
  isOpen: boolean;
  header: ReactNode;
  body: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  /** Prevent passive dismissal (backdrop click, Escape). Only programmatic close. */
  lockOpen?: boolean;
  /** Called once the body has been scrolled to the end, or right away if it fits. */
  onScrolledToEnd?: () => void;
};

function useScrollShadows(onScrolledToEnd?: () => void) {
  const [showHeaderShadow, setShowHeaderShadow] = useState(false);
  const [showFooterShadow, setShowFooterShadow] = useState(false);
  const scrollElement = useRef<HTMLElement | null>(null);
  const onEnd = useRef(onScrolledToEnd);
  useEffect(() => {
    onEnd.current = onScrolledToEnd;
  }, [onScrolledToEnd]);

  const update = useCallback(() => {
    const el = scrollElement.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;
    setShowHeaderShadow(scrollTop > 0);
    setShowFooterShadow(canScrollDown);
    if (!canScrollDown) onEnd.current?.();
  }, []);

  const scrollableNodeRef = useCallback(
    (node: HTMLElement | null) => {
      scrollElement.current?.removeEventListener("scroll", update);
      scrollElement.current = node;
      if (!node) return;
      node.addEventListener("scroll", update);
      const resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(node);
      if (node.firstElementChild) resizeObserver.observe(node.firstElementChild);
      update();
    },
    [update],
  );

  return { showHeaderShadow, showFooterShadow, scrollableNodeRef };
}

export function Popup({ isOpen, header, body, footer, onClose, lockOpen = false, onScrolledToEnd }: PopupProps) {
  const { showHeaderShadow, showFooterShadow, scrollableNodeRef } = useScrollShadows(onScrolledToEnd);

  return (
    // z-400 is the design system's z-modal, above DevTools and anything else floating.
    <Dialog open={isOpen} onClose={() => !lockOpen && onClose?.()} className="relative z-400">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-popup-overlay transition-opacity duration-200 ease-out data-closed:opacity-0"
      />
      <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center p-sp-2">
        {/* The shadow and corners live on the panel, so they scale in with it. */}
        <div className="flex max-h-full w-full max-w-md flex-col">
          <DialogPanel
            transition
            className="pointer-events-auto flex min-h-0 w-full flex-col items-center overflow-hidden rounded-large bg-white shadow-float-small transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0"
          >
            <div className="grid min-h-0 w-full min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
              <div
                className={`relative z-10 flex min-w-0 items-center justify-between bg-white px-sp-3 pb-sp-2 pt-sp-3 transition-shadow ${showHeaderShadow ? "shadow-hover-small" : ""}`}
              >
                <DialogTitle className="min-w-0 flex-1 break-words text-scale-5 font-semibold text-text-dark">
                  {header}
                </DialogTitle>
              </div>

              <SimpleBar
                tabIndex={-1}
                autoHide={false}
                className="simplebar-inset h-full min-h-0 min-w-0 px-sp-3 pb-sp-3 pt-sp-1"
                scrollableNodeProps={{ ref: scrollableNodeRef }}
              >
                <Description as="div" className="max-h-full min-w-0 overflow-y-auto break-words">
                  {body}
                </Description>
              </SimpleBar>

              {footer && (
                <div
                  className={`relative z-10 flex min-w-0 flex-col bg-white px-sp-3 pb-sp-3 pt-sp-2 transition-shadow ${showFooterShadow ? "shadow-hover-small-inverse" : ""}`}
                >
                  {footer}
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
