import type { NetworkBundle } from './types'
import { banNetwork } from './ban/manifest'
import { icnStubNetwork } from './icn-stub/manifest'

export const networks: Record<string, NetworkBundle> = {
  ban: banNetwork,
  'icn-stub': icnStubNetwork,
}

export const DEFAULT_NETWORK_ID = 'ban'

export function getNetwork(id: string | null | undefined): NetworkBundle {
  if (id && networks[id]) return networks[id]
  return networks[DEFAULT_NETWORK_ID]
}

export function readNetworkIdFromQuery(): string {
  if (typeof window === 'undefined') return DEFAULT_NETWORK_ID
  return new URLSearchParams(window.location.search).get('network') || DEFAULT_NETWORK_ID
}
