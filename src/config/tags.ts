/* eslint-disable stylistic/max-len -- These are config strings, so it's okay to not enforce length here. */
import type { Tag } from "../interfaces/tag.js";

export const tags: Array<Tag> = [
  {
    message:
      "Photos/screenshots of an error can be helpful, but it also helps to provide the complete code. Posting the code helps us help you better!\nYou can use a [discord code block](<https://gist.github.com/matthewzring/9f7bbfd102003963f9be7dbcf7d40e51#code-blocks>), [GitHub Gist](<https://gist.github.com/>), [GitHub repository](<https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository>), or [PasteBin](<https://pastebin.com/>).",
    name: "Please don't post pictures of code.",
  },
  {
    message:
      "Large amounts of code are disruptive to chat. Instead, please send a link to your repository, or a link to a [GitHub gist](https://gist.github.com/), [PasteBin](https://pastebin.com/), or similar.",
    name: "For large blocks of code, use a PasteBin or Gist.",
  },
  {
    message:
      "Discord has support for code block syntax. Please repost your code using this syntax:\n\n\\`\\`\\`lang\ncode here\n\\`\\`\\`\n\nYou can replace `lang` with your code's language, such as `js`, to get syntax highlighting.",
    name: "How to format code",
  },
  {
    message:
      "Don't ask to ask, just ask\n<https://dontasktoask.com>. For details on how to ask a strong question, visit <#1410670814696833084>",
    name: "How to ask a question",
  },
  {
    message:
      "Please email donors@freecodecamp.org and provide the email you use to log into freecodecamp.org/learn, your donation receipt, and a brief explanation of your issue.",
    name: "Donation Problems",
  },
  {
    message:
      "It looks like you're asking about your attempted solution rather than your actual problem. We need to know what your problem is before we can help.\n"
      + "https://xyproblem.info",
    name: "XY Problem",
  },
  {
    message:
      `
Discord has support for Markdown formatting:

**Bold** - \`**Bold**\`
*Italic* - \`*Italic*\` or \`_Italic_\`
***Bold Italic*** - \`***Bold Italic***\`
__Underline__ - \`__Underline__\`
~~Strikethrough~~ - \`~~Strikethrough~~\`
__*Underline Italic*__ - \`__*Underline Italic*__\`
__**Underline Bold**__ - \`__**Underline Bold**__\`
__***Underline Bold Italic***__ - \`__***Underline Bold Italic***__\`

> Blockquote
\`> Blockquote\`

`
      + "`Inline Code` - \\`Inline Code\\`"
      + "\n\n```\nCode Block\n```\n\\`\\`\\`\nCode Block\n\\`\\`\\`"
      + "||```\nSpoilered Code\n```||\n\\|\\|\\`\\`\\`\nSpoilered Code\n\\`\\`\\`\\|\\|",
    name: "Discord Markdown Formatting",
  },
  {
    message:
      "This channel is specifically for facilitating contributor efforts. For general programming questions, you should ask in <#718214639669870683>.",
    name: "Programming questions in contributor channels",
  },
  {
    message:
      "This channel is only for sharing 100 Days of Code updates. Please take conversation to <#693145545878929499>.",
    name: "No chatter in 100 Days of Code",
  },
  {
    message:
      "Posting the same message to multiple channels is spammy and can result in redundant responses and confusion. Please delete the duplicates.",
    name: "Don't spam the same question in multiple channels",
  },
  {
    message:
      "Since you just mentioned suicide or self-harm, we need to point that we are not trained medical professionals. We encourage you to call one of the numbers here for immediate help: <http://www.suicide.org/international-suicide-hotlines.html>.",
    name: "Suicide/self-harm",
  },
  {
    message:
      "Please refrain from self-promotion of your social media (e.g. YouTube, LinkedIn, Twitter). You may include such links in your Discord profile if you wish. Links to projects for the limited purpose of debugging or review are also acceptable as long as the purpose for posting is not to drive traffic to the project.",
    name: "No self-promotion",
  },
];
