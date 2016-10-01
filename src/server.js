export default class Server {
  constructor (address, Vue, port = '44055', endpoint = 'api') {
    this.url = `${address}:${port}/${endpoint}`
    this.http = Vue.$http
  }

  getChats () {
    return this.http.get(this.url).then((resp) => {
      return resp.data
    }, (resp) => {
      console.log(`Error! ${resp}`)
      return null
    })
  }

  getMessages (chatId) {
    return this.http.get(this.url + `/messages/${chatId}`).then((resp) => {
      return resp.data
    }, (resp) => {
      console.log(`Error! ${resp}`)
      return null
    })
  }
}
