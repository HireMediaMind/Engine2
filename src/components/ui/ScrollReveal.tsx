import React, { forwardRef } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  threshold?: number;
  stagger?: boolean;
  staggerDelay?: number;
  as?: 'div' | 'section' | 'article' | 'aside';
}

export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  (
    {
      children,
      delay = 0,
      duration = 500,
      direction = 'up',
      distance = 20,
      threshold = 0.1,
      className,
      style,
      as: Component = 'div',
      ...props
    },
    forwardedRef
  ) => {
    const { ref, isVisible, prefersReducedMotion } = useScrollReveal<HTMLDivElement>({
      threshold,
      triggerOnce: true,
    });

    const getInitialTransform = () => {
      if (prefersReducedMotion) return 'none';
      switch (direction) {
        case 'up':
          return `translateY(${distance}px)`;
        case 'down':
          return `translateY(-${distance}px)`;
        case 'left':
          return `translateX(${distance}px)`;
        case 'right':
          return `translateX(-${distance}px)`;
        case 'none':
          return 'none';
        default:
          return `translateY(${distance}px)`;
      }
    };

    const animationStyle: React.CSSProperties = prefersReducedMotion
      ? {}
      : {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'none' : getInitialTransform(),
          transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
        };

    return (
      <Component
        ref={(node) => {
          // Handle both refs
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        className={className}
        style={{ ...animationStyle, ...style }}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

ScrollReveal.displayName = 'ScrollReveal';

// Staggered children wrapper
interface StaggeredRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  staggerDelay?: number;
  baseDelay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export const StaggeredReveal: React.FC<StaggeredRevealProps> = ({
  children,
  staggerDelay = 100,
  baseDelay = 0,
  duration = 500,
  direction = 'up',
  distance = 20,
  className,
  ...props
}) => {
  const { ref, isVisible, prefersReducedMotion } = useScrollReveal<HTMLDivElement>({
    threshold: 0.1,
    triggerOnce: true,
  });

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(-${distance}px)`;
      case 'left':
        return `translateX(${distance}px)`;
      case 'right':
        return `translateX(-${distance}px)`;
      default:
        return `translateY(${distance}px)`;
    }
  };

  return (
    <div ref={ref} className={className} {...props}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const childDelay = baseDelay + index * staggerDelay;
        const childStyle: React.CSSProperties = prefersReducedMotion
          ? {}
          : {
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'none' : getTransform(),
              transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${childDelay}ms, transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${childDelay}ms`,
            };

        return React.cloneElement(child as React.ReactElement<{ style?: React.CSSProperties }>, {
          style: { ...childStyle, ...(child.props.style || {}) },
        });
      })}
    </div>
  );
};
