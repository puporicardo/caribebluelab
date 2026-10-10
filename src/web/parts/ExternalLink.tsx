import type { ReactNode } from 'react';
import { trackEvent } from '../../shared/analytics';

interface ExternalLinkProps {
  href: string | null;
  /** Nombre corto para la analítica. */
  name: string;
  className?: string;
  children: ReactNode;
}

/**
 * Enlace externo medido. Si la URL aún no está confirmada (null), se muestra como texto
 * sin enlace para no llevar a ninguna parte.
 */
export function ExternalLink({ href, name, className, children }: ExternalLinkProps) {
  if (!href) {
    return (
      <span className={`${className ?? ''} is-pending`} title="Enlace por confirmar">
        {children}
      </span>
    );
  }
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('enlace_externo', { destino: name })}>
      {children}
    </a>
  );
}
