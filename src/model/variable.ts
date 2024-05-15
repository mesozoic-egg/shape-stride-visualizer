export type VarVals = Map<string, Node>

export class Node {
  constructor(
    public min: number,
    public max: number,
  ) {}

  mul(b: Node): Node {
    return new MulNode(this, b)
  }

  add(b: Node): Node {
    return new SumNode([this, b])
  }

  mod(b: Node): Node {
    if (!(b instanceof NumNode)) {
      throw new Error("Modulo must be with a number")
    }
    return new ModNode(this, b)
  }

  floordiv(b: Node): Node {
    if (!(b instanceof NumNode)) {
      throw new Error("floor div must be with a number")
    }
    return new FloorDivNode(this, b)
  }

  div(b: Node): Node {
    return new DivNode(this, b)
  }

  render() {
    return _render(this)
  }

  substitute(varVals: VarVals): Node {
    throw new Error("Not implemented")
  }
}

export class FloorDivNode extends Node {
  public a: Node
  public b: NumNode
  constructor(a: Node, b: NumNode) {
    super(0, a.max)
    this.a = a
    this.b = b
  }
  substitute(varVals: VarVals): Node {
    return this.a.substitute(varVals).floordiv(this.b)
  }
}

export class ModNode extends Node {
  public a: Node
  public b: NumNode
  constructor(a: Node, b: NumNode) {
    super(0, a.max)
    this.a = a
    this.b = b
  }

  substitute(varVals: VarVals): Node {
    return this.a.substitute(varVals).mod(this.b)
  }
}

export class NumNode extends Node {
  public value: number
  constructor(value: number) {
    super(value, value)
    this.value = value
  }

  mul(b: Node): Node {
    if (b instanceof NumNode) {
      return new NumNode(this.value * b.value)
    }
    return super.mul(b)
  }

  mod(b: NumNode): NumNode {
    return new NumNode(this.value % b.value)
  }

  floordiv(b: NumNode): NumNode {
    return new NumNode(Math.floor(this.value / b.value))
  }

  div(b: Node): Node {
    if (b instanceof NumNode) {
      return new NumNode(this.value / b.value)
    }
    return super.div(b)
  }

  substitute(varVals: VarVals): Node {
    return this
  }

  toString() {
    return this.value
  }

  toJSON() {
    return this.toString()
  }
}

export class Variable extends Node {
  public name: string
  public value?: number

  constructor(name: string, min: number, max: number) {
    super(min, max)
    this.name = name
  }

  bind(newValue: number) {
    if (!Number.isInteger(newValue)) {
      throw new Error("Value must be an integer")
    }
    if (newValue >= this.min && newValue <= this.max) {
      this.value = newValue
    } else {
      throw new Error(`Value must be between ${this.min} and ${this.max}`)
    }
  }

  substitute(varVals: VarVals) {
    const ret = varVals.get(this.name)
    if (ret) {
      return ret
    }
    console.error("Variable not found for", this, "varVals:", varVals)
    throw new Error("Variable not found")
  }
}

export class MulNode extends Node {
  public a: Node
  public b: Node

  constructor(a: Node, b: Node) {
    super(a.min * b.min, a.max * b.max)
    this.a = a
    this.b = b
  }

  substitute(varVals: VarVals) {
    return this.a.substitute(varVals).mul(this.b.substitute(varVals))
  }
}

export class SumNode extends Node {
  public nodes: Node[]
  constructor(nodes: Node[]) {
    super(
      nodes.reduce((acc, cur) => acc + cur.min, 0),
      nodes.reduce((acc, cur) => acc + cur.max, 0),
    )
    this.nodes = nodes
  }

  substitute(varVals: VarVals) {
    const nodesSubbed: NumNode[] = []
    for (const _node of this.nodes) {
      const subbed = _node.substitute(varVals)
      if (subbed instanceof NumNode) {
        nodesSubbed.push(subbed)
      } else {
        throw new Error("Substitute did not end up with a NumNode")
      }
    }
    return new NumNode(nodesSubbed.reduce((acc, cur) => acc + cur.value, 0))
  }
}

export class DivNode extends Node {
  public a: Node
  public b: Node
  constructor(a: Node, b: Node) {
    super(a.min / b.min, a.max / b.max)
    this.a = a
    this.b = b
  }

  substitute(varVals: VarVals) {
    return this.a.substitute(varVals).div(this.b.substitute(varVals))
  }
}

const _render = (node: unknown): string => {
  if (node instanceof MulNode) {
    return `(${_render(node.a)} * ${_render(node.b)})`
  } else if (node instanceof Variable) {
    return node.name
  } else if (node instanceof NumNode) {
    return node.value.toString()
  } else if (node instanceof ModNode) {
    return `(${_render(node.a)} % ${_render(node.b)})`
  } else if (node instanceof SumNode) {
    return `(${node.nodes.map(_render).join(" + ")})`
  } else if (node instanceof FloorDivNode) {
    return `(${_render(node.a)} // ${_render(node.b)})`
  } else if (node instanceof DivNode) {
    return `(${_render(node.a)} / ${_render(node.b)})`
  } else if (node instanceof Node) {
    console.error(node)
    throw new Error("Base class cannot be rendered")
  } else {
    throw new Error("Unknown node type")
  }
}
