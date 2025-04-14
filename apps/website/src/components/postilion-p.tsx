'use client'

import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useSpring } from 'motion/react'
import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const Model = () => {
  const gltf = useLoader(GLTFLoader, './p.gltf')
  const modelRef = useRef<THREE.Group>(null)
  const scale = useSpring(0, {
    stiffness: 1,
    damping: 0.4,
    mass: 0.3,
    restSpeed: 0.01,
  })

  useEffect(() => {
    scale.set(2)
  }, [scale])

  useFrame((state) => {
    if (!modelRef.current) return
    const time = state.clock.getElapsedTime()
    modelRef.current.rotation.y = Math.sin(time * 0.5) * 0.3
    modelRef.current.rotation.x = Math.sin(time * 0.9) * 0.1
    modelRef.current.scale.setScalar(scale.get())
  })

  return (
    <>
      <primitive ref={modelRef} object={gltf.scene} />
    </>
  )
}

export const PostilionP = () => {
  return (
    <Canvas
      // className="-translate-x-1/3 cursor-grab"
      style={{
        width: '600px',
        height: '600px',
      }}
      camera={{
        position: [300, 0, 100],
        fov: 45,
      }}
    >
      <Model />
      <OrbitControls makeDefault enableZoom={false} />
      <Environment preset="studio" environmentIntensity={5} />
    </Canvas>
  )
}
