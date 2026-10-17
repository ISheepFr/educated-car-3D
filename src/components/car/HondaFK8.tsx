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
  leftdoorOpen: boolean;
  onToggleLeftDoor: () => void;
  leftdoorColor: string;
  onHover: (objects: THREE.Object3D[]) => void;
}

const PAINT_PARTS = [
  "ADD_hood",
  "ORIGIN_BODY",
  "ADD_ORIGIN_BODY001",
  "ADD_LEFTDOOR",
];

export default function HondaFK8({
  trunkOpen,
  onToggleTrunk,
  trunkColor,
  hoodOpen,
  onToggleHood,
  hoodColor,
  leftdoorOpen,
  onToggleLeftDoor,
  leftdoorColor,
  onHover,
}: HondaFK8Props) {
  const { scene } = useGLTF("/educated-car-3D/models/honda-fk8-new.glb");

  const hood = useRef<THREE.Object3D | null>(null);
  const trunk = useRef<THREE.Object3D | null>(null);
  const leftDoor = useRef<THREE.Object3D | null>(null);
  const initialRotation = useRef(0);
  const initialTrunkRotation = useRef(0);
  const initialLeftDoorRotation = useRef(0);

  useEffect(() => {
    const hoodObject = scene.getObjectByName("ADD_hood");
    const trunkObject = scene.getObjectByName("trunk");
    const leftDoorObject = scene.getObjectByName("left_door");

    if (hoodObject) {
      hood.current = hoodObject;
      initialRotation.current = hoodObject.rotation.x;
    }

    if (trunkObject) {
      trunk.current = trunkObject;
      initialTrunkRotation.current = trunkObject.rotation.x;
    }

    if (leftDoorObject) {
      leftDoor.current = leftDoorObject;
      initialLeftDoorRotation.current = leftDoorObject.rotation.y;
    }

    return () => {
      hood.current = null;
      trunk.current = null;
      leftDoor.current = null;
    };
  }, [scene]);

  // Couleur carrosserie
  useEffect(() => {
    PAINT_PARTS.forEach((partName) => {
      const object = scene.getObjectByName(partName);
      if (!object) return;

      const colorTarget =
        partName === "ADD_ORIGIN_BODY001"
          ? trunkColor
          : partName === "ADD_LEFTDOOR"
            ? leftdoorColor
            : hoodColor;

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
  }, [scene, hoodColor, trunkColor, leftdoorColor]);

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

    if (leftDoor.current) {
      const target =
        initialLeftDoorRotation.current + (leftdoorOpen ? -Math.PI / 3 : 0);
      leftDoor.current.rotation.y = THREE.MathUtils.damp(
        leftDoor.current.rotation.y,
        target,
        4,
        delta
      );
    }
  });

  // Identifier la pièce interactive
  function getInteractivePart(object: THREE.Object3D): THREE.Object3D | null {
    let current: THREE.Object3D | null = object;

    while (current) {
      const name = current.name.toUpperCase();
      if ([
        "ADD_HOOD",
        "ADD_ORIGIN_BODY001",
        "TRUNK",
        "ADD_LEFTDOOR",
        "ADD_LEFTDOOR_MIRROR",
      ].includes(name)) {
        return current;
      }

      if (current === scene) break;
      current = current.parent;
    }

    return null;
  }

  function getHoverObjects(part: THREE.Object3D): THREE.Object3D[] {
    if (
      part.name.toUpperCase() !== "ADD_LEFTDOOR" &&
      part.name.toUpperCase() !== "ADD_LEFTDOOR_MIRROR"
    ) {
      return [part];
    }

    const doorParts: THREE.Object3D[] = [];
    scene.traverse((object) => {
      const name = object.name.toUpperCase();
      if (name === "ADD_LEFTDOOR" || name === "ADD_LEFTDOOR_MIRROR") {
        doorParts.push(object);
      }
    });

    return doorParts.length > 0 ? doorParts : [part];
  }

  return (
    <primitive
      object={scene}
      onPointerMove={(event: { object: THREE.Object3D; stopPropagation: () => void }) => {
        const part = getInteractivePart(event.object);

        if (part) {
          event.stopPropagation();
          onHover(getHoverObjects(part));
          document.body.style.cursor = 'pointer';
        } else {
          onHover([]);
          document.body.style.cursor = 'auto';
        }
      }}
      onPointerOut={() => {
        onHover([]);
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
          return;
        }

        if (
          part.name.toUpperCase() === "ADD_LEFTDOOR" ||
          part.name.toUpperCase() === "ADD_LEFTDOOR_MIRROR"
        ) {
          onToggleLeftDoor();
        }
      }}
    />
  );
}

useGLTF.preload('/educated-car-3D/models/honda-fk8-new.glb');
