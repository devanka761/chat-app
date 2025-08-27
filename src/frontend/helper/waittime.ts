export default async function waittime(ts: number = 500, tsa: number = 5): Promise<void> {
  const ms: number = ts - tsa || 0
  return new Promise((resolve) => setTimeout(resolve, ms))
}
