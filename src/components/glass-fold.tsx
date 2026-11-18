"use client";

// From GradFlow, animated WebGL gradients for React: https://gradflow.meerbahadin.dev
// Changed for AMPM: settings rebuild the program instead of being read from a ref during render,
// and the loop stops while the canvas is off screen.

import { useEffect, useRef } from "react";

export interface GlassFoldProps {
  /** The body of each glass pane. */
  color1?: string;
  /** The background. */
  color2?: string;
  /** The lit edges. */
  color3?: string;
  /** Animation speed. 0 freezes it. */
  speed?: number;
  /** How tightly the folds are packed. Higher is more, smaller folds. */
  scale?: number;
  /** Film grain, 0 to 0.5. */
  noise?: number;
  /** How many glass panes to draw, 1 to 6. */
  folds?: number;
  /** Moves the folds, in fractions of the height: [right, up]. */
  offset?: [number, number];
  /** How much the edges darken, 0 to 1. 0.55 takes them down to 45% of the background; 0 keeps them even. */
  vignette?: number;
  /** Strength of the bright ridges (the lit edges in color3), 0 to 1. 1 is the full look. */
  highlight?: number;
  /** How much the folds fade on the left, 0 to 1: calm across the left half, rising smoothly to full on the right.
   * 0 is even; 0.8 leaves 20% on the left. Portrait screens get the calm evenly, as their text spans the width. */
  calm?: number;
  className?: string;
}

const VERTEX = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = `
  precision highp float;

  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_scale;
  uniform float u_noise;
  uniform vec2 u_resolution;
  uniform float u_folds;
  uniform vec2 u_offset;
  uniform float u_vignette;
  uniform float u_highlight;
  uniform float u_calm;
  varying vec2 vUv;

  float grain(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // centered coordinates, y in [-0.5, 0.5], x stretched by the aspect ratio
  vec2 centered(vec2 uv) {
    vec2 p = uv - 0.5;
    p.x *= u_resolution.x / max(u_resolution.y, 1.0);
    return p;
  }

  mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  // panes of glass folded over each other. Each pane has one creased edge
  // that catches the light and thins out to nothing behind it; panes screen
  // over one another, so overlaps get brighter instead of darker.
  vec3 shade(vec2 uv, float time) {
    vec2 q = rot(0.6) * (centered(uv) - u_offset) * 2.0 * u_scale;
    float t = time * 0.6;
    float pixel = 2.0 * u_scale / max(u_resolution.y, 1.0);

    vec3 color = mix(u_color2, u_color2 * (1.0 - u_vignette), clamp(length(centered(uv)) * 1.3, 0.0, 1.0));
    // Weakest folds on the left, full strength on the right: calm across the left half, then one
    // wide smoothstep up to the right edge, so the change is gradual and never shows an edge.
    // On portrait screens the text spans the full width, so the calm applies evenly instead.
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    float landscape = smoothstep(0.8, 1.3, aspect);
    float calmMask = mix(1.0 - u_calm, mix(1.0 - u_calm, 1.0, smoothstep(0.3, 1.0, uv.x)), landscape);

    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      if (fi >= u_folds) break;
      float bend = mod(fi, 2.0) * 2.0 - 1.0;

      float crease = (fi - 2.5) * 0.4
                   + 0.26 * sin(q.x * (1.05 + 0.12 * fi) + fi * 1.9 + t * (0.25 + 0.05 * fi))
                   + 0.1 * bend * q.x * q.x;
      float s = q.y - crease;
      float pane = smoothstep(-pixel, pixel, s);
      float back = max(s, 0.0);

      // thick near the crease, clear further in
      float body = exp(-back * 1.7);
      float fresnel = exp(-back * 8.0);
      // the lit edge, and a fainter line just inside it for the glass's thickness
      float rim = exp(-back * 80.0);
      float inner = exp(-pow((back - 0.045) / 0.014, 2.0));
      float bloom = exp(-abs(s) * 20.0);

      vec3 tint = mix(u_color1, u_color3, clamp(fresnel * 0.6 + 0.08 + 0.14 * sin(fi * 2.1 + q.x * 0.8 + t * 0.2), 0.0, 1.0));
      vec3 light = tint * pane * (body * 0.42 + fresnel * 0.4)
                 + u_color3 * (pane * (rim * 0.6 + inner * 0.12) + bloom * 0.1) * u_highlight;
      light *= calmMask;

      // screen blend
      color += light * (1.0 - color);
    }

    return clamp(color, 0.0, 1.0);
  }

  void main() {
    vec3 color = shade(vUv, u_time);
    if (u_noise > 0.001) {
      float g = grain(vUv * 200.0 + u_time * 0.1);
      color *= 1.0 - u_noise * 0.4 + u_noise * g * 0.4;
    }
    gl_FragColor = vec4(color, 1.0);
  }
`;

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export function GlassFold({
  color1 = "#1e3cc8",
  color2 = "#06081e",
  color3 = "#96d7ff",
  speed = 0.5,
  scale = 1,
  noise = 0.12,
  folds = 6,
  offset = [0, 0],
  vignette = 0.55,
  highlight = 1,
  calm = 0,
  className,
}: GlassFoldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [offsetX, offsetY] = offset;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Without WebGL the canvas stays transparent and the parent's background shows instead.
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const u = { time: uniform("u_time"), resolution: uniform("u_resolution") };
    gl.uniform3fv(uniform("u_color1"), hexToVec3(color1));
    gl.uniform3fv(uniform("u_color2"), hexToVec3(color2));
    gl.uniform3fv(uniform("u_color3"), hexToVec3(color3));
    gl.uniform1f(uniform("u_scale"), scale);
    gl.uniform1f(uniform("u_noise"), noise);
    gl.uniform1f(uniform("u_folds"), folds);
    gl.uniform2f(uniform("u_offset"), offsetX, offsetY);
    gl.uniform1f(uniform("u_vignette"), vignette);
    gl.uniform1f(uniform("u_highlight"), highlight);
    gl.uniform1f(uniform("u_calm"), calm);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    let elapsed = 0;
    let last: number | null = null;
    let frame = 0;

    const draw = (now: number) => {
      if (last !== null) elapsed += Math.min((now - last) / 1000, 0.1) * speed;
      last = now;
      resize();
      gl.uniform1f(u.time, elapsed);
      gl.uniform2f(u.resolution, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // Speed 0 means a still image: one frame, repainted only on resize.
    const still = speed === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      last = null;
      frame = requestAnimationFrame(still ? draw : loop);
    };
    const stop = () => cancelAnimationFrame(frame);
    start();

    // Saves battery: no frames while the hero is scrolled out of view.
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    visibility.observe(canvas);

    // With motion off there is no loop, so repaint the still frame on resize.
    const sizing = new ResizeObserver(() => {
      if (still) draw(performance.now());
    });
    sizing.observe(canvas);

    return () => {
      stop();
      visibility.disconnect();
      sizing.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [color1, color2, color3, speed, scale, noise, folds, offsetX, offsetY, vignette, highlight, calm]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
