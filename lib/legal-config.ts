// Datos del responsable del servicio. COMPLETAR antes de publicar.
export const LEGAL = {
  serviceName: "Spark",
  // Nombre completo o razón social de quien opera el servicio
  operatorName: "Fausto Zaccanti",
  // CUIT/CUIL del responsable (obligatorio para facturar en Argentina)
  operatorTaxId: "[CUIT]",
  operatorAddress: "[DOMICILIO], Argentina",
  contactEmail: "[EMAIL DE SOPORTE]",
  website: "[https://TU-DOMINIO]",
  lastUpdated: "2026-09-25",
  // Precios de referencia (USD). Los cobros en pesos se calculan aparte.
  prices: { plus: 6, pro: 20 },
  trialDays: 14
} as const;
