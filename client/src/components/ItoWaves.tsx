import React from 'react'

interface Props {
  width?: number | string
  height?: number | string
  className?: string
}

// Colors from the ITO player palette — each wave gets one
const WAVE_COLORS = [
  '#F5C818', // yellow
  '#5BC8DC', // cyan
  '#74C045', // green
  '#F07E34', // orange
  '#E87EA1', // pink
  '#7BB8E8', // light blue
  '#B89ED8', // lavender
]

/**
 * Builds a smooth sine-like wave path across a given width.
 * yCenter: vertical center of the wave
 * amplitude: peak deviation from center
 * phase: horizontal offset in pixels to stagger waves
 */
function wavePath(yCenter: number, amplitude: number, phase: number, totalWidth: number): string {
  const period = 120
  const segments: string[] = []
  let x = -period + phase

  segments.push(`M ${x},${yCenter}`)

  while (x < totalWidth + period) {
    // Cubic bezier approximation of sine wave
    segments.push(
      `C ${x + period / 4},${yCenter - amplitude} ${x + (3 * period) / 4},${yCenter + amplitude} ${x + period},${yCenter}`
    )
    x += period
  }

  return segments.join(' ')
}

/**
 * Renders the characteristic ITO squiggly lines — used as the homepage
 * background decoration and the card back pattern.
 */
export function ItoWaves({ width = '100%', height = '100%', className }: Props) {
  const vw = 400
  const vh = 100

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      width={width}
      height={height}
      className={className}
    >
      {WAVE_COLORS.map((color, i) => {
        const yCenter = 10 + (i / (WAVE_COLORS.length - 1)) * 80
        const amplitude = 7 + (i % 3) * 3
        const phase = (i * 17) % 120 // stagger horizontal start
        return (
          <path
            key={color}
            d={wavePath(yCenter, amplitude, phase, vw)}
            stroke={color}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}
