import { Canvas } from "@react-three/fiber"
import { ContactShadows, OrbitControls, Text } from "@react-three/drei"
import { Suspense } from "react"

function CartModel() {
  return (
    <group position={[0, -0.65, 0]}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[2.25, 0.18, 1.25]} />
        <meshStandardMaterial color="#ff7a1a" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[1.95, 0.9, 1.05]} />
        <meshStandardMaterial color="#ffc94a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.48, 0]} castShadow>
        <boxGeometry args={[2.35, 0.16, 1.32]} />
        <meshStandardMaterial color="#f0177b" roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.83, 0]} castShadow>
        <coneGeometry args={[1.32, 0.66, 4]} />
        <meshStandardMaterial color="#0b6e4f" roughness={0.9} />
      </mesh>
      {[[-0.82, 0.05, 0.48], [0.82, 0.05, 0.48], [-0.82, 0.05, -0.48], [0.82, 0.05, -0.48]].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.18, 24]} />
          <meshStandardMaterial color="#181030" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.98, 0.55]}>
        <boxGeometry args={[1.25, 0.42, 0.03]} />
        <meshStandardMaterial color="#181030" />
      </mesh>
      <Text position={[0, 0.98, 0.58]} fontSize={0.19} color="#ffc94a" anchorX="center" anchorY="middle">
        LOOTLOTO
      </Text>
      <Text position={[0, 1.68, 0.04]} rotation={[0, 0, 0]} fontSize={0.16} color="#f7eedd" anchorX="center" anchorY="middle">
        SASTA • SUNDAR • SLAY
      </Text>
    </group>
  )
}

export default function InteractiveThela() {
  return (
    <div className="thela-stage" aria-label="Interactive 3D Lootloto thela. Drag to orbit and scroll to zoom.">
      <div className="thela-label">DRAG THE THELA</div>
      <Canvas shadows camera={{ position: [3.6, 2.5, 4.7], fov: 38 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={1.8} />
          <directionalLight position={[3, 5, 4]} intensity={3} castShadow />
          <pointLight position={[-3, 2, 2]} color="#f0177b" intensity={8} distance={8} />
          <CartModel />
          <ContactShadows position={[0, -0.9, 0]} opacity={0.42} scale={5} blur={2.5} far={4} />
          <OrbitControls enablePan={false} minDistance={3.4} maxDistance={7} minPolarAngle={Math.PI / 3.4} maxPolarAngle={Math.PI / 2.05} enableDamping dampingFactor={0.08} />
        </Suspense>
      </Canvas>
      <div className="thela-hint">↔ orbit · scroll to zoom</div>
    </div>
  )
}
