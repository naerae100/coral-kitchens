import * as THREE from "three";

/**
 * Procedural surfaces for the hero kitchen, drawn on a 2D canvas at runtime.
 *
 * Nothing is downloaded: no texture files, no CDN, nothing that can 404 in
 * production. Each generator is memoised because materials are shared between
 * several meshes in the scene.
 */

function createCanvas(size: number, height = size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext("2d")! };
}

function toTexture(canvas: HTMLCanvasElement, repeatX = 1, repeatY = 1) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function memo<T>(fn: () => T): () => T {
  let cached: T | undefined;
  return () => (cached ??= fn());
}

/** European oak flooring: wide planks, warm, low contrast. */
export const oakFloor = memo(() => {
  const { canvas, ctx } = createCanvas(1024);

  ctx.fillStyle = "#c19a72";
  ctx.fillRect(0, 0, 1024, 1024);

  const plankHeight = 1024 / 6;
  for (let row = 0; row < 6; row++) {
    const y = row * plankHeight;
    // Each plank gets its own base tone so the floor never looks tiled.
    const tone = 0.92 + Math.random() * 0.16;
    ctx.fillStyle = `rgb(${Math.round(193 * tone)}, ${Math.round(154 * tone)}, ${Math.round(114 * tone)})`;
    ctx.fillRect(0, y, 1024, plankHeight - 1);

    // Grain
    for (let i = 0; i < 90; i++) {
      const gy = y + Math.random() * plankHeight;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      let cy = gy;
      for (let x = 0; x < 1024; x += 64) {
        cy += (Math.random() - 0.5) * 3;
        ctx.lineTo(x, cy);
      }
      ctx.strokeStyle = `rgba(140, 105, 70, ${0.04 + Math.random() * 0.09})`;
      ctx.lineWidth = 0.6 + Math.random() * 1.6;
      ctx.stroke();
    }

    // Board seam
    ctx.fillStyle = "rgba(120, 90, 60, 0.35)";
    ctx.fillRect(0, y + plankHeight - 2, 1024, 2);
  }

  return toTexture(canvas, 3, 3);
});

/** Honed white stone: near-white field with restrained grey veining. */
export const whiteStone = memo(() => {
  const { canvas, ctx } = createCanvas(1024);

  ctx.fillStyle = "#f7f6f3";
  ctx.fillRect(0, 0, 1024, 1024);

  const vein = (startY: number, width: number, alpha: number, drift: number) => {
    ctx.beginPath();
    ctx.moveTo(-100, startY);
    let y = startY;
    for (let x = -100; x < 1124; x += 46) {
      y += (Math.random() - 0.5) * drift;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(150, 152, 155, ${alpha})`;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  for (let i = 0; i < 5; i++) {
    const base = Math.random() * 1024;
    vein(base, 2 + Math.random() * 3, 0.22 + Math.random() * 0.14, 60);
    for (let j = 0; j < 5; j++) {
      vein(base + (Math.random() - 0.5) * 150, 0.5 + Math.random(), 0.09, 45);
    }
  }

  return toTexture(canvas);
});

/**
 * The splashback slab. Deliberately more contrast than the benchtop stone: it
 * sits against a white wall, and at benchtop veining it disappears entirely.
 */
export const stoneSlab = memo(() => {
  const { canvas, ctx } = createCanvas(1024, 512);

  ctx.fillStyle = "#f4f3f0";
  ctx.fillRect(0, 0, 1024, 512);

  // Broad tonal drift
  for (let i = 0; i < 14; i++) {
    const g = ctx.createRadialGradient(
      Math.random() * 1024,
      Math.random() * 512,
      0,
      Math.random() * 1024,
      Math.random() * 512,
      200 + Math.random() * 260,
    );
    g.addColorStop(0, `rgba(196, 199, 203, ${0.08 + Math.random() * 0.1})`);
    g.addColorStop(1, "rgba(196, 199, 203, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 512);
  }

  const vein = (startY: number, width: number, alpha: number, drift: number) => {
    ctx.beginPath();
    ctx.moveTo(-80, startY);
    let y = startY;
    for (let x = -80; x < 1104; x += 38) {
      y += (Math.random() - 0.5) * drift;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(126, 130, 136, ${alpha})`;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  for (let i = 0; i < 5; i++) {
    const base = Math.random() * 512;
    vein(base, 1.6 + Math.random() * 2.4, 0.2 + Math.random() * 0.12, 52);
    for (let j = 0; j < 5; j++) {
      vein(base + (Math.random() - 0.5) * 80, 0.5 + Math.random(), 0.08, 40);
    }
  }

  // The splashback plane is roughly 7:1, so a 1:1 map would smear the veining
  // into long horizontal stripes. Repeat across instead of stretching.
  return toTexture(canvas, 3.5, 1);
});

/** Very fine tooth so flat white joinery is not a dead, plastic surface. */
export const satinRoughness = memo(() => {
  const { canvas, ctx } = createCanvas(256);
  const image = ctx.createImageData(256, 256);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 138 + Math.random() * 30;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const texture = toTexture(canvas, 4, 4);
  texture.colorSpace = THREE.NoColorSpace; // roughness data, not colour
  return texture;
});
