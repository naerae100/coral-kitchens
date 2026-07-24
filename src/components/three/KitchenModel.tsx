import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { oakFloor, satinRoughness, stoneSlab, whiteStone } from "./materials";

/**
 * The Coral Kitchens hero kitchen, rebuilt as real 3D geometry.
 *
 * Modelled from the studio's own photograph of a white shaker install: a curved
 * -end island in front of a full-width run, stone splashback, boxed rangehood
 * and a pair of wall sconces. Units are metres, so the proportions are the
 * proportions of an actual kitchen rather than something eyeballed.
 */

const ISLAND = { bodyWidth: 2.05, depth: 0.92, height: 0.86, z: 0.35 };
const ISLAND_RADIUS = ISLAND.depth / 2;
const BACK_Z = -2.6;
const RUN = { width: 5.2, height: 0.86, depth: 0.62, z: -2.28 };

export function useKitchenMaterials() {
  return useMemo(() => {
    const tooth = satinRoughness();

    const joinery = new THREE.MeshStandardMaterial({
      color: "#eceae4",
      roughness: 0.5,
      roughnessMap: tooth,
      metalness: 0,
      envMapIntensity: 0.85,
    });

    const joineryShadow = new THREE.MeshStandardMaterial({
      color: "#e0ddd6",
      roughness: 0.62,
      metalness: 0,
      envMapIntensity: 0.7,
    });

    const stone = new THREE.MeshPhysicalMaterial({
      map: whiteStone(),
      roughness: 0.28,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.3,
      envMapIntensity: 1,
    });

    const splash = new THREE.MeshPhysicalMaterial({
      map: stoneSlab(),
      roughness: 0.24,
      metalness: 0,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
      envMapIntensity: 1.05,
    });

    // Deep warm charcoal. This is what the white joinery is read against, and
    // the single biggest reason the kitchen has form instead of dissolving.
    const featureWall = new THREE.MeshStandardMaterial({
      color: "#939393ff",
      roughness: 0.96,
      metalness: 0,
      // The environment here is a set of bright emissive panels standing in for
      // skylights. At full strength its diffuse contribution alone lifts this
      // wall to near-white, which defeats the point of a dark backdrop.
      envMapIntensity: 0.18,
    });

    const floor = new THREE.MeshStandardMaterial({
      map: oakFloor(),
      roughness: 0.68,
      metalness: 0,
      envMapIntensity: 0.3,
    });

    const dark = new THREE.MeshStandardMaterial({
      color: "#1c1c1e",
      roughness: 0.35,
      metalness: 0.55,
    });

    // Brushed rather than mirror: a fully polished metal with nothing around to
    // reflect just renders black.
    const chrome = new THREE.MeshStandardMaterial({
      color: "#c9cacc",
      roughness: 0.28,
      metalness: 0.82,
      envMapIntensity: 1.5,
    });

    const bronze = new THREE.MeshStandardMaterial({
      color: "#6d5c49",
      roughness: 0.34,
      metalness: 0.9,
    });

    const bulb = new THREE.MeshStandardMaterial({
      color: "#ffdda8",
      emissive: new THREE.Color("#ffc477"),
      emissiveIntensity: 3.2,
      roughness: 1,
    });

    return {
      joinery,
      joineryShadow,
      stone,
      splash,
      featureWall,
      floor,
      dark,
      chrome,
      bronze,
      bulb,
    };
  }, []);
}

type Materials = ReturnType<typeof useKitchenMaterials>;

/**
 * A shaker front: flat door with a proud frame around a recessed centre panel.
 * Four rails rather than an extruded shape — cheaper, and reads correctly at
 * every distance the hero camera ever gets to.
 */
function ShakerDoor({
  width,
  height,
  position,
  rotation,
  materials,
  handle = "none",
  offset = 0,
  onToggle,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  materials: Materials;
  handle?: "none" | "left" | "right";
  /** How far the front sits off the carcass, in metres. */
  offset?: number;
  onToggle?: () => void;
}) {
  const thickness = 0.022;
  const rail = Math.min(0.075, width * 0.18);
  // The frame stands well proud of the centre panel: that shadow line is the
  // whole visual signature of a shaker door, and too shallow a step loses it.
  const proud = thickness / 2 + 0.013;
  const handleX = handle === "left" ? -width / 2 + 0.04 : width / 2 - 0.04;

  const group = useRef<THREE.Group>(null);
  const travel = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    travel.current = THREE.MathUtils.damp(travel.current, offset, 5, delta);
    group.current.position.z = position[2] + travel.current;
    // Fronts turn very slightly as they come off, so a row of them does not
    // read as one rigid slab sliding forward.
    group.current.rotation.y = travel.current * 0.12;
  });

  const interactive = Boolean(onToggle);

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      onClick={
        interactive
          ? (event) => {
              event.stopPropagation();
              onToggle?.();
            }
          : undefined
      }
      onPointerOver={
        interactive
          ? (event) => {
              event.stopPropagation();
              document.body.style.cursor = "pointer";
            }
          : undefined
      }
      onPointerOut={
        interactive
          ? () => {
              document.body.style.cursor = "";
            }
          : undefined
      }
    >
      {/* Recessed centre panel, a shade down so the frame reads against it */}
      <mesh material={materials.joineryShadow} castShadow receiveShadow>
        <boxGeometry args={[width, height, thickness]} />
      </mesh>

      {/* Top and bottom rails */}
      <mesh position={[0, height / 2 - rail / 2, proud]} material={materials.joinery} castShadow>
        <boxGeometry args={[width, rail, 0.026]} />
      </mesh>
      <mesh position={[0, -height / 2 + rail / 2, proud]} material={materials.joinery} castShadow>
        <boxGeometry args={[width, rail, 0.026]} />
      </mesh>
      {/* Stiles */}
      <mesh position={[-width / 2 + rail / 2, 0, proud]} material={materials.joinery} castShadow>
        <boxGeometry args={[rail, height - rail * 2, 0.026]} />
      </mesh>
      <mesh position={[width / 2 - rail / 2, 0, proud]} material={materials.joinery} castShadow>
        <boxGeometry args={[rail, height - rail * 2, 0.026]} />
      </mesh>

      {handle !== "none" && (
        <mesh position={[handleX, height * 0.12, proud + 0.022]} material={materials.chrome}>
          <boxGeometry args={[0.009, height * 0.26, 0.009]} />
        </mesh>
      )}
    </group>
  );
}

/**
 * How far the fronts sit off the carcass for each service being described.
 * 0 — complete kitchens: assembled.
 * 1 — cut-to-size panels: fronts right off, so the components read separately.
 * 2 — door profiles: fronts forward, close enough to read the shaker frame.
 * 3 — precision joinery: back together.
 */
const FOCUS_OFFSET = [0, 0.62, 0.3, 0];

function Island({ materials, focus = 0 }: { materials: Materials; focus?: number }) {
  const frontZ = ISLAND.z + ISLAND_RADIUS;
  const doorCount = 4;
  const doorWidth = ISLAND.bodyWidth / doorCount;
  const topY = ISLAND.height + 0.02;

  // Which island drawers the visitor has pulled open. State rather than a ref
  // because the open flag is a prop on the door, and there are only four of them.
  const [open, setOpen] = useState<boolean[]>(() => Array(doorCount).fill(false));
  const toggle = (i: number) =>
    setOpen((prev) => prev.map((value, index) => (index === i ? !value : value)));

  const focusOffset = FOCUS_OFFSET[focus] ?? 0;

  return (
    <group>
      {/* Body between the two curved returns */}
      <mesh position={[0, ISLAND.height / 2, ISLAND.z]} material={materials.joinery} castShadow>
        <boxGeometry args={[ISLAND.bodyWidth, ISLAND.height, ISLAND.depth]} />
      </mesh>

      {/* Curved end returns — the detail that defines this kitchen */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (ISLAND.bodyWidth / 2), ISLAND.height / 2, ISLAND.z]}
          material={materials.joinery}
          castShadow
        >
          <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS, ISLAND.height, 48]} />
        </mesh>
      ))}

      {/* Shaker fronts across the working face */}
      {Array.from({ length: doorCount }, (_, i) => (
        <ShakerDoor
          key={i}
          width={doorWidth - 0.012}
          height={ISLAND.height - 0.06}
          position={[
            -ISLAND.bodyWidth / 2 + doorWidth * (i + 0.5),
            ISLAND.height / 2,
            frontZ - ISLAND_RADIUS + ISLAND.depth / 2 + 0.001,
          ]}
          materials={materials}
          handle={i === 0 ? "left" : i === doorCount - 1 ? "right" : "none"}
          // Whichever is further out wins: the service being described, or the
          // drawer the visitor pulled open themselves. Staggering by index keeps
          // the row from moving as a single block.
          offset={Math.max(open[i] ? 0.42 : 0, focusOffset * (1 - i * 0.12))}
          onToggle={() => toggle(i)}
        />
      ))}

      {/* Stone benchtop: a stadium plan matching the curved ends, with overhang */}
      <mesh position={[0, topY, ISLAND.z]} material={materials.stone} castShadow>
        <boxGeometry args={[ISLAND.bodyWidth + 0.1, 0.045, ISLAND.depth + 0.08]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (ISLAND.bodyWidth / 2 + 0.05), topY, ISLAND.z]}
          material={materials.stone}
        >
          <cylinderGeometry args={[ISLAND_RADIUS + 0.04, ISLAND_RADIUS + 0.04, 0.045, 48]} />
        </mesh>
      ))}

      {/* Undermount sink and mixer, right of centre as in the photograph */}
      <mesh position={[0.5, topY - 0.004, ISLAND.z - 0.02]} material={materials.dark}>
        <boxGeometry args={[0.46, 0.04, 0.34]} />
      </mesh>
      <group position={[0.5, topY, ISLAND.z - 0.28]}>
        <mesh position={[0, 0.13, 0]} material={materials.chrome}>
          <cylinderGeometry args={[0.019, 0.024, 0.26, 20]} />
        </mesh>
        <mesh position={[0, 0.26, 0.055]} rotation={[0, 0, 0]} material={materials.chrome}>
          <cylinderGeometry args={[0.017, 0.017, 0.12, 16]} />
        </mesh>
        <mesh
          position={[0, 0.26, 0.0275]}
          rotation={[Math.PI / 2, 0, 0]}
          material={materials.chrome}
        >
          <cylinderGeometry args={[0.017, 0.017, 0.06, 16]} />
        </mesh>
      </group>
    </group>
  );
}

function BackRun({ materials }: { materials: Materials }) {
  const doorCount = 8;
  const doorWidth = RUN.width / doorCount;
  const faceZ = RUN.z + RUN.depth / 2;

  return (
    <group>
      {/* Recessed kickboard, so the run reads as sitting on a plinth */}
      <mesh position={[0, 0.05, RUN.z - 0.03]} material={materials.joineryShadow}>
        <boxGeometry args={[RUN.width - 0.04, 0.1, RUN.depth - 0.06]} />
      </mesh>

      <mesh position={[0, 0.1 + RUN.height / 2, RUN.z]} material={materials.joinery}>
        <boxGeometry args={[RUN.width, RUN.height, RUN.depth]} />
      </mesh>

      {Array.from({ length: doorCount }, (_, i) => (
        <ShakerDoor
          key={i}
          width={doorWidth - 0.012}
          height={RUN.height - 0.05}
          position={[-RUN.width / 2 + doorWidth * (i + 0.5), 0.1 + RUN.height / 2, faceZ + 0.001]}
          materials={materials}
        />
      ))}

      {/* Benchtop */}
      <mesh position={[0, 0.1 + RUN.height + 0.022, RUN.z]} material={materials.stone}>
        <boxGeometry args={[RUN.width + 0.04, 0.045, RUN.depth + 0.04]} />
      </mesh>

      {/* Cooktop, centred under the rangehood */}
      <mesh position={[0, 0.1 + RUN.height + 0.046, RUN.z + 0.02]} material={materials.dark}>
        <boxGeometry args={[0.88, 0.012, 0.48]} />
      </mesh>
    </group>
  );
}

function Rangehood({ materials }: { materials: Materials }) {
  return (
    <group position={[0, 0, RUN.z - 0.02]}>
      {/* Boxed canopy */}
      <mesh position={[0, 2.16, 0]} material={materials.joinery} castShadow>
        <boxGeometry args={[0.96, 0.78, 0.6]} />
      </mesh>
      {/* Wider lip at the base */}
      <mesh position={[0, 1.75, 0]} material={materials.joinery}>
        <boxGeometry args={[1.04, 0.05, 0.66]} />
      </mesh>
      {/* Extraction slot */}
      <mesh position={[0, 1.715, 0.02]} material={materials.dark}>
        <boxGeometry args={[0.86, 0.025, 0.5]} />
      </mesh>
    </group>
  );
}

function Sconce({ x, materials }: { x: number; materials: Materials }) {
  // Every cylinder here is rotated onto the Z axis so the fixture projects out of
  // the wall. Left on the default Y axis it reads as a ring seen edge-on.
  return (
    <group position={[x, 1.74, BACK_Z + 0.02]}>
      {/* Backplate flat against the wall */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.bronze}>
        <cylinderGeometry args={[0.042, 0.042, 0.025, 20]} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} material={materials.bronze}>
        <cylinderGeometry args={[0.016, 0.016, 0.075, 12]} />
      </mesh>
      {/* Shade, closed so it reads as a solid form */}
      <mesh position={[0, 0.02, 0.115]} rotation={[Math.PI / 2, 0, 0]} material={materials.bronze}>
        <cylinderGeometry args={[0.048, 0.048, 0.14, 20]} />
      </mesh>
      {/* Warm glow at the open end */}
      <mesh position={[0, -0.05, 0.115]} rotation={[Math.PI / 2, 0, 0]} material={materials.bulb}>
        <cylinderGeometry args={[0.042, 0.042, 0.02, 20]} />
      </mesh>
      <pointLight
        position={[0, -0.1, 0.16]}
        intensity={1.1}
        distance={2.2}
        color="#ffc98a"
        decay={2}
      />
    </group>
  );
}

/**
 * Studio set rather than a full room.
 *
 * A white kitchen photographed inside white walls has almost no tonal
 * separation — the joinery, benchtop and wall all land within a few percent of
 * each other and the whole thing reads as a pale smear. So the ceiling and side
 * walls are gone, and what remains is a dark feature wall and a floor that falls
 * away into the background: the way a showroom display is actually lit.
 */
function Shell({ materials }: { materials: Materials }) {
  return (
    <group>
      {/* Floor — oversized so its far edge is lost in fog, not cut off */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        material={materials.floor}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
      </mesh>

      {/* Dark feature wall behind the run */}
      <mesh position={[0, 2.2, BACK_Z]} material={materials.featureWall} receiveShadow>
        <planeGeometry args={[18, 5.2]} />
      </mesh>

      {/* Stone splashback between benchtop and overheads */}
      <mesh position={[0, 1.33, BACK_Z + 0.012]} material={materials.splash}>
        <boxGeometry args={[4.3, 0.62, 0.024]} />
      </mesh>
    </group>
  );
}

export function KitchenModel({ focus = 0 }: { focus?: number }) {
  const materials = useKitchenMaterials();
  return (
    <group>
      <Shell materials={materials} />
      <BackRun materials={materials} />
      <Rangehood materials={materials} />
      <Sconce x={-1.5} materials={materials} />
      <Sconce x={1.5} materials={materials} />
      <Island materials={materials} focus={focus} />
    </group>
  );
}
