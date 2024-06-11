import * as THREE from 'three'

export default class AudioManager {
  //TODO add functionality to pass song path in constructor
  constructor(songPath = `./src/audio_files/Come 2gether-Hk5C6RpJ5N4.mp3`) {
    this.frequencyArray = []
    this.frequencyData = {
      low: 0,
      mid: 0,
      high: 0,
    }
    this.isPlaying = false
    this.lowFrequency = 10 //10Hz to 250Hz
    this.midFrequency = 150 //150Hz to 2000Hz
    this.highFrequency = 9000 //2000Hz to 20000Hz
    this.smoothedLowFrequency = 0
    this.audioContext = null
    this.songPath = songPath

    this.song = {
      url: this.songPath,
    }
  }

  async loadAudioBuffer() {
    // Load the audio file and create the audio buffer
    const promise = new Promise(async (resolve, reject) => {
      const audioListener = new THREE.AudioListener()
      this.audio = new THREE.Audio(audioListener)
      const audioLoader = new THREE.AudioLoader()

      audioLoader.load(this.song.url, (buffer) => {
        this.audio.setBuffer(buffer)
        this.audio.setLoop(true)
        this.audio.setVolume(0.5)
        this.audioContext = this.audio.context
        this.bufferLength = this.audioAnalyser.data.length
        resolve()
      })

      this.audioAnalyser = new THREE.AudioAnalyser(this.audio, 1024)
    })

    return promise
  }

  play() {
    if (!this.isPlaying) {
      this.audio.play()
      this.isPlaying = true
    
    }
    
  }

  pause() {
    if (this.isPlaying) {
      this.audio.pause()
      this.isPlaying = false
      
    }
    
  }

  collectAudioData() {
    this.frequencyArray = this.audioAnalyser.getFrequencyData()
  }

  analyzeFrequency() {
    // Calculate the average frequency value for each range of frequencies
    const lowFreqRangeStart = Math.floor((this.lowFrequency * this.bufferLength) / this.audioContext.sampleRate)
    const lowFreqRangeEnd = Math.floor((this.midFrequency * this.bufferLength) / this.audioContext.sampleRate)
    const midFreqRangeStart = Math.floor((this.midFrequency * this.bufferLength) / this.audioContext.sampleRate)
    const midFreqRangeEnd = Math.floor((this.highFrequency * this.bufferLength) / this.audioContext.sampleRate)
    const highFreqRangeStart = Math.floor((this.highFrequency * this.bufferLength) / this.audioContext.sampleRate)
    const highFreqRangeEnd = this.bufferLength - 1

    const lowAvg = this.normalizeValue(this.calculateAverage(this.frequencyArray, lowFreqRangeStart, lowFreqRangeEnd))
    const midAvg = this.normalizeValue(this.calculateAverage(this.frequencyArray, midFreqRangeStart, midFreqRangeEnd))
    const highAvg = this.normalizeValue(this.calculateAverage(this.frequencyArray, highFreqRangeStart, highFreqRangeEnd))

    this.frequencyData = {
      low: lowAvg,
      mid: midAvg,
      high: highAvg,
    }
  }

  calculateAverage(array, start, end) {
    let sum = 0
    for (let i = start; i <= end; i++) {
      sum += array[i]
    }
    return sum / (end - start + 1)
  }

  normalizeValue(value) {
    // Assuming the frequency values are in the range 0-256 (for 8-bit data)
    return value / 256
  }

  update() {
    if (!this.isPlaying) return

    this.collectAudioData()
    this.analyzeFrequency()
  }

  stopAndDispose() {
    // Stop the audio if it is playing
    this.audio.stop()
    this.isPlaying = false;
  
  }
}
