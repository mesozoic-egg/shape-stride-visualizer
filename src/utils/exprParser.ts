import {
  SumNode,
  Node,
  NumNode,
  Variable,
  MulNode,
  FloorDivNode,
  ModNode,
  DivNode,
  LtNode,
  AndNode,
} from "../model/variable"

enum LIMIT {
  SUB_STRING_DEPTH = 10,
  STRING_LENGTH = 200,
  DIGIT_LENGTH = 10,
  VARIABLE_NAME_LENGTH = 10,
  WHILE_LOOP_COUNT = 100,
}

interface ParseArgs {
  expression: string
  variables?: Record<string, Variable>
}
export const parse = ({ expression, variables }: ParseArgs) => {
  let _expr = removeWhitespace(expression)
  _expr = replaceAndWithAmpersand(_expr)
  _expr = surroundNegateWithParen(_expr)
  if (!validateMatchingParenthese(_expr)) {
    throw new Error("Parentheses are not matching")
  }
  if (variables && !validateVariables(_expr, variables)) {
    throw new Error("Variables are not valid")
  }
  return evaluateExpression({ expression: _expr, variables, recurseDepth: 0 })
}

const replaceAndWithAmpersand = (expr: string) => expr.replace(/and/g, "&")
export const surroundNegateWithParen = (expr: string) =>
  expr.replace(/-[0-9]+/g, "($&)")

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
  if (recurseDepth > LIMIT.SUB_STRING_DEPTH) {
    throw new Error(
      `Max substring depth exceeded while recursing recurseDepth: ${recurseDepth}, expr: ${expr}`,
    )
  }
  const stack: Node[] = []
  let currentOperand: Node
  let currentOperator: string = ""
  let i = 0
  let whileLoopCount = 0
  while (true) {
    if (whileLoopCount++ > LIMIT.WHILE_LOOP_COUNT) {
      throw new Error(
        `Max while loop count exceeded while iterating, i: ${i}, expr: ${expr}`,
      )
    }
    if (i >= LIMIT.STRING_LENGTH) {
      throw new Error(
        `Max character length exceeded while iterating, i: ${i}, expr: ${expr}`,
      )
    }
    const char = expr[i]
    if (isDigit(char)) {
      let end = i
      while (isDigit(expr[end])) {
        if (end - i > LIMIT.DIGIT_LENGTH) {
          throw new Error(
            `Max digit length exceeded while parsing numbers, i: ${i}, end: ${end} expr: ${expr}`,
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
      if (char === "<") {
        if (expr[i + 1] === "=") {
          currentOperator = "<="
          i++
        }
      }
      if (char === ">") {
        if (expr[i + 1] === "=") {
          currentOperator = ">="
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
        if (end - i > LIMIT.STRING_LENGTH) {
          throw new Error(
            `Max string length exceeded while matching parentheses, i: ${i}, end: ${end}, expr: ${expr}`,
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
        if (end - i > LIMIT.VARIABLE_NAME_LENGTH) {
          throw new Error(
            `Max variable name length exceeded while parsing variables, i: ${i}, end: ${end}, expr: ${expr}`,
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
  return /[+\-*/%<>&]/.test(char)
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
  if (currentOperator === "-") {
    const item = new MulNode(new NumNode(-1), currentOperand)
    stack.push(item)
    return stack
  }
  const operand1 = stack.pop()
  if (!operand1) {
    throw new Error(
      `Nothing was popped from stack. Current operator: ${currentOperator}, currentOperand: ${currentOperand}`,
    )
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
    case "<": {
      const item = operand1.lt(currentOperand)
      stack.push(item)
      break
    }
    case "<=": {
      const item = operand1.le(currentOperand)
      stack.push(item)
      break
    }
    case ">=": {
      const item = operand1.ge(currentOperand)
      stack.push(item)
      break
    }
    case ">": {
      const item = operand1.gt(currentOperand)
      stack.push(item)
      break
    }
    case "&": {
      const item = new AndNode(operand1, currentOperand)
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
  let _expr = removeWhitespace(expression)
  _expr = replaceAndWithAmpersand(_expr)
  _expr = surroundNegateWithParen(_expr)
  if (!validateMatchingParenthese(_expr)) {
    return [false, "Parentheses are not matching"]
  }
  if (variables && !validateVariables(expression, variables)) {
    return [false, "Variables are not valid"]
  }
  return [true, ""]
}
