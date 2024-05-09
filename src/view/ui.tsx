import {
  Flex as FlexAnt,
  Button as ButtonAnt,
  Card as CardAnt,
  InputNumber as InputNumberAnt,
  Typography,
  Space as SpaceAnt,
} from "antd"
import React from "react"

const { Title: TitleAnt, Text: TextAnt } = Typography

interface WithChildren {
  children?: React.ReactNode
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
  gap?: "small" | "middle" | "large" | number
}
export const Flex: React.FC<FlexProps> = ({
  justify = "center",
  align = "center",
  wrap = "nowrap",
  gap,
  children,
}) => {
  return (
    <FlexAnt justify={justify} align={align} wrap={wrap} gap={gap}>
      {children}
    </FlexAnt>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  antType: "primary" | "default" | "dashed" | "text" | "link"
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
  center?: boolean
}
export const Card: React.FC<CardProps> = ({
  children,
  maxWidth,
  margin,
  center,
}) => {
  return (
    <CardAnt
      style={{
        maxWidth: maxWidth,
        margin: center ? "0 auto" : margin,
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
  width?: number
  value: any
  onChange?: (event: eventWithTargetValue) => void
}
export const InputNumber: React.FC<InputNumberProps> = ({
  value,
  onChange,
  width,
}) => {
  return (
    <InputNumberAnt
      style={{
        width: width,
      }}
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

interface TitleProps extends WithChildren {
  level: 1 | 2 | 3 | 4 | 5 | undefined
}
export const Title: React.FC<TitleProps> = ({ level, children }) => {
  return <TitleAnt level={level}>{children}</TitleAnt>
}

interface TextProps extends WithChildren {
  type?: "secondary" | "success" | "warning" | "danger"
}
export const Text: React.FC<TextProps> = ({ type, children }) => {
  return <TextAnt type={type}>{children}</TextAnt>
}

interface SpaceProps extends WithChildren {
  size: number
  direction?: "vertical" | "horizontal"
}
export const Space: React.FC<SpaceProps> = ({
  size,
  direction = "vertical",
  children,
}) => {
  return (
    <div
      style={{
        margin: direction === "horizontal" ? `0 ${size}px` : `${size}px 0`,
      }}
    >
      {children}
    </div>
  )
}



interface CanvasProps extends WithChildren {
  maxWidth?: number
  maxHeight?: number
  padding?: string
}
export const Canvas: React.FC<CanvasProps> = ({
  maxWidth,
  maxHeight,
  padding = "10px 10px",
  children,
}) => {
  return (
    <div
      style={{
        maxWidth: window.innerWidth > 768 ? maxWidth : "100%",
        maxHeight: maxHeight,
        margin: "0 auto",
        padding: padding,
      }}
    >
      {children}
    </div>
  )
}
