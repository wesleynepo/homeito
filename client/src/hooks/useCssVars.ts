import { useRef, useLayoutEffect } from 'react'

/**
 * Sets CSS custom properties on an element imperatively via a ref,
 * avoiding the need for the `style` prop.
 *
 * Runs synchronously after DOM mutations but before paint (useLayoutEffect),
 * so there is no visible flash.
 */
export function useCssVars<T extends HTMLElement>(
  vars: Partial<Record<`--${string}`, string | undefined>>
) {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    for (const [key, value] of Object.entries(vars)) {
      if (value != null) el.style.setProperty(key, value)
      else el.style.removeProperty(key)
    }
  })

  return ref
}
