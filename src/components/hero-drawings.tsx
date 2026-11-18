import { useId } from "react";
import {
  LAYER_HEIGHT,
  LayerScene,
  circle,
  gearOutline,
  honeycombCells,
  project,
  rotate,
  roundedRect,
  type Body,
  type Layer,
  type Loop,
  type Point,
} from "./printed-part";

// PLACEHOLDER IMAGERY: the five service steps on the homepage, from first idea to finished part.
// From step 02 on it is the same gear throughout: designed, sliced, printed, then painted and assembled.
// Dimension figures and settings are illustrative, not the spec of a real AMPM part.

type DrawingProps = { label: string; className?: string };

const ACCENT = "var(--color-accent)";
const INK = "var(--color-ink)";
const MONO = "var(--font-geist-mono)";

function pathOf(points: Point[], close = false) {
  const d = points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L");
  return `M${d}${close ? "Z" : ""}`;
}

function outlineAt(loop: Loop, z: number, close = true) {
  return pathOf(loop.map((point) => project(point, z)), close);
}

function ConsultDrawing({ label, className }: DrawingProps) {
  // The customer's file on the table: a sketch of the part under a magnifier, with our advice ticked off beside it.
  const sheenId = `${useId().replace(/[^a-zA-Z0-9]/g, "")}-sheen`;
  const sheetLayers = 3;
  const sheetTop = sheetLayers * LAYER_HEIGHT;
  const on = (point: Point) => project(point, sheetTop);
  const line = (from: Point, to: Point) => pathOf([on(from), on(to)]);

  const sketchAt: Point = [-175, -20];
  const shift = (loop: Loop): Loop => loop.map(([x, y]) => [x + sketchAt[0], y + sketchAt[1]] as const);
  const sketch = [shift(gearOutline(14, 136, 168)), shift(circle(46, 0, 0, 40))];
  const rows = [-190, -40, 110];

  const lensLayers = 5;
  const lensZ = 30;
  const lensRadius = 150;
  const reach = lensRadius + 22 + 96;
  const handleAt: Point = [sketchAt[0] - reach * Math.SQRT1_2, sketchAt[1] + reach * Math.SQRT1_2];
  const lensTop = (lensZ + lensLayers) * LAYER_HEIGHT;

  const marks = (
    <>
      <g fill="none" stroke={INK} strokeLinejoin="round" strokeLinecap="round">
        <path d={sketch.map((loop) => pathOf(loop.map(on), true)).join("")} strokeWidth="3.5" strokeOpacity="0.8" />
        <g strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="28 7 5 7">
          <path d={line([sketchAt[0] - 215, sketchAt[1]], [sketchAt[0] + 215, sketchAt[1]])} />
          <path d={line([sketchAt[0], sketchAt[1] - 215], [sketchAt[0], sketchAt[1] + 215])} />
        </g>
        {rows.map((y) => (
          <g key={y} strokeWidth="7" strokeOpacity="0.2">
            <path d={line([190, y - 14], [360, y - 14])} />
            <path d={line([190, y + 18], [300, y + 18])} />
          </g>
        ))}
      </g>
      {rows.map((y) => (
        <path
          key={y}
          d={pathOf([on([104, y - 2]), on([126, y + 22]), on([160, y - 30])])}
          fill="none"
          stroke={ACCENT}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <text
        textAnchor="middle"
        fill={INK}
        fillOpacity="0.5"
        fontFamily={MONO}
        fontSize="30"
        transform={`matrix(0.866 0.5 -0.866 0.5 ${on([sketchAt[0], 232]).join(" ")})`}
      >
        YOUR_PART.STL
      </text>
      {/* The magnifier's shadow on the sheet. */}
      <path d={pathOf(shift(circle(lensRadius + 14)).map(on), true)} fill="black" fillOpacity="0.07" />
    </>
  );

  return (
    <LayerScene
      bodies={[
        { layers: [{ loops: [roundedRect(860, 600, 14)], count: sheetLayers }], tone: "light", smooth: true },
        {
          layers: [{ loops: [rotate(roundedRect(190, 46, 22), (Math.PI * 3) / 4)], count: lensLayers }],
          tone: "graphite",
          at: handleAt,
          z: lensZ,
          smooth: true,
          before: marks,
        },
        {
          layers: [{ loops: [circle(lensRadius + 22), circle(lensRadius)], count: lensLayers }],
          tone: "graphite",
          at: sketchAt,
          z: lensZ,
          smooth: true,
        },
      ]}
      label={label}
      className={className}
    >
      <defs>
        <radialGradient id={sheenId} cx="0.32" cy="0.3" r="0.8">
          <stop offset="0" stopColor="white" stopOpacity="0.75" />
          <stop offset="1" stopColor="white" stopOpacity="0.12" />
        </radialGradient>
      </defs>
      <path
        d={pathOf(circle(lensRadius).map(([x, y]) => project([x + sketchAt[0], y + sketchAt[1]], lensTop)), true)}
        fill={`url(#${sheenId})`}
      />
    </LayerScene>
  );
}

function Arrow({ tip, towards }: { tip: Point; towards: Point }) {
  const angle = Math.atan2(towards[1] - tip[1], towards[0] - tip[0]);
  const wing = (spread: number): Point => [
    tip[0] + Math.cos(angle + spread) * 28,
    tip[1] + Math.sin(angle + spread) * 28,
  ];
  return <path d={pathOf([tip, wing(0.28), wing(-0.28)], true)} fill={ACCENT} />;
}

function DesignDrawing({ label, className }: DrawingProps) {
  const tip = 356;
  const body = 80;
  const hubTop = 144;
  const gear = gearOutline(20, 306, tip);
  const hub = circle(132);
  const bore = circle(72);
  const pockets = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3;
    return circle(44, Math.cos(a) * 200, Math.sin(a) * 200, 40);
  });

  // The file's triangle mesh around the rim, with the faces we repaired picked out.
  const segments = 40;
  const [inner, outer] = [254, 300];
  const at = (r: number, i: number): Point => {
    const a = (i / segments) * Math.PI * 2;
    return [Math.cos(a) * r, Math.sin(a) * r];
  };
  const mesh: Point[][] = Array.from({ length: segments }, (_, i) => [
    [at(inner, i), at(outer, i), at(outer, i + 1)],
    [at(inner, i), at(outer, i + 1), at(inner, i + 1)],
  ]).flat();
  const isRepaired = (face: number) => face < 4;
  const repairedAt = project(at((inner + outer) / 2, 1), body);
  const badge: Point = [repairedAt[0] + 235, repairedAt[1] + 70];

  const gridLines = Array.from({ length: 11 }, (_, i) => -420 + i * 84);
  const dimensionY = tip + 64;
  const dimStart = project([-tip, dimensionY]);
  const dimEnd = project([tip, dimensionY]);

  // Where the hub's side walls meet the silhouette, seen from this angle.
  const hubEdge = 132 * Math.SQRT1_2;

  return (
    <LayerScene
      bodies={[]}
      bounds={[
        project([-420, -420]),
        project([420, 420]),
        project([420, -420]),
        project([-420, 420]),
        project([0, 0], hubTop + 60),
        project([-tip, dimensionY + 60]),
        project([tip, dimensionY + 60]),
        [badge[0] + 40, badge[1] + 40],
      ]}
      label={label}
      className={className}
    >
      <g stroke={INK} strokeOpacity="0.07" strokeWidth="1.5">
        {gridLines.map((at) => (
          <g key={at}>
            <path d={pathOf([project([at, -420]), project([at, 420])])} />
            <path d={pathOf([project([-420, at]), project([420, at])])} />
          </g>
        ))}
      </g>

      <g fill="none" stroke={INK} strokeLinejoin="round">
        <path d={outlineAt(gear, 0)} strokeOpacity="0.32" strokeWidth="2" strokeDasharray="10 8" />
        <g strokeOpacity="0.16" strokeWidth="1.5">
          {gear.map((point, index) => (
            <path key={index} d={pathOf([project(point), project(point, body)])} />
          ))}
        </g>
        <path
          d={[outlineAt(gear, body), ...pockets.map((p) => outlineAt(p, body))].join("")}
          fill="white"
          fillOpacity="0.72"
          fillRule="evenodd"
          strokeWidth="3.5"
        />
        <path d={outlineAt(hub, body)} strokeWidth="3" />
        <path
          d={[
            pathOf([project([hubEdge, -hubEdge], body), project([hubEdge, -hubEdge], hubTop)]),
            pathOf([project([-hubEdge, hubEdge], body), project([-hubEdge, hubEdge], hubTop)]),
          ].join("")}
          strokeWidth="3"
        />
        <path
          d={[outlineAt(hub, hubTop), outlineAt(bore, hubTop)].join("")}
          fill="white"
          fillOpacity="0.85"
          fillRule="evenodd"
          strokeWidth="3.5"
        />
      </g>

      {/* File repair: the mesh, with the repaired faces filled and ticked off. */}
      <g strokeLinejoin="round">
        {mesh.map((triangle, face) => (
          <path
            key={face}
            d={pathOf(triangle.map((point) => project(point, body)), true)}
            fill={ACCENT}
            fillOpacity={isRepaired(face) ? 0.5 : 0}
            stroke={isRepaired(face) ? ACCENT : INK}
            strokeOpacity={isRepaired(face) ? 1 : 0.22}
            strokeWidth={isRepaired(face) ? 2 : 1.2}
          />
        ))}
      </g>
      <path d={pathOf([repairedAt, badge])} fill="none" stroke={ACCENT} strokeWidth="3" />
      <circle cx={badge[0]} cy={badge[1]} r="30" fill={ACCENT} />
      <path
        d={pathOf([[badge[0] - 13, badge[1] + 1], [badge[0] - 3, badge[1] + 11], [badge[0] + 14, badge[1] - 10]])}
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="28 7 5 7">
        <path d={pathOf([project([-tip - 44, 0], hubTop), project([tip + 44, 0], hubTop)])} />
        <path d={pathOf([project([0, -tip - 44], hubTop), project([0, tip + 44], hubTop)])} />
      </g>

      <g fill="none" stroke={ACCENT} strokeWidth="3">
        <path d={pathOf([project([-tip, 18]), project([-tip, dimensionY + 16])])} />
        <path d={pathOf([project([tip, 18]), project([tip, dimensionY + 16])])} />
        <path d={pathOf([dimStart, dimEnd])} />
      </g>
      <Arrow tip={dimStart} towards={dimEnd} />
      <Arrow tip={dimEnd} towards={dimStart} />

      <g fill={INK} fontFamily={MONO} fontSize="40">
        {/* Laid flat on the ground plane, like a dimension on an isometric drawing. */}
        <text
          textAnchor="middle"
          transform={`matrix(0.866 0.5 -0.866 0.5 ${project([0, dimensionY + 46]).join(" ")})`}
        >
          Ø 120
        </text>
      </g>
    </LayerScene>
  );
}

// A mounting bracket: a base flange, an upright wall at the back and a shelf reaching forward from its top.
// The shelf overhangs, so it can't print in mid-air: that is what supports are for.
const FLANGE_LAYERS = 8;
const WALL_LAYERS = 44;
const SHELF_LAYERS = 8;
const SHELF_CENTRE: Point = [0, -90];

function bracketBodies(tone: "graphite" | "blue", z: number, smooth: boolean): { lower: Body[]; shelf: Body } {
  const wallTop = z + FLANGE_LAYERS + WALL_LAYERS;
  return {
    lower: [
      { layers: [{ loops: [roundedRect(620, 440, 22)], count: FLANGE_LAYERS }], tone, z, smooth },
      { layers: [{ loops: [roundedRect(620, 50, 6, 0, -195)], count: WALL_LAYERS }], tone, z: z + FLANGE_LAYERS, smooth },
    ],
    shelf: {
      layers: [{ loops: [roundedRect(340, 260, 10, ...SHELF_CENTRE), circle(28, ...SHELF_CENTRE, 32)], count: SHELF_LAYERS }],
      tone,
      z: wallTop - SHELF_LAYERS,
      smooth,
    },
  };
}

function PrepareDrawing({ label, className }: DrawingProps) {
  // The bracket set up on the build plate: the shelf propped on a block of support, layer height chosen.
  const bedLayers = 6;
  const { lower, shelf } = bracketBodies("graphite", bedLayers, false);
  const supportFrom = bedLayers + FLANGE_LAYERS;
  const supportLayers = (shelf.z ?? 0) - supportFrom - 1;

  const bodies: Body[] = [
    { layers: [{ loops: [roundedRect(820, 700, 20)], count: bedLayers }], tone: "light", smooth: true },
    ...lower,
    // Support material: lighter, with its layer lines showing, and a one-layer gap so it snaps off.
    { layers: [{ loops: [roundedRect(320, 195, 4, 0, -72)], count: supportLayers }], tone: "light", z: supportFrom },
    shelf,
  ];

  const top = ((shelf.z ?? 0) + SHELF_LAYERS) * LAYER_HEIGHT;

  // Orientation: the part's upright axis, with a turn arrow around it.
  const axisAt = SHELF_CENTRE;
  const axisTop = top + 230;
  const turn = Array.from({ length: 23 }, (_, i) => {
    const a = (0.2 + i * 0.075) * Math.PI;
    return project([axisAt[0] + Math.cos(a) * 62, axisAt[1] + Math.sin(a) * 62], top + 150);
  });

  // Supports callout, from the front of the support block.
  const supportPoint = project([-90, 23], (supportFrom + supportLayers / 2) * LAYER_HEIGHT);
  const supportTo: Point = [supportPoint[0] - 230, supportPoint[1] - 120];

  // Layer-height callout, from the flange's right-hand side, where the layer lines show.
  const layerPoint = project([310, 60], (bedLayers + FLANGE_LAYERS / 2) * LAYER_HEIGHT);
  const layerTo: Point = [layerPoint[0] + 120, layerPoint[1] + 110];

  return (
    <LayerScene
      bodies={bodies}
      bounds={[
        project(axisAt, axisTop + 20),
        [supportTo[0] - 230, supportTo[1] - 60],
        [layerTo[0] + 200, layerTo[1] + 20],
      ]}
      label={label}
      className={className}
    >
      <path
        d={pathOf([project(axisAt, top + 16), project(axisAt, axisTop)])}
        fill="none"
        stroke={INK}
        strokeOpacity="0.45"
        strokeWidth="1.5"
        strokeDasharray="28 7 5 7"
      />
      <path d={pathOf(turn)} fill="none" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      <Arrow tip={turn[turn.length - 1]} towards={turn[turn.length - 4]} />

      <g fill="none" stroke={ACCENT} strokeWidth="3">
        <path d={pathOf([supportPoint, supportTo, [supportTo[0] - 200, supportTo[1]]])} />
        <path d={pathOf([layerPoint, layerTo, [layerTo[0] + 176, layerTo[1]]])} />
      </g>
      <Arrow tip={supportPoint} towards={supportTo} />
      <Arrow tip={layerPoint} towards={layerTo} />
      <g fill={INK} fontFamily={MONO} fontSize="40">
        <text x={supportTo[0] - 200} y={supportTo[1] - 14}>
          Supports
        </text>
        <text x={layerTo[0] + 6} y={layerTo[1] - 14}>
          0.2 mm
        </text>
      </g>
    </LayerScene>
  );
}

function PrintDrawing({ label, className }: DrawingProps) {
  const baseLayers = 8;
  const bedLayers = 6;
  const onBed = baseLayers + bedLayers;
  const solidLayers = 4;
  const infillLayers = 12;
  const printHeight = (onBed + solidLayers + infillLayers) * LAYER_HEIGHT;

  const gear = gearOutline(20, 215, 250);
  const bore = circle(56);
  const cells = honeycombCells(196, 20, 5).filter((cell) => {
    const [x, y] = cell.reduce<[number, number]>(
      ([sumX, sumY], [px, py]) => [sumX + px / cell.length, sumY + py / cell.length],
      [0, 0],
    );
    return Math.hypot(x, y) > 90;
  });

  const nozzleX = 215;
  const nozzleBase = printHeight / LAYER_HEIGHT;
  const nozzleLength = 12;
  const nozzle: Layer[] = Array.from({ length: nozzleLength }, (_, i) => ({
    loops: [circle(5 + i * 1.7, 0, 0, 24)],
    count: 1,
    hiddenTop: true,
  }));
  const beamZ = 88;
  const carriageZ = beamZ - 10;
  const columnTop = 102;

  const column = (x: number): Body => ({
    layers: [{ loops: [roundedRect(46, 46, 6)], count: columnTop - baseLayers }],
    tone: "graphite",
    at: [x, 0],
    z: baseLayers,
    smooth: true,
  });

  const bodies: Body[] = [
    { layers: [{ loops: [roundedRect(900, 730, 28)], count: baseLayers }], tone: "graphite", smooth: true },
    column(-420),
    {
      layers: [{ loops: [roundedRect(680, 680, 20)], count: bedLayers }],
      tone: "light",
      z: baseLayers,
      smooth: true,
    },
    {
      layers: [
        { loops: [gear, bore], count: solidLayers, hiddenTop: true },
        { loops: [gear, bore, ...cells], count: infillLayers },
      ],
      tone: "graphite",
      z: onBed,
    },
    // Small and detailed next to large: a finished pinion on the same plate.
    {
      layers: [{ loops: [gearOutline(12, 44, 60), circle(17, 0, 0, 24)], count: 10 }],
      tone: "graphite",
      at: [-266, 266],
      z: onBed,
    },
    { layers: nozzle, tone: "graphite", at: [nozzleX, 0], z: nozzleBase, smooth: true },
    {
      layers: [{ loops: [circle(11, 0, 0, 24)], count: carriageZ - nozzleBase - nozzleLength }],
      tone: "graphite",
      at: [nozzleX, 0],
      z: nozzleBase + nozzleLength,
      smooth: true,
    },
    {
      layers: [{ loops: [roundedRect(840, 30, 4)], count: 8 }],
      tone: "graphite",
      z: beamZ,
      smooth: true,
    },
    {
      layers: [{ loops: [roundedRect(92, 72, 10)], count: 24 }],
      tone: "graphite",
      at: [nozzleX, 0],
      z: carriageZ,
      smooth: true,
    },
    column(420),
  ];

  // The bead of plastic going down right now, ending under the nozzle.
  const bead = [...gear.slice(-14), gear[0]].map((point) => project(point, printHeight));

  return (
    <LayerScene bodies={bodies} label={label} className={className}>
      <path d={pathOf(bead)} fill="none" stroke="var(--color-accent-light)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </LayerScene>
  );
}

function FinishDrawing({ label, className }: DrawingProps) {
  // The bracket from step 03 finished: supports removed, sanded smooth and painted,
  // with the printed gear mounted on its shelf and the flange screwed down.
  const { lower, shelf } = bracketBodies("blue", 0, true);
  const shelfTop = (shelf.z ?? 0) + SHELF_LAYERS;
  const gearLayers = 9;

  const screws: Point[] = [
    [-250, 160],
    [250, 160],
  ];

  const bodies: Body[] = [
    ...lower,
    shelf,
    ...screws.map(
      (spot): Body => ({
        layers: [
          { loops: [circle(22, 0, 0, 24)], count: 2 },
          { loops: [circle(22, 0, 0, 24), roundedRect(26, 6, 1)], count: 1 },
        ],
        tone: "graphite",
        at: spot,
        z: FLANGE_LAYERS,
        smooth: true,
      }),
    ),
    {
      layers: [{ loops: [gearOutline(12, 104, 128), circle(28, 0, 0, 32)], count: gearLayers }],
      tone: "light",
      at: SHELF_CENTRE,
      z: shelfTop,
      smooth: true,
    },
    {
      layers: [{ loops: [circle(28, 0, 0, 32)], count: 7 }],
      tone: "graphite",
      at: SHELF_CENTRE,
      z: shelfTop + gearLayers,
      smooth: true,
    },
  ];

  // A small four-point glint on the painted wall: finished and ready to use.
  const glint = project([200, -170], (FLANGE_LAYERS + WALL_LAYERS * 0.62) * LAYER_HEIGHT);
  const star = (size: number) =>
    `M${glint[0]} ${glint[1] - size}Q${glint[0]} ${glint[1]} ${glint[0] + size * 0.6} ${glint[1]}` +
    `Q${glint[0]} ${glint[1]} ${glint[0]} ${glint[1] + size}Q${glint[0]} ${glint[1]} ${glint[0] - size * 0.6} ${glint[1]}` +
    `Q${glint[0]} ${glint[1]} ${glint[0]} ${glint[1] - size}Z`;

  return (
    <LayerScene bodies={bodies} label={label} className={className}>
      <path d={star(34)} fill="white" />
    </LayerScene>
  );
}

export const HERO_DRAWINGS = {
  consult: ConsultDrawing,
  design: DesignDrawing,
  prepare: PrepareDrawing,
  print: PrintDrawing,
  finish: FinishDrawing,
};

export type HeroDrawingName = keyof typeof HERO_DRAWINGS;
