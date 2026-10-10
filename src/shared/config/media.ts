/**
 * Videos de fondo por profundidad (Magnific · Kling 2.5, 1080p, 10 s en bucle).
 *
 * Primero se intenta la copia local en /public/media (rápida y permanente).
 * Si no existe, se usa la URL firmada de Magnific como respaldo.
 * ⚠️ Las URLs firmadas vencen el 12 oct 2026 (noche, hora de Bogotá):
 *    ejecuta `pnpm videos` antes para guardarlas en public/media.
 * Si ninguna carga, el océano WebGL dibuja el fondo completo.
 */
export interface ZoneVideo {
  local: string;
  remote: string;
}

const base = import.meta.env.BASE_URL;

export const ZONE_VIDEOS: ZoneVideo[] = [
  {
    local: `${base}media/00-superficie.mp4`,
    remote:
      'https://pikaso.cdnpk.net/private/production/5682463029/08b80482-9e74-4bf6-b3ee-c2da22386d5e-0.mp4?token=exp=1791849600~hmac=817208634782649faa442fb5be31ae454e2a7442abde9a666acc1a2687354658',
  },
  {
    local: `${base}media/01-zona-de-luz.mp4`,
    remote:
      'https://pikaso.cdnpk.net/private/production/5682464059/24c1646d-f876-4912-ac2a-d8dfed9b3964-0.mp4?token=exp=1791849600~hmac=99db419f70e040f2e5acfce7e28e1101f89138dc934a02b0b3f34d74f07d8366',
  },
  {
    local: `${base}media/02-arrecife.mp4`,
    remote:
      'https://pikaso.cdnpk.net/private/production/5682466018/040b9d50-80c4-4fa8-8424-648c69c78eff-0.mp4?token=exp=1791849600~hmac=3d445b8cd038a95078e42ed31a306dfb2665d3a8b5e0c17f208fe6264856e987',
  },
  {
    local: `${base}media/03-pradera-marina.mp4`,
    remote:
      'https://pikaso.cdnpk.net/private/production/5682468879/a48e2fb7-f33f-4fe7-a41b-b1a49eea2b45-0.mp4?token=exp=1791849600~hmac=ed20d3240d019707a0c1f6a934652099e64b55c205554666267895f19cbd8196',
  },
  {
    local: `${base}media/04-zona-oscura.mp4`,
    remote:
      'https://pikaso.cdnpk.net/private/production/5682470519/49060bea-e736-4ed8-8d89-354535012047-0.mp4?token=exp=1791849600~hmac=fb61b6dbbef62f039915352651cbfed671e3c0593953d094ae07c4fa3578febf',
  },
  {
    local: `${base}media/05-ascenso.mp4`,
    remote:
      'https://pikaso.cdnpk.net/private/production/5682474034/96ee8bb5-a530-4e9c-85c0-11838c85fa1f-0.mp4?token=exp=1791849600~hmac=806496932bf955fabab908b5e9cd5a591e490d254b382b01cf7bd8b7197d00ff',
  },
];

/** Velocidad de reproducción: un poco más lenta se siente más “bajo el agua”. */
export const VIDEO_RATE = 0.8;
