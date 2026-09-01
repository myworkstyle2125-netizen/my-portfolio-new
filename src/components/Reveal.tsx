import React, { useEffect, useRef, useState } from 'react';

export function useReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if element is already within viewport immediately
    try {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setVisible(true);
      }
    } catch {}

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.05, rootMargin: '50px 0px 50px 0px' }
    );

    observer.observe(el);

    // Fallback timer: ensure visible after 500ms so content is never hidden
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return { ref, visible };
}

interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  key?: React.Key;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}

export function Reveal({ children, className = '', delay = 0, as = 'div', ...rest }: RevealProps) {
  const Component = as;
  const { ref, visible } = useReveal();

  return (
    <Component
      ref={ref}
      data-visible={visible}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
