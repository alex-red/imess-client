<template lang="pug">
.home-container
  .chats
    .chat(v-for="chat of chats")
      .chat-avatar
        i.material-icons account_circle
      .chat-name
        p: a(href="#" @click="loadMessage(chat.chat_identifier, chat.ROWID)") {{chat.chat_identifier}}
      .chat-time
  .conversations
    .message-container
      .message-wrapper(v-for="msg of conversations_current", :class="[msg.is_from_me ? 'sent' : 'recieved']")
        .message(@click="log(msg)")
          p(v-if="!msg.cache_has_attachments") {{msg.text}}
          .attachments(v-else)
            .audio-container(v-if="msg.is_audio_message")
              player(:url = "attachments[msg.ROWID].filename", :audiocontext="audiocontext")
            video(v-if="attachments[msg.ROWID].mime_type.includes('video')" controls preload)
              source(:src="attachments[msg.ROWID].filename")
            img(v-if="attachments[msg.ROWID].mime_type.includes('image')", :src="attachments[msg.ROWID].filename")
        //- .message-time
        //-   span {{msg.date_sent}}
        .message-read
    .new
      input#new-msg(@keyup.enter="newMessage" type="text" placeholder="iMessage")
      //- label(for="new-msg") Text
</template>

<script>
import Server from '../server.js'
import Vue from 'vue'
import Player from './Player'

class MSG {
  constructor (text) {
    this.text = text
    this.is_from_me = 1
    this.date_sent = new Date()
    this.date_read = new Date()
    this.is_sent = 0
    this.is_read = 0
    this.is_delivered = 0
    this.is_finished = 0
  }
}

export default {
  components: {
    Player
  },
  data () {
    return {
      // Load from config
      server_address: 'http://192.168.0.10:44055',
      server: new Server('http://192.168.0.10', this, 44055, 'api'),
      msg: 'Hello World22!222',
      test: '',
      attachments: {},
      chats: [],
      conversations: [],
      conversations_current: [],
      conversations_current_target: null,
      conversations_current_chatId: null,
      messagesContainer: null,
      refreshTimer: null,
      audiocontext: new (window.AudioContext || webkitAudioContext)()
    }
  },
  mounted () {
    // INIT
    this.load()
    this.messagesContainer = document.querySelector('.message-container')
    // Vue.nextTick(() => {
    //   this.loadMessage(this.chats[0].chat_identifier, this.chats[0].ROWID)
    // })
    // Start our update/refresh loop
    this.refreshTimer = window.setInterval(this.refresh, 1000)
  },
  beforeDestroy () {
    window.clearInterval(this.refreshTimer)
  },
  methods: {
    load () {
      this.server.getAttachments().then(data => {
        this.attachments = data.reduce((map, obj) => {
          obj.filename = `${this.server_address}${obj.filename}`
          map[obj.message_id] = obj
          return map
        }, {})
      })
      this.server.getChats().then(data => {
        this.chats = data
      })
      if (this.conversations_current_target) {
        this.loadMessage(this.conversations_current_target, this.conversations_current_chatId)
      }
    },
    loadMessage (chatTarget, chatId) {
      if (this.conversations_current_target !== chatTarget) {
        this.conversations_current_target = chatTarget
        this.conversations_current_chatId = chatId
      }
      this.server.getMessages(chatId).then(data => {
        if (this.conversations_current.length !== data.length) {
          this.conversations_current = data
          this.focus()
        }
      })
    },
    newMessage (evt) {
      if (!evt.target.value) return false
      this.server.postMessage(this.conversations_current_target, evt.target.value).then((resp) => {
        console.log(resp)
      })
      const msg = new MSG(evt.target.value)
      this.conversations_current.push(msg)
      evt.target.value = ''
      this.focus()
    },
    focus () {
      // Scroll conversations to bottom on data change
      Vue.nextTick(() => {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
      })
      // Ensure we scroll to bottom after attachments load
      // TODO: Make this more accurate...
      window.setTimeout(() => {
        Vue.nextTick(() => {
          this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
        })
      }, 500)
    },
    attachmentHandler () {
      console.log('test')
    },
    log (msg) {
      console.log(msg)
    },
    refresh () {
      // Refresh code goes here
      this.load()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
.home-container
  display flex
  height 100%
  width 100%
  flex-direction row
  
.chats
  height 100%
  display flex
  overflow-y auto
  overflow-x hidden
  flex-direction column
  background-color #F7F7F7
  // font-size 20px
  width 33%
  
  .chat
    display flex
    justify-content flex-start
    align-items center
    padding .5em 1em .5em 1em
    // border 1px solid grey
    border-bottom .5px solid grey
    height 100px
    .chat-avatar
      align-self center
      border-radius 25px
      width 50px
      height 50px
      background-color #C7C7CC
      i
        font-size 50px
    .chat-name
      display flex
      align-items flex-start

      height 100%
      width 80%
      p
        white-space nowrap
        overflow hidden
        padding-left .5em
        text-overflow ellipsis !important
        a
          font-weight 600
    
.conversations
  overflow-y auto
  display flex
  width 100%
  height 100%
  flex-direction column
  // padding 1em
  // border-left 1px solid grey
  -webkit-box-shadow 2px 0px 2px 2px #888
  box-shadow 2px 0px 2px 2px #888
  .message-container
    overflow-x hidden !important
    padding 1em
    flex 1 1 100%
    display flex
    flex-direction column
    overflow auto
  .message-wrapper
    max-width 66%
    flex-direction row
    margin-bottom 1em
  .message-time, .message-read
    padding 0 .5em 0 .5em
    float right
  .message
    overflow-wrap break-word
    // padding 1em
    border-radius 1em
    p
      padding 1em
      margin 0
    .attachments
      video
        width 100%
        height 100%
        border 1px solid grey
      img
        padding 0
        max-width 100%
      .audio-container
        width 100%
        height 100%
        display flex
    
  .sent
    align-self flex-end
    .message
      background-color #007AFF
      color white
  .recieved
    align-self flex-start
    .message
      background-color #E5E5EA
      color black
    .message-time
      order -1
      float left
      
  .new
    display flex
    flex 0 0 50px
    padding .5em 4em .5em .5em
    justify-content center
    align-items center
    bottom 0
    background-color #F7F7F7
    input
      width 100%
      height 90%
      font-size 16px
      // border-radius 1em
      padding 0 .5em 0 .5em
      outline none
a
  color black
  text-decoration none
  :hover
    color #5856D6
    
.center
  margin 0 auto
</style>
