import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Pseudo-aleatorio determinista para que las formas no cambien entre renders.
function mulberry32(a) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function Floater({ position, size, speed, phase, shape, hyper, reduced }) {
  const ref = useRef()
  const [hot, setHot] = useState(false)
  const base = useMemo(() => new THREE.Color(), [])

  useFrame((state, delta) => {
    const m = ref.current
    if (!m) return
    const k = reduced ? 0.1 : hyper ? 4 : 1
    m.rotation.x += delta * speed * 0.8 * k
    m.rotation.y += delta * speed * k
    m.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + phase) * 0.25
    // Reacciona al puntero: crece y se ilumina.
    m.scale.setScalar(THREE.MathUtils.damp(m.scale.x, hot ? 1.8 : 1, 6, delta))
    const target = hot ? '#ffffff' : hyper ? '#4ad7ff' : '#9dff4a'
    base.set(target)
    m.material.emissive.lerp(base, 1 - Math.exp(-5 * delta))
  })

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHot(true)
      }}
      onPointerOut={() => setHot(false)}
    >
      {shape === 0 && <boxGeometry args={[size, size, size]} />}
      {shape === 1 && <octahedronGeometry args={[size * 0.8]} />}
      {shape === 2 && <tetrahedronGeometry args={[size * 0.9]} />}
      <meshStandardMaterial
        color="#1a2230"
        metalness={0.6}
        roughness={0.35}
        emissive="#9dff4a"
        emissiveIntensity={0.55}
        flatShading
      />
    </mesh>
  )
}

export default function Floaters({ hyper, reduced, count = 16 }) {
  const items = useMemo(() => {
    const rand = mulberry32(42)
    return Array.from({ length: count }, (_, i) => {
      const angle = rand() * Math.PI * 2
      const radius = 4 + rand() * 4.5
      return {
        id: i,
        position: [Math.cos(angle) * radius, (rand() - 0.5) * 5, Math.sin(angle) * radius - 2],
        size: 0.18 + rand() * 0.3,
        speed: 0.3 + rand() * 0.9,
        phase: rand() * 10,
        shape: Math.floor(rand() * 3),
      }
    })
  }, [count])

  return (
    <group>
      {items.map((it) => (
        <Floater key={it.id} {...it} hyper={hyper} reduced={reduced} />
      ))}
    </group>
  )
}
