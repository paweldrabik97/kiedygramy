import React, { useMemo, useEffect, use } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { RoundedBox, SoftShadows, Decal } from '@react-three/drei';
import { CanvasTexture } from 'three';

// --- ZMODYFIKOWANY GENERATOR TEKSTUR ---
// Zmiana: Tło musi być PRZEZROCZYSTE, żeby było widać kolor kostki pod "naklejką".
const createDiceTexture = (number) => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 1. TŁO: Czyścimy canvas, żeby był przezroczysty
  ctx.clearRect(0, 0, size, size);

  ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 10; ctx.strokeRect(5, 5, size-10, size-10);

  // 2. Kropki (czarne)
  ctx.fillStyle = '#000000';
  const radius = 50; // Trochę większe kropki
  
  const dot = (x, y) => {
    ctx.beginPath();
    ctx.arc(x * size, y * size, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  const c = 0.5; 
  const l = 0.22; // Trochę szerzej rozstawione
  const r = 0.78;
  
  if (number % 2 === 1) dot(c, c);
  if (number > 1) { dot(l, l); dot(r, r); }
  if (number > 3) { dot(l, r); dot(r, l); }
  if (number === 6) { dot(l, c); dot(r, c); }

  return new CanvasTexture(canvas);
};

// --- Komponent Podłogi (bez zmian) ---
function Floor() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0], material: { friction: 0.3 }
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <shadowMaterial opacity={0.1} color="black" />
    </mesh>
  );
}

// --- Komponent Ścian (bez zmian) ---
function Walls() {
  const { viewport } = useThree();
  const width = viewport.width / 2; const height = viewport.height / 2;
  usePlane(() => ({ position: [-width, 0, 0], rotation: [0, Math.PI / 2, 0] }));
  usePlane(() => ({ position: [width, 0, 0], rotation: [0, -Math.PI / 2, 0] }));
  usePlane(() => ({ position: [0, 0, -height], rotation: [0, 0, 0] }));
  usePlane(() => ({ position: [0, 0, height], rotation: [Math.PI, 0, 0] }));
  return null;
}

// --- NOWY Komponent Kostki z RoundedBox i Decalami ---
function Dice() {
  const [ref, api] = useBox(() => ({
    mass: 1, position: [0, 1, 0], args: [1, 1, 1], 
    material: { friction: 0.1, restitution: 0.8 },
  }));

  const textures = useMemo(() => [
      createDiceTexture(1), createDiceTexture(6), createDiceTexture(2),
      createDiceTexture(5), createDiceTexture(3), createDiceTexture(4),
  ], []);

  useEffect(() => {
    const timeout = setTimeout(() => {
        throwDice();
    }, 300);
    return () => clearTimeout(timeout);
    }, []);

  const throwDice = (e) => {
    if (e) e.stopPropagation(); 
    api.wakeUp();
    const jump = 5 + Math.random() * 2; 
    const x = (Math.random() - 0.5) * 30; const z = (Math.random() - 0.5) * 30;
    api.applyImpulse([x, jump, z], [0, 0, 0]);
    const t = 10;
    api.applyTorque([(Math.random()-.5)*t, (Math.random()-.5)*t, (Math.random()-.5)*t]);
  };

  // Konfiguracja naklejek: Pozycja, Rotacja i Indeks tekstury dla każdej z 6 ścian
  const decalsData = [
    { pos: [0.5, 0, 0], rot: [0, Math.PI/2, 0], texIdx: 0 },  // Prawa (1)
    { pos: [-0.5, 0, 0], rot: [0, -Math.PI/2, 0], texIdx: 1 }, // Lewa (6)
    { pos: [0, 0.5, 0], rot: [-Math.PI/2, 0, 0], texIdx: 2 }, // Góra (2)
    { pos: [0, -0.5, 0], rot: [Math.PI/2, 0, 0], texIdx: 3 },  // Dół (5)
    { pos: [0, 0, 0.5], rot: [0, 0, 0], texIdx: 4 },           // Przód (3)
    { pos: [0, 0, -0.5], rot: [Math.PI, 0, 0], texIdx: 5 },    // Tył (4)
  ];

  return (
    <mesh ref={ref} onClick={throwDice}>
      {/* 1. Używamy RoundedBox jako geometrii */}
      <RoundedBox args={[1, 1, 1]} radius={0.15} smoothness={8} castShadow receiveShadow>
        {/* 2. Jeden bazowy materiał dla całej kostki (np. biały plastik) */}
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
        
        {/* 3. Naklejamy 6 Decali na ścianki */}
        {decalsData.map((data, i) => (
            <Decal 
                key={i}
                position={data.pos} // Gdzie nakleić
                rotation={data.rot} // Jak obrócić naklejkę
                scale={[0.8, 0.8, 1]} // Skala (trochę mniejsza niż ścianka, żeby nie wchodzić na rogi)
                map={textures[data.texIdx]} // Tekstura z kropkami (przezroczyste tło)
            />
        ))}
      </RoundedBox>
    </mesh>
  );
}

// --- Główna Scena (bez zmian) ---
export default function DiceArena() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#e0e0e0' }}>
      <Canvas shadows camera={{ position: [0, 15, 0], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]} intensity={1.5} castShadow
          shadow-camera-left={-20} shadow-camera-right={20}
          shadow-camera-top={20} shadow-camera-bottom={-20}
          shadow-mapSize={[2048, 2048]}
        />
        <SoftShadows size={5} samples={8} />
        <Physics gravity={[0, -10, 0]}>
          <Walls /> <Floor /> <Dice />
        </Physics>
      </Canvas>
    </div>
  );
}