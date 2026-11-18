import { Fragment, useId, type ReactNode } from "react";

// PLACEHOLDER IMAGERY: stands in for studio photography until AMPM supplies it.
// Each part is built as FDM builds it: a stack of real slices, painted bottom-up.
// Later layers hide earlier ones, so holes and steps get correct depth with no 3D engine.

export type PartName = "bracket" | "honeycomb" | "fixture";
export type PartTone = "light" | "graphite" | "glass" | "blue";

export type Point = readonly [number, number];
export type Loop = Point[];
// hiddenTop: the section's last layer has no visible top face (it is covered, or a slope).
export type Layer = { loops: Loop[]; count: number; hiddenTop?: boolean };

export const LAYER_HEIGHT = 4;
const DEPTH_BANDS = 8;
const PADDING = 56;

// tint multiplies the grey side shades per channel: blue is a part painted in the logo's blue.
const TONES: Record<
  PartTone,
  { side: readonly number[]; top: readonly [string, string]; line: number; tint?: readonly [number, number, number] }
> = {
  light: { side: [0x8a, 0xd4, 0xb4, 0x80], top: ["#fbfbfc", "#d9d9dc"], line: 0.09 },
  glass: { side: [0xc4, 0xf8, 0xea, 0xb4], top: ["#ffffff", "#f0f0f2"], line: 0.05 },
  graphite: { side: [0x24, 0x56, 0x3a, 0x1a], top: ["#5a5a5e", "#2c2c2f"], line: 0.22 },
  blue: { side: [0x5a, 0xa8, 0x86, 0x4c], top: ["#a9cdef", "#5b8ac2"], line: 0.12, tint: [0.42, 0.62, 1] },
};

export function circle(r: number, cx = 0, cy = 0, n = 72): Loop {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  });
}

export function roundedRect(w: number, h: number, r: number, cx = 0, cy = 0): Loop {
  const corners: [number, number, number][] = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, 90],
    [-w / 2 + r, -h / 2 + r, 180],
    [w / 2 - r, -h / 2 + r, 270],
  ];
  return corners.flatMap(([x, y, start]) =>
    Array.from({ length: 9 }, (_, i) => {
      const a = ((start + i * 11.25) * Math.PI) / 180;
      return [cx + x + Math.cos(a) * r, cy + y + Math.sin(a) * r] as const;
    }),
  );
}

export function gearOutline(teeth: number, root: number, tip: number): Loop {
  const step = (Math.PI * 2) / teeth;
  return Array.from({ length: teeth }, (_, t) => {
    const at = (fraction: number, r: number) => {
      const a = (t + fraction) * step;
      return [Math.cos(a) * r, Math.sin(a) * r] as const;
    };
    return [at(0, root), at(0.3, root), at(0.42, tip), at(0.68, tip), at(0.8, root)];
  }).flat();
}

export function honeycombCells(limit: number, r: number, gap: number): Loop[] {
  const pitch = r * Math.sqrt(3) + gap;
  const cells: Loop[] = [];
  for (let row = -12; row <= 12; row++) {
    for (let col = -12; col <= 12; col++) {
      const x = (col + (row % 2 ? 0.5 : 0)) * pitch;
      const y = row * pitch * (Math.sqrt(3) / 2);
      if (Math.hypot(x, y) + r > limit) continue;
      cells.push(
        Array.from({ length: 6 }, (_, i) => {
          const a = (i * Math.PI) / 3 + Math.PI / 6;
          return [x + Math.cos(a) * r, y + Math.sin(a) * r] as const;
        }),
      );
    }
  }
  return cells;
}

function buildBracket(): Layer[] {
  const plate = [
    roundedRect(640, 440, 36),
    circle(30, -240, 70, 40),
    circle(30, 240, 70, 40),
    circle(30, -240, 160, 40),
    circle(30, 240, 160, 40),
  ];
  const wall = (reach: number): Loop => [
    [-296, -212],
    [296, -212],
    [296, -156],
    [176, -156],
    [176, reach],
    [146, reach],
    [146, -156],
    [-146, -156],
    [-146, reach],
    [-176, reach],
    [-176, -156],
    [-296, -156],
  ];
  const ribSteps = 44;
  const ribs = Array.from({ length: ribSteps }, (_, i): Layer => ({
    loops: [wall(-156 + 330 * (1 - (i + 1) / ribSteps))],
    count: 1,
    hiddenTop: true,
  }));
  return [{ loops: plate, count: 9 }, ...ribs, { loops: [wall(-156)], count: 22 }];
}

function buildHoneycomb(): Layer[] {
  const outer = circle(340, 0, 0, 96);
  return [
    { loops: [outer], count: 6, hiddenTop: true },
    { loops: [outer, ...honeycombCells(318, 30, 7)], count: 34 },
  ];
}

function buildFixture(): Layer[] {
  const block = roundedRect(660, 460, 44);
  return [
    {
      loops: [
        block,
        circle(22, -290, -190, 32),
        circle(22, 290, -190, 32),
        circle(22, -290, 190, 32),
        circle(22, 290, 190, 32),
      ],
      count: 8,
    },
    {
      loops: [
        roundedRect(600, 400, 28),
        roundedRect(250, 300, 22, -140, 0),
        circle(120, 148, 0),
      ],
      count: 26,
    },
  ];
}

const BUILDERS: Record<PartName, () => Layer[]> = {
  bracket: buildBracket,
  honeycomb: buildHoneycomb,
  fixture: buildFixture,
};

export function project([x, y]: Point, z = 0): Point {
  return [(x - y) * 0.866, (x + y) * 0.5 - z];
}

function toPath(loops: Loop[]) {
  return loops
    .map((loop) => {
      const points = loop.map((point) => project(point)).map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`);
      return `M${points.join("L")}Z`;
    })
    .join("");
}

function grey(value: number, tint: readonly [number, number, number] = [1, 1, 1]) {
  const channel = (scale: number) =>
    Math.round(Math.min(255, value * scale)).toString(16).padStart(2, "0");
  return `#${channel(tint[0])}${channel(tint[1])}${channel(tint[2])}`;
}

export function rotate(loop: Loop, radians: number): Loop {
  const [c, s] = [Math.cos(radians), Math.sin(radians)];
  return loop.map(([x, y]) => [x * c - y * s, x * s + y * c] as const);
}

function offset(loop: Loop, [dx, dy]: Point): Loop {
  return loop.map(([x, y]) => [x + dx, y + dy] as const);
}

// A scene is one or more stacks, painted in order, so list them back to front.
// z is counted in layers. smooth drops the layer lines, for machine parts that aren't printed.
export type Body = {
  layers: Layer[];
  tone: PartTone;
  at?: Point;
  z?: number;
  smooth?: boolean;
  /** Drawn just before this body, so later bodies cover it: marks on a surface, cast shadows. */
  before?: ReactNode;
};

export function LayerScene({
  bodies,
  bounds = [],
  label,
  className,
  children,
}: {
  bodies: Body[];
  bounds?: Point[];
  label: string;
  className?: string;
  children?: ReactNode;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const resolved = bodies.map((body, bodyIndex) => {
    const layers = body.layers.map((layer) => ({
      ...layer,
      loops: layer.loops.map((loop) => offset(loop, body.at ?? [0, 0])),
    }));
    const total = layers.reduce((sum, layer) => sum + layer.count, 0);
    const outlines = layers.map((layer) => layer.loops[0].map((point) => project(point)));
    const xs = outlines.flat().map(([x]) => x);
    let start = body.z ?? 0;
    const placed = layers.map((layer, layerIndex) => {
      const from = start;
      start += layer.count;
      return { layer, layerIndex, from };
    });
    return { body, bodyIndex, layers, total, placed, minX: Math.min(...xs), maxX: Math.max(...xs) };
  });

  const corners: Point[] = [
    ...bounds,
    ...resolved.flatMap(({ placed }) =>
      placed.flatMap(({ layer, from }) =>
        layer.loops[0].flatMap((point) => [
          project(point, from * LAYER_HEIGHT),
          project(point, (from + layer.count) * LAYER_HEIGHT),
        ]),
      ),
    ),
  ];
  const minX = Math.min(...corners.map(([x]) => x)) - PADDING;
  const maxX = Math.max(...corners.map(([x]) => x)) + PADDING;
  const minY = Math.min(...corners.map(([, y]) => y)) - PADDING;
  const maxY = Math.max(...corners.map(([, y]) => y)) + PADDING;

  // The contact shadow falls from the widest slice resting on the ground.
  const widest = resolved
    .filter(({ body }) => !body.z)
    .flatMap(({ layers }) => layers.map((layer) => layer.loops[0]))
    .sort((a, b) => spread(b) - spread(a))[0];

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`${minX.toFixed(1)} ${minY.toFixed(1)} ${(maxX - minX).toFixed(1)} ${(maxY - minY).toFixed(1)}`}
      className={className}
      overflow="visible"
    >
      <defs>
        {resolved.map(({ body, bodyIndex, minX: x1, maxX: x2, placed }) => {
          const [a, b, c, d] = TONES[body.tone].side;
          const tint = TONES[body.tone].tint;
          return (
            <Fragment key={bodyIndex}>
              {Array.from({ length: DEPTH_BANDS }, (_, band) => {
                // Lower layers sit darker, which grounds the part and deepens its holes.
                const light = 0.8 + 0.2 * (band / (DEPTH_BANDS - 1));
                return (
                  <linearGradient
                    key={band}
                    id={`${uid}-side-${bodyIndex}-${band}`}
                    gradientUnits="userSpaceOnUse"
                    x1={x1}
                    x2={x2}
                    y1="0"
                    y2="0"
                  >
                    <stop offset="0" stopColor={grey(a * light, tint)} />
                    <stop offset="0.3" stopColor={grey(b * light, tint)} />
                    <stop offset="0.65" stopColor={grey(c * light, tint)} />
                    <stop offset="1" stopColor={grey(d * light, tint)} />
                  </linearGradient>
                );
              })}
              <linearGradient id={`${uid}-top-${bodyIndex}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={TONES[body.tone].top[0]} />
                <stop offset="1" stopColor={TONES[body.tone].top[1]} />
              </linearGradient>
              {placed.map(({ layer, layerIndex }) => (
                <path
                  key={layerIndex}
                  id={`${uid}-layer-${bodyIndex}-${layerIndex}`}
                  d={toPath(layer.loops)}
                  fillRule="evenodd"
                />
              ))}
            </Fragment>
          );
        })}
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <filter id={`${uid}-tight`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {widest && (
        <>
          <path d={toPath([widest])} transform="translate(0 20)" filter={`url(#${uid}-soft)`} opacity="0.2" />
          <path d={toPath([widest])} transform="translate(0 5)" filter={`url(#${uid}-tight)`} opacity="0.3" />
        </>
      )}

      {resolved.map(({ body, bodyIndex, total, placed }) => (
        <Fragment key={bodyIndex}>
          {body.before}
          {placed.flatMap(({ layer, layerIndex, from }) =>
          Array.from({ length: layer.count }, (_, i) => {
            const height = from - (body.z ?? 0) + i;
            const band = Math.min(DEPTH_BANDS - 1, Math.floor((height / total) * DEPTH_BANDS));
            const isExposedTop = i === layer.count - 1 && !layer.hiddenTop;
            const fill = isExposedTop ? `url(#${uid}-top-${bodyIndex})` : `url(#${uid}-side-${bodyIndex}-${band})`;
            return (
              <use
                key={`${bodyIndex}-${layerIndex}-${i}`}
                href={`#${uid}-layer-${bodyIndex}-${layerIndex}`}
                y={-(from + i) * LAYER_HEIGHT}
                fill={fill}
                stroke={body.smooth ? fill : "black"}
                strokeOpacity={body.smooth ? 1 : TONES[body.tone].line}
                strokeWidth="0.7"
                strokeLinejoin="round"
              />
            );
          }),
          )}
        </Fragment>
      ))}

      {children}
    </svg>
  );
}

function spread(loop: Loop) {
  const xs = loop.map((point) => project(point)[0]);
  return Math.max(...xs) - Math.min(...xs);
}

export function PrintedPart({
  part,
  tone,
  label,
  className,
}: {
  part: PartName;
  tone: PartTone;
  label: string;
  className?: string;
}) {
  return (
    <LayerScene bodies={[{ layers: BUILDERS[part](), tone }]} label={label} className={className} />
  );
}
