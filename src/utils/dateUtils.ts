/**
 * Utilitaires universels de formatage de date au format Jour Mois Année (français)
 */

/**
 * Formate une date au format standard Jour/Mois/Année (ex: 30/09/2026)
 */
export function formatDate(input?: string | Date | null): string {
  if (!input) return '';
  if (typeof input === 'string') {
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
  }
  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formate une date au format littéraire Jour Mois Année (ex: 30 septembre 2026)
 */
export function formatDateLong(input?: string | Date | null): string {
  if (!input) return '';
  if (typeof input === 'string') {
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }
  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formate une date avec le jour de la semaine (ex: Mercredi 30 septembre 2026)
 */
export function formatDateFull(input?: string | Date | null): string {
  if (!input) return '';
  if (typeof input === 'string') {
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      const str = d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  }
  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);
  const str = d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formate une date et heure (ex: 30/09/2026 à 14:30)
 */
export function formatDateTime(input?: string | Date | null): string {
  if (!input) return '';
  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);
  const dateStr = formatDate(d);
  const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} à ${timeStr}`;
}

/**
 * Retourne la date du jour au format ISO YYYY-MM-DD (ex: 2026-10-01)
 */
export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Ajoute un nombre de jours à une date au format YYYY-MM-DD
 */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, '0');
  const nextD = String(date.getDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
}
