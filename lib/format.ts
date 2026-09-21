/** Todo se muestra en hora de Puerto Rico, no en la del servidor. */
const ZONA = "America/Puerto_Rico";

const FECHA = new Intl.DateTimeFormat("es-PR", {
  timeZone: ZONA,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const ANIO = new Intl.DateTimeFormat("es-PR", { timeZone: ZONA, year: "numeric" });

export function fecha(iso: string): string {
  return FECHA.format(new Date(iso)).replace(/\./g, "");
}

export function anio(iso: string): number {
  return Number(ANIO.format(new Date(iso)));
}

export function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** "3 de 6" para lobbies, "Ganó"/"Perdió" para duelos. */
export function resultadoTexto(kind: string, placement: number, total: number): string {
  if (kind === "duel") return placement === 1 ? "Ganó" : "Perdió";
  return `${placement} de ${total}`;
}

const FECHA_HORA = new Intl.DateTimeFormat("es-PR", {
  timeZone: ZONA,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

/** "sáb, 4 oct, 7:00 p. m." en hora de Puerto Rico. */
export function fechaHora(iso: string): string {
  return FECHA_HORA.format(new Date(iso)).replace(/\./g, "").replace(/\s+/g, " ");
}
