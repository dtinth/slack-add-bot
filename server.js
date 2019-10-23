if (process.env.GIT_EMAIL) {
  require('child_process').execSync(
    `git config user.email ${process.env.GIT_EMAIL}`,
  )
}

const express = require('express')
const app = express()
const tasks = require('./tasks')
const ObjectID = require('bson-objectid')

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
  const taskName = req.params.taskName
  const executionId = ObjectID.generate()
  try {
    res.json({ text: 'meow' })
  } catch (e) {
    next(e)
  }
})

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})
