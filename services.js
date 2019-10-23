const providers = require('./providers')

function discoverServices() {
  const availableServices = new Map()
  for (const k of Object.keys(process.env)) {
    const m = k.match(/^ADD_TO_(\S+)$/)
    if (m) {
      const splitted = process.env[k].split('?')
      const providerName = splitted.shift()
      try {
        const provider = providers[providerName]
        if (!provider) {
          throw new Error('Provider not found: ' + providerName)
        }
        const params = Object.fromEntries(
          new URLSearchParams(splitted.join('?')),
        )
        availableServices.set(m[1].toUpperCase(), {
          instance: provider.configure(params),
          providerName,
          params,
        })
      } catch (e) {
        console.error('Failed to configure service %s', m[1])
        throw e
      }
    }
  }
  return {
    availableServices,
    get(name) {
      return availableServices.get(`${name}`.toUpperCase().replace(/\s+/g, '_'))
    },
  }
}

module.exports = discoverServices()
