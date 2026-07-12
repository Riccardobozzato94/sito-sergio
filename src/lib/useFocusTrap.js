import { useEffect, useRef } from 'react';

/**
 * Traps keyboard focus inside a container element.
 * Useful for modals, menus, and lightboxes.
 *
 * @param {boolean} active - Whether the trap is active
 * @param {object} options - Configuration
 * @returns {React.RefObject} - Ref to attach to the container
 */
export default function useFocusTrap(active = true, options = {}) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Save the element that had focus before the trap
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;

    // Focus the first focusable element inside, or the container itself
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusFirst = () => {
      const focusable = container.querySelectorAll(focusableSelectors);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        container.focus();
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(focusFirst, 50);

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusable = container.querySelectorAll(focusableSelectors);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      container.removeEventListener('keydown', handleKeyDown);
      // Restore previous focus
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [active]);

  return containerRef;
}
