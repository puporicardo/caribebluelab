/**
 * Enlaces externos del micrositio en un solo lugar.
 * Los que aún no están confirmados quedan en null y el sitio los muestra sin enlace.
 */
export const LINKS = {
  innovazul: 'https://innovazul.co',
  almar: 'https://almar.innovazul.co',
  granFaro: 'https://granfaro.innovazul.co',
  blueLab: 'https://bluelab.innovazul.co',
  /** Galería de Art Blue Lab: por confirmar. */
  artBlueLabGallery: null as string | null,
  /** Propuesta de alianza Art Blue Lab – CAF: por confirmar. */
  artBlueLabAlliance: null as string | null,
  /** Editorial Unimagdalena (colección CUBI): por confirmar la URL de cada título. */
  editorial: null as string | null,
  /** Formulario o página de IncubAzul Caribe: por confirmar. */
  incubAzul: null as string | null,
} as const;
