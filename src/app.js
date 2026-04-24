// Copyright (c) 2022 8th Wall, Inc.
//
// app.js is the main entry point for your 8th Wall app. Code here will execute after head.html
// is loaded, and before body.html is loaded.

import './index.css'

// Register custom A-Frame components in app.js before the scene in body.html has loaded.
import {tapPlaceComponent} from './tap-place'
AFRAME.registerComponent('tap-place', tapPlaceComponent)

// Minimal billboard: keeps an entity's orientation matched to the AR camera
// so that text labels always face the viewer as they move around the scene.
AFRAME.registerComponent('billboard', {
  tick() {
    const camera = this.el.sceneEl.camera
    if (camera) {
      this.el.object3D.quaternion.copy(camera.quaternion)
    }
  },
})

