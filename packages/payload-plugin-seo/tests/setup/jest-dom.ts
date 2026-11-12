// Register jest-dom matchers on this package's own `vitest` instance.
// In this pnpm monorepo (`shamefully-hoist=true`), `@testing-library/jest-dom/vitest`
// resolves the hoisted root `vitest`, which is a different version, so its
// `expect.extend` never reaches the `expect` these tests use.
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

expect.extend(matchers);
