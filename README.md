# /add

Usually when working on a project or organizing an event, usually just Slack is not enough; we have to use other third-party tools, such as GitHub, Notion, Airtable, etc.

It is sometimes painful to have to ask for everyone email and send out invites individually.

This is a self-service Slack bot that lets people add themselves (or others) to third-party services.

Currently available providers:

- GitHub Repo — Invite a GitHub user to collaborate on a GitHub repository
- GitHub Team — Add a GitHub user to a GitHub team, inviting them to the organization if they are not part of it yet
- Notion Page — Add a Notion user by email to a Notion page

## Concepts

- **Provider** provides a service whose user can be added.
  The same provider uses the same code for the adding logic.
  For example, the `githubRepo` provider lets people add themselves to a GitHub repository.
  They are defined in `providers.js`.

- **Service** is a configured instance of a service.
  They are defined in your `.env` file as it may contain sensitive data.
  For example, if you have 3 GitHub you can define 3 services based on the same provider.

  For example:

  ```
  ADD_TO_WEB_REPO="githubRepo?installationId=1234567&owner=dtinth&repo=myevent-web"
  ADD_TO_API_REPO="githubRepo?installationId=1234567&owner=dtinth&repo=myevent-api"
  ```

  People can add themselves by saying:

  ```
  /add dtinth to web repo
  /add dtinth to api repo
  ```

## Usage

This project is built on Glitch, so that you can easily remix it, run your own instance, and add the code you need.

1. Remix the [slash-add](https://glitch.com/edit/#!/slash-add) project on Glitch.

2. After remixing you will get a unique project name.

3. Click the **Show** button at the top, and copy the **Slack Request URL** shown in the web page.

4. Create the `/add` Slash command in Slack developer console:

   ![Screenshot](https://cdn.glitch.com/e6f4f8f5-3286-434c-8cee-74e8a4ded0e0%2Fslash-configure.png?v=1571836256027)

5. Edit `.env` file to add your services:

   ```
   # Format:
   # ADD_TO_<SERVICE_NAME>="<providerName>?<key>=<value>"

   ADD_TO_GITHUB_REPO="githubRepo?installationId=1234567&owner=dtinth&repo=myevent-web"
   ```

## Currently available providers

### `githubRepo`

Invite someone to a GitHub Repository. This provider utilizes the [GitHub Apps API](https://developer.github.com/apps/), and does not need a personal access token to function.

Required environment variables:

- `GH_APP_ID` — The GitHub App’s ID
- `GH_APP_PRIVATE_KEY_BASE64` — The GitHub App’s Private Key, base64-encoded

Required GitHub App scope:

- **Repository permissions &rarr; Administration:** Read & write

Parameters:

- `installationId` — The installation ID of your GitHub App.
- `owner` — The owner of the repository.
- `repo` — The name of the repository.

### `githubTeam`

Adds a GitHub User to a GitHub Team.
If the user being invited is not part of the organization, they will be invited via email.
This provider utilizes the [GitHub Apps API](https://developer.github.com/apps/), and does not need a personal access token to function.

Required environment variables:

- `GH_APP_ID` — The GitHub App’s ID
- `GH_APP_PRIVATE_KEY_BASE64` — The GitHub App’s Private Key, base64-encoded

Required GitHub App scope:

- **Organization permissions &rarr; Members:** Read & write

Parameters:

- `installationId` — The installation ID of your GitHub App.
- `teamId` — The numeric team ID. Here’s [how to find a GitHub Team ID](https://fabian-kostadinov.github.io/2015/01/16/how-to-find-a-github-team-id/#comment-4560809366).
- `role` — Either `maintainer` or `member` (default: `member`). Here’s [the relevant documentation](https://developer.github.com/v3/teams/members/#add-or-update-team-membership).

### `notionPage`

Adds a Notion user by email to edit a Notion page.

Required environment variables:

- `NOTION_TOKEN_V2` — Notion’s authentication token. You can extract this from your browser cookie named `token_v2`.

Parameters:

- `pageId` — The Notion page ID. This is the last part of the URL, which is 32 characters long, such as `157765353f2c4705bd45474e5ba8b46c`.
