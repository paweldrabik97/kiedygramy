import React, { useRef } from "react";
import { RigidBody } from "@react-three/rapier";
import { getDiceResult, D6_NORMALS } from "../utils/diceUtils";

const DieD6 = ({ position, onResult }) => {
  const rigidBodyRef = useRef();

  const handleSleep = () => {
    if (!rigidBodyRef.current) return;

    const finalRotation = rigidBodyRef.current.rotation();

    const result = getDiceResult(finalRotation, D6_NORMALS);

    console.log(`Die D6 is still. The result is: ${result}`);

    if (onResult) {
      onResult(result);
    }
  };

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      colliders="cuboid"
      restitution={0.6}
      friction={0.2}
      onSleep={handleSleep}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>
    </RigidBody>
  );
};

export default DieD6;
