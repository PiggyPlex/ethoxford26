#!/usr/bin/env ts-node

import * as T from "effect"
import * as Playwright from "playwright"
import { pipe } from "effect/Function"

/**
 * Recursively formats an accessibility node
 */
function dumpNode(node: any, depth = 0): any {
  const indent = "  ".repeat(depth)
  const { role, name, children } = node
  return {
    role,
    name,
    children: Array.isArray(children)
      ? children.map((c: any) => dumpNode(c, depth + 1))
      : [],
  }
}

/**
 * Effect to launch browser, visit a URL, and extract the accessibility tree
 */
const getAccessibilityTree = (url: string) =>
  T.gen(function* ($) {
    // 1) Launch browser
    const browser = yield* $(T.fromPromise(() => Playwright.chromium.launch()))
    const page = yield* $(T.fromPromise(() => browser.newPage()))

    // 2) Navigate
    yield* $(T.fromPromise(() => page.goto(url)))

    // 3) Ask Playwright for tree
    const snapshot = yield* $(
      T.fromPromise(() => page.accessibility.snapshot({ interestingOnly: false }))
    )

    // 4) Close browser
    yield* $(T.fromPromise(() => browser.close()))

    return dumpNode(snapshot)
  })

/**
 * Effect to print a typed JSON tree
 */
const program = pipe(
  getAccessibilityTree("https://example.com"),
  T.flatMap((tree) =>
    T.succeedWith(() => {
      console.log(JSON.stringify(tree, null, 2))
    })
  )
)

T.runPromise(program).then(
  () => process.exit(0),
  (err) => {
    console.error("Error:", err)
    process.exit(1)
  }
)
