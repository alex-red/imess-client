<template lang="pug">
.home-container
  //- .welcome
  //-   h1 Messages
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
          span {{msg.text}}
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
  data () {
    return {
      server: new Server('http://192.168.0.10', this, 44055, 'api'),
      msg: 'Hello World22!222',
      test: '',
      chats: [],
      conversations: [],
      conversations_current: [],
      coversations_current_target: '',
      messagesContainer: null
    }
  },
  mounted () {
    let vm = this
    this.server.getChats().then(data => {
      vm.chats = data
      this.loadMessage(data[0].ROWID)
    })
    this.messagesContainer = document.querySelector('.message-container')
  },
  methods: {
    loadMessage (chatTarget, chatId) {
      this.server.getMessages(chatId).then(data => {
        this.conversations_current = data
        this.conversations_current_target = chatTarget
        this.focus()
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
    },
    log (msg) {
      console.log(msg)
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
    // justify-content center
    padding .5em 1em .5em 1em
    // border 1px solid grey
    border-bottom .5px solid grey
    height 100px
    .chat-avatar
      align-self flex-start
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
      width 66%
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
    padding 1em
    border-radius 1em
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
