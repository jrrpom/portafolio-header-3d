# Header 3D para portafolio (React + Vite + R3F)

Header interactivo con **React Three Fiber** y **@react-three/drei**: una nave espacial en formato **FBX** con su animación incorporada, iluminación, formas flotantes animadas con `useFrame` y una interfaz HTML/Tailwind superpuesta.

## Ejecutar en local

```bash
npm install
npm run dev
```

## Personalizar

Edita `src/config.js` con tu nombre, título profesional y enlaces.

## Estructura

- `public/models/nave.fbx`: modelo 3D (incluye 1 animación de ~33 s).
- `public/models/tex/`: texturas PBR (color, normal, emisiva y ORM) extraídas del `.blend` y reducidas a 2048 px.
- `src/components/HeroHeader.jsx`: `<Canvas>`, UI superpuesta y estado global (hiperimpulso).
- `src/components/Scene.jsx`: luces, entorno, `OrbitControls` restringido, estrellas y parallax.
- `src/components/Spaceship.jsx`: carga con `useLoader(FBXLoader)`, `useAnimations`, eventos `onPointerOver/Out` y `onClick`.
- `src/components/Floaters.jsx`: cubos, octaedros y tetraedros animados con `useFrame`.

## Interacción

- Arrastra para girar la nave (rango limitado, sin zoom).
- Pasa el cursor sobre la nave o sobre las formas flotantes: reaccionan.
- Clic en la nave (o botón) activa el **hiperimpulso**: cambia el color de luces y motores, acelera la animación y las estrellas.

## Desplegar en Vercel

1. Sube el proyecto a un repositorio público de GitHub.
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio. Vercel detecta Vite automáticamente (Build: `npm run build`, Output: `dist`).
3. Pulsa **Deploy**.
