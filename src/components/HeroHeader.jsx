import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'
import Scene from './Scene.jsx'
import { profile } from '../config.js'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

function LoadingBar() {
  const { progress, active } = useProgress()
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setGone(true), 500)
      return () => clearTimeout(t)
    }
  }, [active, progress])
  if (gone) return null
  const done = progress >= 100
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 grid place-items-center bg-void transition-opacity duration-500 ${done ? 'opacity-0' : 'opacity-100'}`}
      role="status"
      aria-live="polite"
    >
      <div className="w-56">
        <p className="mb-3 text-sm text-hull/70">Cargando la nave… {Math.round(progress)}%</p>
        <div className="h-px w-full bg-hull/20">
          <div className="h-px bg-signal transition-[width] duration-200" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

export default function HeroHeader() {
  const [hyper, setHyper] = useState(false)
  const [hovered, setHovered] = useState(false)
  const reduced = usePrefersReducedMotion()
  const toggleHyper = () => setHyper((h) => !h)

  return (
    <header className="relative h-svh min-h-[640px] w-full overflow-hidden bg-void">
      <Canvas
        className="absolute! inset-0"
        camera={{ position: [0, 0.8, 9], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        aria-label="Escena 3D interactiva con una nave espacial"
      >
        <Scene
          hyper={hyper}
          hovered={hovered}
          setHovered={setHovered}
          toggleHyper={toggleHyper}
          reduced={reduced}
        />
      </Canvas>

      <LoadingBar />

      {/* UI superpuesta: no captura el puntero salvo en enlaces y botones */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 sm:p-10">
        <nav className="flex items-center justify-between">
          <a
            href="#"
            className="pointer-events-auto font-display text-xl font-extrabold tracking-tight text-hull"
            aria-label="Inicio"
          >
            {profile.initials}
          </a>
          <ul className="pointer-events-auto flex gap-6 text-sm text-hull/80">
            <li><a className="transition-colors hover:text-signal" href="#proyectos">Proyectos</a></li>
            <li><a className="transition-colors hover:text-signal" href="#contacto">Contacto</a></li>
          </ul>
        </nav>

        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-[clamp(2.75rem,9vw,7.5rem)] font-extrabold leading-[0.92] tracking-tight text-white">
              {profile.name}
            </h1>
            <p className="mt-4 text-lg font-medium text-signal sm:text-xl">{profile.role}</p>
            <p className="mt-2 max-w-md text-base leading-relaxed text-hull/75">{profile.tagline}</p>

            <div className="pointer-events-auto mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#proyectos"
                className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-void transition-transform hover:scale-105"
              >
                Ver proyectos
              </a>
              <button
                type="button"
                onClick={toggleHyper}
                aria-pressed={hyper}
                className={`rounded-full border px-6 py-3 text-sm font-semibold transition-colors ${
                  hyper
                    ? 'border-drive bg-drive/15 text-drive'
                    : 'border-hull/30 text-hull hover:border-signal hover:text-signal'
                }`}
              >
                {hyper ? 'Desactivar hiperimpulso' : 'Activar hiperimpulso'}
              </button>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-5 text-sm text-hull/80">
            <a className="transition-colors hover:text-signal" href={profile.links.github} target="_blank" rel="noreferrer">GitHub</a>
            <a className="transition-colors hover:text-signal" href={profile.links.email}>Correo</a>
          </div>
        </div>
      </div>

      <p className="pointer-events-none absolute left-1/2 top-24 z-10 -translate-x-1/2 text-center text-xs text-hull/50 sm:top-8">
        Arrastra para girar la nave. Haz clic en ella para el hiperimpulso.
      </p>
    </header>
  )
}
