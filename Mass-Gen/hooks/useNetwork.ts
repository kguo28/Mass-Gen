'use client'
import { useEffect, useState } from 'react'
import { getNetwork, readNetworkIdFromQuery, DEFAULT_NETWORK_ID } from '@/networks/registry'
import type { NetworkBundle } from '@/networks/types'

/** Read-only hook: returns the currently active NetworkBundle.
 *  Selection is by `?network=...` URL parameter at page load.
 *  Defaults to BAN.  Demo-only: changing networks mid-session would
 *  require a full reload (the network's data is baked into rendered
 *  components on first paint). */
export function useNetwork(): { network: NetworkBundle; networkId: string; hydrated: boolean } {
  const [networkId, setNetworkId] = useState<string>(DEFAULT_NETWORK_ID)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setNetworkId(readNetworkIdFromQuery())
    setHydrated(true)
  }, [])

  return { network: getNetwork(networkId), networkId, hydrated }
}
