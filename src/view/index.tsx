import {
  Flex as FlexAnt,
  Button as ButtonAnt,
  Card as CardAnt,
  InputNumber as InputNumberAnt,
  InputNumberProps as InputNumberPropsAnt,
} from "antd"
import React from "react"

interface WithChildren {
  children: React.ReactNode
}

interface FlexProps extends WithChildren {
  justify?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly"
  align?: "flex-start" | "center" | "flex-end"
  wrap?: "wrap" | "nowrap"
}
export const Flex: React.FC<FlexProps> = ({
  justify = "center",
  align = "center",
  wrap = "nowrap",
  children,
}) => {
  return (
    <FlexAnt justify={justify} align={align} wrap={wrap}>
      {children}
    </FlexAnt>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  antType: "primary" | 'default' | "dashed" | "text" | "link"
  margin?: number
  width?: number
}
export const Button: React.FC<ButtonProps> = ({
  children,
  type,
  antType,
  margin,
  width,
  ...props
}) => {
  return (
    <ButtonAnt
      type={antType}
      htmlType={type}
      style={{ margin: margin, width: width }}
      {...props}
    >
      {children}
    </ButtonAnt>
  )
}

interface CardProps extends WithChildren {
  maxWidth?: number
  margin?: number
}
export const Card: React.FC<CardProps> = ({ children, maxWidth, margin }) => {
  return (
    <CardAnt
      style={{
        maxWidth: maxWidth,
        margin: margin,
      }}
    >
      {children}
    </CardAnt>
  )
}

type eventWithTargetValue = {
  target: {
    value: any
  }
}
interface InputNumberProps {
  value: any
  onChange?: (event: eventWithTargetValue) => void
}
export const InputNumber: React.FC<InputNumberProps> = ({
  value,
  onChange,
}) => {
  return (
    <InputNumberAnt
      value={value}
      onChange={(value) => {
        onChange?.({ target: { value } })
      }}
    />
  )
}

export const TextAlign: React.FC<WithChildren> = ({ children }) => {
  return <div style={{ textAlign: "start" }}>{children}</div>
}
