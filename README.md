# glitch-task-runner

General-purpose task runner boilerplate.

## Usage

### Configuring

- Set your web admin password in `.env` using `TASK_RUNNER_ADMIN_PASSWORD`.

### Defining tasks

- Define tasks in `tasks.js`.

### Running tasks

- **Web:** Click _Show_ &rarr; _In a New Window_. Then login with `admin` user with the configured password.

- **CLI:** Click on _Tools_ &rarr; _Logs_, then click _Console_. Then type in `node cli <taskName>`.

- **API:** `http post https://admin:<admin-password>@<project>.glitch.me/tasks/<taskName>`
