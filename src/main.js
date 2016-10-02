import Vue from 'vue'
import App from './App'
import '../node_modules/material-design-lite/material.min.css'
import '../node_modules/material-design-lite/material.min.js'

Vue.use(require('vue-resource'))

/* eslint-disable no-new */
let vm = new Vue({
  el: '#app',
  render: h => h(App)
})

window.vm = vm
