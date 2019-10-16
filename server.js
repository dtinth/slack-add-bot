if (process.env.GIT_EMAIL) {
  require('child_process').execSync(
    `git config user.email ${process.env.GIT_EMAIL}`,
  )
}

const express = require('express')
const basicAuth = require('express-basic-auth')
const app = express()
const tasks = require('./tasks')

const authenticated = basicAuth({
  users: { admin: process.env.ADMIN_PASSWORD },
  challenge: true,
  realm: 'glitch-task-runner',
})

app.use(authenticated)
app.use(express.static('public'))

app.post('/tasks/:taskName', async (req, res, next) => {
  const taskName = req.params.taskName
  try {
    if (!Object.keys(tasks).includes(taskName)) {
      throw new Error(`Task "${taskName}" not found`)
    }
    const task = tasks[taskName]
    await task.run({})
    res.end()
  } catch (e) {
    next(e)
  }
})

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})
