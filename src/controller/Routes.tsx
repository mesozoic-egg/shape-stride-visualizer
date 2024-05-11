import React from "react"
import { Link as LinkRR } from "react-router-dom"
import { Link as LinkUI } from "../view/ui"

interface LinkProps {
  to: string
  children: React.ReactNode
  htmlLink?: boolean
  newTab?: boolean
}

export const Link: React.FC<LinkProps> = ({
  to,
  children,
  htmlLink = false,
  newTab,
}) => {
  if (htmlLink) {
    return (
      <a
        href={to}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    )
  }
  return (
    <LinkRR to={to} style={{ textDecoration: "None" }}>
      {children}
    </LinkRR>
  )
}
