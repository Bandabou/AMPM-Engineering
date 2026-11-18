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
  const lensCentre = project(sketchAt, lensTop);

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
      {/* Through the glass: the detail being checked, picked out in blue. */}
      <path
        d={pathOf(
          shift(gearOutline(14, 136, 168))
            .slice(8, 24)
            .map(([x, y]) => project([x, y], lensTop))
            .map(([x, y]): Point => [lensCentre[0] + (x - lensCentre[0]) * 0.62 + 40, lensCentre[1] + (y - lensCentre[1]) * 0.62 + 8]),
        )}
        fill="none"
        stroke={ACCENT}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
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
  const leaderFrom = project([72 * Math.SQRT1_2, -72 * Math.SQRT1_2], hubTop);
  const leaderTo: Point = [leaderFrom[0] + 240, leaderFrom[1] - 190];

  const heightX = project([tip + 34, -tip - 34])[0];
  const heightBase = project([tip * Math.SQRT1_2, -tip * Math.SQRT1_2])[1];

  return (
    <LayerScene
      bodies={[]}
      bounds={[
        project([-420, -420]),
        project([420, 420]),
        project([420, -420]),
        project([-420, 420]),
        project([0, 0], hubTop + 60),
        [leaderTo[0] + 150, leaderTo[1] - 50],
        project([-tip, dimensionY + 60]),
        project([tip, dimensionY + 60]),
        [heightX + 100, heightBase],
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
        <path d={pathOf([[heightX, heightBase], [heightX, heightBase - hubTop]])} />
        <path d={pathOf([[heightX - 18, heightBase], [heightX + 18, heightBase]])} />
        <path d={pathOf([[heightX - 18, heightBase - hubTop], [heightX + 18, heightBase - hubTop]])} />
        <path d={pathOf([leaderFrom, leaderTo, [leaderTo[0] + 136, leaderTo[1]]])} />
      </g>
      <Arrow tip={dimStart} towards={dimEnd} />
      <Arrow tip={dimEnd} towards={dimStart} />
      <Arrow tip={leaderFrom} towards={leaderTo} />

      <g fill={INK} fontFamily={MONO} fontSize="40">
        {/* Laid flat on the ground plane, like a dimension on an isometric drawing. */}
        <text
          textAnchor="middle"
          transform={`matrix(0.866 0.5 -0.866 0.5 ${project([0, dimensionY + 46]).join(" ")})`}
        >
          Ø 120
        </text>
        <text x={heightX + 30} y={heightBase - hubTop / 2 + 14}>
          24
        </text>
        <text x={leaderTo[0] + 4} y={leaderTo[1] - 14}>
          Ø 24
        </text>
      </g>
    </LayerScene>
  );
}

function PrepareDrawing({ label, className }: DrawingProps) {
  // The gear set up for printing: turned to its best side, propped on supports, layer height chosen.
  const bedLayers = 6;
  const supportLayers = 16;
  const bodyLayers = 14;
  const hubLayers = 10;

  const teeth = 20;
  const gear = gearOutline(teeth, 215, 250);
  const bore = circle(46);
  const boss = circle(92);
  const bodyZ = bedLayers + supportLayers;
  const hubZ = bodyZ + bodyLayers;
  const top = (hubZ + hubLayers) * LAYER_HEIGHT;

  // One support under every tooth and a second ring further in.
  const ringOf = (count: number, r: number, phase: number): Point[] =>
    Array.from({ length: count }, (_, i) => {
      const a = ((i + phase) / count) * Math.PI * 2;
      return [Math.cos(a) * r, Math.sin(a) * r] as const;
    });
  const supports = [...ringOf(teeth, 232, 0.55), ...ringOf(12, 160, 0)];

  // Everything standing on the bed, back to front, so nearer pieces cover farther ones.
  const lowerBoss: Body = {
    layers: [{ loops: [boss], count: supportLayers, hiddenTop: true }],
    tone: "graphite",
    z: bedLayers,
  };
  const standing: Body[] = [
    lowerBoss,
    ...supports.map(
      (spot): Body => ({
        layers: [{ loops: [roundedRect(15, 15, 3)], count: supportLayers, hiddenTop: true }],
        tone: "blue",
        at: spot,
        z: bedLayers,
        smooth: true,
      }),
    ),
  ].sort((a, b) => (a.at?.[0] ?? 0) + (a.at?.[1] ?? 0) - ((b.at?.[0] ?? 0) + (b.at?.[1] ?? 0)));

  const bodies: Body[] = [
    { layers: [{ loops: [roundedRect(680, 680, 20)], count: bedLayers }], tone: "light", smooth: true },
    ...standing,
    { layers: [{ loops: [gear, bore], count: bodyLayers }], tone: "graphite", z: bodyZ },
    { layers: [{ loops: [boss, bore], count: hubLayers }], tone: "graphite", z: hubZ },
  ];

  // Orientation: the part's axis, with a turn arrow around it.
  const axisTop = top + 250;
  const turn = Array.from({ length: 23 }, (_, i) => {
    const a = (0.2 + i * 0.075) * Math.PI;
    return project([Math.cos(a) * 62, Math.sin(a) * 62], top + 170);
  });

  // Supports callout, from a support at the front left.
  const frontSupport = supports[7];
  const supportFrom = project(frontSupport, (bedLayers + supportLayers / 2) * LAYER_HEIGHT);
  const supportTo: Point = [supportFrom[0] - 190, supportFrom[1] + 120];

  // Layer-height callout, from the rim on the right.
  const rim: Point = [215 * Math.SQRT1_2, -215 * Math.SQRT1_2];
  const layerFrom = project(rim, (bodyZ + bodyLayers / 2) * LAYER_HEIGHT);
  const layerTo: Point = [layerFrom[0] + 150, layerFrom[1] - 110];

  return (
    <LayerScene
      bodies={bodies}
      bounds={[
        project([0, 0], axisTop + 20),
        [supportTo[0] - 250, supportTo[1] + 20],
        [layerTo[0] + 215, layerTo[1] - 60],
      ]}
      label={label}
      className={className}
    >
      <path
        d={pathOf([project([0, 0], top + 16), project([0, 0], axisTop)])}
        fill="none"
        stroke={INK}
        strokeOpacity="0.45"
        strokeWidth="1.5"
        strokeDasharray="28 7 5 7"
      />
      <path d={pathOf(turn)} fill="none" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      <Arrow tip={turn[turn.length - 1]} towards={turn[turn.length - 4]} />

      <g fill="none" stroke={ACCENT} strokeWidth="3">
        <path d={pathOf([supportFrom, supportTo, [supportTo[0] - 216, supportTo[1]]])} />
        <path d={pathOf([layerFrom, layerTo, [layerTo[0] + 176, layerTo[1]]])} />
      </g>
      <Arrow tip={supportFrom} towards={supportTo} />
      <Arrow tip={layerFrom} towards={layerTo} />
      <g fill={INK} fontFamily={MONO} fontSize="40">
        <text x={supportTo[0] - 216} y={supportTo[1] - 14}>
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
  // The printed gear, sanded smooth and painted, meshing with a second gear on a mounting plate.
  const plateLayers = 8;
  const gearLayers = 16;
  const capLayers = 9;

  const bigStep = (Math.PI * 2) / 20;
  const smallStep = (Math.PI * 2) / 12;
  const towards = -Math.PI / 4;
  const centreDistance = 372;
  // A tooth of the big gear points at the small one, which turns a gap to meet it.
  const big = rotate(gearOutline(20, 215, 250), towards - 0.55 * bigStep);
  const small = rotate(gearOutline(12, 120, 152), towards + Math.PI - 0.05 * smallStep);
  const smallAt: Point = [Math.cos(towards) * centreDistance, Math.sin(towards) * centreDistance];
  const plateCentre: Point = [smallAt[0] / 2, smallAt[1] / 2];

  // A screw in each corner of the plate: it is bolted together, not just laid out.
  const screws = rotate(
    [
      [-440, -230],
      [440, -230],
      [-440, 230],
      [440, 230],
    ],
    towards,
  ).map(([x, y]): Point => [x + plateCentre[0], y + plateCentre[1]]);

  const gearZ = plateLayers;
  const topZ = gearZ + gearLayers;

  const bodies: Body[] = [
    {
      layers: [{ loops: [rotate(roundedRect(1000, 580, 44), towards)], count: plateLayers }],
      tone: "light",
      at: plateCentre,
      smooth: true,
    },
    ...screws.map(
      (spot): Body => ({
        layers: [{ loops: [circle(17, 0, 0, 24)], count: 3 }],
        tone: "graphite",
        at: spot,
        z: plateLayers,
        smooth: true,
      }),
    ),
    { layers: [{ loops: [big, circle(56)], count: gearLayers }], tone: "blue", z: gearZ, smooth: true },
    { layers: [{ loops: [circle(56)], count: capLayers }], tone: "graphite", z: topZ, smooth: true },
    { layers: [{ loops: [small, circle(36)], count: gearLayers }], tone: "light", at: smallAt, z: gearZ, smooth: true },
    { layers: [{ loops: [circle(36)], count: capLayers }], tone: "graphite", at: smallAt, z: topZ, smooth: true },
  ];

  // A small four-point glint on the painted face: finished and ready to use.
  const glint = project([-120, -60], topZ * LAYER_HEIGHT);
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
