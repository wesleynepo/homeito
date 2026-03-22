import type React from 'react'

/**
 * Wraps CSS custom properties for use in the React `style` prop.
 * Only accepts `--*` keys, making it clear this is not inline styling.
 *
 * Usage: style={cssVars({ '--player-color': color })}
 */
export function cssVars(vars: Record<`--${string}`, string | undefined>): React.CSSProperties {
  return vars as React.CSSProperties
}
