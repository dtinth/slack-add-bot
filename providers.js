const { App } = require('@octokit/app')
const Octokit = require('@octokit/rest')
const axios = require('axios')
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
    const installationId =
      params.installationId || invariant(false, 'Missing param installationId')
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
        const result = await octokit.repos.addCollaborator({
          owner,
          repo,
          username: addee,
        })
        return {
          text: `Invited ${result.data.invitee.login} to ${owner}/${repo}.\nSee invitation at ${result.data.html_url}`,
        }
      },
    }
  },
}

exports.githubTeam = {
  configure(params) {
    const installationId =
      params.installationId || invariant(false, 'Missing param installationId')
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
        const result = await octokit.teams.addOrUpdateMembership({
          team_id: teamId,
          username: addee,
          role,
        })
        return { text: `Invited ${addee} to team.\nPlease check your email!` }
      },
    }
  },
}

exports.notionPage = {
  configure(params) {
    const addDashToPageId = str => {
      const m =
        str.match(/^(........)(....)(....)(....)(............)$/) ||
        invariant(
          false,
          'Page ID should be exactly 32 characters long, %s received',
          str.length,
        )
      const dashed = m.slice(1).join('-')
      return dashed
    }
    const pageId = addDashToPageId(
      params.pageId || invariant(false, 'Missing param pageId'),
    )
    const token =
      process.env.NOTION_TOKEN_V2 ||
      invariant(false, 'Missing ENV NOTION_TOKEN_V2')
    const uuidv4 = require('uuid/v4')
    return {
      async add(addee, context) {
        const emailMatch = addee.match(/^<mailto:([^@|\s>]+@[^|\s>]+)/)
        if (!emailMatch) {
          return { text: 'Needs an email' }
        }
        const email = emailMatch[1]
        const client = axios.create({
          headers: {
            Cookie: `token_v2=${token};`,
          },
        })
        context.log('Getting user ID')
        const {
          data: { userId },
        } = await client
          .post('https://www.notion.so/api/v3/createEmailUser', { email })
          .catch(handleNetworkError)
        invariant(userId, 'Expected userId back, %s received', userId)
        context.log(`Inviting ${userId}...`)
        const { data } = await client
          .post('https://www.notion.so/api/v3/submitTransaction', {
            requestId: uuidv4(),
            transactions: [
              {
                id: uuidv4(),
                operations: [
                  {
                    table: 'block',
                    id: pageId,
                    command: 'setPermissionItem',
                    path: ['permissions'],
                    args: {
                      type: 'user_permission',
                      role: 'editor',
                      user_id: userId,
                    },
                  },
                ],
              },
            ],
          })
          .catch(handleNetworkError)
        console.log('Received data', data)
        return { text: `Added ${addee} to Notion page.` }
      },
    }
  },
}

function handleNetworkError(e) {
  console.error('Network error:', e)
  throw e
}
