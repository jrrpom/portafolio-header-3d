import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useAnimations, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

const MODEL_URL = '/models/nave.fbx'
const TARGET_SIZE = 5.4 // tamaño final (unidades de escena) de la dimensión más grande

// Texturas extraídas del .blend (2048 px). orm = R: oclusión, G: rugosidad, B: metalicidad.
const TEXTURES = {
  map: '/models/tex/color.jpg',
  normalMap: '/models/tex/normal.jpg',
  emissiveMap: '/models/tex/emissive.jpg',
  orm: '/models/tex/orm.jpg',
}

// Look de los materiales que no usan texturas (anillos y motores no tienen UV).
// 'Material.001' es el casco: usa los mapas de arriba.
const LOOKS = {
  'Material.003': { color: '#8794a3', metalness: 0.9, roughness: 0.28 }, // anillos / aros
  'Material.002': { color: '#1b2a1b', metalness: 0.2, roughness: 0.4, glow: true }, // motores
}

const LIME = new THREE.Color('#9dff4a')
const CYAN = new THREE.Color('#4ad7ff')

export default function Spaceship({ hyper, hovered, onHover, onToggle, reduced }) {
  const root = useRef()
  const fbx = useLoader(FBXLoader, MODEL_URL)
  const tex = useTexture(TEXTURES)
  const hullMaterials = useRef([])

  // Preparamos el modelo una sola vez: quitamos las luces de Blender (están con
  // intensidades de 1000+ y quemarían la escena), cambiamos a materiales PBR y
  // calculamos escala y centrado.
  const { scale, offset, glowMaterials } = useMemo(() => {
    const lights = []
    const glow = []
    const hull = []

    // Color y emisiva en sRGB; el resto son datos lineales.
    tex.map.colorSpace = THREE.SRGBColorSpace
    tex.emissiveMap.colorSpace = THREE.SRGBColorSpace
    Object.values(tex).forEach((t) => {
      t.anisotropy = 8
      t.needsUpdate = true
    })
    fbx.traverse((o) => {
      if (o.isLight) lights.push(o)
      if (o.isMesh) {
        o.frustumCulled = false // la animación mueve la malla fuera de su caja original
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        const next = mats.map((m) => {
          if (m.name === 'Material.001') {
            const hullMat = new THREE.MeshStandardMaterial({
              name: m.name,
              map: tex.map,
              normalMap: tex.normalMap,
              aoMap: tex.orm,
              roughnessMap: tex.orm,
              metalnessMap: tex.orm,
              emissiveMap: tex.emissiveMap,
              emissive: new THREE.Color('#ffffff'),
              emissiveIntensity: 1.5,
              metalness: 1,
              roughness: 1,
            })
            hull.push(hullMat)
            m.dispose()
            return hullMat
          }
          const look = LOOKS[m.name] ?? { color: '#9aa5b1', metalness: 0.8, roughness: 0.4 }
          const std = new THREE.MeshStandardMaterial({
            name: m.name,
            color: look.color,
            metalness: look.metalness,
            roughness: look.roughness,
            emissive: look.glow ? LIME : new THREE.Color(0x000000),
            emissiveIntensity: look.glow ? 1.2 : 0,
          })
          if (look.glow) glow.push(std)
          m.dispose()
          return std
        })
        o.material = Array.isArray(o.material) ? next : next[0]
      }
    })
    lights.forEach((l) => l.parent?.remove(l))
    hullMaterials.current = hull

    const box = new THREE.Box3().setFromObject(fbx)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s = TARGET_SIZE / Math.max(size.x, size.y, size.z)
    return { scale: s, offset: center.multiplyScalar(-s), glowMaterials: glow }
  }, [fbx, tex])

  // Animación incluida en el FBX ("Scene", ~33 s) con useAnimations de drei.
  const { actions, names } = useAnimations(fbx.animations, fbx)
  useEffect(() => {
    const action = actions[names[0]]
    action?.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.6).play()
    return () => action?.fadeOut(0.3)
  }, [actions, names])

  // Cada frame: velocidad de animación, brillo de motores y flotación.
  useFrame((state, delta) => {
    const action = actions[names[0]]
    if (action) {
      const target = reduced ? 0.25 : hyper ? 3.2 : hovered ? 1.6 : 1
      action.timeScale = THREE.MathUtils.damp(action.timeScale, target, 3, delta)
    }
    // Las luces del casco (anillos de la textura emisiva) brillan más con el hiperimpulso.
    hullMaterials.current.forEach((m) => {
      m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, hyper ? 4 : hovered ? 2.8 : 1.5, 4, delta)
    })
    const color = hyper ? CYAN : LIME
    glowMaterials.forEach((m) => {
      m.emissive.lerp(color, 1 - Math.exp(-4 * delta))
      m.emissiveIntensity = THREE.MathUtils.damp(
        m.emissiveIntensity,
        hyper ? 3.5 : hovered ? 2.4 : 1.2,
        4,
        delta,
      )
    })
    if (root.current && !reduced) {
      const t = state.clock.elapsedTime
      root.current.position.y = Math.sin(t * 0.8) * 0.12
      const s = THREE.MathUtils.damp(root.current.scale.x, hovered ? 1.06 : 1, 5, delta)
      root.current.scale.setScalar(s)
    }
  })

  return (
    <group
      ref={root}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        onHover(false)
        document.body.style.cursor = 'auto'
      }}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      <group position={offset}>
        <primitive object={fbx} scale={scale} />
      </group>
    </group>
  )
}
