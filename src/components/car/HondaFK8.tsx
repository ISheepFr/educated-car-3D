import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface HondaFK8Props {
  trunkOpen: boolean;
  onToggleTrunk: () => void;
  trunkColor: string;
  hoodOpen: boolean;
  onToggleHood: () => void;
  hoodColor: string;
  onHover: (object: THREE.Object3D | null) => void;
}

const PAINT_PARTS = [
  "ADD_hood",
  "ORIGIN_BODY",
  "ADD_ORIGIN_BODY001",
];

export default function HondaFK8({
  trunkOpen,
  onToggleTrunk,
  trunkColor,
  hoodOpen,
  onToggleHood,
  hoodColor,
  onHover,
}: HondaFK8Props) {
  const { scene } = useGLTF("/educated-car-3D/models/honda-fk8-new.glb");

  const hood = useRef<THREE.Object3D | null>(null);
  const trunk = useRef<THREE.Object3D | null>(null);
  const initialRotation = useRef(0);
  const initialTrunkRotation = useRef(0);

  useEffect(() => {
    const hoodObject = scene.getObjectByName("ADD_hood");
    const trunkObject = scene.getObjectByName("trunk");

    if (hoodObject) {
      hood.current = hoodObject;
      initialRotation.current = hoodObject.rotation.x;
    }

    if (trunkObject) {
      trunk.current = trunkObject;
      initialTrunkRotation.current = trunkObject.rotation.x;
    }

    return () => {
      hood.current = null;
      trunk.current = null;
    };
  }, [scene]);

  // Couleur carrosserie
  useEffect(() => {
    PAINT_PARTS.forEach((partName) => {
      const object = scene.getObjectByName(partName);
      if (!object) return;

      const colorTarget = partName === "ADD_ORIGIN_BODY001" ? trunkColor : hoodColor;

      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        if (!child.userData.colorMaterials) {
          const originals = Array.isArray(child.material)
            ? child.material
            : [child.material];

          const clones = originals.map((mat) => mat.clone());
          child.material = clones.length === 1 ? clones[0] : clones;
          child.userData.colorMaterials = clones;
        }

        const materials = child.userData.colorMaterials as THREE.Material[];

        materials.forEach((material) => {
          if ("color" in material && material.color instanceof THREE.Color) {
            material.color.set(colorTarget);
          }
        });
      });
    });
  }, [scene, hoodColor, trunkColor]);

  // Animation capot / coffre
  useFrame((_, delta) => {
    if (hood.current) {
      const target = initialRotation.current + (hoodOpen ? -Math.PI / 3 : 0);
      hood.current.rotation.x = THREE.MathUtils.damp(
        hood.current.rotation.x,
        target,
        4,
        delta
      );
    }

    if (trunk.current) {
      const target = initialTrunkRotation.current + (trunkOpen ? -Math.PI / 3 : 0);
      trunk.current.rotation.x = THREE.MathUtils.damp(
        trunk.current.rotation.x,
        -target,
        4,
        delta
      );
    }
  });

  // Identifier la pièce interactive
  function getInteractivePart(object: THREE.Object3D): THREE.Object3D | null {
    let current: THREE.Object3D | null = object;

    while (current) {
      if (
        current.name === "ADD_hood" ||
        current.name === "ADD_ORIGIN_BODY001" ||
        current.name === "trunk"
      ) {
        return current;
      }

      if (current === scene) break;
      current = current.parent;
    }

    return null;
  }

  return (
    <primitive
      object={scene}
      onPointerMove={(event: { object: THREE.Object3D; stopPropagation: () => void }) => {
        const part = getInteractivePart(event.object);

        if (part) {
          event.stopPropagation();
          onHover(part);
          document.body.style.cursor = 'pointer';
        } else {
          onHover(null);
          document.body.style.cursor = 'auto';
        }
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(event: { object: THREE.Object3D; stopPropagation: () => void }) => {
        const part = getInteractivePart(event.object);

        if (!part) return;

        event.stopPropagation();

        if (part.name === 'ADD_ORIGIN_BODY001' || part.name === 'trunk') {
          onToggleTrunk();
          return;
        }

        if (part.name === 'ADD_hood') {
          onToggleHood();
        }
      }}
    />
  );
}

useGLTF.preload('/educated-car-3D/models/honda-fk8.glb');
