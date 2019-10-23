const providers = require('./providers')

function discoverServices() {
  const availableServices = new Map()
  for (const k of Object.keys(process.env)) {
    const m = k.match(/^ADD_TO_(\S+)$/)
    if (m) {
      availableServices.add(m[1].toUpperCase(), )
    }
  }
  return {
    get(name) {
      return availableServices.get(`${name}`.toUpperCase())
    }
  }
}

module.exports = discoverServices()