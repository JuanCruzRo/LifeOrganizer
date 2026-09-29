/**
 * Modelo de unidad economica de Spark.
 *
 *   node scripts/modelo-economico.ts
 *
 * Cambiá las variables del bloque SIGUIENTE y volvé a correr. Todo lo que no
 * sabemos con certeza esta expuesto ahi a proposito, para que el numero que
 * salga se pueda discutir en vez de creerlo.
 *
 * Lo que NO incluye, y hay que sumar a mano: soporte, tu tiempo, marketing, y
 * el costo de reponer los usuarios que se van.
 */

/* ======================= VARIABLES ======================= */

export type Config = {
  // --- Mercado ---
  USUARIOS: number; // personas registradas
  PCT_PAGA: number; // cuanto de los registrados se suscribe
  PCT_PLUS: number; // de los suscriptores, cuanto esta en Plus (el resto, Pro)
  PRECIO_PLUS: number; // USD/mes
  PRECIO_PRO: number; // USD/mes
  PCT_TRIAL: number; // de los suscriptores, cuanto esta en periodo de prueba

  // --- Uso ---
  PCT_DEL_TOPE: number; // fraccion del tope diario que quema el usuario promedio
  TOPE_CHAT_PLUS: number; // mensajes/dia
  TOPE_CHAT_PRO: number;

  // --- Proveedor ---
  TOKENS_GRATIS_DIA: number; // Groq gratis, PARA TODO EL PRODUCTO
  TOKENS_POR_TURNO: number; // prompt + salida, medido
  PRECIO_IN: number; // USD por token
  PRECIO_OUT: number;
  RATIO_OTRAS: number; // las otras 5 funciones de IA vs el chat

  // --- Costos que NO medimos ---
  COMISION_MP: number; // comision de Mercado Pago, + IVA
  RETENCION_FISCAL: number;

  // --- Fijos ---
  VERCEL_MENSUAL: number;
  NEON_MENSUAL: number;
  DOMINIO_ANUAL: number;

  // --- Reparto ---
  SOCIOS: number;
};

export const CFG: Config = {
  USUARIOS: 1_000,
  PCT_PAGA: 0.05,
  PCT_PLUS: 0.6,
  PRECIO_PLUS: 6,
  PRECIO_PRO: 20,
  PCT_TRIAL: 0.4, // 40% de los suscriptores todavia esta probando

  PCT_DEL_TOPE: 0.3,
  TOPE_CHAT_PLUS: 60,
  TOPE_CHAT_PRO: 200,

  TOKENS_GRATIS_DIA: 200_000,
  TOKENS_POR_TURNO: 1_188 + 364,
  PRECIO_IN: 0.15 / 1e6,
  PRECIO_OUT: 0.6 / 1e6,
  RATIO_OTRAS: 0.9,

  COMISION_MP: 0.12 * 1.21, // <-- LO MAS INCIERTO DEL MODELO
  RETENCION_FISCAL: 0.15, // <-- y este

  VERCEL_MENSUAL: 20,
  NEON_MENSUAL: 19,
  DOMINIO_ANUAL: 12,

  SOCIOS: 2
};

/* ======================= CALCULO ======================= */

export type Resultado = {
  suscriptores: number;
  plus: number;
  pro: number;
  pagadores: number; // los que NO estan en trial
  facturadoBruto: number;
  facturadoCobrado: number; // lo que entra a la cuenta, sin trials
  mp: number;
  retencion: number;
  ia: number;
  fijos: number;
  neto: number;
  turnosDia: number;
  turnosGratis: number;
  turnosPagados: number;
  usaGroqGratis: boolean;
};

export function calcular(c: Config = CFG): Resultado {
  const suscriptores = c.USUARIOS * c.PCT_PAGA;
  const plus = suscriptores * c.PCT_PLUS;
  const pro = suscriptores * (1 - c.PCT_PLUS);
  const pagadores = suscriptores * (1 - c.PCT_TRIAL);

  const turnosDia =
    plus * c.TOPE_CHAT_PLUS * c.PCT_DEL_TOPE + pro * c.TOPE_CHAT_PRO * c.PCT_DEL_TOPE;

  // Groq cubre los primeros tokens del dia y el resto cae a Ollama. Esto es
  // una escalera, no una curva: hasta ~168 turnos/dia el costo es ~0, y del
  // turno siguiente ya se esta pagando entero.
  const turnosGratis = Math.min(turnosDia, c.TOKENS_GRATIS_DIA / c.TOKENS_POR_TURNO);
  const turnosPagados = Math.max(0, turnosDia - turnosGratis);

  const costoTurno = 1_188 * c.PRECIO_IN + 364 * c.PRECIO_OUT;
  const ia = turnosPagados * costoTurno * 30 * (1 + c.RATIO_OTRAS);

  const bruto = plus * c.PRECIO_PLUS + pro * c.PRECIO_PRO;
  const cobrado = bruto * (1 - c.PCT_TRIAL); // los trials no facturan todavia
  const mp = cobrado * c.COMISION_MP;
  const retencion = cobrado * c.RETENCION_FISCAL;
  const fijos = c.VERCEL_MENSUAL + c.NEON_MENSUAL + c.DOMINIO_ANUAL / 12;
  const neto = cobrado - mp - retencion - ia - fijos;

  return {
    suscriptores, plus, pro, pagadores,
    facturadoBruto: bruto,
    facturadoCobrado: cobrado,
    mp, retencion, ia, fijos, neto,
    turnosDia: Math.round(turnosDia),
    turnosGratis: Math.round(turnosGratis),
    turnosPagados: Math.round(turnosPagados),
    usaGroqGratis: turnosDia <= turnosGratis
  };
}

/* ======================= SALIDA ======================= */

const money = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");
const pad = (s: string, n: number) => s.padStart(n);
const sign = (n: number) => (n >= 0 ? "+" : "-") + "$" + Math.abs(Math.round(n)).toLocaleString("es-AR");

export function imprimir(c: Config = CFG) {
  const r = calcular(c);

  console.log(`
${c.USUARIOS.toLocaleString("es-AR")} usuarios | ${(c.PCT_PAGA * 100).toFixed(0)}% paga = ${Math.round(r.suscriptores)} | ${(c.PCT_DEL_TOPE * 100).toFixed(0)}% del tope | ${(c.PCT_TRIAL * 100).toFixed(0)}% en trial | ${c.SOCIOS} socios

  ${r.plus.toFixed(1)} Plus  +  ${r.pro.toFixed(1)} Pro   ->  ${Math.round(r.pagadores)} pagando de verdad

  INGRESO
    suscripciones              ${pad(money(r.facturadoBruto), 9)}
    menos los que estan en trial ${pad(money(-(r.facturadoBruto - r.facturadoCobrado)), 9)}
    cobrar de verdad           ${pad(money(r.facturadoCobrado), 9)}

  SE VA
    Mercado Pago (${(c.COMISION_MP * 100).toFixed(1)}%)       ${pad(money(-r.mp), 9)}
    retencion (${(c.RETENCION_FISCAL * 100).toFixed(0)}%)            ${pad(money(-r.retencion), 9)}
    IA                        ${pad(money(-r.ia), 9)}
    fijos                     ${pad(money(-r.fijos), 9)}

  QUEDA  ${pad(sign(r.neto), 9)} /mes     cada socio: ${sign(r.neto / c.SOCIOS)}
  la IA se lleva el ${r.facturadoCobrado > 0 ? ((r.ia / r.facturadoCobrado) * 100).toFixed(1) : "0"}% de lo cobrado
  IA: ${r.turnosDia} turnos/dia, ${r.usaGroqGratis ? "todos en Groq gratis" : `${r.turnosGratis} en Groq gratis + ${r.turnosPagados} en Ollama`}
`);
  return r;
}

export function sensibilidad() {
  const base = calcular().neto;
  const variations: [string, keyof Config, number[]][] = [
    ["cuantos usuarios", "USUARIOS", [500, 1_000, 2_000, 5_000, 10_000]],
    ["cuanto convierten a pagado", "PCT_PAGA", [0.01, 0.02, 0.05, 0.1, 0.2]],
    ["comision de Mercado Pago", "COMISION_MP", [0.05, 0.1, 0.145, 0.2]],
    ["retencion fiscal", "RETENCION_FISCAL", [0, 0.1, 0.15, 0.25]],
    ["cuanto del tope usan", "PCT_DEL_TOPE", [0.1, 0.3, 0.6, 1]],
    ["proporcion de Plus", "PCT_PLUS", [0, 0.3, 0.6, 0.8]],
    ["tope de Plus (mensajes/dia)", "TOPE_CHAT_PLUS", [15, 30, 60]],
    ["tope de Pro (mensajes/dia)", "TOPE_CHAT_PRO", [50, 100, 200]]
  ];

  console.log("  QUE VARIABLE MUDA EL RESULTADO, Y CUANTO\n");
  for (const [label, key, valores] of variations) {
    console.log(`  ${label}`);
    for (const v of valores) {
      const r = calcular({ ...CFG, [key]: v } as Config);
      const delta = r.neto - base;
      const barra = Math.abs(delta) < 1 ? "  <- igual" : delta > 0 ? "  mejor" : "  peor";
      console.log(`      ${String(v).padStart(7)}   ${sign(r.neto).padStart(10)}${barra}`);
    }
  }
}

imprimir();
sensibilidad();
