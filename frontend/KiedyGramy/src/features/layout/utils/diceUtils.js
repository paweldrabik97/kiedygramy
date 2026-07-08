import * as THREE from "three";

//D4 face normals
export const D4_NORMALS = [
  { value: 1, vector: new THREE.Vector3(0, 0.377885, 0) },
  { value: 2, vector: new THREE.Vector3(-0.178137, -0.125962, -0.308542) },
  { value: 3, vector: new THREE.Vector3(-0.178137, -0.125962, 0.308542) },
  { value: 4, vector: new THREE.Vector3(0.356274, -0.125962, 0) },
];

// D6 face normals
export const D6_NORMALS = [
  { value: 1, vector: new THREE.Vector3(0, 0.565234, 0) },
  { value: 6, vector: new THREE.Vector3(0, -0.565234, 0) },
  { value: 2, vector: new THREE.Vector3(0.565234, 0, 0) },
  { value: 5, vector: new THREE.Vector3(-0.565234, 0, 0) },
  { value: 3, vector: new THREE.Vector3(0, 0.565234, 0) },
  { value: 4, vector: new THREE.Vector3(0, -0.565234, 0) },
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
  { value: 1, vector: new THREE.Vector3(-0.398039, -0.624554, -0.003639) },
  { value: 7, vector: new THREE.Vector3(-0.487396, 0.58129, -0.002306) },
  { value: 2, vector: new THREE.Vector3(-0.614845, 0.112323, 0.419869) },
  { value: 8, vector: new THREE.Vector3(0.070093, 0.387705, 0.639162) },
  { value: 3, vector: new THREE.Vector3(-0.635911, -0.002805, -0.387928) },
  { value: 9, vector: new THREE.Vector3(-0.004053, 0.389115, -0.640766) },
  { value: 4, vector: new THREE.Vector3(0.111525, -0.417933, 0.614827) },
  { value: 10, vector: new THREE.Vector3(0.632101, 0.003264, 0.398588) },
  { value: 5, vector: new THREE.Vector3(0.001004, -0.396841, -0.631597) },
  { value: 11, vector: new THREE.Vector3(0.644476, -0.006945, -0.383164) },
  { value: 6, vector: new THREE.Vector3(0.385761, -0.637233, -0.070107) },
  { value: 12, vector: new THREE.Vector3(0.38315, 0.646419, 0.008874) },
];

// D20 face normals
export const D20_NORMALS = [
  { value: 1, vector: new THREE.Vector3(0, -0.730552, -0.279046) },
  { value: 11, vector: new THREE.Vector3(0.451506, -0.451506, 0.451506) },
  { value: 2, vector: new THREE.Vector3(0, 0.730552, -0.279046) },
  { value: 12, vector: new THREE.Vector3(-0.451506, 0.451506, -0.451506) },
  { value: 3, vector: new THREE.Vector3(-0.451506, -0.451506, 0.451506) },
  { value: 13, vector: new THREE.Vector3(0.279046, 0, 0.730552) },
  { value: 4, vector: new THREE.Vector3(0.730552, 0.279046, 0) },
  { value: 14, vector: new THREE.Vector3(0.451506, 0.451506, 0.451506) },
  { value: 5, vector: new THREE.Vector3(0.279046, 0, -0.730552) },
  { value: 15, vector: new THREE.Vector3(-0.279046, 0, -0.730552) },
  { value: 6, vector: new THREE.Vector3(0.451506, -0.451506, -0.451506) },
  { value: 16, vector: new THREE.Vector3(-0.279046, 0, 0.730552) },
  { value: 7, vector: new THREE.Vector3(-0.451506, -0.451506, -0.451506) },
  { value: 17, vector: new THREE.Vector3(-0.730552, -0.279046, 0) },
  { value: 8, vector: new THREE.Vector3(-0.451506, 0.451506, 0.451506) },
  { value: 18, vector: new THREE.Vector3(0.451506, 0.451506, -0.451506) },
  { value: 9, vector: new THREE.Vector3(0.730552, -0.279046, 0) },
  { value: 19, vector: new THREE.Vector3(0, -0.730552, 0.279046) },
  { value: 10, vector: new THREE.Vector3(-0.730552, 0.279046, 0) },
  { value: 20, vector: new THREE.Vector3(0, 0.730552, 0.279046) },
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
