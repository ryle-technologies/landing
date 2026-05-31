export type FeedEventStatus = "pending" | "ok" | "failed"

/** HTTP verb for rows that represent an API surface (REST / internal HTTP). */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS"

/**
 * Single line in the under-the-hood console.
 *
 * Same shape regardless of source (mock today, SSE/WebSocket from the backend
 * tomorrow). The console UI never branches on origin — it just renders rows.
 */
export type FeedEvent = {
  id: string
  /** Unix ms. Used for the leading time column and ordering. */
  ts: number
  /**
   * When set, the row is treated as API-shaped: a color-coded method prefix is
   * shown before the event type. Omitted for purely on-chain / RPC rows.
   */
  method?: HttpMethod
  /** Dot-namespaced event name, e.g. `payment.created`, `tx.confirmed`. */
  type: string
  /** Right-hand payload string. Pre-formatted, so the renderer stays dumb. */
  summary: string
  status?: FeedEventStatus
  /** Raw payload, surfaced when a row is expanded. */
  detail?: Record<string, unknown>
}
