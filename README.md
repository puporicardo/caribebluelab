# Caribe Blue Lab · micrositio (React)

Micrositio de la Universidad del Magdalena para el ecosistema InnovAzul / Perla del Caribe
(stand en el Blue Zone Forum, Cádiz, 27–30 oct 2026). Dos experiencias sobre el mismo contenido:

- **Web**: un recorrido continuo por seis profundidades, con scroll. Cada zona es una página de React con su propia URL.
- **Kiosco**: la TV del stand muestra un bucle de 6 minutos (una zona por minuto) en español o inglés.

React 19 · TypeScript · Vite · React Router · React Three Fiber (visor 3D) · Vercel Analytics + Speed Insights.

## Empezar

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # genera dist/ (lo que publica Vercel)
pnpm typecheck  # revisión de tipos (TypeScript)
pnpm videos     # descarga los videos de fondo a public/media (antes del 12 oct 2026)
```

Requiere Node 20.19 o superior.

### Archivos que hay que copiar

| Qué | Dónde | Nota |
| --- | --- | --- |
| Modelo del mero guasa | `public/models/mero-guasa.glb` | Primer ejemplo del visor 3D (web `/arrecife` y kiosco, escena 2). Versión optimizada (~3 MB) del original `Mero_lomo_vientre_corregidos.glb` (85 MB). |
| Videos de fondo | `public/media/00-superficie.mp4` … `05-ascenso.mp4` | `pnpm videos` los baja de Magnific. Si faltan, se usan las URLs firmadas y, como último recurso, el océano WebGL. |

## Rutas

### Web: scroll continuo, una URL por zona

| Zona | Español | Inglés |
| --- | --- | --- |
| Superficie | `/` | `/en` |
| Zona de luz | `/zona-de-luz` | `/en/zona-de-luz` |
| Arrecife | `/arrecife` | `/en/arrecife` |
| Pradera marina | `/pradera-marina` | `/en/pradera-marina` |
| Zona oscura | `/zona-oscura` | `/en/zona-oscura` |
| Ascenso | `/ascenso` | `/en/ascenso` |

Las seis páginas se dibujan seguidas, así que el scroll nunca se corta.

- Si entras por una URL, la página baja directo a esa zona.
- Al hacer scroll, la URL cambia sola a la zona que está en pantalla, sin recargar y sin crear entradas en el historial.
- El menú, la regla de profundidad y el pie usan enlaces a esas rutas. Los botones atrás y adelante del navegador te llevan a la zona de cada URL.
- También funcionan los anchors: `/#arrecife`, `/en#ascenso`, `/#como-recorrer`, `/ascenso#incubazul`.

El idioma se elige en la Superficie, y también en la cabecera y el pie. Al cambiarlo pasas a `/en/…` o de vuelta a español sin perder la posición.

### Kiosco

- `/kiosco/es` (español) y `/kiosco/en` (inglés). `/kiosco` redirige a español.
- Parámetros de revisión:
  - `?escena=0–5`: zona en la que empieza.
  - `?velocidad=x6`: bucle en 1 minuto.
  - `?velocidad=pausa`: bucle detenido.
  - `?subtitulos=0`: oculta los subtítulos.
- Teclado: `F` pantalla completa · `←` `→` cambiar de zona · `espacio` pausa.
- Para montarlo en la TV del stand, abre `https://<dominio>/kiosco/es` en Chrome en modo kiosco o a pantalla completa.

## Estructura

```
src/
  App.tsx                  rutas (web por zonas + kiosco)
  content/                 textos ES/EN tipados (es.ts, en.ts), zonas, enlaces externos
  web/
    DiveLayout.tsx         layout de la web: scroll ↔ URL, océano, cabecera, regla, pie
    pages/                 una página por zona (SuperficiePage, ZonaDeLuzPage, ArrecifePage…)
    parts/                 Header, DepthRail, Stage, Footer, ZoneHead…
  kiosk/
    KioskApp.tsx           bucle de 6 min, escalado 1920×1080, teclado
    beats/                 18 momentos (6 escenas × 3)
    parts/                 regla de profundidad, escenografía, mero 3D
  shared/
    ocean/                 océano WebGL (shader) compartido
    components/            VideoStack, WaterRipples, Ficha, Rich, visor 3D (species/)
    analytics.tsx          Vercel Analytics + Speed Insights + trackEvent()
```

- Los textos están en `src/content/es.ts` y `src/content/en.ts`. Lo que va entre `*asteriscos*` se muestra en cursiva.
- Los enlaces que aún no están confirmados (galería, alianza CAF, IncubAzul, editorial) están en `src/content/links.ts`. Mientras valgan `null`, se muestran sin enlace.

## Medición en Vercel

1. En el proyecto de Vercel activa **Analytics** (Web Analytics) y **Speed Insights**.
2. Despliega. No hace falta configurar nada más: el código ya incluye los componentes.

**Qué se registra:**

- **Vistas por zona.** Cada zona tiene su URL, así que el panel de Analytics muestra cuántas personas llegan a cada profundidad (`/arrecife`, `/en/ascenso`…), cuántas entran directo por un enlace, y desde qué país, dispositivo y página de origen llegan. Funciona en el plan Hobby, que incluye 50.000 eventos al mes.
- **Eventos personalizados** (`trackEvent` en `src/shared/analytics.tsx`). Vercel solo los guarda en el plan Pro, con un máximo de 2 propiedades por evento. Son estos:
  - `idioma_elegido`
  - `inicio_inmersion`
  - `visor_3d` (girar, acercar, arrastrar…)
  - `especie_vista`
  - `audio`
  - `filminuto`
  - `enlace_externo`
  - `cta`
  - `fin_del_recorrido`
- **Speed Insights.** Core Web Vitals reales por ruta.
- **El kiosco** registra solo una vista por arranque, en `/kiosco/[idioma]`.

**Dónde consultar los datos:**

- En el panel del proyecto en Vercel.
- Con la API REST `GET https://api.vercel.com/v1/query/web-analytics/visits/aggregate`, agrupando por `requestPath`, `country`, `referrerHostname`…
- Con la CLI: `vercel metrics`.

## Despliegue en Vercel

`vercel.json` ya trae lo necesario:

- El framework (Vite).
- La reescritura SPA, para que `/arrecife` o `/kiosco/en` funcionen al recargar.
- Caché larga para `/models` y `/media`.

Conecta el repositorio en Vercel o ejecuta `vercel` en la carpeta del proyecto.

> Nota: `pnpm build` no corre `tsc` antes de construir, para que un ajuste de tipos no bloquee un despliegue. Ejecuta `pnpm typecheck` en CI o antes de publicar.

## Pendientes de contenido

Los textos entre `[corchetes]` son marcadores por confirmar:

- Fichas, autorías y licencias.
- Las especies 2 y 3.
- Los títulos de los filminutos.
- Las canciones de CUBI.
- Los ganadores del Challenge.
- El QR del kiosco.
- El subdominio definitivo.
