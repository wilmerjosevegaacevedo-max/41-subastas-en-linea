export function calculateMinimumIncrementCentavos(precioInicialPesos: number): number {
  const precioCentavos = precioInicialPesos * 100;
  const rawFivePercent = precioCentavos * 0.05;
  const roundedCentavos = Math.round(rawFivePercent / 50000) * 50000;
  if (roundedCentavos < 100000) {
    return 100000;
  }
  return roundedCentavos;
}

export function formatPesos(centavos: number): string {
  const pesos = Math.floor(centavos / 100);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos);
}
