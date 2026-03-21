import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './LivesDisplay.module.css'

interface Props {
  lives: number
  maxLives: number
}

export function LivesDisplay({ lives, maxLives }: Props) {
  const { t } = useTranslation()
  const [prevLives, setPrevLives] = useState(lives)

  useEffect(() => {
    setPrevLives(lives)
  }, [lives])

  return (
    <div className={styles.container} aria-label={t('lives.aria', { lives, max: maxLives })}>
      {Array.from({ length: maxLives }, (_, i) => {
        const isLost = i >= lives
        const justLost = i >= lives && i < prevLives
        return (
          <span
            key={i}
            className={`${styles.heart} ${isLost ? styles.lost : ''} ${justLost ? styles.pulse : ''}`}
          >
            {isLost ? '🖤' : '❤️'}
          </span>
        )
      })}
    </div>
  )
}
