let cachedIp: string | null = null

export async function fetchLocalIp(): Promise<string> {
  if (cachedIp) return cachedIp
  try {
    const res = await fetch('/api/local-ip')
    const data = (await res.json()) as { ip: string }
    cachedIp = data.ip
    return cachedIp
  } catch {
    return '127.0.0.1'
  }
}

import { useState, useEffect } from 'react'

export function useLocalIp(): string | null {
  const [ip, setIp] = useState<string | null>(cachedIp)

  useEffect(() => {
    fetchLocalIp().then(setIp)
  }, [])

  return ip
}
