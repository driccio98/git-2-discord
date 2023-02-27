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

  if (commits.length && commits.length >= 1) {
    discordPayload.embeds = commits.map((commit) => ({
      title: commit.message,
      description: `By: ${commit.author.name}`,
      color: 16711680,
    }));
  } else {
    discordPayload.embeds.push({
      title: headCommit.message,
      description: `By: ${headCommit.author.name}`,
      color: 16711680,
    });
  }

  sendDiscordMessage(discordWebhookUrl, discordPayload);

  core.setOutput("Commits:", commits);
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}

async function sendDiscordMessage(discordWebhookUrl, payload) {
  return await axios.post(discordWebhookUrl, payload);
}
