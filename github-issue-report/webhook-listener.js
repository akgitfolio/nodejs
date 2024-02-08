const { Octokit } = require("@octokit/rest");
const { createNodeMiddleware, createProbot } = require("@octokit/webhooks");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const probot = createProbot();

probot.on("push", async (context) => {
  const { commits } = context.payload;

  for (const commit of commits) {
    const message = commit.message;

    if (message.startsWith("FIX:")) {
      try {
        const issueTitle = message.slice(5).trim();
        const issueBody = commit.body || "No description provided.";
        const issueLabels = ["bugfix"];

        await octokit.issues.create({
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          title: issueTitle,
          body: issueBody,
          labels: issueLabels,
        });

        console.log(`Created issue: ${issueTitle}`);
      } catch (error) {
        console.error(`Failed to create issue: ${error.message}`);
      }
    }
  }
});

const middleware = createNodeMiddleware(probot, {
  path: "/api/github/webhooks",
});

module.exports = middleware;
