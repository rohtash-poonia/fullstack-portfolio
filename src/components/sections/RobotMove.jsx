import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { useRef, useEffect } from "react";

function RobotModel() {
  const { scene } = useGLTF("/robot.glb");
  const robotRef = useRef();
  const keys = useRef({});

  useEffect(() => {
    const down = (e) => (keys.current[e.key] = true);
    const up = (e) => (keys.current[e.key] = false);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame(() => {
    if (!robotRef.current) return;

    const speed = 0.05;

    if (keys.current["ArrowUp"]) robotRef.current.position.z -= speed;
    if (keys.current["ArrowDown"]) robotRef.current.position.z += speed;
    if (keys.current["ArrowLeft"]) robotRef.current.position.x -= speed;
    if (keys.current["ArrowRight"]) robotRef.current.position.x += speed;
  });

  return (
    <primitive
      ref={robotRef}
      object={scene}
      scale={1}              // scale bada rakha for visibility
      position={[0, 0, 0]}   // center me
    />
  );
}

export default function RobotGLB() {
  return (
    <Canvas camera={{ position: [0, 1, 4] }}>
      <ambientLight intensity={2} />
      <directionalLight position={[2, 2, 2]} intensity={2} />
      <RobotModel />
      <OrbitControls />
    </Canvas>
  );
}   