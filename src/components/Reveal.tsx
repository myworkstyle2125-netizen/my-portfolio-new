import React, { useEffect, useRef, useState } from 'react';

export function useReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
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
