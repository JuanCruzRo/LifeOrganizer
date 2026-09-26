/**
 * Milo's expressions. Each one is a separate image in /public so only the
 * faces a screen actually uses get downloaded.
 */
export type MiloFace =
  | "avatar"
  | "pensando"
  | "celebrando"
  | "enfocado"
  | "dormido"
  | "alerta"
  | "animando"
  | "saludando"
  | "orgulloso"
  | "confundido"
  | "escuchando";

export function miloFace(face: MiloFace): string {
  return `/milo-${face}.webp`;
}
