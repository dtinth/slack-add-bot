if (process.env.GIT_EMAIL) {
  require('child_process').execSync(
    `git config user.email ${process.env.GIT_EMAIL}`,
  )
}

const express = require('express')
const basicAuth = require('express-basic-auth')
const app = express()
const tasks = require('./tasks')
const ObjectID = require('bson-objectid')

const authenticated = basicAuth({
  users: { admin: process.env.TASK_RUNNER_ADMIN_PASSWORD },
  challenge: true,
  realm: 'glitch-task-runner',
})

app.use(authenticated)
app.use(express.static('public'))

app.get('/tasks', async (req, res, next) => {
  res.json(
    Array.from(Object.entries(tasks)).map(([key, t]) => {
      return {
        name: key,
        description: t.description,
      }
    }),
  )
})

app.post('/tasks/:taskName', async (req, res, next) => {
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
    try {
      const result = await task.run({
        log: logger('log'),
        warn: logger('warn'),
        error: logger('error'),
      })
    } catch (e) {
      logger.error(`Task execution failed: ${(e && e.stack) || e}\n`)
    }
    res.end()
  } catch (e) {
    next(e)
  }
})

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})
