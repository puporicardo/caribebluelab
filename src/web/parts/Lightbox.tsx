import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight } from '../../shared/components/Icons';

interface LightboxProps {
  /** Lista de imágenes; el visor muestra la del índice `index`. */
  images: { src: string; alt: string }[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

/** Imagen ampliada sobre el fondo de la página difuminado. Esc cierra; las flechas del teclado cambian de imagen. */
export function Lightbox({ images, index, onIndex, onClose }: LightboxProps) {
  const many = images.length > 1;
  const go = (d: number) => onIndex((index + d + images.length) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (many && e.key === 'ArrowRight') go(1);
      else if (many && e.key === 'ArrowLeft') go(-1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length]);

  const img = images[index];
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={img.alt} onClick={onClose}>
      <img className="lightbox-img" src={img.src} alt={img.alt} onClick={(e) => e.stopPropagation()} />
      <button type="button" className="lightbox-close" aria-label="Cerrar" onClick={onClose}>
        ×
      </button>
      {many && (
        <>
          <button type="button" className="lightbox-arrow lightbox-arrow--prev" aria-label="Anterior" onClick={(e) => (e.stopPropagation(), go(-1))}>
            <ArrowRight />
          </button>
          <button type="button" className="lightbox-arrow lightbox-arrow--next" aria-label="Siguiente" onClick={(e) => (e.stopPropagation(), go(1))}>
            <ArrowRight />
          </button>
          <span className="lightbox-count">
            {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </span>
        </>
      )}
    </div>,
    document.body,
  );
}
