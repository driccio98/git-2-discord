const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");


try {
  const headCommit = JSON.parse(process.env.HEAD_COMMIT);
  const commits = JSON.parse(process.env.COMMITS || "{}");
  const repository = JSON.parse(process.env.REPOSITORY);
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK;

  const discordPayload = {
    content: `New breaking change(s) on [${repository.name}](${repository.html_url}):`,
    embeds: [],
  };

  const regex = /breaking change/i;

  if (commits.length && commits.length >= 1) {
    for (const commit of commits) {
      if (regex.test(commit.message)) {
        discordPayload.embeds.push({
          title: commit.message,
          description: `Commit URL: ${commit.url}\nBy: ${commit.author.name}`,
          color: 16711680,
        });
      }
    }
  } else {
    if (regex.test(headCommit.message)) {
      discordPayload.embeds.push({
        title: headCommit.message,
        description: `Commit URL: ${headCommit.url}\nBy: ${headCommit.author.name}`,
        color: 16711680,
      });
    }
  }

  if (discordPayload.embeds.length > 0) {
    sendDiscordMessage(discordWebhookUrl, discordPayload);
  }
  
  core.setOutput("Commits:", commits);
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}

async function sendDiscordMessage(discordWebhookUrl, payload) {
  return await axios.post(discordWebhookUrl, payload);
}
