import { useEffect, useState } from "react"
import { Variable } from "../model/variable"
import { Button, Flex, Input, Space, Text } from "../view/ui"

interface ExpressionInputProps {
  prefilled?: string
  variables: Variable[]
  onConfirm: (expression: string) => void
  validate: (str: string) => [boolean, string]
  placeholder?: string
}
export enum EXAMPLES {
  SIMPLE = "idx0 * 2 + idx1",
  COMPLEX = "((((((idx0 * 2) % 3) + idx1) % 3) * 3) + ((((idx0 * 2) + idx1) // 3) * 3))",
}

export const ExpressionInput: React.FC<ExpressionInputProps> = ({
  onConfirm,
  validate,
  prefilled = "",
  placeholder,
}) => {
  const [typed, setTyped] = useState(prefilled)
  const [errMsg, setErrMsg] = useState("")
  useEffect(() => {
    const id = setTimeout(() => {
      const [valid, errorReason] = validate(typed)
      if (valid) {
        setErrMsg("")
        onConfirm(typed)
      } else {
        setErrMsg(errorReason)
      }
    }, 500)
    return () => clearTimeout(id)
  }, [typed, validate, onConfirm])
  return (
    <div>
      <Input
        value={typed}
        onChange={(e) => {
          setTyped(e.target.value)
        }}
        placeholder={placeholder}
        allowClear
        maxWidth={800}
      />
      <br />
      {errMsg && <Text type="danger">Error: {errMsg}</Text>}
      <Space size={10} />
      <Flex align="center" gap="small" justify="flex-start">
        <Text strong>Try:</Text>
        <Button
          antType="default"
          onClick={() => {
            setTyped(EXAMPLES.SIMPLE)
          }}
        >
          {EXAMPLES.SIMPLE}
        </Button>
        <Button
          antType="default"
          onClick={() => {
            setTyped(EXAMPLES.COMPLEX)
          }}
        >
          {EXAMPLES.COMPLEX}
        </Button>
      </Flex>
    </div>
  )
}
