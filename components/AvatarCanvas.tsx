'use client';

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import { Group } from "three";

type AvatarProps = {
  active: boolean;
  speaking: boolean;
};

const idleNames = ["Idle", "Armature|Idle", "idle"];
const talkNames = ["Talking", "Armature|Talking", "Talking_1", "Talk"];

function CompanionModel({ active, speaking }: AvatarProps) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF("/models/companion.glb");
  const { actions } = useAnimations(animations, group);

  const idleAction = useMemo(() => {
    if (!actions) return undefined;
    for (const name of idleNames) {
      if (actions[name]) return actions[name];
    }
    const first = Object.values(actions)[0];
    return first;
  }, [actions]);

  const talkAction = useMemo(() => {
    if (!actions) return undefined;
    for (const name of talkNames) {
      if (actions[name]) return actions[name];
    }
    return undefined;
  }, [actions]);

  useEffect(() => {
    if (!idleAction) return;
    idleAction.reset().fadeIn(0.6).play();
    return () => {
      idleAction.fadeOut(0.4);
    };
  }, [idleAction]);

  useEffect(() => {
    if (!talkAction) return;
    if (speaking) {
      talkAction.reset().fadeIn(0.2).play();
    } else {
      talkAction.fadeOut(0.4);
    }
  }, [speaking, talkAction]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const breathe = Math.sin(t * 1.2) * 0.03;
    group.current.position.y = 0.3 + breathe;
    const rotTarget = speaking ? Math.sin(t * 2) * 0.15 : Math.sin(t * 0.5) * 0.1;
    group.current.rotation.y += (rotTarget - group.current.rotation.y) * delta * 2;
  });

  return (
    <group ref={group} dispose={null} scale={1.5} position={[0, -1.6, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/companion.glb");

export function AvatarCanvas({ active, speaking }: AvatarProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.5, 4], fov: 45 }}
      className="avatar-canvas"
    >
      <color attach="background" args={["#050816"]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 6, 2]}
        intensity={2.5}
        castShadow
        shadow-camera-far={20}
      />
      <spotLight position={[-4, 5, -2]} intensity={1.2} angle={0.45} penumbra={0.3} />
      <Suspense fallback={null}>
        {active ? <CompanionModel active={active} speaking={speaking} /> : null}
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 2.5}
        target={[0, 0.4, 0]}
      />
    </Canvas>
  );
}
