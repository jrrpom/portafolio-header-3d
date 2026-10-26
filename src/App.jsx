import HeroHeader from './components/HeroHeader.jsx'
import { profile } from './config.js'

export default function App() {
  return (
    <>
      <HeroHeader />

      <main>
        <section id="proyectos" className="mx-auto max-w-5xl px-6 py-28">
          <h2 className="font-display text-4xl font-bold text-white">Proyectos</h2>
          <p className="mt-4 max-w-xl text-hull/75">
            Aquí irán tus proyectos. Reemplaza esta sección con tus trabajos destacados.
          </p>
        </section>

        <section id="contacto" className="mx-auto max-w-5xl px-6 pb-28">
          <h2 className="font-display text-4xl font-bold text-white">Contacto</h2>
          <p className="mt-4 max-w-xl text-hull/75">
            ¿Tienes un proyecto en mente? Escríbeme a{' '}
            <a className="text-signal underline underline-offset-4" href={profile.links.email}>
              joserobertoruizp@gmail.com
            </a>
            .
          </p>
        </section>
      </main>
    </>
  )
}