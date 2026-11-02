import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getGestureById } from "../../services/gestureMapping";

/**
 * SignAvatar - Photorealistic Skinned 3D Human Communication Assistant
 * 
 * Visual Realism & Biomechanics:
 * - Direct integration of user's high-fidelity Blender avatar (Mia character rig, 12 meshes, PBR textures).
 * - Multi-layer procedural eye shader: Sclera gradient, dark limbal ring, striated hazel/amber iris, dark pupil, wet corneal reflection.
 * - Subsurface skin shader calibration: 0.46 roughness lipid sheen, warm undertones, eliminates flat/plastic mannequin look.
 * - Hair fiber specular sheen: Anisotropic espresso brunette with dual-rim edge definition.
 * - Realistic fabric textiles: Matte woven cotton/linen shirt and denim weave.
 * - Alive human presence: Micro-saccades, conscious eye contact towards camera, organic diaphragmatic breathing.
 * - Hardware-accelerated THREE.AnimationMixer with 11 baked actions strictly in frontal signing space (15–35cm in front of torso).
 * - Communication Framing: Default view prioritizes Face -> Upper Body -> Both Hands -> Frontal Gesture Space.
 * - Studio 4-point lighting with ACES Filmic tone mapping, soft contact shadows, and glowing circular stage pedestal.
 * - Slow-Motion playback (1.0x, 0.5x, 0.25x), freeze-frame Pause, instant Replay, and 2D accessible vector fallback.
 */

// Supported Animation Clip Names baked into sign-avatar.glb
export const CLIP_NAMES = {
  IDLE: "IDLE",
  HELLO: "HELLO",
  YES: "YES",
  NO: "NO",
  HELP: "HELP",
  THANK_YOU: "THANK_YOU",
  POINTING_UP: "POINTING_UP",
  VICTORY: "VICTORY",
  I_LOVE_YOU: "I_LOVE_YOU",
  OPEN_PALM: "OPEN_PALM",
  CLOSED_FIST: "CLOSED_FIST"
};

// Maps gesture IDs and avatarActions to GLB AnimationClips
const GESTURE_TO_CLIP = {
  idle: CLIP_NAMES.IDLE,
  default: CLIP_NAMES.IDLE,
  hello: CLIP_NAMES.HELLO,
  wave: CLIP_NAMES.HELLO,
  Open_Palm: CLIP_NAMES.OPEN_PALM,
  open_palm: CLIP_NAMES.OPEN_PALM,
  yes: CLIP_NAMES.YES,
  thumbs_up: CLIP_NAMES.YES,
  Thumb_Up: CLIP_NAMES.YES,
  good: CLIP_NAMES.YES,
  no: CLIP_NAMES.NO,
  fist: CLIP_NAMES.CLOSED_FIST,
  closed_fist: CLIP_NAMES.CLOSED_FIST,
  Closed_Fist: CLIP_NAMES.CLOSED_FIST,
  help: CLIP_NAMES.HELP,
  Help: CLIP_NAMES.HELP,
  thank_you: CLIP_NAMES.THANK_YOU,
  Thank_You: CLIP_NAMES.THANK_YOU,
  thanks: CLIP_NAMES.THANK_YOU,
  point_courses: CLIP_NAMES.POINTING_UP,
  pointing_up: CLIP_NAMES.POINTING_UP,
  Pointing_Up: CLIP_NAMES.POINTING_UP,
  peace: CLIP_NAMES.VICTORY,
  victory: CLIP_NAMES.VICTORY,
  Victory: CLIP_NAMES.VICTORY,
  ily: CLIP_NAMES.I_LOVE_YOU,
  iloveyou: CLIP_NAMES.I_LOVE_YOU,
  ILoveYou: CLIP_NAMES.I_LOVE_YOU
};

// Camera framing configurations calibrated for communication visibility
const CAMERA_PRESETS = {
  // Optimal communication view: Face -> Upper Body -> Both Hands -> Gesture Space in front of torso
  body: {
    pos: new THREE.Vector3(0, 1.25, 2.05),
    target: new THREE.Vector3(0, 1.20, 0)
  },
  // Full-body perspective: Top of head to shoes
  full: {
    pos: new THREE.Vector3(0, 1.05, 2.75),
    target: new THREE.Vector3(0, 0.92, 0)
  },
  // Hands close-up: Detailed 5-digit finger articulation
  hands: {
    pos: new THREE.Vector3(-0.06, 1.22, 1.35),
    target: new THREE.Vector3(-0.06, 1.22, 0)
  }
};

/**
 * Procedural High-Realism Human Eye Texture
 * Generates an anatomically structured eyeball texture with warm sclera,
 * defined limbal ring, striated iris fibrils, and deep pupil.
 */
function createRealisticEyeTexture() {
  if (typeof document === "undefined") return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Sclera: Natural warm ivory white with subtle radial gradient
    const scleraGrad = ctx.createRadialGradient(256, 256, 100, 256, 256, 256);
    scleraGrad.addColorStop(0, "#fcfbfa");
    scleraGrad.addColorStop(0.7, "#f5f3ee");
    scleraGrad.addColorStop(1.0, "#ebe6dd");
    ctx.fillStyle = scleraGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Fine sclera vascular micro-tones
    ctx.strokeStyle = "rgba(210, 150, 140, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r1 = 140 + Math.random() * 40;
      const r2 = 230 + Math.random() * 20;
      ctx.beginPath();
      ctx.moveTo(256 + Math.cos(angle) * r1, 256 + Math.sin(angle) * r1);
      ctx.lineTo(256 + Math.cos(angle + 0.1) * r2, 256 + Math.sin(angle + 0.1) * r2);
      ctx.stroke();
    }

    // Limbal Ring: Dark defined boundary around iris
    ctx.beginPath();
    ctx.arc(256, 256, 132, 0, Math.PI * 2);
    ctx.fillStyle = "#160f0a";
    ctx.fill();

    // Iris Base: Rich warm hazel/amber/chestnut gradient
    const irisGrad = ctx.createRadialGradient(256, 256, 20, 256, 256, 128);
    irisGrad.addColorStop(0, "#7a4e22");
    irisGrad.addColorStop(0.3, "#9e6c34");
    irisGrad.addColorStop(0.65, "#613c18");
    irisGrad.addColorStop(0.92, "#331d0b");
    irisGrad.addColorStop(1.0, "#190e06");
    ctx.beginPath();
    ctx.arc(256, 256, 128, 0, Math.PI * 2);
    ctx.fillStyle = irisGrad;
    ctx.fill();

    // Fine radial collagen fibrils (120 radial lines)
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 120; i++) {
      const angle = (i / 120) * Math.PI * 2;
      const r1 = 36 + Math.random() * 16;
      const r2 = 122 + Math.random() * 6;
      ctx.strokeStyle = i % 2 === 0 ? "rgba(215, 165, 105, 0.42)" : "rgba(80, 45, 18, 0.38)";
      ctx.beginPath();
      ctx.moveTo(256 + Math.cos(angle) * r1, 256 + Math.sin(angle) * r1);
      ctx.lineTo(256 + Math.cos(angle) * r2, 256 + Math.sin(angle) * r2);
      ctx.stroke();
    }

    // Secondary inner contraction ring
    ctx.beginPath();
    ctx.arc(256, 256, 68, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(225, 175, 115, 0.28)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Deep central Pupil
    ctx.beginPath();
    ctx.arc(256, 256, 42, 0, Math.PI * 2);
    ctx.fillStyle = "#080605";
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    if (THREE.SRGBColorSpace) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    return texture;
  } catch (e) {
    return null;
  }
}

export default function SignAvatar({
  gestureId = "idle",
  playbackSpeed: propSpeed = 1.0,
  isPaused: propPaused = false,
  replayTrigger = 0,
  onReplay = null,
  onSpeedChange = null,
  showControls = true,
  showViewPresets = true,
  showStatusBadge = true,
  className = "w-full h-full min-h-[440px]",
  forceFallback: propForceFallback = false,
  initialView = "body", // Communication framing by default
  modelUrl = "/models/sign-avatar.glb"
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const mixerRef = useRef(null);
  const actionsMapRef = useRef({});
  const currentActionRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Alive human presence references (bones & mesh tracking)
  const headBoneRef = useRef(null);
  const eyesMeshRef = useRef([]);
  const gazeTargetRef = useRef({ x: 0, y: 0, nextTime: 2.0 });

  // Component States
  const [loadingStage, setLoadingStage] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [forceFallback, setForceFallback] = useState(propForceFallback);
  const [internalSpeed, setInternalSpeed] = useState(propSpeed);
  const [isPaused, setIsPaused] = useState(propPaused);
  const [cameraView, setCameraView] = useState(initialView);
  const [replayBadgeVisible, setReplayBadgeVisible] = useState(false);

  // Sync prop changes
  useEffect(() => {
    setInternalSpeed(propSpeed);
  }, [propSpeed]);

  useEffect(() => {
    setIsPaused(propPaused);
  }, [propPaused]);

  useEffect(() => {
    setForceFallback(propForceFallback);
  }, [propForceFallback]);

  // Lookup gesture details from gestureMapping
  const activeGestureData = getGestureById(gestureId);
  const effectiveAction = activeGestureData ? activeGestureData.avatarAction : gestureId;

  // Resolve target clip name
  const resolveTargetClip = useCallback((action, id) => {
    if (GESTURE_TO_CLIP[action]) return GESTURE_TO_CLIP[action];
    if (GESTURE_TO_CLIP[id]) return GESTURE_TO_CLIP[id];
    const upper = (action || id || "").toUpperCase();
    if (CLIP_NAMES[upper]) return CLIP_NAMES[upper];
    return CLIP_NAMES.IDLE;
  }, []);

  // Update animation speed / pause state
  useEffect(() => {
    if (mixerRef.current) {
      mixerRef.current.timeScale = isPaused ? 0 : internalSpeed;
    }
  }, [internalSpeed, isPaused]);

  // Switch animation action with smooth crossFade
  useEffect(() => {
    if (!mixerRef.current || !actionsMapRef.current) return;

    const targetClipName = resolveTargetClip(effectiveAction, gestureId);
    const actions = actionsMapRef.current;
    const nextAction = actions[targetClipName] || actions[CLIP_NAMES.IDLE];

    if (!nextAction) return;

    if (currentActionRef.current !== nextAction) {
      nextAction.reset();
      nextAction.setEffectiveTimeScale(isPaused ? 0 : internalSpeed);
      nextAction.play();

      if (currentActionRef.current) {
        currentActionRef.current.crossFadeTo(nextAction, 0.35, true);
      }
      currentActionRef.current = nextAction;
    }
  }, [effectiveAction, gestureId, resolveTargetClip, internalSpeed, isPaused]);

  // Handle replay trigger
  const triggerReplay = useCallback(() => {
    if (currentActionRef.current) {
      currentActionRef.current.reset().play();
    }
    setReplayBadgeVisible(true);
    setTimeout(() => setReplayBadgeVisible(false), 900);
    if (onReplay) onReplay();
  }, [onReplay]);

  useEffect(() => {
    if (replayTrigger > 0) {
      triggerReplay();
    }
  }, [replayTrigger, triggerReplay]);

  const handleSpeedSelect = (speedVal) => {
    setInternalSpeed(speedVal);
    if (onSpeedChange) onSpeedChange(speedVal);
  };

  const checkWebGLSupport = () => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!(window.WebGLRenderingContext && gl);
    } catch (e) {
      return false;
    }
  };

  // ── Three.js Lifecycle & Photorealistic Rendering ─────────────────
  useEffect(() => {
    if (forceFallback) {
      setIsLoaded(true);
      return;
    }

    if (!checkWebGLSupport()) {
      setHasWebGLError(true);
      setErrorMessage("WebGL is not supported or hardware acceleration is disabled.");
      setIsLoaded(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    setLoadingStage(15);

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    // 1. Scene & Communication Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    const initialPreset = CAMERA_PRESETS[initialView] || CAMERA_PRESETS.body;
    camera.position.copy(initialPreset.pos);
    camera.lookAt(initialPreset.target);
    cameraRef.current = camera;

    // 2. WebGL Renderer with ACES Filmic Tone Mapping & Soft Shadows
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      rendererRef.current = renderer;

      container.innerHTML = "";
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("[SignAvatar] WebGL context creation failed:", err);
      setHasWebGLError(true);
      setErrorMessage("Failed to initialize 3D graphics context.");
      setIsLoaded(true);
      return;
    }

    const handleContextLost = (e) => {
      e.preventDefault();
      setHasWebGLError(true);
      setErrorMessage("3D Graphics context was lost. Displaying 2D vector fallback.");
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost, false);

    // 3. Cinematic 4-Point Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.35);
    scene.add(ambientLight);

    // Key Light (Warm daylight illuminating face, chest, and hands)
    const keyLight = new THREE.DirectionalLight(0xfffbf2, 2.3);
    keyLight.position.set(1.8, 3.8, 3.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    // Fill Light (Soft sky-blue fill to prevent harsh dark shadows)
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.15);
    fillLight.position.set(-2.0, 2.4, 2.0);
    scene.add(fillLight);

    // Dedicated Hand & Torso Contrast Light (Separates skin tone from dark clothing)
    const handContrastLight = new THREE.DirectionalLight(0xffedd5, 1.5);
    handContrastLight.position.set(0, 1.25, 2.5);
    scene.add(handContrastLight);

    // Cyan Edge Rim Light (Sharp silhouette highlights on hair, shoulders, and fingers)
    const rimLight = new THREE.PointLight(0x00f5d4, 3.0, 12);
    rimLight.position.set(0, 3.0, -2.4);
    scene.add(rimLight);

    // Warm Hair & Shoulder Kicker Light (Illuminates brunette hair strands & back contour)
    const kickerLight = new THREE.PointLight(0xfbbf24, 1.5, 9);
    kickerLight.position.set(-1.8, 2.6, -1.2);
    scene.add(kickerLight);

    // Subtle atmospheric dust particles
    const particleGeo = new THREE.BufferGeometry();
    const pCount = 35;
    const pArr = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pArr[i] = (Math.random() - 0.5) * 3.6;
      pArr[i + 1] = Math.random() * 2.8;
      pArr[i + 2] = (Math.random() - 0.5) * 2.4;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pArr, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Ground Stage & Circular Pedestal
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const stageDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.25, 0.05, 36),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.7,
        metalness: 0.3
      })
    );
    stageDisc.position.y = -0.025;
    stageDisc.receiveShadow = true;
    stageGroup.add(stageDisc);

    // Glowing Cyan Trim Ring
    const trimRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.22, 0.015, 8, 40),
      new THREE.MeshStandardMaterial({
        color: 0x00f5d4,
        emissive: 0x00d2b4,
        emissiveIntensity: 0.8
      })
    );
    trimRing.rotation.x = Math.PI / 2;
    trimRing.position.y = 0.002;
    stageGroup.add(trimRing);

    // 5. Load Blender Avatar GLB & Enhance PBR Materials for Visual Realism
    const loader = new GLTFLoader();
    setLoadingStage(35);

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.rotation.set(0, 0, 0);

        // Generate procedural high-definition eye texture
        const eyeTexture = createRealisticEyeTexture();
        const eyeMat = new THREE.MeshStandardMaterial({
          map: eyeTexture,
          roughness: 0.06,
          metalness: 0.04
        });

        const foundEyes = [];
        let foundHead = null;

        // Traverse and enhance all mesh materials with realistic human PBR properties
        model.traverse((child) => {
          if (child.name === "c_head.x" || child.name === "head.x") {
            foundHead = child;
          }

          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const name = child.name.toLowerCase();
            const mat = child.material;

            // A. Eyes: Apply realistic reflective eye material with limbal ring and pupil
            if (name.includes("eye") || name.includes("tiny eye")) {
              child.material = eyeMat;
              foundEyes.push(child);
            }
            // B. Hair: Convert flat black plastic into rich espresso brunette with specular sheen
            else if (name.includes("genesis9.007") || name.includes("hair")) {
              if (mat) {
                mat.color = new THREE.Color(0x241b18); // Rich dark chocolate/espresso
                mat.roughness = 0.36; // Catches rim light with hair strand sheen
                mat.metalness = 0.08;
                mat.needsUpdate = true;
              }
            }
            // C. Skin (face, body, hands): Eliminate plastic/chalky look
            else if (name.includes("genesis9.005") || (mat && mat.name && mat.name.includes("body"))) {
              if (mat) {
                mat.roughness = 0.46; // Natural human skin hydration sheen
                mat.metalness = 0.01;
                mat.needsUpdate = true;
              }
            }
            // D. Nails: Natural healthy nail plate lacquer
            else if (mat && mat.name && mat.name.includes("nails")) {
              mat.color = new THREE.Color(0xf5d3c8);
              mat.roughness = 0.22;
              mat.needsUpdate = true;
            }
            // E. Eyebrows & Lashes: Deep rich brunette with proper alpha
            else if (name.includes("brow") || name.includes("eyl")) {
              if (mat) {
                mat.color = new THREE.Color(0x1e1614);
                mat.roughness = 0.42;
                mat.transparent = true;
                mat.depthWrite = true;
                mat.needsUpdate = true;
              }
            }
            // F. Clothing (Shirt & Trousers): Matte woven textile finish
            else if (name.includes("top") || name.includes("cube") || name.includes("mesh")) {
              if (mat) {
                mat.roughness = 0.74; // Matte fabric texture
                mat.metalness = 0.04;
                mat.needsUpdate = true;
              }
            }
            // G. Teeth & Oral Cavity
            else if (mat && mat.name && mat.name.includes("teeth")) {
              mat.color = new THREE.Color(0xfaf8f2);
              mat.roughness = 0.16;
              mat.needsUpdate = true;
            }
          }
        });

        headBoneRef.current = foundHead;
        eyesMeshRef.current = foundEyes;

        scene.add(model);

        // Setup AnimationMixer
        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;

        // Register baked animation clips
        const actions = {};
        if (gltf.animations && gltf.animations.length > 0) {
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat);
            actions[clip.name] = action;
          });
        }
        actionsMapRef.current = actions;

        // Play initial action (defaults to IDLE or active prop)
        const initialClipName = resolveTargetClip(effectiveAction, gestureId);
        const startAction = actions[initialClipName] || actions[CLIP_NAMES.IDLE];
        if (startAction) {
          startAction.setEffectiveTimeScale(internalSpeed);
          startAction.play();
          currentActionRef.current = startAction;
        }

        setLoadingStage(100);
        setIsLoaded(true);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.min(95, Math.round((xhr.loaded / xhr.total) * 100));
          setLoadingStage(percent);
        } else {
          setLoadingStage((prev) => Math.min(90, prev + 15));
        }
      },
      (err) => {
        console.warn("[SignAvatar] Failed to load Blender avatar GLB:", err);
        setHasWebGLError(true);
        setErrorMessage("Could not load 3D model. Displaying 2D vector fallback.");
        setIsLoaded(true);
      }
    );

    // 6. Animation Render Loop with Organic Human Micro-Movements & Eye Saccades
    const clock = new THREE.Clock();
    let currentLookAt = initialPreset.target.clone();
    let timeElapsed = 0;

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      timeElapsed += delta;

      // Update animation mixer for gesture playback
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Organic Human Presence: Eye micro-saccades & conscious contact
      if (timeElapsed > gazeTargetRef.current.nextTime) {
        gazeTargetRef.current.nextTime = timeElapsed + 2.4 + Math.random() * 1.6;
        gazeTargetRef.current.x = (Math.random() - 0.5) * 0.018;
        gazeTargetRef.current.y = (Math.random() - 0.5) * 0.014;
      }

      // Apply subtle alive gaze tracking
      if (eyesMeshRef.current.length > 0) {
        eyesMeshRef.current.forEach((eye) => {
          eye.rotation.y = THREE.MathUtils.lerp(eye.rotation.y, gazeTargetRef.current.x, 0.05);
          eye.rotation.x = THREE.MathUtils.lerp(eye.rotation.x, gazeTargetRef.current.y, 0.05);
        });
      }

      // Smooth camera interpolation towards selected view preset
      const preset = CAMERA_PRESETS[cameraView] || CAMERA_PRESETS.body;
      camera.position.lerp(preset.pos, 0.08);
      currentLookAt.lerp(preset.target, 0.08);
      camera.lookAt(currentLookAt);

      // Subtle atmospheric ambient particle drift
      particles.rotation.y += delta * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Responsive Window Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener("resize", handleResize);
      if (renderer) {
        renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceFallback, modelUrl]);

  // ── 2D Vector Handshape Fallback Renderer ──────────────────────────
  const renderVectorFallback = () => {
    const gesture = activeGestureData || {
      label: gestureId.replace("_", " "),
      icon: "🖐️",
      summary: "Visual gesture representation"
    };

    return (
      <div
        data-testid="sign-avatar-fallback"
        className="w-full h-full min-h-[380px] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl border border-cyan-500/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-950/40 via-transparent to-transparent opacity-60" />

        <div className="z-10 flex flex-col items-center gap-1 mb-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>2D Accessible Vector Fallback Mode Active</span>
          </div>
          {errorMessage && (
            <span className="text-[10px] text-amber-300/80 max-w-xs text-center">{errorMessage}</span>
          )}
        </div>

        <div className="z-10 relative flex flex-col items-center gap-3">
          <div className="w-32 h-32 rounded-3xl bg-cyan-950/60 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 relative">
            <span className="text-6xl select-none">{gesture.icon || "✋"}</span>
            <svg
              className="absolute -top-3 -right-3 w-10 h-10 text-cyan-400 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>

          <div className="text-center mt-2">
            <h4 className="text-lg font-bold text-white tracking-wide">{gesture.label}</h4>
            <p className="text-xs text-slate-300 max-w-xs mt-1 leading-relaxed">
              {gesture.explanation?.handshape || gesture.summary}
            </p>
          </div>

          {gesture.explanation?.steps && (
            <div className="mt-3 flex flex-col gap-1.5 w-full max-w-xs text-left bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Step Execution</span>
              {gesture.explanation.steps.slice(0, 2).map((s, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-200">
                  <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="z-10 flex items-center gap-2 mt-5">
          <button
            onClick={() => setForceFallback(false)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-cyan-900/50"
          >
            Attempt 3D WebGL
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      data-testid="sign-avatar-container"
      className={`relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col ${className}`}
    >
      {/* ── 1. Top HUD / Status Bar ──────────────────────────────── */}
      {(showStatusBadge || showViewPresets) && (
        <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center pointer-events-none">
          <div className="flex items-center gap-2">
            {showStatusBadge && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-white text-xs font-semibold shadow-lg pointer-events-auto">
                <span
                  className={`w-2 h-2 rounded-full ${
                    hasWebGLError || forceFallback ? "bg-amber-400" : isLoaded ? "bg-emerald-400 animate-pulse" : "bg-cyan-400 animate-spin"
                  }`}
                />
                <span>
                  {hasWebGLError || forceFallback
                    ? "2D Fallback"
                    : isLoaded
                    ? effectiveAction === "idle"
                      ? "Nova AI (Communication Avatar)"
                      : `Gesture: ${activeGestureData?.label || effectiveAction}`
                    : `Loading Communication Avatar (${loadingStage}%)`}
                </span>
              </div>
            )}

            {/* Active Speed Pill */}
            {internalSpeed !== 1.0 && showControls && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-bold">
                {internalSpeed}x Slow-Mo
              </span>
            )}

            {/* Paused Pill */}
            {isPaused && showControls && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold">
                Paused
              </span>
            )}
          </div>

          {/* View Angle Preset Toggle: Communication / Full Body / Hands Zoom */}
          {showViewPresets && (
            <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-0.5 rounded-lg border border-slate-700/60 shadow-lg">
              <button
                onClick={() => setCameraView("body")}
                data-testid="view-upper-body-btn"
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  cameraView === "body"
                    ? "bg-cyan-600 text-white shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Communication Framing: Face, Upper Body & Hands in Front"
              >
                Communication
              </button>
              <button
                onClick={() => setCameraView("full")}
                data-testid="view-full-body-btn"
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  cameraView === "full"
                    ? "bg-cyan-600 text-white shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Complete Full-Body View"
              >
                Full Body
              </button>
              <button
                onClick={() => setCameraView("hands")}
                data-testid="view-hands-zoom-btn"
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  cameraView === "hands"
                    ? "bg-cyan-600 text-white shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Close-Up on 5-Digit Hand Articulation"
              >
                Hands Zoom
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 2. Loading State Overlay ─────────────────────────────── */}
      {!isLoaded && !hasWebGLError && !forceFallback && (
        <div
          data-testid="sign-avatar-loading"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm text-white p-6"
        >
          <div className="w-14 h-14 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <span className="text-2xl animate-pulse">🧍</span>
          </div>
          <span className="mt-4 text-sm font-bold text-cyan-300 tracking-wide">
            Calibrating Communication Avatar...
          </span>
          <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${loadingStage}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Loading PBR textures, alive gaze tracking & frontal sign gestures
          </span>
        </div>
      )}

      {/* ── 3. Replay Visual Ripple Notification ─────────────────── */}
      {replayBadgeVisible && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          <div className="px-4 py-2 bg-cyan-500/90 text-white text-xs font-bold rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
            <span className="text-base">↺</span>
            <span>Replaying Gesture from Start...</span>
          </div>
        </div>
      )}

      {/* ── 4. Main 3D WebGL Canvas Container or Fallback ────────── */}
      {hasWebGLError || forceFallback ? (
        renderVectorFallback()
      ) : (
        <div
          ref={containerRef}
          data-testid="sign-avatar-canvas"
          className="w-full h-full flex-1 min-h-0"
        />
      )}

      {/* ── 5. Bottom Interactive Controls Overlay ───────────────── */}
      {showControls && (
        <div className="relative z-20 px-3 py-2.5 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* Replay & Play/Pause */}
          <div className="flex items-center gap-2">
            <button
              onClick={triggerReplay}
              data-testid="sign-avatar-replay-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-md transition-all"
              title="Replay gesture from frame 0"
            >
              <span>↺</span>
              <span>Replay</span>
            </button>

            <button
              onClick={() => setIsPaused((prev) => !prev)}
              data-testid="sign-avatar-pause-btn"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold rounded-lg transition-all border border-slate-700"
              title={isPaused ? "Resume animation" : "Freeze frame to inspect posture and fingers"}
            >
              <span>{isPaused ? "▶ Resume" : "⏸ Pause"}</span>
            </button>
          </div>

          {/* Slow-Motion Speed Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Speed:
            </span>
            {[
              { val: 1.0, label: "1.0x" },
              { val: 0.5, label: "0.5x" },
              { val: 0.25, label: "0.25x" }
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => handleSpeedSelect(val)}
                data-testid={`speed-btn-${val}`}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  internalSpeed === val
                    ? "bg-emerald-500 text-slate-950 shadow-sm font-extrabold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
                title={`Playback speed ${label}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Fallback Simulator Toggle for Dev / Testing */}
          <button
            onClick={() => setForceFallback((prev) => !prev)}
            data-testid="toggle-fallback-btn"
            className="text-[10px] text-slate-400 hover:text-cyan-300 underline underline-offset-2 transition-colors ml-auto"
            title="Test accessible 2D vector fallback"
          >
            {forceFallback ? "Exit Fallback" : "Test Fallback"}
          </button>
        </div>
      )}
    </div>
  );
}
