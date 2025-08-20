"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label: string
    color: string
  }
>

export interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartProps) {
  return (
    <div
      className={cn("h-full w-full", className)}
      style={
        {
          "--chart-1": config.chrome?.color || "#2563eb",
          "--chart-2": config.safari?.color || "#dc2626",
          "--chart-3": config.firefox?.color || "#ea580c",
          "--chart-4": config.edge?.color || "#7c3aed",
          "--chart-5": config.other?.color || "#059669",
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

export function ChartTooltip({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-2 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface TooltipPayload {
  value: number | string
  payload: Record<string, unknown>
  dataKey: string
  name: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
  hideLabel?: boolean
}) {
  if (!active || !payload) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {!hideLabel && (
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {label}
          </span>
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-[0.70rem] uppercase text-muted-foreground">
          Value
        </span>
        <span className="font-bold text-muted-foreground">
          {payload[0]?.value}
        </span>
      </div>
    </div>
  )
}
