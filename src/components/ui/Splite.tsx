'use client'

import { Component, Suspense, lazy, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { loadSpline } from './spline-loader'

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false }
    static getDerivedStateFromError() { return { failed: true } }
    render() {
        return this.state.failed
            ? <div role="status" className="w-full h-full flex items-center justify-center text-gray-400 text-sm">3D scene unavailable</div>
            : this.props.children
    }
}

const Spline = lazy(loadSpline)
const motionQuery = '(prefers-reduced-motion: reduce)'
const getReducedMotion = () => window.matchMedia(motionQuery).matches
const getServerSnapshot = () => true
const subscribeMotion = (onChange: () => void) => {
    const media = window.matchMedia(motionQuery)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
}

function SceneLoading() {
    return (
        <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 text-sm">
            <span aria-hidden="true" className="h-8 w-8 rounded-full border-2 border-white/20 border-t-sky-400 animate-spin" />
            Loading robot…
        </div>
    )
}

interface SplineSceneProps {
    scene: string
    className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
    const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, getServerSnapshot)

    if (reducedMotion) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Animation paused for reduced motion
            </div>
        )
    }

    return (
        <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <SceneBoundary>
                <Suspense fallback={<SceneLoading />}>
                    <Spline scene={scene} className="w-full h-full">
                        <SceneLoading />
                    </Spline>
                </Suspense>
            </SceneBoundary>
        </div>
    )
}
