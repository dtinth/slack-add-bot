if (process.env.GIT_EMAIL) {
  require('child_process').execSync(
    `git config user.email ${process.env.GIT_EMAIL}`,
  )
}

const express = require('express')
const app = express()
const ObjectID = require('bson-objectid')
const services = require('./services')
const axios = require('axios')

app.use(require('body-parser').urlencoded({ extended: false, verify }))
app.use(require('body-parser').json({ verify }))
app.use(express.static('public'))

function verify(req, res, buf, encoding) {
  const ts = req.get('X-Slack-Request-Timestamp')
  const basestring = Buffer.concat([Buffer.from(`v0:${ts}:`), buf])
  const expected =
    'v0=' +
    require('crypto')
      .createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
      .update(basestring)
      .digest('hex')
  const actual = req.get('X-Slack-Signature')
  if (expected !== actual) {
    console.error('Invalid signature', { actual, expected })
    throw new Error('Invalid signature!')
  }
}

app.post('/add', async (req, res, next) => {
  const executionId = ObjectID.generate()
  const { text } = req.body
  const match = text.match(/^(\S+)\s+to\s+(.+)$/)
  if (!match) {
    res.json({ text: getUsage() })
    return
  }
  const logger = level => (...args) => {
    const text = `[${new Date().toJSON()}] ${level} - ${require('util').format(
      ...args,
    )}`
    console.log(`${executionId} ${text}`)
  }
  const service = services.get(match[2])
  if (!service) {
    res.json({ text: `Did not find service with a name "${match[2]}"` })
    return
  }
  res.json({ text: `Processing your request…`, response_type: 'in_channel' })
  try {
    try {
      const result = await service.instance.add(match[1], {
        log: logger('log'),
        warn: logger('warn'),
        error: logger('error'),
      })
      await axios.post(req.body.response_url, { text: result.text, response_type: 'in_channel' })
    } catch (e) {
      console.error(e)
      await axios.post(req.body.response_url, { text: `Failed to add: ${e}`, response_type: 'in_channel' })
    }
  } catch (e) {
    console.error(e)
  }
})

function getUsage() {
  return [
    '*Usage:* /add PERSON to SERVICE',
    '',
    '*Examples:*',
    '/add dtinth to service',
  ].join('\n')
}

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})
