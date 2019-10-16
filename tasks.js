module.exports = {
  async hello(context) {
    context.log('meow')
    await new Promise(r => setTimeout(r, 500))
    context.log('nyan')
    await new Promise(r => setTimeout(r, 500))
    context.log('whee')
    await new Promise(r => setTimeout(r, 500))
    return 'world'
  },
  async testError(context) {
    throw new Error('oops')
  }
}