import { Link } from 'react-router';
import { useContent } from '../../content';
import { LANGS, zonePath } from '../../content/zones';
import { BrandLogo } from '../../shared/components/BrandLogo';
import { useDive } from '../dive';

/** Cabecera fija: transparente sobre la Superficie, sólida al bajar; tinta navy en el Ascenso. */
export function Header({ solid }: { solid: boolean }) {
  const t = useContent();
  const { lang, switchLang } = useDive();

  return (
    <header className={`site-header ${solid ? 'is-solid' : ''}`}>
      <div className="wrap site-header-row">
        <Link to={zonePath(lang, 0)} className="brand" aria-label="Caribe Blue Lab">
          <BrandLogo variant="horizontal" title="" />
        </Link>
        <nav aria-label={t.ui.mainNav} className="navlinks">
          <Link to={{ pathname: zonePath(lang, 0), hash: 'como-recorrer' }}>{t.ui.nav.dive}</Link>
          <Link to={zonePath(lang, 1)}>{t.ui.nav.experiences}</Link>
          <Link to={{ pathname: zonePath(lang, 5), hash: 'incubazul' }}>{t.ui.nav.incubazul}</Link>
        </nav>
        <div role="group" aria-label={t.ui.languageGroup} className="lang-toggle">
          {LANGS.map((l, i) => (
            <span key={l} className="lang-toggle-item">
              {i > 0 && <span aria-hidden="true">/</span>}
              <button
                type="button"
                lang={l}
                aria-pressed={lang === l}
                className={lang === l ? 'is-on' : ''}
                onClick={() => switchLang(l, 'cabecera')}
              >
                {l.toUpperCase()}
              </button>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
