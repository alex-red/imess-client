export function fetchBlob (url, callback) {
  let xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.responseType = 'blob'
  xhr.onload = function () {
    callback(this.response)
  }
  xhr.onerror = () => {
    alert(`Failed to fetch ${url}`)
  }
  xhr.send()
}

let theAudioContext = new AudioContext()
function getAudioContext () {
  if (!theAudioContext) {
    theAudioContext = new AudioContext()
  }
  return theAudioContext
}

export function convertAudioBlobToAmr (blob) {
  readBlob(blob, data => {
    const ctx = getAudioContext()
    ctx.decodeAudioData(data.buffer, audioBuffer => {
      let pcm
      if (audioBuffer.copyFromChannel) {
        pcm = new Float32Array(audioBuffer.length)
        audioBuffer.copyFromChannel(pcm, 0, 0)
      } else {
        pcm = audioBuffer.getChannelData(0)
      }
      const amr = AMR.encode(pcm, audioBuffer.sampleRate, 7)
      playAmrArray(amr)
    })
  })
}

export function readBlob (blob, callback) {
  const reader = new FileReader()
  reader.onload = e => {
    const data = new Uint8Array(e.target.result)
    callback(data)
  }
  reader.readAsArrayBuffer(blob)
}

export function playAmrBlob (blob, callback) {
  readBlob(blob, data => {
    playAmrArray(data)
  })
}

export function playAmrArray (array) {
  const samples = AMR.decode(array)
  if (!samples) {
    alert('Failed to decode!')
    return
  }
  playPcm(samples)
}

export function playPcm (samples) {
  const ctx = getAudioContext()
  const src = ctx.createBufferSource()
  const buffer = ctx.createBuffer(1, samples.length, 8000)
  if (buffer.copyToChannel) {
    buffer.copyToChannel(samples, 0, 0)
  } else {
    const channelBuffer = buffer.getChannelData(0)
    channelBuffer.set(samples)
  }
  src.buffer = buffer
  src.connect(ctx.destination)
  src.start()
}
