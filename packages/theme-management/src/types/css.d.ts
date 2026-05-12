// Allow TypeScript to resolve side-effect CSS imports (e.g. `import './Foo.css'`)
declare module '*.css' {
  const content: Record<string, string>
  export default content
}
