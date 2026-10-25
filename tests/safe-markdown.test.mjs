import test from 'node:test'
import assert from 'node:assert/strict'
import { renderSafeMarkdown } from '../src/lib/safe-markdown.mjs'

test('renders markdown while escaping embedded HTML', () => {
  const html = renderSafeMarkdown('<script>alert(1)</script>\n\n**safe text**')
  assert.doesNotMatch(html, /<script>/i)
  assert.match(html, /&lt;script&gt;/)
  assert.match(html, /<strong>safe text<\/strong>/)
})

test('removes unsafe link and image schemes', () => {
  const html = renderSafeMarkdown('[click](javascript:alert(1))\n\n![photo](javascript:alert(1))')
  assert.doesNotMatch(html, /href="javascript:/i)
  assert.doesNotMatch(html, /src="javascript:/i)
  assert.match(html, /click/)
})

test('keeps safe links and images', () => {
  const html = renderSafeMarkdown('[project](https://example.com)\n\n![photo](/photo.jpg)')
  assert.match(html, /href="https:\/\/example\.com"/)
  assert.match(html, /src="\/photo\.jpg"/)
})
