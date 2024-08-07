import { Variable, MulNode, VarVals, NumNode } from "./variable"

describe("Test algebraic operation", () => {
  it("multiplication", () => {
    const a = new Variable("a", 0, 10)
    const b = new Variable("b", 0, 10)
    const c = a.mul(b)
    expect(c.min).toBe(0)
    expect(c.max).toBe(100)
    expect(c.render()).toBe("(a * b)")
  })

  it("nested multiplication", () => {
    const a = new Variable("a", 0, 10)
    const b = new Variable("b", 0, 10)
    const c = a.mul(b)
    const d = c.mul(a)
    expect(d.min).toBe(0)
    expect(d.max).toBe(1000)
    expect(d.render()).toBe("((a * b) * a)")
  })
})

describe("Test substitution", () => {
  it("Variable", () => {
    const a = new Variable("a", 0, 10)
    const varVals: VarVals = new Map()
    varVals.set(a.name, new NumNode(1))
    const res = a.substitute(varVals)
    expect(res instanceof NumNode).toBe(true)
    expect((res as NumNode).value).toBe(1)
  })

  it("Algebra", () => {
    const a = new Variable("a", 0, 10)
    const b = new Variable("b", 0, 10)
    const c = a.mul(b)
    const varVals: VarVals = new Map()
    varVals.set(a.name, new NumNode(3))
    varVals.set(b.name, new NumNode(4))
    const res = c.substitute(varVals)
    expect(res instanceof NumNode).toBe(true)
    expect((res as NumNode).value).toBe(12)
  })

  it("Sum", () => {
    const a = new Variable("a", 0, 10)
    const b = new Variable("b", 0, 10)
    const c = a.add(b)
    const varVals: VarVals = new Map()
    varVals.set(a.name, new NumNode(3))
    varVals.set(b.name, new NumNode(4))
    const res = c.substitute(varVals)
    expect(res instanceof NumNode).toBe(true)
    expect((res as NumNode).value).toBe(7)
  })

  it("Mod", () => {
    const a = new Variable("a", 0, 10)
    const b = new NumNode(4)
    const c = a.mod(b)
    const varVals: VarVals = new Map()
    varVals.set(a.name, new NumNode(10))
    const res = c.substitute(varVals)
    expect(res instanceof NumNode).toBe(true)
    expect((res as NumNode).value).toBe(2)
  })

  it("complex", () => {
    const idx0 = new Variable("idx0", 0, 10)
    const idx1 = new Variable("idx1", 0, 10)
    const c = idx0
      .mul(new NumNode(2))
      .mod(new NumNode(3))
      .add(idx1.mod(new NumNode(3)).mul(new NumNode(3)))
    expect(c.render()).toBe("(((idx0 * 2) % 3) + ((idx1 % 3) * 3))")
    const varVals: VarVals = new Map()
    varVals.set(idx0.name, new NumNode(1))
    varVals.set(idx1.name, new NumNode(2))
    const res = c.substitute(varVals)
    expect(res instanceof NumNode).toBe(true)
    expect((res as NumNode).value).toBe(8)
  })

  it("comparison substitution", () => {
    const a = new Variable("a", 0, 10)
    const lessThan5 = a.lt(new NumNode(5))
    const varVals = new Map()
    varVals.set(a.name, new NumNode(4))
    const res = lessThan5.substitute(varVals)
    expect(res instanceof NumNode).toBe(true)
    expect((res as NumNode).value).toBe(1)

    const lessOrEqualThan5 = a.le(new NumNode(5))
    const res2 = lessOrEqualThan5.substitute(varVals)
    expect(res2 instanceof NumNode).toBe(true)
    expect((res2 as NumNode).value).toBe(1)

    const greaterThan5 = a.gt(new NumNode(5))
    const res3 = greaterThan5.substitute(varVals)
    expect(res3 instanceof NumNode).toBe(true)
    expect((res3 as NumNode).value).toBe(0)

    const greaterOrEqualThan5 = a.ge(new NumNode(5))
    const res4 = greaterOrEqualThan5.substitute(varVals)
    expect(res4 instanceof NumNode).toBe(true)
    expect((res4 as NumNode).value).toBe(0)
  })

  it("'and' logic", () => {
    const a = new Variable("a", 0, 10)
    const b = new Variable("b", 0, 10)
    const c = a.lt(new NumNode(5)).and(b.gt(new NumNode(5)))
    const varVals = new Map()
    varVals.set(a.name, new NumNode(4))
    varVals.set(b.name, new NumNode(6))
    const res = c.substitute(varVals)
    expect(res instanceof NumNode).toBe(true)
    expect((res as NumNode).value).toBe(1)
  })
})
