import * as THREE from "three";

//D4 face normals
export const D4_NORMALS = [
  { value: 1, vector: new THREE.Vector3(0, 0, 1) },
  { value: 2, vector: new THREE.Vector3(Math.sqrt(8 / 9), 0, -1 / 3) },
  {
    value: 3,
    vector: new THREE.Vector3(-Math.sqrt(2 / 9), Math.sqrt(2 / 3), -1 / 3),
  },
  {
    value: 4,
    vector: new THREE.Vector3(-Math.sqrt(2 / 9), -Math.sqrt(2 / 3), -1 / 3),
  },
];

// D6 face normals
export const D6_NORMALS = [
  { value: 1, vector: new THREE.Vector3(0, 0, 1) },
  { value: 6, vector: new THREE.Vector3(0, 0, -1) },
  { value: 2, vector: new THREE.Vector3(1, 0, 0) },
  { value: 5, vector: new THREE.Vector3(-1, 0, 0) },
  { value: 3, vector: new THREE.Vector3(0, 1, 0) },
  { value: 4, vector: new THREE.Vector3(0, -1, 0) },
];

// D8 face normals
export const D8_NORMALS = [
  {
    value: 1,
    vector: new THREE.Vector3(0.331917, 0.331917, -0.331917).normalize(),
  },
  {
    value: 5,
    vector: new THREE.Vector3(-0.331917, 0.331917, 0.331917).normalize(),
  },
  {
    value: 2,
    vector: new THREE.Vector3(-0.331917, -0.331917, 0.331917).normalize(),
  },
  {
    value: 6,
    vector: new THREE.Vector3(0.331917, -0.331917, -0.331917).normalize(),
  },
  {
    value: 3,
    vector: new THREE.Vector3(-0.331917, -0.331917, -0.331917).normalize(),
  },
  {
    value: 7,
    vector: new THREE.Vector3(0.331917, -0.331917, 0.331917).normalize(),
  },
  {
    value: 4,
    vector: new THREE.Vector3(0.331917, 0.331917, 0.331917).normalize(),
  },
  {
    value: 8,
    vector: new THREE.Vector3(-0.331917, 0.331917, -0.331917).normalize(),
  },
];

// D10 face normals
export const D10_NORMALS = [
  { value: 0, vector: new THREE.Vector3(0, 0.200008, 0.653006) },
  { value: 1, vector: new THREE.Vector3(0.621046, -0.200008, -0.20179) },
  { value: 2, vector: new THREE.Vector3(-0.383827, 0.200008, -0.528293) },
  { value: 3, vector: new THREE.Vector3(-0.383827, -0.200008, 0.528293) },
  { value: 4, vector: new THREE.Vector3(0.621046, 0.200008, 0.20179) },
  { value: 5, vector: new THREE.Vector3(-0.621046, -0.200008, -0.20179) },
  { value: 6, vector: new THREE.Vector3(0.383827, 0.200008, -0.528293) },
  { value: 7, vector: new THREE.Vector3(0.383827, -0.200008, 0.528293) },
  { value: 8, vector: new THREE.Vector3(-0.621046, 0.200008, 0.20179) },
  { value: 9, vector: new THREE.Vector3(0, -0.200008, -0.653006) },
];

// D12 face normals
export const D12_NORMALS = [
  { value: 1, vector: new THREE.Vector3(0, 0, 1) },
  { value: 7, vector: new THREE.Vector3(0, 0, -1) },
  { value: 2, vector: new THREE.Vector3(1, 0, 0) },
  { value: 8, vector: new THREE.Vector3(-1, 0, 0) },
  { value: 3, vector: new THREE.Vector3(0, 1, 0) },
  { value: 9, vector: new THREE.Vector3(0, -1, 0) },
  {
    value: 4,
    vector: new THREE.Vector3(Math.cos(Math.PI / 6), Math.sin(Math.PI / 6), 0),
  },
  {
    value: 10,
    vector: new THREE.Vector3(
      -Math.cos(Math.PI / 6),
      -Math.sin(Math.PI / 6),
      0,
    ),
  },
  {
    value: 5,
    vector: new THREE.Vector3(
      Math.cos((5 * Math.PI) / 6),
      Math.sin((5 * Math.PI) / 6),
      0,
    ),
  },
  {
    value: 11,
    vector: new THREE.Vector3(
      -Math.cos((5 * Math.PI) / 6),
      -Math.sin((5 * Math.PI) / 6),
      0,
    ),
  },
  {
    value: 6,
    vector: new THREE.Vector3(
      Math.cos((3 * Math.PI) / 2),
      Math.sin((3 * Math.PI) / 2),
      0,
    ),
  },
  {
    value: 12,
    vector: new THREE.Vector3(
      -Math.cos((3 * Math.PI) / 2),
      -Math.sin((3 * Math.PI) / 2),
      0,
    ),
  },
];

// D20 face normals
export const D20_NORMALS = [
  { value: 1, vector: new THREE.Vector3(0, 0, 1) },
  { value: 11, vector: new THREE.Vector3(0, 0, -1) },
  { value: 2, vector: new THREE.Vector3(1, 0, 0) },
  { value: 12, vector: new THREE.Vector3(-1, 0, 0) },
  { value: 3, vector: new THREE.Vector3(0, 1, 0) },
  { value: 13, vector: new THREE.Vector3(0, -1, 0) },
  {
    value: 4,
    vector: new THREE.Vector3(
      Math.cos(Math.PI / 10),
      Math.sin(Math.PI / 10),
      0,
    ),
  },
  {
    value: 14,
    vector: new THREE.Vector3(
      -Math.cos(Math.PI / 10),
      -Math.sin(Math.PI / 10),
      0,
    ),
  },
  {
    value: 5,
    vector: new THREE.Vector3(
      Math.cos((3 * Math.PI) / 10),
      Math.sin((3 * Math.PI) / 10),
      0,
    ),
  },
  {
    value: 15,
    vector: new THREE.Vector3(
      -Math.cos((3 * Math.PI) / 10),
      -Math.sin((3 * Math.PI) / 10),
      0,
    ),
  },
  {
    value: 6,
    vector: new THREE.Vector3(
      Math.cos((5 * Math.PI) / 10),
      Math.sin((5 * Math.PI) / 10),
      0,
    ),
  },
  {
    value: 16,
    vector: new THREE.Vector3(
      -Math.cos((5 * Math.PI) / 10),
      -Math.sin((5 * Math.PI) / 10),
      0,
    ),
  },
  {
    value: 7,
    vector: new THREE.Vector3(
      Math.cos((7 * Math.PI) / 10),
      Math.sin((7 * Math.PI) / 10),
      0,
    ),
  },
  {
    value: 17,
    vector: new THREE.Vector3(
      -Math.cos((7 * Math.PI) / 10),
      -Math.sin((7 * Math.PI) / 10),
      0,
    ),
  },
  {
    value: 8,
    vector: new THREE.Vector3(
      Math.cos((9 * Math.PI) / 10),
      Math.sin((9 * Math.PI) / 10),
      0,
    ),
  },
  {
    value: 18,
    vector: new THREE.Vector3(
      -Math.cos((9 * Math.PI) / 10),
      -Math.sin((9 * Math.PI) / 10),
      0,
    ),
  },
  {
    value: 9,
    vector: new THREE.Vector3(
      Math.cos((11 * Math.PI) / 10),
      Math.sin((11 * Math.PI) / 10),
      0,
    ),
  },
  {
    value: 19,
    vector: new THREE.Vector3(
      -Math.cos((11 * Math.PI) / 10),
      -Math.sin((11 * Math.PI) / 10),
      0,
    ),
  },
  {
    value: 10,
    vector: new THREE.Vector3(
      Math.cos((13 * Math.PI) / 10),
      Math.sin((13 * Math.PI) / 10),
      0,
    ),
  },
  {
    value: 20,
    vector: new THREE.Vector3(
      -Math.cos((13 * Math.PI) / 10),
      -Math.sin((13 * Math.PI) / 10),
      0,
    ),
  },
];

export const getDiceResult = (rapierRotation, faceNormals) => {
  // Rapier returns rotation as a quaternion (x, y, z, w)
  // Converting it to a THREE.Quaternion to use with our face normals
  const quaternion = new THREE.Quaternion(
    rapierRotation.x,
    rapierRotation.y,
    rapierRotation.z,
    rapierRotation.w,
  );

  let maxDot = -1;
  let result = 1;
  const worldUp = new THREE.Vector3(0, 1, 0);

  faceNormals.forEach((face) => {
    const rotatedNormal = face.vector.clone().applyQuaternion(quaternion);
    const dot = rotatedNormal.dot(worldUp);

    if (dot > maxDot) {
      maxDot = dot;
      result = face.value;
    }
  });

  return result;
};
