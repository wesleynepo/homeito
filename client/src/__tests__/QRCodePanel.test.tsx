import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QRCodePanel } from '../components/QRCodePanel'

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <div data-testid="qr-code" data-value={value} />
  ),
}))

vi.mock('../hooks/useLocalIp', () => ({
  useLocalIp: vi.fn(),
}))

import { useLocalIp } from '../hooks/useLocalIp'
const mockUseLocalIp = vi.mocked(useLocalIp)

describe('QRCodePanel — join URL format', () => {
  it('generates /?code= URL using local IP when available', () => {
    mockUseLocalIp.mockReturnValue('192.168.1.10')
    // jsdom sets window.location.port to '' by default
    render(<QRCodePanel roomCode="ABCD" />)
    const qr = screen.getByTestId('qr-code')
    expect(qr.getAttribute('data-value')).toBe('http://192.168.1.10:3000/?code=ABCD')
  })

  it('generates /?code= URL using window.location.origin when no local IP', () => {
    mockUseLocalIp.mockReturnValue(null)
    render(<QRCodePanel roomCode="WXYZ" />)
    const qr = screen.getByTestId('qr-code')
    expect(qr.getAttribute('data-value')).toBe('http://localhost:3000/?code=WXYZ')
  })

  it('displays the room code as text', () => {
    mockUseLocalIp.mockReturnValue(null)
    render(<QRCodePanel roomCode="TEST" />)
    expect(screen.getByText('TEST')).toBeInTheDocument()
  })
})
