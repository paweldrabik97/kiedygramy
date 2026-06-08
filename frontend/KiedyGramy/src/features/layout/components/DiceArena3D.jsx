import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { Environment, ContactShadows } from "@react-three/drei";
import DieD8 from "./DieD8";
import { useDice } from "../../../context/DiceContext";

const ArenaWalls = () => {
  const width = window.innerWidth / 100;
  const height = window.innerHeight / 100;

  return (
    <>
      <RigidBody type="fixed" position={[0, -2, 0]}>
        <CuboidCollider args={[25, 0.25, 25]} />
        <mesh receiveShadow>
          <boxGeometry args={[50, 0.5, 50]} />
          <shadowMaterial transparent opacity={0.4} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" position={[-width / 2, 0, 0]}>
        <boxGeometry args={[0.5, 20, height * 2]} />
      </RigidBody>
      <RigidBody type="fixed" position={[width / 2, 0, 0]}>
        <boxGeometry args={[0.5, 20, height * 2]} />
      </RigidBody>
      <RigidBody type="fixed" position={[0, 0, -height / 2]}>
        <boxGeometry args={[width * 2, 20, 0.5]} />
      </RigidBody>
      <RigidBody type="fixed" position={[0, 0, height / 2]}>
        <boxGeometry args={[width * 2, 20, 0.5]} />
      </RigidBody>
    </>
  );
};

const DiceArena3D = () => {
  const { dicePool, isRolling } = useDice();

  if (!isRolling) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <Canvas
        shadows
        camera={{ position: [0, 30, 7], fov: 20 }}
        style={{ pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 20, 10]}
            castShadow
            intensity={1.5}
          />

          <Physics gravity={[0, -30, 0]}>
            <ArenaWalls />

            {dicePool.map((die, index) => {
              const startPosition = [
                index * 2 - (dicePool.length - 1),
                5 + index,
                0,
              ];

              if (die.type === "D8") {
                return (
                  <DieD8
                    key={die.id}
                    position={startPosition}
                    onResult={(result) =>
                      console.log(`Wynik z ${die.id}: ${result}`)
                    }
                  />
                );
              }

              return null;
            })}
          </Physics>

          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default DiceArena3D;
