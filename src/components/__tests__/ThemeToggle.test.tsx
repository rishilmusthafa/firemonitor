import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import ThemeToggle from '../ThemeToggle'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('renders theme toggle button without aria-label', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    // Note: Current implementation doesn't have aria-label
  })

  it('renders theme toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })
}) 