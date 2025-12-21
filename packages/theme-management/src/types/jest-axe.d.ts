declare module 'jest-axe' {
  import { MatcherUtils } from '@testing-library/jest-dom/dist/utils'
  export function axe(html: string | Node): Promise<any>
  export function toHaveNoViolations(received: any): { pass: boolean; message?: () => string }
  const plugin: any
  export default plugin
}
