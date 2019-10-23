const { App } = require('@octokit/app')
const Octokit = require('@octokit/rest')

function getGitHubClient(installationId) {
  const app = new App({
    id: process.env.GH_APP_ID,
    privateKey: Buffer.from(
      process.env.GH_APP_PRIVATE_KEY_BASE64,
      'base64',
    ).toString(),
  })
  const octokit = new Octokit({
    async auth() {
      const installationAccessToken = await app.getInstallationAccessToken({
        installationId,
      })
      return `token ${installationAccessToken}`
    },
  })
  return octokit
}

exports.githubRepo = {
  configure(params) {},
}
