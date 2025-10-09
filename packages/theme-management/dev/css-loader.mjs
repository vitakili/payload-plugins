// CSS loader for Node.js ESM
export async function resolve(specifier, context, next) {
  if (specifier.endsWith('.css') || specifier.endsWith('.scss') || specifier.endsWith('.sass')) {
    return {
      shortCircuit: true,
      url: new URL('./empty.js', import.meta.url).href,
    }
  }
  return next(specifier, context)
}

export async function load(url, context, next) {
  if (url.endsWith('.css') || url.endsWith('.scss') || url.endsWith('.sass')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {};',
    }
  }
  return next(url, context)
}
