const APPNAME = require('./appname')
const { server } = require('./'+ APPNAME + '/app')
const { API_PORT } = require('./'+ APPNAME + '/config')
console.log(APPNAME, process.env.NODE_ENV, API_PORT)

server.listen(API_PORT, () => {
  console.log('REST API listening on port ' + API_PORT)
})
