import type { Placement } from "@floating-ui/dom"
import { cssVars } from "./middleware"
import type { PositioningOptions } from "./types"

export type GetPlacementStylesOptions = {
  placement?: Placement
}

const ARROW_FLOATING_STYLE = {
  bottom: "rotate(45deg)",
  left: "rotate(135deg)",
  top: "rotate(225deg)",
  right: "rotate(315deg)",
} as const

type PlacementStyleOptions = PositioningOptions & {
  anchorPoint?: { x: number; y: number } | null
}

export function getPlacementStyles(options: PlacementStyleOptions = {}) {
  const { placement = "bottom", sameWidth, fitViewport, strategy = "absolute", anchorPoint } = options
  const point = anchorPoint || { x: 0, y: 0 }

  return {
    arrow: {
      position: "absolute",
      width: cssVars.arrowSize.reference,
      height: cssVars.arrowSize.reference,
      [cssVars.arrowSizeHalf.variable]: `calc(${cssVars.arrowSize.reference} / 2)`,
      [cssVars.arrowOffset.variable]: `calc(${cssVars.arrowSizeHalf.reference} * -1)`,
    } as const,

    arrowTip: {
      transform: ARROW_FLOATING_STYLE[placement.split("-")[0]],
      background: cssVars.arrowBg.reference,
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      position: "absolute",
      zIndex: "inherit",
    } as const,

    floating: {
      position: strategy,
      minWidth: sameWidth ? undefined : "max-content",
      width: sameWidth ? "var(--reference-width)" : undefined,
      maxWidth: fitViewport ? "var(--available-width)" : undefined,
      maxHeight: fitViewport ? "var(--available-height)" : undefined,
      top: `${point.y}px`,
      left: `${point.x}px`,
      transform: `translate3d(var(--x), var(--y), 0)`,
    } as const,
  }
}
