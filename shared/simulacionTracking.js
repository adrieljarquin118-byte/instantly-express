export function calcularProgreso(fechaInicio, diasEstimados) {
  const transcurrido = Math.max(0, Date.now() - new Date(fechaInicio).getTime());
  return Math.min(95, Math.round((transcurrido / (diasEstimados * 86400000)) * 100));
}