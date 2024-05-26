import * as THREE from 'three'
import ReativeParticles from './entities/ReactiveParticles'
import * as dat from 'dat.gui'
import BPMManager from './managers/BPMManager'
import AudioManager from './managers/AudioManager'

export default class App {
  //THREE objects
  static holder = null
  static gui = null

  //Managers
  static audioManager = null
  static bpmManager = null

  constructor() {
    this.onClickBinder = () => this.init()
    document.addEventListener('click', this.onClickBinder)
    this.isAnimating = true; // Add this line
  }

  init() {
    document.removeEventListener('click', this.onClickBinder)

    //enter fullscreen if the user clicks anywhere on the screen
    document.documentElement.onclick = function() {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
          document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
          document.documentElement.msRequestFullscreen();
        }
      }
    }

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })

    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.autoClear = false
    document.querySelector('.content').appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000)
    this.camera.position.z = 12
    this.camera.frustumCulled = false

    this.scene = new THREE.Scene()
    this.scene.add(this.camera)

    App.holder = new THREE.Object3D()
    App.holder.name = 'holder'
    this.scene.add(App.holder)
    App.holder.sortObjects = false

    App.gui = new dat.GUI()

    this.createManagers()

    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  async createManagers() {
    //TODO add functionality to react to song switches via list
    App.audioManager = new AudioManager(this)
    await App.audioManager.loadAudioBuffer()

    App.bpmManager = new BPMManager()
    App.bpmManager.addEventListener('beat', () => {
      this.particles.onBPMBeat()
    })
    await App.bpmManager.detectBPM(App.audioManager.audio.buffer)

    document.querySelector('.user_interaction').remove()

    App.audioManager.play()


    this.particles = new ReativeParticles()
    this.particles.init()

    this.update()
  }

  resize() {
    this.width = window.innerWidth
    this.height = window.innerHeight

    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.width, this.height)
  }

  update() {
      if (this.isAnimating) {
        requestAnimationFrame(() => this.update())
        this.particles?.update()
        App.audioManager.update()
        this.renderer.render(this.scene, this.camera)
    }
  }

  // Add these methods to control the animation
  pauseAnimation() {
    this.isAnimating = false;
  }

  resumeAnimation() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.update();
    }
  }

  
}
