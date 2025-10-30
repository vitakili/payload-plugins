import * as matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

// Extend vitest's expect with jest-dom matchers
expect.extend(matchers)
