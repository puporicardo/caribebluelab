import { useContent } from '../../content';
import { Rich } from '../../shared/components/Rich';
import { cssVars } from '../../shared/css';
import { ExternalLink } from '../parts/ExternalLink';
import { ZoneHead } from '../parts/ZoneHead';

/** Colores de portada (paleta) para cada libro de la estantería, en orden. */
const BOOK_TONES: { bg: string; ink?: string; frame: string; label?: string }[] = [
  { bg: 'linear-gradient(165deg, #4C86AE, #1D3256)', frame: 'rgba(245,243,240,.3)' },
  { bg: 'linear-gradient(165deg, #D2BB81, #2A4C72)', frame: 'rgba(245,243,240,.4)', label: '#0B1B33' },
  { bg: 'linear-gradient(165deg, #35668B, #0B1B33)', frame: 'rgba(245,243,240,.3)' },
  { bg: 'linear-gradient(165deg, #2A4C72, #0B1B33)', frame: 'rgba(245,243,240,.3)' },
  { bg: 'linear-gradient(165deg, #D2BB81, #4C86AE)', frame: 'rgba(11,27,51,.25)', ink: '#0B1B33' },
  { bg: 'linear-gradient(165deg, #1D3256, #0B1B33)', frame: 'rgba(111,227,214,.35)', label: '#6FE3D6' },
  { bg: 'linear-gradient(165deg, #F5F3F0, #D2BB81)', frame: 'rgba(11,27,51,.2)', ink: '#0B1B33', label: '#7A5C16' },
  { bg: 'linear-gradient(165deg, #35668B, #1D3256)', frame: 'rgba(245,243,240,.3)' },
  { bg: 'linear-gradient(165deg, #0B1B33, #1D3256)', frame: 'rgba(210,187,129,.4)', label: '#D2BB81' },
];

const EDITORIAL = 'https://libros.unimagdalena.edu.co';

/**
 * Enlace a la Editorial Unimagdalena y portada (public/libros) de cada libro, en el mismo orden
 * que la estantería. Sin portada se muestra el lomo de color; sin enlace, el libro no lleva a ningún lado.
 */
const BOOK_LINKS: { href: string | null; cover?: string }[] = [
  { href: `${EDITORIAL}/cubi-y-el-bosque-sin-colores-1jdbo.html`, cover: 'bosque-sin-colores.jpg' },
  { href: `${EDITORIAL}/cubi-y-el-puente-de-los-monitos-saltarines-24crh.html`, cover: 'puente-monitos-saltarines.jpg' },
  { href: `${EDITORIAL}/cubi-y-el-susurro-de-las-olas-053gd.html`, cover: 'susurro-de-las-olas.jpg' },
  { href: `${EDITORIAL}/cubi-y-el-desorden-de-las-olas-tdivx.html`, cover: 'desorden-de-las-olas.jpg' },
  { href: `${EDITORIAL}/cubi-y-el-secreto-de-la-arena-caliente-sd4d5.html`, cover: 'secreto-arena-caliente.jpg' },
  { href: `${EDITORIAL}/cubi-y-el-juego-de-las-sombras-que-brillan-fyf8k.html`, cover: 'juego-sombras-que-brillan.jpg' },
  { href: `${EDITORIAL}/las-aventuras-de-gaia-8eu07.html`, cover: 'aventuras-de-gaia.jpg' },
  // «CUBI y el Arrecife que No Caminaba»: no está en el catálogo de la editorial.
  { href: null },
  // Rubik Literario STEAM+G: la colección completa en la editorial.
  { href: `${EDITORIAL}/tematicas/ybcs.html` },
];

/** Zona 3 · Pradera marina (Leer): estantería CUBI. */
export function PraderaMarinaPage() {
  const t = useContent();
  const shelf = t.web.shelf;
  const base = import.meta.env.BASE_URL;

  return (
    <section id="pradera-marina" className="zone" aria-labelledby="titulo-zona-3">
      <div className="wrap">
        <ZoneHead index={3} accent="var(--c-accent)" />

        <article aria-label={shelf.title.replace(/\*/g, '')} data-reveal="">
          <div className="shelf-head">
            <h3 className="disp shelf-title">
              <Rich text={shelf.title} split />
            </h3>
            <span className="shelf-note">{shelf.note}</span>
          </div>
          <ul className="shelf stagger">
            {shelf.books.map((b, i) => {
              const tone = BOOK_TONES[i % BOOK_TONES.length];
              const link = BOOK_LINKS[i] ?? { href: null };
              const name = `libro_${i + 1}`;
              if (link.cover) {
                return (
                  <li key={b.title}>
                    <ExternalLink href={link.href} name={name} className="book book--cover">
                      <img src={`${base}libros/${link.cover}`} alt={b.title} loading="lazy" decoding="async" />
                    </ExternalLink>
                    <span className="book-caption">{b.title}</span>
                  </li>
                );
              }
              const spine = (
                <>
                  <span className="eyebrow book-label" style={tone.label ? { color: tone.label } : undefined}>
                    {b.label}
                  </span>
                  <span className="disp book-title">{b.title}</span>
                </>
              );
              const style = cssVars({ '--frame': tone.frame }, { background: tone.bg, color: tone.ink });
              return (
                <li key={b.title}>
                  {link.href ? (
                    <ExternalLink href={link.href} name={name} className="book">
                      <span className="book-inner" style={style}>
                        {spine}
                      </span>
                    </ExternalLink>
                  ) : (
                    <div className="book" style={style}>
                      {spine}
                    </div>
                  )}
                </li>
              );
            })}
            <li>
              <div className="book book--kit">
                <span>{shelf.kit}</span>
              </div>
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}
