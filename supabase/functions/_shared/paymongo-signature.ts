// supabase/functions/_shared/paymongo-signature.ts
//
// PayMongo webhook signature check (Web Crypto only, no imports).
//
// Header: `Paymongo-Signature: t=<unix seconds>,te=<test sig>,li=<live sig>`
// Signature = hex HMAC-SHA256 of `${t}.${rawBody}` with the webhook's secret.
// Only one of te/li is filled, depending on the mode the event came from.
//
// A valid signature only proves PayMongo sent the event. The webhook still
// re-fetches the checkout session with our secret key before confirming
// anything.

/** How far the signed timestamp may be from our clock, either way. */
export const SIGNATURE_TOLERANCE_SECONDS = 5 * 60

export type PaymongoMode = 'live' | 'test'

/** The mode of a PayMongo secret key (`sk_live_...` / `sk_test_...`), or null if unknown. */
export function modeOfSecretKey(secretKey: string | null | undefined): PaymongoMode | null {
  if (!secretKey) return null
  if (secretKey.startsWith('sk_live_')) return 'live'
  if (secretKey.startsWith('sk_test_')) return 'test'
  return null
}

export function parseSignatureHeader(
  header: string | null | undefined,
): { t: string; te: string; li: string } | null {
  if (!header) return null
  const parts: Record<string, string> = {}
  for (const piece of header.split(',')) {
    const i = piece.indexOf('=')
    if (i > 0) parts[piece.slice(0, i).trim()] = piece.slice(i + 1).trim()
  }
  if (!parts.t) return null
  return { t: parts.t, te: parts.te ?? '', li: parts.li ?? '' }
}

function hexToBytes(hex: string): ArrayBuffer | null {
  if (!/^[0-9a-f]{64}$/i.test(hex)) return null
  const out = new ArrayBuffer(hex.length / 2)
  const view = new Uint8Array(out)
  for (let i = 0; i < view.length; i++) view[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}

async function hmacKey(secret: string, usage: 'sign' | 'verify'): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  )
}

/** Hex HMAC-SHA256 of `${timestamp}.${rawBody}`. Used by tests to build valid headers. */
export async function signPayload(secret: string, timestamp: string, rawBody: string): Promise<string> {
  const key = await hmacKey(secret, 'sign')
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`))
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('')
}

export type VerifyOptions = {
  /** Mode of our PAYMONGO_SECRET_KEY. Null/undefined = unknown: accept whichever signature is present. */
  mode?: PaymongoMode | null
  /** Current time in unix seconds (injectable for tests). */
  nowSeconds?: number
  toleranceSeconds?: number
}

/**
 * True only when the header carries a fresh timestamp and a signature for our
 * mode that matches the raw body. The comparison is constant-time
 * (crypto.subtle.verify).
 */
export async function verifyPaymongoSignature(
  rawBody: string,
  header: string | null | undefined,
  secret: string,
  options: VerifyOptions = {},
): Promise<boolean> {
  const parsed = parseSignatureHeader(header)
  if (!parsed || !secret) return false

  if (!/^\d{1,12}$/.test(parsed.t)) return false
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000)
  const tolerance = options.toleranceSeconds ?? SIGNATURE_TOLERANCE_SECONDS
  if (Math.abs(now - Number(parsed.t)) > tolerance) return false

  const given = options.mode === 'live'
    ? parsed.li
    : options.mode === 'test'
    ? parsed.te
    : parsed.li || parsed.te
  const givenBytes = hexToBytes(given)
  if (!givenBytes) return false

  const key = await hmacKey(secret, 'verify')
  return await crypto.subtle.verify(
    'HMAC',
    key,
    givenBytes,
    new TextEncoder().encode(`${parsed.t}.${rawBody}`),
  )
}
