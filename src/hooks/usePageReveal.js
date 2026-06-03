import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function usePageReveal(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(el,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
    );

    const children = el.querySelectorAll('[data-reveal]');
    if (children.length > 0) {
      gsap.fromTo(children,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, deps);

  return ref;
}
