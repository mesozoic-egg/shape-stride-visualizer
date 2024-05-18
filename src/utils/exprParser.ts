import {
  SumNode,
  Node,
  NumNode,
  Variable,
  MulNode,
  FloorDivNode,
  ModNode,
  DivNode,
} from "../model/variable"
const MAX_PARENTHESES_DEPTH = 80
const MAX_EVALUATE_LOOP_LIMIT = 80
const MAX_EVALUATE_RECURSE_DEPTH = 30
const MAX_LOOP_RECURSE_LIMIT = 30
interface ParseArgs {
  expression: string
  variables?: Record<string, Variable>
}
export const parse = ({ expression, variables }: ParseArgs) => {
  let _expr = removeWhitespace(expression)
  if (!validateMatchingParenthese(_expr)) {
    throw new Error("Parentheses are not matching")
  }
  if (variables && !validateVariables(_expr, variables)) {
    throw new Error("Variables are not valid")
  }
  return evaluateExpression({ expression: _expr, variables, recurseDepth: 0 })
}

const removeWhitespace = (expr: string) => {
  return expr.replace(/\s/g, "")
}

interface EvaluateArgs extends ParseArgs {
  recurseDepth: number
}
const evaluateExpression = ({
  expression: expr,
  variables,
  recurseDepth,
}: EvaluateArgs) => {
  if (recurseDepth > MAX_EVALUATE_RECURSE_DEPTH) {
    throw new Error("Max recursion depth exceeded while parsing")
  }
  const stack: Node[] = []
  let currentOperand: Node
  let currentOperator: string = ""
  let i = 0
  while (true) {
    if (i >= MAX_EVALUATE_LOOP_LIMIT) {
      throw new Error("Max recursion depth exceeded while parsing")
    }
    const char = expr[i]
    if (isDigit(char)) {
      let end = i
      while (isDigit(expr[end])) {
        if (end > MAX_EVALUATE_LOOP_LIMIT) {
          throw new Error(
            "Max recursion/loop depth exceeded while parsing numbers",
          )
        }
        end++
      }
      const _num = expr.slice(i, end)
      const num = Number(_num)
      if (isNaN(num)) {
        throw new Error(`Unable to parse number ${_num}`)
      }
      currentOperand = new NumNode(num)
      if (currentOperator) {
        pushNodeToStack(stack, currentOperand, currentOperator)
        currentOperator = ""
      } else {
        stack.push(currentOperand)
      }
      i = end
    } else if (isOperator(char)) {
      currentOperator = char
      if (char === "/") {
        if (expr[i + 1] === "/") {
          currentOperator = "//"
          i++
        }
      }
      i++
    } else if (char === "(") {
      const start = i
      let end = start
      let parenthesesCount = 1
      while (true) {
        end++
        if (expr[end] === "(") {
          parenthesesCount++
        } else if (expr[end] === ")") {
          parenthesesCount--
          if (parenthesesCount === 0) {
            break
          }
        }
        if (end >= MAX_PARENTHESES_DEPTH) {
          console.error("parentheses end", end)
          throw new Error(
            "Max recursion depth exceeded while matching parentheses",
          )
        }
      }
      const subExpr = expr.slice(start + 1, end)
      const node = evaluateExpression({
        expression: subExpr,
        variables,
        recurseDepth: recurseDepth + 1,
      })

      if (currentOperator) {
        pushNodeToStack(stack, node, currentOperator)
        currentOperator = ""
      } else {
        stack.push(node)
      }
      i = end + 1
    } else if (char && /[a-zA-Z]/.test(char)) {
      let end = i
      while (expr[end] && /[a-zA-Z0-9]/.test(expr[end])) {
        if (end > MAX_LOOP_RECURSE_LIMIT) {
          throw new Error(
            "Max recursion/loop depth exceeded while parsing variables",
          )
        }
        end++
      }
      const variable = variables?.[expr.slice(i, end)]
      if (!variable) {
        console.error(variables)
        throw new Error(`Variable ${char} not found`)
      }
      if (currentOperator) {
        pushNodeToStack(stack, variable, currentOperator)
        currentOperator = ""
      } else {
        stack.push(variable)
      }
      i = end
    }
    if (i >= expr.length) {
      break
    }
  }
  console.log({ stack })
  if (stack.length > 1) {
    if (!currentOperator) {
      console.error({ stack, currentOperator })
      throw new Error(
        "Current operator is empty when stack has more than 1 items",
      )
    }
    pushNodeToStack(stack, stack.pop() as Node, currentOperator)
  }
  if (stack.length !== 1) {
    throw new Error("Stack did not end up with just one item")
  }
  const value = stack.pop()
  if (!(value instanceof Node)) {
    throw new Error("Item in stack is not of type Node")
  }
  return value
}

const isDigit = (char: string) => {
  return /\d/.test(char)
}

const isOperator = (char: string) => {
  return /[+\-*/%]/.test(char)
}

const pushNodeToStack = (
  stack: Node[],
  currentOperand: Node,
  currentOperator: string,
) => {
  if (!currentOperand) {
    throw new Error("Current operand is undefined")
  }
  if (!currentOperator) {
    throw new Error("Current operator is undefined")
  }
  const operand1 = stack.pop()
  if (!operand1) {
    throw new Error("Nothing was popped from stack")
  }
  switch (currentOperator) {
    case "+": {
      const item = new SumNode([operand1, currentOperand])
      stack.push(item)
      break
    }
    case "*": {
      const item = new MulNode(operand1, currentOperand)
      stack.push(item)
      break
    }
    case "//": {
      if (!(currentOperand instanceof NumNode)) {
        console.error("Floor div RHS operand:", currentOperand)
        throw new Error(
          "Floor div requires right hand side operand to be a number",
        )
      }
      const currentOperandAsNumNode = currentOperand as NumNode
      const item = new FloorDivNode(operand1, currentOperandAsNumNode)
      stack.push(item)
      break
    }
    case "/": {
      const item = new DivNode(operand1, currentOperand)
      stack.push(item)
      break
    }
    case "%": {
      if (!(currentOperand instanceof NumNode)) {
        console.error("mod RHS operand:", currentOperand)
        throw new Error("mod requires right hand side operand to be a number")
      }
      const currentOperandAsNumNode = currentOperand as NumNode
      const item = new ModNode(operand1, currentOperandAsNumNode)
      stack.push(item)
      break
    }
    default: {
      console.error("Invalid operator:", currentOperator)
      throw new Error(`Invalid operator: ${currentOperator}`)
    }
  }
  return stack
}

const validateMatchingParenthese = (expr: string) => {
  let num = 0
  for (const char of expr) {
    if (char === "(") {
      num++
    } else if (char === ")") {
      num--
    }
  }
  return num === 0
}

export const validateVariables = (
  expr: string,
  variables: Record<string, Variable>,
) => {
  const variableNames = Object.keys(variables)
  let valid = true
  const variablePattern = /[a-zA-Z][a-zA-Z0-9]*/g
  const matches = expr.match(variablePattern) || []
  for (const match of matches) {
    if (!variableNames.includes(match)) {
      valid = false
      break
    }
  }
  return valid
}

export const validateExpressionInput = ({
  expression,
  variables,
}: ParseArgs): [boolean, string] => {
  if (!validateMatchingParenthese(expression)) {
    return [false, "Parentheses are not matching"]
  }
  if (variables && !validateVariables(expression, variables)) {
    return [false, "Variables are not valid"]
  }
  return [true, ""]
}
