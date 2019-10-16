const tasks = require('./tasks')
require('dotenv').config()

Array.from(Object.entries(tasks))
  .reduce((cli, [key, task]) => {
    const logger = level => (...args) =>
      console.log(
        `[${new Date().toJSON()}] ${level} - ${require('util').format(
          ...args,
        )}`,
      )
    return cli.command(
      `${key}`,
      task.description || `Run task ${key}`,
      task.options || {},
      async args => {
        task.run({
          args,
          log: logger('log'),
          warn: logger('warn'),
          error: logger('error'),
        })
      },
    )
  }, require('tkt').cli())
  .parse()
