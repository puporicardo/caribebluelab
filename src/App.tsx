import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';
import { isLang } from './content/zones';
import { ZoneRoute } from './web/ZoneRoute';

const DiveLayout = lazy(() => import('./web/DiveLayout'));
const KioskApp = lazy(() => import('./kiosk/KioskApp'));

/**
 * Rutas
 *  Web (scroll continuo; cada zona es una página con su URL):
 *    /                 Superficie (español)      /en                 Surface (English)
 *    /zona-de-luz      Zona de luz               /en/zona-de-luz
 *    /arrecife         Arrecife                  /en/arrecife
 *    /pradera-marina   Pradera marina            /en/pradera-marina
 *    /zona-oscura      Zona oscura               /en/zona-oscura
 *    /ascenso          Ascenso                   /en/ascenso
 *    También funcionan los anchors: /#arrecife, /en#ascenso, /#como-recorrer, /ascenso#incubazul
 *
 *  Kiosco (TV del stand, bucle de 6 min):
 *    /kiosco/es · /kiosco/en   (+ ?escena=0–5 &velocidad=x6|pausa &subtitulos=0)
 */
export function App() {
  return (
    <Routes>
      <Route path="/kiosco" element={<Navigate to="/kiosco/es" replace />} />
      <Route path="/kiosco/:lang" element={<KioskRoute />} />

      <Route
        element={
          <Suspense fallback={<Splash />}>
            <DiveLayout />
          </Suspense>
        }
      >
        <Route index element={<ZoneRoute />} />
        <Route path=":zona" element={<ZoneRoute />} />
        <Route path="en">
          <Route index element={<ZoneRoute />} />
          <Route path=":zona" element={<ZoneRoute />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function KioskRoute() {
  const { lang } = useParams();
  if (!isLang(lang)) return <Navigate to="/kiosco/es" replace />;
  return (
    <Suspense fallback={<Splash />}>
      <KioskApp lang={lang} />
    </Suspense>
  );
}

function Splash() {
  return <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg, #4C86AE 0%, #2A4C72 55%, #0B1B33 100%)' }} />;
}
