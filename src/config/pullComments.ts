/* eslint-disable stylistic/max-len -- These are config strings, so it's okay to not enforce length here. */
const pullComments: Array<{ key: string; message: string }> = [
  {
    key: "Don't Ping Maintainers",
    message:
      "We realize you're looking to get help as soon as possible. Rather than pinging someone directly, which can be considered rude, would you mind [joining our Discord](https://discord.gg/KVUmVXA) and asking your question there? Someone might be more readily available to help.",
  },
  {
    key: "Hacktoberfest requirements",
    message:
      "Thank you for submitting a pull request for Hacktoberfest. However, it appears that you have not followed the instructions provided in the Hacktoberfest issue thread or our other contributing guidelines. Please review them and make the necessary changes.",
  },
  {
    key:     "Merge Conflicts",
    message: `We would love to be able to merge your changes, but it looks like you have some merge conflicts. ⚠️\n\nOnce you resolve these conflicts, we will be able to review your PR and merge it. 😊\n\n---\n\nIf you're not familiar with the merge conflict process, feel free to look over GitHub's guide on ["Resolving a merge conflict"](https://help.github.com/articles/resolving-a-merge-conflict-on-github/). 🔍️\n\nAlso, it's good practice on GitHub to write a brief description of your changes when creating a PR. 📝`,
  },
  {
    key:     "Duplicate PR",
    message: `This PR seems to make similar changes as an existing PR. As such, we are going to close this as a duplicate.\n\nIf you feel you have additional changes to expand upon this PR, please feel free to push your commits and request this PR be reopened.\n\nThanks again! 😊\n\n---\n\nIf you have any questions, feel free to ask questions on the ["freeCodeCamp Community" category on our forum](https://forum.freecodecamp.org/c/site-community) or [the contributors chat room](https://discord.gg/PRyKn3Vbay).`,
  },
  {
    key: "External Resource Link",
    message:
      "Thank you for your pull request.\n\nWe are closing this pull request.\n\nIf you think we're wrong in closing this issue, please request for it to be reopened and add further clarification. Thank you and happy coding.",
  },
  {
    key: "Newbie Mistakes",
    message:
      "Hey there,\n\nThanks for your interest in contributing. We appreciate your efforts, but this PR doesn't follow [our guidelines](https://contribute.freecodecamp.org/how-to-open-a-pull-request).\n\nDo not worry, you should join our [Discord](https://discord.gg/KVUmVXA) server and ask for help in [#freecodecamp-community](https://discord.com/channels/692816967895220344/715074489422970962). That will help other contributors guide you to get your PR ready for a review. \n\nHappy Contributing!",
  },
  {
    key: "Not Triaged",
    message:
      "Hi there,\n\nThanks for creating this pull request.\n\nThe linked issue has not been triaged yet, and a solution has not been agreed upon. Once the issue is open for contribution, you are welcome to update this pull request to reflect the issue consensus. Until the issue is open for contribution, we will not be able to review your pull request.",
  },
  {
    key:     "Related to Camper Code",
    message: `Thank you for reporting this issue.\n\nThis is a standard message notifying you that this issue seems to be a request for help. Instead of asking for help here, please click the **"Get Help"** button on the challenge on freeCodeCamp and choose the **"Ask for help"** option, which will help you create a question in the right part of the forum. Volunteers on the forum usually respond to questions within a few hours and can help determine if there is an issue with your code or the challenge's tests.\n\nIf the forum members determine there is nothing wrong with your code, you can request this issue to be reopened.\n\nThank you and happy coding.`,
  },
  {
    key: "Fix in Progress",
    message:
      "Thank you for reporting this issue.\n\nThis is a standard message notifying you that the problem you mentioned here is present in production, but that it has already been fixed in staging. This means that the next time we push our staging branch to production, this problem should be fixed. Because of this, we're closing this issue.\n\nIf you think we're wrong in closing this issue, please request for it to be reopened and add further clarification. Thank you and happy coding.",
  },
  {
    key: "Requests for Assignment",
    message:
      "We typically do not assign issues. Instead, we accept the first pull request that comprehensively solves the issue.\n\nIssues labelled with `help wanted` or `first timers only` are open for contributions.\n\nPlease make sure you read [our guidelines for contributing](https://contribute.freecodecamp.org/intro/). We prioritize contributors following the instructions in our guide. Join us in [our chat room](https://discord.gg/PRyKn3Vbay) or [the forum](https://forum.freecodecamp.org/c/site-community) if you need help contributing - our community will be happy to assist you.",
  },
  {
    key: "rtfm",
    message:
      "Please stop and read our [contributing guide](https://contribute.freecodecamp.org).\n\nThis issue is not marked as ready for contributions or help wanted. Also, we typically do not assign issues.",
  },
  {
    key: "Failing CI",
    message:
      "We would love to be able to merge your changes but it looks like there is an error with the CI build. ⚠️\n\nOnce you resolve these issues, we will be able to review your PR and merge it. 😊\n\n---\n\nFeel free to reference the [contributing guidelines](https://contribute.freecodecamp.org/how-to-work-on-coding-challenges/) for instructions on running the CI build locally. ✅",
  },
  {
    key: "Exercise PR Made Against Boilerplate Repo",
    message:
      "Hi there,\n\nIt looks like this PR was supposed to be made on your own fork instead of the original boilerplate repository.\n\nAs such, this isn't a PR we can merge to our repository. Feel free to join our [chat room](https://discord.gg/PRyKn3Vbay) or our [forum](https://forum.freecodecamp.org/) if you have any questions or need help with the coding challenges.\n\nHappy coding.",
  },
];

const pullClose = `Thank you for opening this pull request.

This is a standard message notifying you that we've reviewed your pull request and have decided not to merge it. We would welcome future pull requests from you.

Thank you and happy coding.
`;

const issueClose = `Thank you for reporting this issue.

This is a standard message notifying you that this issue is not on our roadmap at this time, and not something we plan to implement.

If you think we're wrong in closing this issue, please request for it to be reopened and add further clarification. Thank you and happy coding.`;

export { pullComments, pullClose, issueClose };
