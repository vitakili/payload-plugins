import { render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { ClientSlugHandler, SlugProvider, useSlugContext } from '../dist/client.js'

describe('Client Components', () => {
  test('SlugProvider provides context', () => {
    const TestComponent = () => {
      const { slugs } = useSlugContext()
      return <div data-testid="slugs">{JSON.stringify(slugs)}</div>
    }

    const { getByTestId } = render(
      <SlugProvider>
        <TestComponent />
      </SlugProvider>,
    )

    const element = getByTestId('slugs')
    expect(element).toBeInTheDocument()
    expect(JSON.parse(element.textContent || '{}')).toEqual({})
  })

  test('ClientSlugHandler renders without crashing', () => {
    expect(() => {
      render(
        <SlugProvider>
          <ClientSlugHandler localizedSlugs={{ en: '/test' }} />
        </SlugProvider>,
      )
    }).not.toThrow()
  })

  test('ClientSlugHandler with pageData renders without crashing', () => {
    const pageData = {
      title: { en: 'Hello World' },
      slug: { en: 'hello-world' },
      localizedSlugs: {
        en: { slug: 'hello-world', fullPath: '/hello-world' },
      },
    }

    expect(() => {
      render(
        <SlugProvider>
          <ClientSlugHandler pageData={pageData} />
        </SlugProvider>,
      )
    }).not.toThrow()
  })
})
