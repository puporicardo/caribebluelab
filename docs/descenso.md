# Película del descenso (scroll-world con Magnific)

La web tiene de fondo una sola toma continua: la cámara entra al mar por la superficie, baja por la zona de luz, gira hacia el arrecife, pasa sobre la pradera marina, cae por una grieta hasta la oscuridad y sube de golpe hasta romper la superficie al atardecer. El scroll no reproduce el video: lo recorre (scrub).

Técnica tomada del skill `scroll-world` (`.claude/skills/scroll-world`), arquitectura A: cada tramo empieza en el **último fotograma real** del anterior, así que no hay cortes. Generado el 10 oct 2026 con Magnific. Proyecto en Magnific: «Caribe Blue Lab · Descenso scroll».

## Qué hay en el repo

| Qué | Dónde |
| --- | --- |
| Tramos para web (1080p GOP 8 y 720p GOP 4) + pósteres | `public/film/leg1…6.mp4`, `leg1…6-m.mp4`, `leg1…6.webp` |
| Fauna sin fondo (WebP) | `public/sea/*.webp` |
| Masters, fotogramas de costura y PNG originales | `media-src/` (ignorado por git) |
| Configuración de la película (tramos y mapa scroll → tiempo) | `src/shared/config/film.ts` |
| Fauna por capa (especies, luz, color del agua) | `src/shared/config/sealife.ts` |
| Motor de scrub (blob + canvas, seek sin cola) | `src/shared/components/DiveFilm.tsx` |
| Fauna animada | `src/shared/components/SeaLife.tsx` |

## Modelos y coste

| Pieza | Modelo | Créditos |
| --- | --- | --- |
| Fotograma inicial (superficie, 2 variantes) | Seedream 5 Pro, 16:9, 2K | 200 |
| 9 animales (8 de perfil + medusa) | Seedream 5 Pro, 2K | 900 |
| Recorte sin fondo (8) | Magnific Remove Background | 24 |
| Lámina de burbujas reales sobre negro | Seedream 5 Pro, 2K | 100 |
| 6 tramos + 1 repetición | Kling 3.0, 1080p, 10 s, sin audio, solo fotograma inicial | 6.300 |
| **Total** | | **~7.500** |

Se descartó Seedance 2.5 (6.320 créditos por tramo de 8 s). Kling 3.0 encadena bien con fotograma inicial y cuesta 900 por tramo de 10 s.

## Prompts

Todos los tramos: `kling-30`, 16:9, 1080p, 10 s, `withSoundEffects: false`, `keyframes.start` = último fotograma del tramo anterior (subido a Magnific). Sin fotograma final: forzar uno hace que la cámara retroceda en la costura.

**Fotograma inicial (Seedream 5 Pro)**
> Photorealistic cinematic wide shot, camera floating just a few centimeters above the calm surface of the Caribbean Sea off Santa Marta, Colombia, at early morning. Crystal-clear turquoise water in the foreground with gentle glassy swells and sparkling sunlight reflections… distant green mountains of the Sierra Nevada coastline… No boats, no people, no birds, no buildings, no text.

**Tramo 1 · Superficie → zona de luz.** La cámara se inclina y atraviesa la superficie (plano partido por la línea de agua), queda mirando el espejo plateado desde abajo y baja entre rayos de sol.

**Tramo 2 · Zona de luz → arrecife (giro lateral).** Avanza sobre arena con cáusticas y hace un barrido amplio a la derecha que descubre el arrecife; travelling lateral con paralaje.

**Tramo 3 · Arrecife → pradera marina.** Sube por encima de la cabeza de coral, pasa rozando los corales y baja a rasar una pradera de *Thalassia* que se mece.

**Tramo 4 · Pradera → grieta.** La pradera termina en un borde; la cámara se asoma, se ladea y baja entre dos paredes de roca hacia el azul profundo.

**Tramo 5 · Hacia la oscuridad.** Sigue bajando entre las paredes, que se disuelven; nieve marina escasa. La primera toma metió un pez amarillo y burbujas y se descartó (`media-src/legs/leg5-descarte-pez.mp4`). En la buena se oscureció en postproducción, de forma progresiva:
`eq=eval=frame:gamma='1-0.42*min(t/9,1)':brightness='-0.05*min(t/9,1)':saturation='1-0.25*min(t/9,1)',colorbalance=bs=0.06:bm=0.04`
El tramo 6 parte del último fotograma **ya graduado**, para que la costura coincida.

**Tramo 6 · Ascenso.** Gira hacia la luz, sube cada vez más rápido, el agua pasa de azul noche a turquesa y rompe la superficie en un atardecer dorado con montañas a contraluz (sale del agua hacia el 78 % del tramo).

Todos los prompts terminan con «Empty scene: no fish, no animals, no people, no divers, no text». Los peces van aparte, animados encima: un pez dentro de un video recorrido con el scroll nadaría hacia atrás al subir.

## Encode

```bash
# escritorio
ffmpeg -i legN.mp4 -an -vf "unsharp=5:5:0.6:5:5:0.0" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart public/film/legN.mp4
# teléfonos
ffmpeg -i legN.mp4 -an -vf "scale=-2:720" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart public/film/legN-m.mp4
```

## Cómo se ve en la página

1. **Película** (`DiveFilm`): cada tramo se baja como Blob (siempre se puede buscar, aunque el host no sirva rangos), se busca el fotograma que pide el scroll y se copia a un `<canvas>`. Solo se cargan el tramo activo y sus vecinos; en escritorio el resto llega a los 6 s. Nunca se encola un seek si el decodificador sigue ocupado.
2. **Mapa scroll → película** (`FILM_KEYS`): la cámara llega a cada capa justo después de que su titular entra en pantalla y se queda casi quieta mientras se lee. El ascenso termina de salir del agua cuando asoma el pie.
3. **Fauna** (`SeaLife`): fotos reales sin fondo. Cada animal tiene una distancia a cámara que decide tamaño, desenfoque, saturación y cuánto lo vela el agua (con luz cenital y vientre en sombra). Los peces baten la cola en 3D; la raya aletea; la tortuga planea; las medusas laten y brillan. Cardúmenes de sargentos, huyen del puntero y se desplazan con el scroll como si la cámara bajara entre ellos. De vez en cuando uno pasa desenfocado por delante del texto. Ningún animal aparece ni desaparece en pantalla: todos entran nadando desde un costado, o desde abajo o arriba según hacia dónde va el scroll, y salen del todo antes de retirarse. Al cambiar de capa, los de la anterior aceleran hacia el borde y toman la luz de la nueva mientras se van.
4. **Óptica del agua** (shader): rayos de sol y red de cáusticas sobre el video solo bajo el agua, partículas en suspensión, bioluminiscencia en lo profundo y viñeta de lente.
5. **Polvo y arena en suspensión** (`MarineSnow`, canvas 2D): cientos de motas diminutas que revolotean con la corriente, algunas destellan al cruzar la luz, y pocos copos irregulares desenfocados cerca del lente. Suben al bajar con el scroll y caen en el ascenso. Arena cálida arriba, nieve marina azulada en lo profundo, motas doradas al subir. Las motas redondas del shader quedaron casi solo como bioluminiscencia en lo profundo.
6. **Burbujas** (pocas, a propósito): 8 burbujas reales recortadas de una foto sobre negro (el negro pasa a alfa: queda el reflejo plateado y el brillo especular). Suben en chorros desde un mismo punto, las grandes más rápido y deformándose, las pequeñas en zigzag; crecen un poco al subir. Nube de burbujas al zambullirse, muchas en el ascenso y alguna enorme y desenfocada que pasa frente al lente. La medusa se procesó igual: sin caja.

`prefers-reduced-motion`: sin videos ni fauna; solo los pósteres con fundido.

El kiosco sigue usando los videos en bucle de `public/media`.

## Motion de textos y gráficos

`src/web/motion.css` + `src/web/useMotion.ts` + `useReveal.ts`:

- **Al entrar** (`.is-in`, una vez): los titulares entran palabra por palabra desde una máscara (`<Rich split>`), los bloques pasan del desenfoque del agua al foco y se escalonan, los filetes y las filas de las fichas se dibujan, las listas suben una tras otra, los libros de la estantería se abren en abanico, las barras de audio crecen y las marcas de corte de las figuras se trazan.
- **Con el scroll** (`--v`, `--e` por elemento; `--sy` en la raíz): el numeral gigante de cada zona se dibuja trazo a trazo y flota más lento que el texto, las figuras van a otra velocidad (parallax), los trazos de gráficos se completan, la apertura se apaga al salir por arriba y la portada se hunde, se desenfoca y se apaga al bajar.
- **Densidad**: sutileza ante todo. Pocos animales por capa (2–7), cardúmenes de 3–5, un pez en primer plano cada minuto o más, chorros de burbujas espaciados.
- **Ascenso**: la subida arranca rápido para que el titular entre ya sobre luz azul; el velo claro de lectura y el sol crecen con la subida (sin cortes); todo lo que hay en el agua se queda abajo y sale por el borde inferior antes de romper la superficie, con un destello y la lente mojada un instante. Sobre el agua no hay peces ni burbujas.
- **Visor 3D**: sin caja, con luz submarina, sombra difusa en el agua y un velo de contraste. El pez nada en su sitio y gira con el scroll; se puede seguir arrastrando y usar los botones.
- Con `prefers-reduced-motion` todo aparece ya en su sitio.

## Tipografía y color

- **Mona Sans** (variable, ancho 75–125 %): titulares anchos y ligeros (`font-stretch` 116–125 %, peso 200–300) y texto corrido en ancho normal.
- **Martian Mono**: la voz de laboratorio. Eyebrows (que se teclean), etiquetas de ficha, navegación, botones, pies de figura.
- **Newsreader itálica**: solo el énfasis (*cursivas* de los titulares, verbos de zona, lema).
- Autoalojadas en `public/fonts` (Google Fonts, licencia SIL OFL), latín y latín extendido. `src/shared/styles/fonts.css` + tokens en `base.css` (`--f-display`, `--f-sans`, `--f-mono`, `--f-serif`).
- **Acento coral** `#FF8466` (`--c-accent`) sobre fondos oscuros y `#B8442A` (`--c-accent-ink`) sobre claros. El cian bioluminiscente queda solo en lo que brilla en la zona oscura.

## Coreografía de scroll (para exhibición)

Cada cosa entra distinto (`src/web/motion.css`):

| Elemento | Cómo entra |
| --- | --- |
| Portada | «Caribe» desde la izquierda, «Lab» desde la derecha, «Blue» desde el desenfoque; al bajar se separan, «Blue» crece y todo se apaga. |
| Titulares de zona (ligados al scroll) | 1 · convergen desde los dos lados; 2 · caen girando; 3 · ola desde la derecha; 4 · emergen del desenfoque; 5 · suben creciendo. |
| Eyebrows | Se teclean con cursor, en mono. |
| Franja gigante bajo cada apertura | Nombre de la zona y verbo, corren de lado con el scroll (dirección alterna) y se inclinan con la velocidad. |
| Numerales 01–05 | Se dibujan trazo a trazo y cruzan de lado más lento que el texto. |
| Bloques de texto | Desde su costado, con leve giro. |
| Figuras | Desde más lejos, barridas desde su borde de entrada, y flotan a otra velocidad. |
| Fichas | Etiqueta desde la izquierda, valor desde la derecha, filete que se dibuja. |
| Listas (canciones, filminutos) | Desde la izquierda, cada una a su ritmo. Índice de profundidades: alternando lados. |
| Estantería | Libros en abanico; la fila corre con el scroll. |
| Gran Faro | Filas desde la derecha (datos que llegan) y series que se trazan. |
| Challenge | I desde la izquierda, II desde abajo, III desde la derecha. |
| Cierre | El titular se acerca, el botón llega desde la derecha y un brillo lo recorre. |
| Progreso | Hilo coral arriba que se llena con el recorrido. |

## Película vertical (9:16)

Una segunda cadena nativa vertical, no un recorte: mismo guion de cámara, mismo modelo (Kling 3.0, 1080p, 10 s), cada tramo empieza en el último fotograma real del anterior. Fotograma inicial: Seedream 5 Pro en 9:16 con la superficie horizontal como referencia (la extensión automática con Ideogram se descartó: inventó texto). El tramo 5 se oscureció igual que el horizontal antes de encadenar el 6.

- Archivos: `legN-v.mp4` (1080×1920, GOP 8), `legN-vm.mp4` (720×1280, GOP 4, teléfonos), `legN-v.webp` (póster).
- `DiveFilm` elige la película según la orientación (alto > ancho) y recarga si se gira el dispositivo.
- Coste: ~5.500 créditos (6 tramos × 900 + fotograma). Se descartó reencuadrar los clips con Runway Aleph 2: 5.850 créditos por tramo.

## Reproducción fluida

`DiveFilm` ya no avanza buscando fotograma a fotograma cuando el avance es continuo hacia adelante: reproduce el video con `playbackRate` igual a la velocidad pedida y pinta cada fotograma decodificado (`requestVideoFrameCallback`). Solo busca al ir hacia atrás, al detenerse o para corregir un desfase grande.

- **Kiosco** (`clock`): siempre reproduce; en las pausas la toma queda quieta; los viajes arrancan ya con velocidad (curva que nunca parte de cero), así nunca hay avance a saltos.
- **Kiosco, textos sincronizados con la película**: titulares, franjas, logo y mero 3D no esperan a la pausa. `presence()` (en `src/kiosk/timeline.ts`) calcula en cada cuadro cuánto ha llegado la cámara a cada capa (`--in`) y cuánto se ha alejado (`--out`); el CSS mueve todo con eso, igual que la web con el scroll. El titular empieza a entrar mientras la cámara se acerca, termina justo al asentarse y sale arrastrado (hacia arriba al bajar, hacia abajo al subir) en cuanto la cámara reanuda la marcha. El logo se arma con el matraz llenándose, se parte al zambullirse y se vuelve a armar al salir al atardecer.
- **Web**: el motion ligado al scroll sigue a un scroll suavizado (inercia), no a los saltos de ~100 px de la rueda.
