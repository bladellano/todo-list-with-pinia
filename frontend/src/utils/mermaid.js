let mermaidInstance = null
let initializedTheme = null

async function getMermaid(theme) {
  if (!mermaidInstance) {
    const module = await import('mermaid')
    mermaidInstance = module.default
  }

  if (initializedTheme !== theme) {
    mermaidInstance.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'strict',
      fontFamily: 'inherit'
    })
    initializedTheme = theme
  }

  return mermaidInstance
}

export async function renderMermaidDiagrams(container, theme = 'light') {
  if (!container) return

  const nodes = container.querySelectorAll('pre.mermaid')
  if (nodes.length === 0) return

  try {
    const mermaid = await getMermaid(theme)
    await mermaid.run({
      nodes: Array.from(nodes),
      suppressErrors: true
    })
  } catch (error) {
    console.error('Erro ao renderizar diagrama Mermaid:', error)
  }
}
