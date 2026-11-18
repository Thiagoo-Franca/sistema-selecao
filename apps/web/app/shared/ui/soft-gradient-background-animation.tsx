import React, { useEffect, useId } from "react"
import { cn } from "@/shared/lib/utils"

interface SoftGradientBackgroundAnimationProps {
  className?: string
  animationDuration?: number
}

// UFBA Institute of Computing brand colors in OKLCH
// Red: #F0523E → oklch(0.58 0.22 25)
// Yellow: #F8D65A → oklch(0.85 0.14 100)
// Green: #7BCB61 → oklch(0.72 0.17 145)
// Blue: #70C8EA → oklch(0.72 0.14 230)

const BRAND_COLORS = [
  "oklch(0.58 0.22 25)", // Red
  "oklch(0.85 0.14 100)", // Yellow
  "oklch(0.72 0.17 145)", // Green
  "oklch(0.72 0.14 230)", // Blue
] as const

export function SoftGradientBackgroundAnimation({
  className = "",
  animationDuration = 15,
}: SoftGradientBackgroundAnimationProps) {
  const styleId = useId()

  useEffect(() => {
    const styleEl = document.createElement("style")
    styleEl.id = styleId

    // Create gradient stops that cycle through brand colors
    const colorStops = BRAND_COLORS.join(", ")

    styleEl.textContent = `
      @property --pos1 {
        syntax: "<percentage>";
        inherits: false;
        initial-value: 0%;
      }
      @property --pos2 {
        syntax: "<percentage>";
        inherits: false;
        initial-value: 25%;
      }
      @property --pos3 {
        syntax: "<percentage>";
        inherits: false;
        initial-value: 50%;
      }
      @property --pos4 {
        syntax: "<percentage>";
        inherits: false;
        initial-value: 75%;
      }

      .oklch-gradient-bg-${styleId} {
        background-image: linear-gradient(
            135deg,
            ${colorStops}
          );
        background-size: 300% 300%;
        animation-name: anim_bg_${styleId};
        animation-duration: ${animationDuration}s;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        opacity: 0.35;
      }

      @keyframes anim_bg_${styleId} {
        0% {
          background-position: 0% 50%;
          --pos1: 0%; --pos2: 25%; --pos3: 50%; --pos4: 75%;
        }
        25% {
          background-position: 50% 100%;
        }
        50% {
          background-position: 100% 50%;
        }
        75% {
          background-position: 50% 0%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
    `

    document.head.appendChild(styleEl)

    return () => {
      document.head.removeChild(styleEl)
    }
  }, [animationDuration, styleId])

  return <div className={cn(`oklch-gradient-bg-${styleId} h-full w-full`, className)} />
}
