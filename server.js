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
  require('crypto').createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
}

app.post('/add', async (req, res, next) => {
  const taskName = req.params.taskName
  const executionId = ObjectID.generate()
  try {
    if (!Object.keys(tasks).includes(taskName)) {
      throw new Error(`Task "${taskName}" not found`)
    }
    res.set('Content-Type', 'text/plain')
    const task = tasks[taskName]
    const logger = level => (...args) => {
      const text = `[${new Date().toJSON()}] ${level} - ${require('util').format(
        ...args,
      )}`
      res.write(`${text}\r\n`)
      console.log(`${executionId} ${text}`)
    }
    const args = Object.fromEntries(
      Object.entries(req.body || {})
        .filter(([k]) => k.startsWith('args[') && k.endsWith(']'))
        .map(([k, v]) => [k.slice(5, -1), v]),
    )
    logger('log')('Received request with args', args)
    try {
      const result = await task.run({
        log: logger('log'),
        warn: logger('warn'),
        error: logger('error'),
        args: args,
      })
    } catch (e) {
      logger('error')(`Task execution failed: ${(e && e.stack) || e}\n`)
    }
    res.end()
  } catch (e) {
    next(e)
  }
})

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})
