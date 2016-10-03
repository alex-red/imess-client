<template lang="pug">
.player(:id="id")
  p.message
  .control
    a.button
      i.material-icons(@click="playing = !playing" v-if="!playing") play_arrow
      i.material-icons(@click="playing = !playing" v-if="playing") pause
    .track
      .progress
      .scrubber
</template>

<script>
import Vue from 'vue'

export default {
  props: ['url', 'audiocontext'],
  data () {
    return {
      player: {},
      playing: false,
      id: null
    }
  },
  mounted () {
    // Generate unique ID from url
    this.id = this.url.split('/')[5].split('-').join('').toLowerCase()
    Vue.nextTick(() => {
      let playerElement = document.querySelector(`[id='${this.id}']`)
      this.player = new Player(this.url, playerElement, this.audiocontext)
    })
  }
}

function Player (url, el, audiocontext) {
  this.ac = audiocontext
  this.url = url
  this.el = el
  this.button = el.querySelector('.button')
  this.track = el.querySelector('.track')
  this.progress = el.querySelector('.progress')
  this.scrubber = el.querySelector('.scrubber')
  this.message = el.querySelector('.message')
  this.message.innerHTML = 'Loading'
  this.bindEvents()
  this.fetch()
}

Player.prototype.bindEvents = function () {
  this.button.addEventListener('click', this.toggle.bind(this))
  this.scrubber.addEventListener('mousedown', this.onMouseDown.bind(this))
  window.addEventListener('mousemove', this.onDrag.bind(this))
  window.addEventListener('mouseup', this.onMouseUp.bind(this))
}

Player.prototype.fetch = function () {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', this.url, true)
  xhr.responseType = 'blob'
  xhr.onload = function () {
    this.decode(xhr.response)
  }.bind(this)
  xhr.send()
}

Player.prototype.decode = function (blob) {
  const getArray = (blob, fn) => {
    const reader = new FileReader()
    reader.onload = e => {
      const data = new Uint8Array(e.target.result)
      fn(data)
    }
    reader.readAsArrayBuffer(blob)
  }

  const getSamples = (array) => {
    let samples = AMR.decode(array)
    playSamples(samples)
  }

  const playSamples = (samples) => {
    init(samples)
  }

  let that = this
  const init = (samples) => {
    that.buffer = that.ac.createBuffer(1, samples.length, 8000)
    if (that.buffer.copyToChannel) {
      that.buffer.copyToChannel(samples, 0, 0)
    } else {
      const channelBuffer = that.buffer.getChannelData(0)
      channelBuffer.set(samples)
    }
    that.message.innerHTML = ''
    that.draw()
    // that.play()
  }

  getArray(blob, getSamples)

  // this.ac.decodeAudioData(arrayBuffer, function (audioBuffer) {
  //   this.message.innerHTML = ''
  //   this.buffer = audioBuffer
  //   this.draw()
  //   this.play()
  // }.bind(this))
}

Player.prototype.connect = function () {
  if (this.playing) {
    this.pause()
  }
  this.source = this.ac.createBufferSource()
  this.source.buffer = this.buffer
  this.source.connect(this.ac.destination)
}

Player.prototype.play = function (position) {
  this.connect()
  if (this.position >= this.buffer.duration) {
    this.position = 0
  }
  this.position = typeof position === 'number' ? position : this.position || 0
  this.startTime = this.ac.currentTime - (this.position || 0)
  this.source.start(this.ac.currentTime, this.position)
  this.playing = true
}

Player.prototype.pause = function () {
  if (this.source) {
    this.source.stop(0)
    this.source = null
    this.position = this.ac.currentTime - this.startTime
    this.playing = false
  }
}

Player.prototype.seek = function (time) {
  if (this.playing) {
    this.play(time)
  } else {
    this.position = time
  }
}

Player.prototype.updatePosition = function () {
  this.position = this.playing
    ? this.ac.currentTime - this.startTime : this.position
  if (this.position >= this.buffer.duration) {
    this.position = this.buffer.duration
    this.pause()
  }
  return this.position
}

Player.prototype.toggle = function () {
  if (!this.playing) {
    this.play()
  } else {
    this.pause()
  }
}

Player.prototype.onMouseDown = function (e) {
  this.dragging = true
  this.startX = e.pageX
  this.startLeft = parseInt(this.scrubber.style.left || 0, 10)
}

Player.prototype.onDrag = function (e) {
  var width, position
  if (!this.dragging) {
    return
  }
  width = this.track.offsetWidth
  position = this.startLeft + (e.pageX - this.startX)
  position = Math.max(Math.min(width, position), 0)
  this.scrubber.style.left = position + 'px'
}

Player.prototype.onMouseUp = function () {
  var width, left, time
  if (this.dragging) {
    width = this.track.offsetWidth
    left = parseInt(this.scrubber.style.left || 0, 10)
    time = left / width * this.buffer.duration
    this.seek(time)
    this.dragging = false
  }
}

Player.prototype.draw = function () {
  let progress = (this.updatePosition() / this.buffer.duration)
  let width = this.track.offsetWidth
  if (this.playing) {
    this.button.classList.add('pause')
    this.button.classList.remove('play')
  } else {
    this.button.classList.add('play')
    this.button.classList.remove('pause')
  }
  this.progress.style.width = (progress * width) + 'px'
  if (!this.dragging) {
    this.scrubber.style.left = (progress * width) + 'px'
  }
  requestAnimationFrame(this.draw.bind(this))
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
* {
  box-sizing: border-box;
}

.player {
  margin: 0 auto;
  width: 300px;
}

.message {
  margin 0
}

.controls {
  background: #333;
  padding: 8px;
}

.button {
  color: white;
  width: 20px;
  margin: 3px 0 0 0;
  font-size: 16px;
  text-align: center;
  display: inline-block;
  cursor: pointer;
  background: transparent;
  border: none;
  outline: none;
}

.track {
  position: relative;
  width: 236px;
  margin: 7px 0 0 16px;
  height: 10px;
  border: 1px solid #666;
  display: inline-block;
  vertical-align: top;
}

.progress {
  position: absolute;
  width: 0%;
  height: 100%;
  background: #f00;
}

.scrubber {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin: -4px 0 0 -9px;
  background: #f00;
  border: solid 3px #ddd;
  cursor: pointer;
  box-shadow: 0 0 5px #000, inset 0 0 4px #400;
}
</style>
