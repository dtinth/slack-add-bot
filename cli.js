const tasks = require('./tasks')
require('dotenv').config()

Object.entries(tasks)
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
      Object.fromEntries(
        Object.entries(task.options || {}).map(([name, option]) => {
          return [
            name,
            {
              description: option.description || `Argument "${name}"`,
              demand: true,
              type: 'string',
            },
          ]
        }),
      ),
      async args => {
        return task.run({
          args,
          log: logger('log'),
          warn: logger('warn'),
          error: logger('error'),
        })
      },
    )
  }, require('tkt').cli())
  .parse()
