'use client'

import { useEffect, useRef } from 'react'

/* ── Speaker Data — matches real voice catalog ── */
const SPEAKERS = [
  // Hindi females (4)
  { name: 'Priya',  id: 'v006', lang: 'Hindi',   c1: [0.5, 0.0, 1.0], c2: [1.0, 0.0, 0.5] },
  { name: 'Kavya',  id: 'v007', lang: 'Hindi',   c1: [1.0, 0.0, 0.4], c2: [0.2, 0.0, 1.0] },
  { name: 'Divya',  id: 'v008', lang: 'Hindi',   c1: [0.0, 0.2, 1.0], c2: [0.5, 0.0, 1.0] },
  { name: 'Neha',   id: 'v009', lang: 'Hindi',   c1: [0.0, 1.0, 1.0], c2: [0.0, 0.4, 1.0] },
  // Hindi males (4)
  { name: 'Raj',    id: 'v015', lang: 'Hindi',   c1: [1.0, 0.6, 0.0], c2: [1.0, 0.0, 0.3] },
  { name: 'Aakash', id: 'v016', lang: 'Hindi',   c1: [0.0, 1.0, 0.3], c2: [0.0, 0.4, 0.2] },
  { name: 'Dev',    id: 'v017', lang: 'Hindi',   c1: [0.1, 0.0, 0.4], c2: [0.0, 0.2, 1.0] },
  { name: 'Sahil',  id: 'v018', lang: 'Hindi',   c1: [1.0, 0.9, 0.5], c2: [0.2, 0.5, 1.0] },
  // English females (5)
  { name: 'Aisha',  id: 'v001', lang: 'English', c1: [1.0, 0.0, 0.5], c2: [0.5, 0.0, 1.0] },
  { name: 'Zara',   id: 'v002', lang: 'English', c1: [0.6, 0.0, 1.0], c2: [0.0, 1.0, 1.0] },
  { name: 'Sophia', id: 'v003', lang: 'English', c1: [1.0, 0.6, 0.5], c2: [1.0, 0.9, 0.8] },
  { name: 'Maya',   id: 'v004', lang: 'English', c1: [0.0, 0.9, 1.0], c2: [1.0, 0.6, 0.0] },
  { name: 'Isha',   id: 'v005', lang: 'English', c1: [0.6, 0.0, 1.0], c2: [0.0, 1.0, 1.0] },
  // Marathi (3)
  { name: 'Meera',  id: 'v010', lang: 'Marathi', c1: [1.0, 0.3, 0.0], c2: [1.0, 0.0, 0.5] },
  { name: 'Omkar',  id: 'v019', lang: 'Marathi', c1: [0.0, 1.0, 0.5], c2: [0.5, 0.0, 1.0] },
  { name: 'Tejas',  id: 'v020', lang: 'Marathi', c1: [1.0, 0.4, 0.4], c2: [1.0, 0.8, 0.2] },
]

/* ── Config ── */
const RADIUS = 1.05
const GAP = 3.2
const CAM_Z = 7.5
const ACTIVE_S = 1.25
const IDLE_S = 0.88
const EASE = 0.06
const SCROLL_SPD = 2
const DETAIL = 40

/* ── GLSL Noise ── */
const NOISE_GLSL = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`

const VERT = NOISE_GLSL + `
uniform float uTime;
uniform float uAudio;
uniform float uActive;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;
void main(){
  vNormal=normal;vPosition=position;
  float noise=snoise(position*0.5+uTime*0.4);
  vNoise=noise;
  float displacement=noise*(0.04+uAudio*uActive*0.25);
  vec3 newPos=position+normal*displacement;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(newPos,1.0);
}`

const FRAG = `
precision highp float;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;
uniform float uActive;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;
void main(){
  vec3 viewDir=normalize(cameraPosition-vPosition);
  float fresnel=pow(1.0-dot(viewDir,vNormal),3.0);
  float mixFactor=smoothstep(-0.5,0.5,vNoise);
  vec3 baseColor=mix(uColor1,uColor2,mixFactor);
  vec3 finalColor=baseColor+(fresnel*uColor2*1.5);
  finalColor*=mix(0.25,1.0,uActive);
  gl_FragColor=vec4(finalColor,1.0);
}`

export default function VoiceGallery() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<HTMLButtonElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const nameEl = nameRef.current
    const playEl = playRef.current
    const dotsEl = dotsRef.current
    if (!wrap || !nameEl || !playEl || !dotsEl) return

    // Dynamic import three.js (client only)
    let destroyed = false
    import('three').then((THREE) => {
      if (destroyed) return

      /* State */
      type Item = {
        group: any; mesh: any; material: any;
        glow: any; label: any; name: string; c2: number[];
        index: number; extra: number; widthTotal: number;
        currentScale: number; currentActive: number;
      }
      const items: Item[] = []
      const scroll = { cur: 0, tgt: 0, last: 0 }
      let isDown = false, startX = 0, scrollPos = 0
      let activeIdx = 0, prevActiveIdx = -1
      let audioLevel = 0
      let isPlaying = false
      let currentAudio: HTMLAudioElement | null = null
      let voiceMap: Record<string, string> = {}
      let velocity = 0, lastPointerX = 0, lastPointerTime = 0
      let snapTimeout: ReturnType<typeof setTimeout>
      let wheelTimeout: ReturnType<typeof setTimeout>
      let globalTime = 0
      let raf = 0

      /* Renderer */
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(wrap.clientWidth, wrap.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      wrap.insertBefore(renderer.domElement, wrap.firstChild)

      /* Camera & Scene */
      const camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100)
      camera.position.z = CAM_Z
      const scene = new THREE.Scene()

      /* Fetch real voice catalog for preview URLs */
      fetch('/api/v1/voices')
        .then(r => r.json())
        .then(data => {
          if (data.voices) {
            for (const v of data.voices) {
              const firstName = (v.display_name || v.name || '').split(' ')[0]
              if (v.preview_urls?.default) {
                const url = v.preview_urls.default
                voiceMap[firstName.toLowerCase()] = url.startsWith('/') ? url : `/${url}`
              }
            }
          }
        })
        .catch(() => {})

      /* Glow texture */
      const gc = document.createElement('canvas')
      const gctx = gc.getContext('2d')!
      gc.width = 128; gc.height = 128
      const grad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64)
      grad.addColorStop(0, 'rgba(255,255,255,0.4)')
      grad.addColorStop(0.4, 'rgba(255,255,255,0.12)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      gctx.fillStyle = grad
      gctx.fillRect(0, 0, 128, 128)
      const glowTex = new THREE.CanvasTexture(gc)

      /* Label creator */
      function createLabel(text: string) {
        const c = document.createElement('canvas')
        const ctx = c.getContext('2d')!
        c.width = 256; c.height = 48
        ctx.font = '500 20px Inter, sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.globalAlpha = 0.8
        ctx.fillText(text, 128, 24)
        const tex = new THREE.CanvasTexture(c)
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.5 })
        const spr = new THREE.Sprite(mat)
        spr.scale.set(1.6, 0.3, 1)
        return spr
      }

      /* Create dots */
      for (let d = 0; d < SPEAKERS.length; d++) {
        const dot = document.createElement('div')
        dot.className = 'vg-dot'
        dotsEl.appendChild(dot)
      }

      /* Create spheres */
      const geo = new THREE.IcosahedronGeometry(RADIUS, DETAIL)
      const all = [...SPEAKERS, ...SPEAKERS]
      const wTotal = all.length * GAP

      all.forEach((sp, i) => {
        const mat = new THREE.ShaderMaterial({
          vertexShader: VERT, fragmentShader: FRAG,
          uniforms: {
            uTime: { value: Math.random() * 100 },
            uAudio: { value: 0 }, uActive: { value: 0 },
            uColor1: { value: new THREE.Color(sp.c1[0], sp.c1[1], sp.c1[2]) },
            uColor2: { value: new THREE.Color(sp.c2[0], sp.c2[1], sp.c2[2]) },
          }
        })
        const mesh = new THREE.Mesh(geo, mat)
        const grp = new THREE.Group()
        grp.add(mesh)

        const glowMat = new THREE.SpriteMaterial({
          map: glowTex,
          color: new THREE.Color(sp.c2[0], sp.c2[1], sp.c2[2]),
          transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending,
          depthTest: false, depthWrite: false,
        })
        const glow = new THREE.Sprite(glowMat)
        glow.scale.set(3.5, 3.5, 1)
        glow.position.z = -0.3
        grp.add(glow)

        const label = createLabel(sp.name)
        label.position.y = -RADIUS * ACTIVE_S - 0.32
        grp.add(label)

        scene.add(grp)
        const extra = (i * GAP >= wTotal / 2) ? wTotal : 0

        items.push({
          group: grp, mesh, material: mat, glow, label,
          name: sp.name, c2: sp.c2, index: i,
          extra, widthTotal: wTotal,
          currentScale: IDLE_S, currentActive: 0,
        })
      })

      /* Viewport */
      function getVW() {
        const fov = (camera.fov * Math.PI) / 180
        const h = 2 * Math.tan(fov / 2) * camera.position.z
        return h * camera.aspect
      }

      /* Update */
      function updatePositions() {
        const vw = getVW()
        const dir = scroll.cur > scroll.last ? 'right' : 'left'
        let closestDist = Infinity, closestIdx = 0

        for (let i = 0; i < items.length; i++) {
          const it = items[i]
          const posX = it.index * GAP - scroll.cur - it.extra
          it.group.position.x = posX

          const dist = Math.abs(posX)
          if (dist < closestDist) { closestDist = dist; closestIdx = i }

          const edge = vw / 2 + GAP
          if (dir === 'right' && posX + RADIUS < -edge) it.extra -= it.widthTotal
          if (dir === 'left' && posX - RADIUS > edge) it.extra += it.widthTotal
        }

        activeIdx = closestIdx

        for (let j = 0; j < items.length; j++) {
          const it = items[j]
          const isActive = j === activeIdx
          const tA = isActive ? 1.0 : 0.0
          const tS = isActive ? ACTIVE_S : IDLE_S

          it.currentActive += (tA - it.currentActive) * 0.08
          it.currentScale += (tS - it.currentScale) * 0.08

          it.mesh.scale.setScalar(it.currentScale)
          it.material.uniforms.uActive.value = it.currentActive

          // Float
          it.group.position.y = Math.sin(globalTime * 0.8 + it.index * 0.7) * 0.12

          // Label
          it.label.position.y = -it.currentScale * RADIUS - 0.32
          it.label.material.opacity += ((isActive ? 0.9 : 0.3) - it.label.material.opacity) * 0.08

          // Glow
          it.glow.material.opacity += (it.currentActive * 0.45 - it.glow.material.opacity) * 0.08
        }

        // Name fade
        if (activeIdx !== prevActiveIdx) {
          if (isPlaying) stopAudio()
          nameEl!.style.opacity = '0'
          setTimeout(() => {
            nameEl!.textContent = items[activeIdx].name
            nameEl!.style.opacity = '1'
          }, 180)
          prevActiveIdx = activeIdx

          // Dots
          const si = activeIdx % SPEAKERS.length
          const dots = dotsEl!.children
          for (let d = 0; d < dots.length; d++) {
            dots[d].classList.toggle('active', d === si)
          }
        }
      }

      function snap() { scroll.tgt = Math.round(scroll.tgt / GAP) * GAP }

      /* Input */
      function onDown(e: MouseEvent | TouchEvent) {
        isDown = true
        startX = 'touches' in e ? e.touches[0].clientX : e.clientX
        scrollPos = scroll.cur
        velocity = 0; lastPointerX = startX; lastPointerTime = Date.now()
        clearTimeout(snapTimeout)
      }
      function onMove(e: MouseEvent | TouchEvent) {
        if (!isDown) return
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX
        const now = Date.now(); const dt = now - lastPointerTime
        if (dt > 5) { velocity = (lastPointerX - x) / dt; lastPointerX = x; lastPointerTime = now }
        scroll.tgt = scrollPos + (startX - x) * SCROLL_SPD * 0.015
      }
      function onUp() {
        if (!isDown) return
        isDown = false
        scroll.tgt += velocity * 180
        clearTimeout(snapTimeout)
        snapTimeout = setTimeout(snap, 450)
      }
      function onWheel(e: WheelEvent) {
        e.preventDefault()
        scroll.tgt += (e.deltaY > 0 ? 1 : -1) * SCROLL_SPD * 0.3
        clearTimeout(wheelTimeout)
        wheelTimeout = setTimeout(snap, 150)
      }
      function onKey(e: KeyboardEvent) {
        if (e.key === 'ArrowRight') { scroll.tgt += GAP; snap() }
        if (e.key === 'ArrowLeft') { scroll.tgt -= GAP; snap() }
      }
      function onResize() {
        camera.aspect = wrap!.clientWidth / wrap!.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(wrap!.clientWidth, wrap!.clientHeight)
      }

      wrap.addEventListener('mousedown', onDown)
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
      wrap.addEventListener('touchstart', onDown, { passive: true })
      window.addEventListener('touchmove', onMove as EventListener, { passive: true })
      window.addEventListener('touchend', onUp)
      wrap.addEventListener('wheel', onWheel, { passive: false })
      window.addEventListener('keydown', onKey)
      window.addEventListener('resize', onResize)

      /* Audio — real voice previews */
      function toggleAudio() {
        if (isPlaying) stopAudio(); else startAudio()
      }
      function startAudio() {
        const speaker = SPEAKERS[activeIdx % SPEAKERS.length]
        if (!speaker) return

        stopAudio()

        isPlaying = true
        playEl!.innerHTML = '&#9646;&#9646;'
        playEl!.classList.add('on')

        // Load static preview file from backend (bypassing Vercel proxy 404s)
        const API_BASE = 'https://voxar-production-95a3.up.railway.app'
        const audioUrl = `${API_BASE}/previews/${speaker.id}.wav`

        currentAudio = new Audio(audioUrl)
        currentAudio.play().catch(err => {
          console.warn('Gallery preview failed:', err)
          stopAudio()
        })
        currentAudio.onended = () => stopAudio()
      }
      function stopAudio() {
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.onended = null
          currentAudio = null
        }
        isPlaying = false; audioLevel = 0
        playEl!.innerHTML = '&#9654;'
        playEl!.classList.remove('on')
      }

      playEl.addEventListener('click', toggleAudio)

      /* Tick */
      function tick() {
        raf = requestAnimationFrame(tick)
        globalTime = performance.now() * 0.001
        scroll.cur += (scroll.tgt - scroll.cur) * EASE

        if (isPlaying) {
          audioLevel += (0.5 + Math.sin(globalTime * 3) * 0.3 - audioLevel) * 0.08
        } else { audioLevel *= 0.93 }

        for (const it of items) {
          it.material.uniforms.uTime.value += 0.01
          it.material.uniforms.uAudio.value = audioLevel
        }

        updatePositions()
        scroll.last = scroll.cur
        renderer.render(scene, camera)
      }
      tick()

      /* Cleanup on unmount */
      return () => {
        destroyed = true
        cancelAnimationFrame(raf)
        wrap.removeEventListener('mousedown', onDown)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        wrap.removeEventListener('touchstart', onDown)
        window.removeEventListener('touchmove', onMove as EventListener)
        window.removeEventListener('touchend', onUp)
        wrap.removeEventListener('wheel', onWheel)
        window.removeEventListener('keydown', onKey)
        window.removeEventListener('resize', onResize)
        playEl.removeEventListener('click', toggleAudio)
        stopAudio()
        renderer.dispose()
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
        dotsEl.innerHTML = ''
      }
    })

    return () => { destroyed = true }
  }, [])

  return (
    <section className="voice-gallery-section">
      <div className="container container--narrow">
        <div className="demo-header">
          <div className="section-tag">// Meet Our Voices</div>
          <h2 className="demo-title">Choose your speaker.</h2>
          <p className="features-subtitle" style={{ marginTop: '12px' }}>
            Swipe through our collection. Each voice has its own character.
          </p>
        </div>
      </div>
      <div className="vg-wrap" ref={wrapRef}>
        <div className="vg-fade l"></div>
        <div className="vg-fade r"></div>
        <div className="vg-ctrl">
          <div className="vg-speaker" ref={nameRef}>Priya</div>
          <button className="vg-play" ref={playRef}>&#9654;</button>
          <div className="vg-dots" ref={dotsRef}></div>
        </div>
      </div>
    </section>
  )
}
