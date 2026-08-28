import { Canvas } from "@react-three/fiber"
import { ContactShadows, OrbitControls, Text } from "@react-three/drei"
import { Suspense, useRef, useState } from "react"

function CartModel() {
  return (
    <group position={[0, -0.72, 0]}>
      <mesh position={[0, 0.56, 0]} castShadow>
        <boxGeometry args={[2.3, 0.16, 1.25]} />
        <meshStandardMaterial color="#8b5a3c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <boxGeometry args={[2.05, 0.85, 1.08]} />
        <meshStandardMaterial color="#b87545" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.74, 0.56]}>
        <boxGeometry args={[1.48, 0.33, 0.035]} />
        <meshStandardMaterial color="#2e2825" roughness={0.7} />
      </mesh>
      <Text position={[0, 0.76, 0.59]} fontSize={0.16} color="#e6c98f" anchorX="center" anchorY="middle">LOOTLOTO</Text>
      {[[-0.86, 0.16, 0.5], [0.86, 0.16, 0.5], [-0.86, 0.16, -0.5], [0.86, 0.16, -0.5]].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.27, 0.27, 0.18, 32]} />
          <meshStandardMaterial color="#302b28" roughness={0.65} />
        </mesh>
      ))}
      {[[-0.85, 1.48, 0], [0.85, 1.48, 0]].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} castShadow><cylinderGeometry args={[0.045, 0.045, 1.9, 12]} /><meshStandardMaterial color="#35302c" metalness={0.65} roughness={0.35} /></mesh>
      ))}
      <mesh position={[0, 1.72, 0]} castShadow><boxGeometry args={[2.28, 0.12, 1.3]} /><meshStandardMaterial color="#d4b078" roughness={0.9} /></mesh>
      <mesh position={[0, 1.92, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[1.02, 0.72, 4]} /><meshStandardMaterial color="#d9c39b" roughness={1} /></mesh>
      <mesh position={[0, 1.95, 0.02]}><boxGeometry args={[1.5, 0.04, 0.04]} /><meshStandardMaterial color="#8b5a3c" /></mesh>
      <mesh position={[0, 0.72, -0.82]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.06, 0.06, 1.7, 12]} /><meshStandardMaterial color="#35302c" metalness={0.7} roughness={0.3} /></mesh>
      <Text position={[0, 1.48, 0.66]} fontSize={0.12} color="#5c4636" anchorX="center" anchorY="middle">FRESH • LOCAL • DAILY</Text>
    </group>
  )
}

export default function InteractiveThela() {
  const [position, setPosition] = useState(0)
  const start = useRef({ x: 0, position: 0 })
  return (
    <div className="thela-stage" aria-label="Interactive 3D thela. Drag the cart from one side to the other; drag vertically to orbit and scroll to zoom." onPointerDown={(event) => { start.current = { x: event.clientX, position }; event.currentTarget.setPointerCapture(event.pointerId) }} onPointerMove={(event) => { if (event.buttons) setPosition(Math.max(-18, Math.min(18, start.current.position + (event.clientX - start.current.x) / 14))) }}>
      <Canvas shadows camera={{ position: [3.6, 2.5, 4.7], fov: 38 }} style={{ transform: `translateX(${position}px)`, transition: "transform 80ms linear" }}>
        <Suspense fallback={null}>
          <ambientLight intensity={2.1} /><directionalLight position={[3, 5, 4]} intensity={3.3} castShadow />
          <CartModel /><ContactShadows position={[0, -0.98, 0]} opacity={0.34} scale={5} blur={2.5} far={4} />
          <OrbitControls enablePan={false} minDistance={3.4} maxDistance={7} minPolarAngle={Math.PI / 3.4} maxPolarAngle={Math.PI / 2.05} enableDamping dampingFactor={0.08} />
        </Suspense>
      </Canvas>
      <div className="thela-hint">drag sideways to move · drag on cart to orbit</div>
    </div>
  )
}
