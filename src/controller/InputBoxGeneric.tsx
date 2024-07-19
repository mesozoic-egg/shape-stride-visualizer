import { InputNumber, Input } from "../view/ui"
import { useState, useEffect } from "react"

export type AttributeValidator = (value: string | number) => [boolean, string]

interface InputBoxProps {
  label: string
  onValueConfirm: (value: string | number) => void
  id: number
  prefilled?: string | number
  validator: AttributeValidator
  disabled?: boolean
  type?: string
}
export const InputBox: React.FC<InputBoxProps> = ({
  prefilled = "",
  label,
  onValueConfirm,
  id,
  validator,
  disabled,
  type,
}) => {
  const [value, setValue] = useState<unknown>(prefilled)
  const [errorMsg, setErrorMsg] = useState<string | undefined>()
  useEffect(() => {
    if (
      value !== undefined &&
      value !== null &&
      (typeof value === "number" || typeof value === "string")
    ) {
      const [valid, reason] = validator(value)
      if (valid) {
        setErrorMsg(undefined)
        onValueConfirm(value)
      } else {
        setErrorMsg(reason)
      }
    } else {
      setErrorMsg("Enter a value of type number or string")
    }
  }, [id, value, onValueConfirm, validator])
  return (
    <div>
      <label>{label}</label>
      <br />
      {type === "string" ? (
        <Input
          value={value as any}
          onChange={(e) => {
            setValue(e.target.value)
          }}
          width={60}
        />
      ) : (
        <InputNumber
          width={60}
          value={value as any}
          onChange={(e) => {
            setValue(e.target.value)
          }}
          disabled={disabled}
        />
      )}
      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}
    </div>
  )
}
