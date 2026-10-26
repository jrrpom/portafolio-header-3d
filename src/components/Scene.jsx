import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import Spaceship from './Spaceship.jsx'
import Floaters from './Floaters.jsx'

const LIME = new THREE.Color('#9dff4a')
const CYAN = new THREE.Color('#4ad7ff')

function Lights({ hyper }) {
  const accent = useRef()
  const rim = useRef()
  useFrame((_, delta) => {
    const c = hyper ? CYAN : LIME
    accent.current.color.lerp(c, 1 - Math.exp(-4 * delta))
    rim.current.color.lerp(c, 1 - Math.exp(-4 * delta))
    accent.current.intensity = THREE.MathUtils.damp(accent.current.intensity, hyper ? 90 : 40, 4, delta)
  })
  return (
    <>
      <ambientLight intensity={0.35} />
      {/* Luz principal, fría, desde arriba-adelante */}
      <directionalLight position={[5, 6, 6]} intensity={2.4} color="#dfe9ff" />
      {/* Contraluz que dibuja el contorno del casco */}
      <directionalLight ref={rim} position={[-6, 2, -5]} intensity={2.2} color="#9dff4a" />
      {/* Luz puntual de color bajo la nave: la zona de los motores */}
      <pointLight ref={accent} position={[0, -2.2, 1.5]} intensity={40} distance={14} decay={2} color="#9dff4a" />
    </>
  )
}

function Rig({ children, hyper, reduced }) {
  const group = useRef()
  const spin = useRef()
  // Parallax suave con el puntero + rotación lenta de las estrellas.
  useFrame((state, delta) => {
    if (reduced) return
    const { x, y } = state.pointer
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, x * 0.18, 3, delta)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -y * 0.08, 3, delta)
    spin.current.rotation.y += delta * (hyper ? 0.35 : 0.02)
  })
  return (
    <>
      <group ref={spin}>
        <Stars radius={60} depth={50} count={hyper ? 6000 : 3500} factor={4} saturation={0} fade speed={hyper ? 4 : 0.6} />
      </group>
      <group ref={group}>{children}</group>
    </>
  )
}

export default function Scene({ hyper, hovered, setHovered, toggleHyper, reduced }) {
  return (
    <>
      <color attach="background" args={['#060912']} />
      <fog attach="fog" args={['#060912', 14, 38]} />
      <Lights hyper={hyper} />

      {/* Entorno procedural (sin descargar HDRIs) para dar reflejos al metal */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 4]} scale={[10, 3, 1]} color="#cfe0ff" />
        <Lightformer form="rect" intensity={2} position={[-6, 0, -3]} scale={[6, 6, 1]} color="#9dff4a" />
        <Lightformer form="ring" intensity={1.5} position={[5, -2, -4]} scale={4} color="#4ad7ff" />
      </Environment>

      <Rig hyper={hyper} reduced={reduced}>
        <Suspense fallback={null}>
          <Spaceship
            hyper={hyper}
            hovered={hovered}
            onHover={setHovered}
            onToggle={toggleHyper}
            reduced={reduced}
          />
        </Suspense>
        <Floaters hyper={hyper} reduced={reduced} />
      </Rig>

      {/* Órbita restringida: sin zoom ni paneo, ángulos limitados para no romper el layout */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.5}
        minPolarAngle={Math.PI / 2.8}
        maxPolarAngle={Math.PI / 1.8}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
      />
    </>
  )
}
