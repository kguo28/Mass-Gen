import { pvpCard, type ChangeCard } from './changeCards'

/**
 * Registry of all available Change Card units, keyed by their card id.
 * To add a new unit: import its card here and add an entry.
 */
export const changeCardRegistry: Record<string, ChangeCard> = {
  pvp: pvpCard,
}

export function getChangeCard(id: string | null | undefined): ChangeCard | null {
  if (!id) return null
  return changeCardRegistry[id] ?? null
}
