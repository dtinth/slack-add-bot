if (process.env.GIT_EMAIL) {
  require('child_process').execSync(
    `git config user.email ${process.env.GIT_EMAIL}`,
  )
}

const express = require('express')
const basicAuth = require('express-basic-auth')
const app = express()
const tasks = require('./tasks')
const uuidv4 = require('uuid/v4')

const authenticated = basicAuth({
  users: { admin: process.env.TASK_RUNNER_ADMIN_PASSWORD },
  challenge: true,
  realm: 'glitch-task-runner',
})

app.use(authenticated)
app.use(express.static('public'))

app.get('/tasks', async (req, res, next) => {
  res.json(Array.from(Object.entries(tasks)).map(([key, t]) => {
    return {
      name: t,
    }
  }))
})

app.post('/tasks/:taskName', async (req, res, next) => {
  const taskName = req.params.taskName
  const executionId = uuidv4()
  try {
    if (!Object.keys(tasks).includes(taskName)) {
      throw new Error(`Task "${taskName}" not found`)
    }
    res.set('Content-Type', 'text/plain')
    const task = tasks[taskName]
    const logger = level => (...args) =>
      res.write(
        `[${new Date().toJSON()}] ${level} - ${require('util').format(
          ...args,
        )}`,
      )
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
