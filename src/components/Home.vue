<template lang="pug">
.home-container
  .welcome
    h1 Messages
  .content-container.mdl-grid.mdl-layout
    .chats.mdl-cell.mdl-cell--4-col
      .chat(v-for="chat of chats")
        a(href="#" @click="loadMessage(chat.ROWID)"): span {{chat.chat_identifier}}
    .conversations.mdl-cell.mdl-cell--8-col
      .message(v-for="msg of conversations_current", :class="[msg.is_from_me ? 'sent' : 'recieved']")
        span(@click="log(msg)") {{msg.text}}
      .new.mdl-cell.mdl-cell--8-col
        input#new-msg(type="text" placeholder="iMessage")
        //- label(for="new-msg") Text
</template>

<script>
import Server from '../server.js'
import Vue from 'vue'

export default {
  data () {
    return {
      server: new Server('http://192.168.0.10', this, 44055, 'api'),
      msg: 'Hello World22!222',
      chats: [],
      conversations: [],
      conversations_current: []
    }
  },
  mounted () {
    let vm = this
    this.server.getChats().then(data => {
      vm.chats = data
    })
  },
  methods: {
    loadMessage (chatId) {
      this.server.getMessages(chatId).then(data => {
        this.conversations_current = data
        Vue.nextTick(() => this.focus())
      })
    },
    focus () {
      // Scroll conversations to bottom on data change
      const container = document.querySelector('.conversations')
      container.scrollTop = container.scrollHeight
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
  flex-direction column
  justify-content center
  align-items center
  
.content-container
  display flex
  padding 0
.chats
  display flex
  flex-direction column
  font-size 24px
  overflow-y auto
  .chat
    display flex
    align-items center
    justify-content center
    border 1px solid grey
    height 100px
.conversations
  display flex
  overflow-y auto
  flex-direction column
  padding 1em
  margin-bottom 51px
  border 1px solid grey
  .message
    border-radius 1em
    min-width 10%
    max-width 66%
    padding 1em
    margin-bottom 1em
    &.sent
      align-self flex-end
      background-color #007AFF
      color white
    &.recieved
      background-color #F7F7F7
      align-self flex-start
      color black
  .new
    position absolute
    display flex
    justify-content center
    align-items center
    border 1px solid grey
    bottom 0
    margin-left -15px
    padding-left 1em
    padding-right 1em
    height 50px
    background-color #F7F7F7
    input
      width 100%
      border-radius 1em
      outline none
      padding 5px
a
  color black
  text-decoration none
  :hover
    color #5856D6
    
.center
  margin 0 auto
</style>
