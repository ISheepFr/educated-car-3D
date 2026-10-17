import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Bounds,
  Environment,
} from "@react-three/drei";

import {
  EffectComposer,
  Outline,
} from "@react-three/postprocessing";

import { Suspense, useState } from "react";
import * as THREE from "three";

import HondaFK8 from "./components/car/HondaFK8";

export default function App() {
  const [hoodOpen, setHoodOpen] = useState(false);
  const [trunkOpen, setTrunkOpen] = useState(false);
  const [hoodColor, setHoodColor] = useState("#ffffff");
  const [trunkColor, setTrunkColor] = useState("#ffffff");
  const [hoveredObject, setHoveredObject] =
    useState<THREE.Object3D | null>(null);

  const colors = [
    { name: "Blanc", value: "#ffffff" },
    { name: "Rouge", value: "#cc2028" },
    { name: "Bleu", value: "#2454a6" },
    { name: "Noir", value: "#111111" },
    { name: "Gris", value: "#777777" },
  ];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "#171b22",
        overflow: "hidden",
      }}
    >
      {/* Scène 3D */}
      <Canvas
        shadows
        camera={{
          position: [5, 3, 7],
          fov: 45,
          near: 0.01,
          far: 1000,
        }}
      >
        <color attach="background" args={["#171b22"]} />

        <ambientLight intensity={1.5} />

        <directionalLight
          position={[5, 10, 5]}
          intensity={3}
          castShadow
        />

        {/* Gestion de la sélection */}

        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.3}>
            <HondaFK8
              hoodOpen={hoodOpen}
              onToggleHood={() =>
                setHoodOpen((prev) => !prev)
              }
              trunkOpen={trunkOpen}
              onToggleTrunk={() =>
                setTrunkOpen((prev) => !prev)
              }
              hoodColor={hoodColor}
              trunkColor={trunkColor}
              onHover={setHoveredObject}
            />
          </Bounds>

          <Environment preset="city" />
        </Suspense>

        <EffectComposer autoClear={false} multisampling={4}>
          <Outline
            selection={hoveredObject ? [hoveredObject] : []}
            visibleEdgeColor={0xff7a00}
            hiddenEdgeColor={0xff7a00}
            edgeStrength={100}
            blur
            xRay={true}
          />
        </EffectComposer>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={30}
        />
      </Canvas>

      {/* Titre */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 40,
          color: "white",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            letterSpacing: 3,
          }}
        >
          CAR EXPLORER
        </h1>

        <p style={{ color: "#a5aab5", fontSize: 14, margin: "8px 0 0" }}>
          Honda Civic Type R FK8
        </p>
      </div>

      {/* Panneau de personnalisation */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 30,
          padding: 20,
          background: "rgba(20, 25, 35, 0.9)",
          borderRadius: 12,
          color: "white",
          minWidth: 230,
          zIndex: 10,
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          Personnalisation
        </h3>

        <p style={{ fontSize: 13, color: "#a5aab5" }}>
          Couleur carrosserie
        </p>

        {/* Boutons de couleur */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {colors.map((color) => (
            <button
              key={color.value}
              type="button"
              title={color.name}
              aria-label={color.name}
              aria-pressed={hoodColor === color.value}
              onClick={() => {
                setHoodColor(color.value);
                setTrunkColor(color.value);
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: color.value,
                border:
                  hoodColor === color.value
                    ? "3px solid white"
                    : "2px solid #555555",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        {/* Bouton ouverture capot */}
        <button
          type="button"
          onClick={() => setHoodOpen((prev) => !prev)}
          style={{
            width: "100%",
            padding: "12px",
            background: "#ffffff",
            color: "#171b22",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {hoodOpen ? "Fermer le capot" : "Ouvrir le capot"}
        </button>

        <button
          type="button"
          onClick={() => setTrunkOpen((prev) => !prev)}
          style={{
            width: "100%",
            padding: "12px",
            background: "#ffffff",
            color: "#171b22",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            marginTop: 12,
          }}
        >
          {trunkOpen ? "Fermer le coffre" : "Ouvrir le coffre"}
        </button>
      </div>

      {/* Indications */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 30,
          color: "#a5aab5",
          fontSize: 12,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        Souris : rotation • Molette : zoom
      </div>
    </div>
  );
}
