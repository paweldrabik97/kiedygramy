import React, { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { getDiceResult, D12_NORMALS } from "../utils/diceUtils";
import { useDice } from "../../../context/DiceContext";
import { useFrame } from "@react-three/fiber";

const DieD12 = ({ position, onResult }) => {
  const { nodes, materials } = useGLTF("/d12.glb");
  const rigidBodyRef = useRef();
  const meshRef = useRef();

  const { reportResult, isFading } = useDice();
  const hasReported = useRef(false);

  const initialLinvel = useRef([
    (Math.random() - 0.5) * 10, // X
    10 + Math.random() * 5, // Y
    (Math.random() - 0.5) * 10, // Z
  ]).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (rigidBodyRef.current) {
        const torque = {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
          z: (Math.random() - 0.5) * 10,
        };

        const impulse = {
          x: (Math.random() - 0.5) * 20,
          y: Math.random() * 20 + 10,
          z: (Math.random() - 0.5) * 20,
        };

        rigidBodyRef.current.applyTorqueImpulse(torque, true);
        rigidBodyRef.current.applyImpulse(impulse, true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSleep = () => {
    if (!rigidBodyRef.current || hasReported.current) return;

    const finalRotation = rigidBodyRef.current.rotation();
    const result = getDiceResult(finalRotation, D12_NORMALS);

    hasReported.current = true;
    reportResult(result);
  };

  const meshNode = Object.values(nodes).find((n) => n.isMesh);

  const clonedMaterial = useMemo(() => {
    if (!meshNode) return null;
    const mat = meshNode.material.clone();
    mat.transparent = true;
    mat.opacity = 1;
    return mat;
  }, [meshNode]);

  useFrame((state, delta) => {
    if (isFading && meshRef.current) {
      meshRef.current.material.opacity = Math.max(
        0,
        meshRef.current.material.opacity - delta,
      );
    }
  });

  if (!meshNode) return null;

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      colliders="hull"
      restitution={0.5}
      friction={0.6}
      linearDamping={0.9}
      angularDamping={0.9}
      onSleep={handleSleep}
    >
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        geometry={meshNode.geometry}
        material={clonedMaterial}
      />
    </RigidBody>
  );
};

useGLTF.preload("/assets/d12.glb");

export default DieD12;
