import '@testing-library/jest-dom';



jest.mock(
  'react-router-dom',
  () => ({
    BrowserRouter: ({ children }) => children,
    Routes: ({ children }) => children,
    Route: ({ element }) => element,
    Navigate: () => null,
    useParams: () => ({}),
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/' }),
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
    Link: ({ children, to }) => children,
  }),
  { virtual: true }
);

jest.mock('three', () => ({
  Scene: jest.fn(() => ({ add: jest.fn() })),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn(), lerp: jest.fn() },
    lookAt: jest.fn(),
    updateProjectionMatrix: jest.fn(),
    aspect: 1
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    shadowMap: {},
    domElement: { addEventListener: jest.fn(), removeEventListener: jest.fn() },
    render: jest.fn(),
    dispose: jest.fn()
  })),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(() => ({ position: { set: jest.fn() }, castShadow: false })),
  PointLight: jest.fn(() => ({ position: { set: jest.fn() } })),
  BufferGeometry: jest.fn(() => ({ setAttribute: jest.fn() })),
  BufferAttribute: jest.fn(),
  PointsMaterial: jest.fn(),
  Points: jest.fn(() => ({ rotation: {} })),
  Group: jest.fn(() => ({
    position: { set: jest.fn(), y: 0, z: 0 },
    rotation: { set: jest.fn(), x: 0, y: 0, z: 0 },
    scale: { set: jest.fn(), lerp: jest.fn(), y: 1 },
    add: jest.fn()
  })),
  MeshStandardMaterial: jest.fn(() => ({ emissiveIntensity: 0.5 })),
  MeshBasicMaterial: jest.fn(),
  MeshPhysicalMaterial: jest.fn(),
  CylinderGeometry: jest.fn(() => ({ scale: jest.fn() })),
  SphereGeometry: jest.fn(() => ({ scale: jest.fn() })),
  BoxGeometry: jest.fn(),
  ConeGeometry: jest.fn(() => ({ scale: jest.fn(), rotateX: jest.fn() })),
  TorusGeometry: jest.fn(() => ({ scale: jest.fn() })),
  PlaneGeometry: jest.fn(() => ({ scale: jest.fn() })),
  RingGeometry: jest.fn(() => ({ scale: jest.fn() })),
  ShadowMaterial: jest.fn(),
  Mesh: jest.fn(() => ({
    position: { set: jest.fn(), y: 0, z: 0 },
    rotation: { set: jest.fn(), x: 0, y: 0, z: 0 },
    scale: { set: jest.fn(), y: 1 }
  })),
  Clock: jest.fn(() => ({ getDelta: jest.fn(() => 0.016), getElapsedTime: jest.fn(() => 1.0) })),
  MathUtils: { lerp: jest.fn((a, b, t) => a + (b - a) * t) },
  Vector3: jest.fn((x, y, z) => ({ x, y, z })),
  AnimationMixer: jest.fn(() => ({
    clipAction: jest.fn(() => ({
      setEffectiveTimeScale: jest.fn().mockReturnThis(),
      setLoop: jest.fn().mockReturnThis(),
      play: jest.fn().mockReturnThis(),
      stop: jest.fn().mockReturnThis(),
      reset: jest.fn().mockReturnThis(),
      fadeIn: jest.fn().mockReturnThis(),
      fadeOut: jest.fn().mockReturnThis(),
      crossFadeTo: jest.fn().mockReturnThis()
    })),
    update: jest.fn(),
    stopAllAction: jest.fn(),
    timeScale: 1.0
  })),
  AnimationClip: {
    findByName: jest.fn((clips, name) => ({ name }))
  },
  LoopRepeat: 2201,
  LoopOnce: 2200,
  CanvasTexture: jest.fn(() => ({ needsUpdate: false, colorSpace: "" })),
  SRGBColorSpace: "srgb",
  PCFSoftShadowMap: 2,
  ACESFilmicToneMapping: 4,
  AdditiveBlending: 2
}));

jest.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn((url, onLoad) => {
      if (onLoad) {
        onLoad({
          scene: {
            traverse: jest.fn(),
            position: { set: jest.fn() },
            rotation: { set: jest.fn() },
            scale: { set: jest.fn() },
            add: jest.fn()
          },
          animations: [
            { name: "IDLE" },
            { name: "HELLO" },
            { name: "YES" },
            { name: "NO" },
            { name: "HELP" },
            { name: "THANK_YOU" },
            { name: "POINTING_UP" },
            { name: "VICTORY" },
            { name: "I_LOVE_YOU" },
            { name: "OPEN_PALM" },
            { name: "CLOSED_FIST" }
          ]
        });
      }
    })
  }))
}));
