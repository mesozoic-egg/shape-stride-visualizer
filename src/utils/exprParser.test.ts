import { Variable } from "../model/variable"
import { parse, validateVariables } from "./exprParser"

describe("Test parsers", () => {
  test.each([
    ["(1 + 2 + 3)", "((1 + 2) + 3)"],
    ["1 * 2 * 3", "((1 * 2) * 3)"],
    ["1 * (2 * 3)", "(1 * (2 * 3))"],
    ["(( 1 + 2 ) * 3)", "((1 + 2) * 3)"],
    ["12 + 4", "(12 + 4)"],
    ["13 // 4", "(13 // 4)"],
    ["13 / 4", "(13 / 4)"],
  ])('parse arithmetic "%s"', (expression, expected) => {
    expect(parse({ expression }).render()).toBe(expected)
  })

  test.each([
    ["(a + b)", "(a + b)"],
    ["(a + b) * c", "((a + b) * c)"],
    ["a + (b * c)", "(a + (b * c))"],
    ["a + 12", "(a + 12)"],
    ["(a + b) + b", "((a + b) + b)"],
  ])('parse variables "%s"', (expression, expected) => {
    expect(
      parse({
        expression,
        variables: {
          a: new Variable("a", 0, 1),
          b: new Variable("b", 0, 1),
          c: new Variable("c", 0, 1),
        },
      }).render(),
    ).toBe(expected)
  })

  test.each([
    [
      "(idx0 + 2) * 3 + idx1",
      { idx0: new Variable("idx0", 0, 1), idx1: new Variable("idx1", 0, 1) },
      "(((idx0 + 2) * 3) + idx1)",
    ],
    [
      "idx0 + idx0 + 1",
      { idx0: new Variable("idx0", 0, 1), idx1: new Variable("idx1", 0, 1) },
      "((idx0 + idx0) + 1)",
    ],
    [
      "(idx0 * 2) % 3 // 4",
      { idx0: new Variable("idx0", 0, 1) },
      "(((idx0 * 2) % 3) // 4)",
    ],
    [
      "((((((idx0 * 2) % 3) + idx1) % 3) * 3) + ((((idx0 * 2) + idx1) // 3) * 3))",
      { idx0: new Variable("idx0", 0, 1), idx1: new Variable("idx1", 0, 1) },
      "((((((idx0 * 2) % 3) + idx1) % 3) * 3) + ((((idx0 * 2) + idx1) // 3) * 3))",
    ],
    [
      "(((idx2%5)*5)+(idx0*125)+(idx1*25)+(idx3%5))",
      {
        idx0: new Variable("idx0", 0, 1),
        idx1: new Variable("idx1", 0, 1),
        idx2: new Variable("idx2", 0, 1),
        idx3: new Variable("idx3", 0, 1),
      },
      "(((((idx2 % 5) * 5) + (idx0 * 125)) + (idx1 * 25)) + (idx3 % 5))",
    ],
    [
      "((idx0*125)+(idx3*5)+(idx5*25)+(idx6*5)+idx4+idx7)",
      {
        idx0: new Variable("idx0", 0, 1),
        idx3: new Variable("idx3", 0, 2),
        idx4: new Variable("idx4", 0, 2),
        idx5: new Variable("idx5", 0, 4),
        idx6: new Variable("idx6", 0, 2),
        idx7: new Variable("idx7", 0, 2),
      },
      "((((((idx0 * 125) + (idx3 * 5)) + (idx5 * 25)) + (idx6 * 5)) + idx4) + idx7)",
    ],
    [
      "((idx2*45)+(idx5*9)+(idx6*3)+idx7)",
      {
        idx2: new Variable("idx2", 0, 3),
        idx5: new Variable("idx5", 0, 4),
        idx6: new Variable("idx6", 0, 2),
        idx7: new Variable("idx7", 0, 2),
      },
      "((((idx2 * 45) + (idx5 * 9)) + (idx6 * 3)) + idx7)",
    ],
  ])(
    "parse complex variable and expression %s %s",
    (expression, variables, expected) => {
      expect(
        parse({
          expression,
          variables,
        }).render(),
      ).toBe(expected)
    },
  )
})

describe("test validateVariables", () => {
  test.each([
    ["(a + b)", { a: new Variable("a", 0, 1), b: new Variable("b", 0, 1) }],
    [
      "(idx0 + idx1)",
      { idx0: new Variable("idx0", 0, 1), idx1: new Variable("idx1", 0, 1) },
    ],
  ])('all variables present "%s" "%s"', (expression, variables) => {
    expect(validateVariables(expression, variables)).toBe(true)
  })

  test.each([
    ["(a + b)", { a: new Variable("a", 0, 1) }],
    ["(idx0 + idx1)", { idx0: new Variable("idx0", 0, 1) }],
  ])('some variables not present "%s" "%s"', (expression, variables) => {
    expect(validateVariables(expression, variables)).toBe(false)
  })
})
