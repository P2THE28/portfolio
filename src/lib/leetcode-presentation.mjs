/** Return a metric only when the provider supplied validated statistics. */
export function leetCodeMetric(result, metric) {
  if (!result || (result.status !== 'success' && result.status !== 'cached')) return null
  const value = result.data[metric]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}
