'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThemeConfig } from '@/lib/themes';

interface InteractiveColorBlobProps {
  theme: ThemeConfig;
  className?: string;
  isPaused?: boolean;
}

// 3D Simplex Noise Shader Implementation
const noiseGLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const vertexShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uInteraction;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;

${noiseGLSL}

void main() {
  vUv = uv;
  
  // Smooth, slow rolling organic wave (representing clarity, tranquility, and low friction)
  vec3 norm = normalize(position);
  float wave1 = snoise(position * 0.65 + vec3(uTime * 0.22)) * 0.65;
  float wave2 = snoise(position * 1.20 - vec3(uTime * 0.18)) * 0.25;
  
  // Interactive mouse fluid pull with gentle falloff
  float mouseDist = length(position.xy - uMouse * 1.3);
  float mouseInfluence = smoothstep(2.2, 0.0, mouseDist) * uInteraction * 0.25;
  
  // Low amplitude displacement - smooth, organic, non-jagged crystalline wave
  float totalDisplacement = (wave1 + wave2) * 0.18 + mouseInfluence;
  vNoise = totalDisplacement;
  
  vec3 displacedPosition = position + norm * totalDisplacement;
  
  vNormal = normalize(normalMatrix * (norm + vec3(wave1, wave2, 0.0) * 0.15));
  vPosition = (modelViewMatrix * vec4(displacedPosition, 1.0)).xyz;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
`;

const fragmentShader = `
uniform vec3 uColorA; // Translucent cyan (representing clarity and focus)
uniform vec3 uColorB; // Muted frosted slate
uniform vec3 uColorC; // Soft cool lavender / periwinkle
uniform vec3 uColorD; // Frosted soft cream / pearl white
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(-vPosition);
  
  // Soft Fresnel rim for gentle glassmorphic transmission (clarity without glare)
  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.4);
  
  // Diffuse two-point lighting for frosted glass caustics
  vec3 lightDir1 = normalize(vec3(1.0, 1.6, 2.0));
  vec3 halfVec1 = normalize(lightDir1 + viewDir);
  // Soft, broad specular reflection - subtle frosted glass finish instead of harsh glare
  float spec1 = pow(max(dot(normal, halfVec1), 0.0), 22.0) * 0.40;
  
  vec3 lightDir2 = normalize(vec3(-1.6, -1.0, -1.2));
  float rim = pow(max(dot(normal, -lightDir2), 0.0), 2.8) * 0.28;
  
  // Calm, sensory-friendly palette blend:
  // Base transitions from muted frosted slate into translucent cyan, tinged with soft cool lavender rim
  float blend = smoothstep(-0.25, 0.35, vNoise);
  vec3 baseColor = mix(uColorB, uColorA, blend);
  baseColor = mix(baseColor, uColorC, fresnel * 0.55);
  
  // Subtle frosted cream transmission and soft ambient rim
  vec3 specularColor = uColorD * spec1;
  vec3 rimColor = mix(uColorA, uColorD, 0.45) * rim;
  
  vec3 finalColor = baseColor + specularColor + rimColor;
  
  // Translucent glass alpha: 100% transparent canvas, translucent frosted core
  float alpha = clamp(0.78 + fresnel * 0.18, 0.0, 0.94);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

export default function InteractiveColorBlob({
  theme,
  className = '',
  isPaused = false,
}: InteractiveColorBlobProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isDragging = useRef(false);
  const dragVelocity = useRef({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0 });
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // 1. Scene & 100% Transparent Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.6; // Clean framing with zero edge clipping

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent canvas
    container.appendChild(renderer.domElement);

    // 2. Crystalline Wave Geometry & Sensory-Friendly Calm Material
    const geometry = new THREE.IcosahedronGeometry(1.3, 48);

    // Calm, sensory-friendly palette: Frosted Slate, Translucent Cyan, Soft Lavender & Cream
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uInteraction: { value: 0 },
      uColorA: { value: new THREE.Color(0x38bdf8) }, // Translucent cyan (focus & clarity)
      uColorB: { value: new THREE.Color(0x475569) }, // Muted frosted slate
      uColorC: { value: new THREE.Color(0x818cf8) }, // Soft cool lavender / periwinkle
      uColorD: { value: new THREE.Color(0xf1f5f9) }, // Frosted crystal cream
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 3. Pointer & Drag Interaction Handlers
    const canvasEl = renderer.domElement;
    canvasEl.style.cursor = 'grab';
    canvasEl.style.touchAction = 'none';

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      mousePos.current.targetX = normX;
      mousePos.current.targetY = normY;

      if (isDragging.current) {
        const deltaX = clientX - lastPointer.current.x;
        const deltaY = clientY - lastPointer.current.y;
        dragVelocity.current.x = deltaX * 0.006;
        dragVelocity.current.y = deltaY * 0.006;
        mesh.rotation.y += dragVelocity.current.x;
        mesh.rotation.x += dragVelocity.current.y;
        lastPointer.current = { x: clientX, y: clientY };
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      canvasEl.style.cursor = 'grabbing';
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      lastPointer.current = { x: clientX, y: clientY };
      uniforms.uInteraction.value = 1.0;
    };

    const handlePointerUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        canvasEl.style.cursor = 'grab';
        uniforms.uInteraction.value = 0.5;
      }
    };

    canvasEl.addEventListener('mousemove', handlePointerMove);
    canvasEl.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvasEl.addEventListener('touchmove', handlePointerMove, { passive: true });
    canvasEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // 4. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 320;
      const newHeight = container.clientHeight || 280;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 5. Check System Motion Preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = mediaQuery.matches;
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleReducedMotionChange);

    // 6. Animation Loop with Motion Freezing Support
    let animationFrameId: number;
    let lastTimestamp = 0;
    let accumulatedTime = 0;

    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate);

      if (lastTimestamp === 0) lastTimestamp = timestamp;
      const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      const isMotionFrozen = Boolean(isPausedRef.current || prefersReducedMotion);

      if (!isMotionFrozen) {
        accumulatedTime += delta;
        uniforms.uTime.value = accumulatedTime;

        // Smooth mouse lerp
        mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
        mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;
        uniforms.uMouse.value.set(mousePos.current.x, mousePos.current.y);

        // Continuous gentle crystalline wave rotation
        if (!isDragging.current) {
          mesh.rotation.y += 0.003 + mousePos.current.x * 0.004;
          mesh.rotation.x += 0.0015 - mousePos.current.y * 0.003;
          dragVelocity.current.x *= 0.94;
          dragVelocity.current.y *= 0.94;
        }
      } else {
        // When motion is frozen/paused: stop time advancement and auto-rotation
        // If user manually drags, allow smooth tactile inspection with quick decay
        if (!isDragging.current) {
          dragVelocity.current.x *= 0.85;
          dragVelocity.current.y *= 0.85;
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
      canvasEl.removeEventListener('mousemove', handlePointerMove);
      canvasEl.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvasEl.removeEventListener('touchmove', handlePointerMove);
      canvasEl.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchend', handlePointerUp);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center select-none pointer-events-auto ${className}`}
      style={{ background: 'transparent' }}
    />
  );
}
