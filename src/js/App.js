import * as THREE from 'three'
import ReativeParticles from './entities/ReactiveParticles'
import * as dat from 'dat.gui'
import BPMManager from './managers/BPMManager'
import AudioManager from './managers/AudioManager'
import Songs from '@/Songs.js'

export default class App {
  //THREE objects
  static holder = null
  static gui = null

  //Managers
  static audioManager = null
  static bpmManager = null
  static appInstance = null
  static currSongIndex = 0;

  constructor() {
    this.isAnimating = true; // Add this line
    App.appInstance = this
    this.onClickBinder = () => this.init()
    document.addEventListener('click', this.onClickBinder)
    this.animationFrameId = null;

  }

  init() {
    console.log("song", Songs.songList)
    document.removeEventListener('click', this.onClickBinder)

    
    document.documentElement.onclick = function(event) {
      //enter fullscreen if the user clicks anywhere on the screen 
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

    

    document.documentElement.onkeydown = function (event) {
      //pause/resume music when clicking leertaste 
      if (App.audioManager != null && event.key === ' ' ) {
        if (App.appInstance.isAnimating) {
          App.appInstance.pauseAnimation()
        } else {
          App.appInstance.resumeAnimation()
        }
      }
      
      if (event.key === 'ArrowRight') {
        App.appInstance.isAnimating = false;
        App.currSongIndex += 1

        App.appInstance.start(Songs.songList[App.currSongIndex])
        
        App.appInstance.isAnimating = true;
      } else if (event.key === 'ArrowLeft') {
        App.appInstance.isAnimating = false;
        App.currSongIndex -= 1

        App.appInstance.start(Songs.songList[App.currSongIndex])

        App.appInstance.isAnimating = true;
      }
    }

    this.start(Songs.songList[App.currSongIndex])
    
  }

  
    start(songPath) {
      // Dispose of previous instances if they exist
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      if (this.renderer) {
        this.renderer.dispose();
        document.querySelector('.content').removeChild(this.renderer.domElement);
      }
      if (App.gui) {
        App.gui.destroy();
      }
      // Assuming you have a method to stop and dispose of the current audio
      if (App.audioManager) {
        App.audioManager.stopAndDispose();
        App.audioManager = null;
      }
    
      // Recreate renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.autoClear = false;
      document.querySelector('.content').appendChild(this.renderer.domElement);
    
      // Recreate camera
      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);
      this.camera.position.z = 12;
      this.camera.frustumCulled = false;
    
      // Recreate scene
      this.scene = new THREE.Scene();
      this.scene.add(this.camera);
    
      // Reset or recreate holder
      if (App.holder) {
        // Assuming you have a method to properly dispose of or reset App.holder
        this.scene.remove(App.holder);
      }
      App.holder = new THREE.Object3D();
      App.holder.name = 'holder';
      this.scene.add(App.holder);
      App.holder.sortObjects = false;
    
      // Recreate GUI
      App.gui = new dat.GUI();
    
      // Load the song and other resources
      this.createManagers(songPath);
    
      // Resize listener
      // Consider removing the previous event listener if possible before adding a new one
      window.removeEventListener('resize', this.boundResize);
      this.boundResize = () => this.resize();
      window.addEventListener('resize', this.boundResize);
    }
  

  async createManagers(songPath) {
    App.audioManager = new AudioManager(songPath)
    await App.audioManager.loadAudioBuffer()

    App.bpmManager = new BPMManager()
    App.bpmManager.addEventListener('beat', () => {
      this.particles.onBPMBeat()
    })
    await App.bpmManager.detectBPM(App.audioManager.audio.buffer)

    try {
      document.querySelector('.user_interaction').remove()
    }catch(e) {}
      

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
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = requestAnimationFrame(() => this.update())
        this.particles?.update()
        App.audioManager.update()
  
        this.renderer.render(this.scene, this.camera)
    }
  }

  // Add these methods to control the animation
   pauseAnimation() {
    App.audioManager.pause()
    this.isAnimating = false;
  }

   resumeAnimation() {
    if (!this.isAnimating) {
      App.audioManager.play()
      this.isAnimating = true;
      this.update();
    }
  }

  
}
