'use client'

import { Suspense, lazy } from 'react'
import { Card } from './card'
import { Spotlight } from './spotlight'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader"></span>
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}

export function HeroSection() {
  return (
    <Card className="w-full h-[600px] md:h-[700px] lg:h-[800px] bg-black relative overflow-visible">
      {/* Spotlight effect */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <div className="relative w-full h-full overflow-visible">
        {/* Left text content */}
        <div className="absolute top-0 left-0 flex flex-col justify-center h-full p-8 z-20 max-w-[50%]">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Interactive 3D
          </h1>
          <p className="mt-4 text-neutral-300 text-lg md:text-xl">
            Bring your UI to life with beautiful 3D scenes. Create immersive experiences
            that capture attention and enhance your design.
          </p>
        </div>

        {/* Robot / Right content */}
        <div className="absolute top-0 left-1/2 w-[300vw] h-full -translate-x-1/2 overflow-visible">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="absolute top-0 left-0 w-ful h-full origin-center pointer-events-none"
          />
        </div>
      </div>
    </Card>
  )
}