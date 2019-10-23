const { App } = require('@octokit/app')
const Octokit = require('@octokit/rest')
const invariant = require('invariant')

function getGitHubClient(installationId) {
  const app = new App({
    id: process.env.GH_APP_ID || invariant(false, 'Missing ENV GH_APP_ID'),
    privateKey: Buffer.from(
      process.env.GH_APP_PRIVATE_KEY_BASE64 ||
        invariant(false, 'Missing ENV GH_APP_PRIVATE_KEY_BASE64'),
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
  configure(params) {
    const installationId = params.installationId || invariant(false, 'Missing param installationId')
    const owner = params.owner || invariant(false, 'Missing param owner')
    const repo = params.repo || invariant(false, 'Missing param repo')
    return {
      async add(addee, context) {
        // https://github.com/shinnn/github-username-regex/blob/master/index.js
        if (!addee.match(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)) {
          return { text: 'Invalid username format' }
        }
        context.log('Getting GitHub client')
        const octokit = await getGitHubClient(installationId)
        context.log('Inviting')
        const result = await octokit.repos.addCollaborator({ owner, repo, username: addee })
        return { text: `Invited ${result.data.invitee.login} to ${owner}/${repo}.\nSee invitation at ${result.data.html_url}`}
      },
    }
  },
}

exports.githubTeam = {
  configure(params) {
    const installationId = params.installationId || invariant(false, 'Missing param installationId')
    const teamId = params.teamId || invariant(false, 'Missing param owner')
    const role = params.role || 'member'
    return {
      async add(addee, context) {
        // https://github.com/shinnn/github-username-regex/blob/master/index.js
        if (!addee.match(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)) {
          return { text: 'Invalid username format' }
        }
        context.log('Getting GitHub client')
        const octokit = await getGitHubClient(installationId)
        context.log('Inviting')
        const result = await octokit.teams.addOrUpdateMembership({ team_id: teamId, username: addee, role })
        return { text: `Invited ${addee} to team.\nPlease check your email!`}
      },
    }
  },
}
