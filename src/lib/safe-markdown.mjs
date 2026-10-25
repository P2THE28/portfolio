import { marked } from 'marked'

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function isSafeUrl(value, image = false) {
  if (value.startsWith('/') && !value.startsWith('//')) return true
  if (value.startsWith('./') || value.startsWith('../') || value.startsWith('#')) return true
  try {
    const protocol = new URL(value).protocol
    return image ? protocol === 'https:' || protocol === 'http:' : ['https:', 'http:', 'mailto:', 'tel:'].includes(protocol)
  } catch {
    return false
  }
}

export function renderSafeMarkdown(source) {
  const renderer = new marked.Renderer()
  renderer.html = ({ text }) => escapeHtml(text)
  renderer.link = function ({ href, title, tokens }) {
    const label = this.parser.parseInline(tokens)
    if (!isSafeUrl(href)) return label
    const titleAttribute = title ? ` title="${escapeHtml(title)}"` : ''
    return `<a href="${escapeHtml(href)}"${titleAttribute} rel="noopener noreferrer">${label}</a>`
  }
  renderer.image = ({ href, title, text }) => {
    if (!isSafeUrl(href, true)) return escapeHtml(text)
    const titleAttribute = title ? ` title="${escapeHtml(title)}"` : ''
    return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttribute} loading="lazy" decoding="async">`
  }
  return marked(source, { renderer })
}
