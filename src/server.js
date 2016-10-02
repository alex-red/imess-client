export default class Server {
  constructor (address, Vue, port = '44055', endpoint = 'api') {
    this.url = `${address}:${port}/${endpoint}`
    this.http = Vue.$http
  }

  GET (endpoint) {
    return this.http.get(this.url + `${endpoint}`).then((resp) => {
      return resp.data
    }, (resp) => {
      console.log(`Error! ${resp}`)
      return null
    })
  }

  POST (endpoint) {
    return this.http.post(this.url + `${endpoint}`).then((resp) => {
      return resp.data
    }, (resp) => {
      console.log(`Error! ${resp}`)
      return null
    })
  }

  getChats () { return this.GET('/chats') }

  getAttachments () { return this.GET('/attachments') }

  getMessages (chatId) { return this.GET(`/messages/${chatId}`) }

  postMessage (personId, msg) {
    return this.POST(`/message/${personId}/${msg}`)
  }

}
