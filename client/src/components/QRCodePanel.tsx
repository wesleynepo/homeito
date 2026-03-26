import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useLocalIp } from '../hooks/useLocalIp'
import styles from './QRCodePanel.module.css'

interface Props {
  roomCode: string
}

export function QRCodePanel({ roomCode }: Props) {
  const localIp = useLocalIp()
  const port = window.location.port || '3000'
  const joinUrl = localIp
    ? `http://${localIp}:${port}/?code=${roomCode}`
    : `${window.location.origin}/?code=${roomCode}`

  return (
    <div className={styles.container}>
      <QRCodeSVG value={joinUrl} size={256} bgColor="#0a0a0f" fgColor="#ffffff" />
      <p className={styles.ip}>{localIp ?? '…'}:{port}</p>
      <p className={styles.code}>{roomCode}</p>
    </div>
  )
}
