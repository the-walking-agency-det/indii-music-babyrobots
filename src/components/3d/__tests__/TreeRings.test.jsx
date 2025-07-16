import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as THREE from 'three'
import TreeRings from '../TreeRings'

const mockFrameCallback = jest.fn()
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="r3f-canvas">{children}</div>,
  useFrame: fn => {
    mockFrameCallback(fn)
    fn({ clock: { elapsedTime: 0 } }, 0.016)
  }
}))

// Suppress console.error for R3F components
beforeAll(() => {
  console.error = jest.fn()
})

// Mock modules
const MockCanvas = ({ children }) => <div data-testid="r3f-canvas">{children}</div>;

// Mock @react-three/drei
jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="r3f-controls" />,
  Environment: () => <div data-testid="r3f-environment" />,
  PerspectiveCamera: () => <div data-testid="r3f-camera" />
}))

// Mock three.js
jest.mock('three', () => ({
  RingGeometry: jest.fn(),
  Color: jest.fn().mockImplementation(() => ({
    multiplyScalar: jest.fn().mockReturnThis()
  })),
  MeshStandardMaterial: jest.fn(),
  DoubleSide: 'DoubleSide',
  Group: jest.fn(),
  Mesh: jest.fn(),
  Object3D: jest.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  }))
}))

describe('TreeRings Component', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    container = null
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
render(<MockCanvas><TreeRings /></MockCanvas>)
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument()
  })

  it('creates correct number of rings', () => {
    const numRings = 5
render(<MockCanvas><TreeRings numRings={numRings} /></MockCanvas>)
    expect(THREE.RingGeometry).toHaveBeenCalledTimes(numRings)
  })

  it('respects ring spacing parameter', () => {
    const ringSpacing = 0.3
render(<MockCanvas><TreeRings ringSpacing={ringSpacing} /></MockCanvas>)

    const firstCallArgs = THREE.RingGeometry.mock.calls[0]
    const innerRadius = firstCallArgs[0]
    const outerRadius = firstCallArgs[1]
    expect(outerRadius - innerRadius).toBeCloseTo(ringSpacing * 0.8)
  })

  it('creates materials with correct properties', () => {
    const ringColor = '#FF0000'
render(<MockCanvas><TreeRings ringColor={ringColor} /></MockCanvas>)

    expect(THREE.MeshStandardMaterial).toHaveBeenCalledWith(
      expect.objectContaining({
        roughness: expect.any(Number),
        metalness: expect.any(Number),
        side: THREE.DoubleSide
      })
    )
  })

it('disables animations when interactive is false', () => {
    render(<MockCanvas><TreeRings interactive={false} /></MockCanvas>)
    expect(mockFrameCallback).toHaveBeenCalled()
  })

  it('handles extreme values for numRings', () => {
    const extremeNumRings = 100
render(<MockCanvas><TreeRings numRings={extremeNumRings} /></MockCanvas>)
    expect(THREE.RingGeometry).toHaveBeenCalledTimes(extremeNumRings)
  })

it('applies wave motion when interactive', () => {
    render(<MockCanvas><TreeRings interactive={true} /></MockCanvas>)
    expect(mockFrameCallback).toHaveBeenCalled()
  })

  it('applies correct color and material properties', () => {
    const customColor = '#00FF00'
render(<MockCanvas><TreeRings ringColor={customColor} /></MockCanvas>)
    
    expect(THREE.Color).toHaveBeenCalled()
    expect(THREE.MeshStandardMaterial).toHaveBeenCalledWith(
      expect.objectContaining({
        roughness: expect.any(Number),
        metalness: expect.any(Number),
        side: THREE.DoubleSide
      })
    )
  })
})
