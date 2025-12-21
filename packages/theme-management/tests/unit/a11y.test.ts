import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import React from 'react'
import ThemePreview from '../../src/components/ThemePreview'

// Avoid TypeScript mismatch by using a cast

// Note: we mock @payloadcms/ui before importing ThemePreview
jest.mock('@payloadcms/ui', () => ({
  useField: () => ({ value: 'cool' }),
}))
;(expect as any).extend(toHaveNoViolations)

describe('Accessibility (a11y) checks - ThemePreview', () => {
  it('has no detectable violations', async () => {
    const { container } = render(React.createElement(ThemePreview))
    const results = await axe(container)
    ;(expect(results) as any).toHaveNoViolations()
  })
})
