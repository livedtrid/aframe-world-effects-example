// tap-place.js – One-time AR planet placement with sequential label reveal

const PLANET_SCALE = '1.5 1.5 1.5'
const PLANET_LIFT  = 0.18          // metres the planet floats up during entrance
const SPIN_DUR     = 14000         // ms per full rotation
const ENTRANCE_DUR = 1400          // ms for scale + lift animation

const LABELS = [
  { text: 'Onboarding inteligente',    offset: '-2.40 1.80 0' },
  { text: 'Bem-estar digital',          offset:  '2.40 1.80 0' },
  { text: 'Crescimento contínuo',       offset: '-2.40 -0.80 0' },
  { text: 'Experiência personalizada',  offset:  '2.40 -0.80 0' },
]

export const tapPlaceComponent = {
  init() {
    this.modelPlaced    = false
    this.messagesRevealed = false

    const ground = document.getElementById('ground')
    this.prompt  = document.getElementById('promptText')

    ground.addEventListener('click', (event) => {
      if (this.modelPlaced) return
      this.modelPlaced = true
      this.prompt.style.display = 'none'
      this._spawnPlanet(event.detail.intersection.point)
    })
  },

  _spawnPlanet(touchPoint) {
    const planet = document.createElement('a-entity')
    planet.setAttribute('position', touchPoint)
    planet.setAttribute('gltf-model', '#planetModel')
    planet.setAttribute('class', 'cantap')
    planet.setAttribute('scale', '0.001 0.001 0.001')
    planet.setAttribute('visible', 'false')

    this.el.sceneEl.appendChild(planet)

    planet.addEventListener('model-loaded', () => {
      planet.setAttribute('visible', 'true')

      // — Scale entrance —
      planet.setAttribute('animation__scale', {
        property: 'scale',
        from: '0.20 0.20 0.20',
        to: PLANET_SCALE,
        dur: ENTRANCE_DUR,
        easing: 'easeOutCubic',
      })

      // — Upward float during entrance —
      planet.setAttribute('animation__lift', {
        property: 'position',
        from: `${touchPoint.x} ${touchPoint.y} ${touchPoint.z}`,
        to:   `${touchPoint.x} ${touchPoint.y + PLANET_LIFT} ${touchPoint.z}`,
        dur: ENTRANCE_DUR,
        easing: 'easeOutCubic',
      })

      // — Idle rotation – begins after entrance completes —
      setTimeout(() => {
        planet.setAttribute('animation__spin', {
          property: 'rotation',
          from: '0 0 0',
          to: '0 360 0',
          loop: true,
          dur: SPIN_DUR,
          easing: 'linear',
        })
      }, ENTRANCE_DUR)
    })

    // Tap model → reveal labels once
    planet.addEventListener('click', (e) => {
      e.stopPropagation()
      if (this.messagesRevealed) return
      this.messagesRevealed = true
      this._revealLabels(planet)
    })
  },

  _revealLabels(planet) {
    // Label container sits at planet's current world position but does NOT rotate
    const pos = planet.object3D.position

    const container = document.createElement('a-entity')
    container.setAttribute('position', { x: pos.x, y: pos.y, z: pos.z })
    this.el.sceneEl.appendChild(container)

    LABELS.forEach(({ text, offset }, i) => {
      setTimeout(() => {
        const label = document.createElement('a-entity')
        label.setAttribute('position', offset)
        label.setAttribute('billboard', '')       // custom component – faces camera
        label.setAttribute('scale', '0.001 0.001 0.001')
        container.appendChild(label)

        // Dark pill background for readability
        const bg = document.createElement('a-plane')
        bg.setAttribute('material', 'color: #080820; transparent: true; opacity: 0.80; shader: flat')
        bg.setAttribute('width',  '3.00')
        bg.setAttribute('height', '1.30')
        bg.setAttribute('position', '0 0 -0.005')
        label.appendChild(bg)

        // Text
        const textEl = document.createElement('a-entity')
        textEl.setAttribute('text', {
          value: text,
          color: '#FFFFFF',
          align: 'center',
          width: 2.75,
          wrapCount: 28,
        })
        label.appendChild(textEl)

        // Fade-in via scale
        label.setAttribute('animation__appear', {
          property: 'scale',
          from: '0.001 0.001 0.001',
          to: '5 5 5',
          dur: 480,
          easing: 'easeOutCubic',
        })
      }, i * 450 + 150)
    })
  },
}
