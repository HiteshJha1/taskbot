/*CMD
  command: /rules
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

let GROUP_ID = -1001893199393;

let rulesText = `1. Don't lie about how many tasks you did. If you say you did more tasks than you actually did, you'll be kicked out, you won't get any money, and you'll lose whatever money you already had in your account.

2. Only register tasks in the right place. You have to register the task in the comments section or by replying to the task message. Bot won't work otherwise.

3. Screenshot first, then register. First, you need to upload a picture (screenshot) showing you did the task. Then you can use the command to register the task (like "/like 25"). Do it in that order!

For example:

User A completes 25 like and retweet tasks and uploads a screenshot to the comment section. After uploading the screenshot, User A must type /like 25 in the comment section.`;

// Delete the current trigger message (so old /rules command disappears)


// Send new rules message
 Api.sendMessage({
  chat_id: GROUP_ID,
  text: rulesText,
  parse_mode: "Markdown"
});

// Schedule next run without saving message ID
Bot.run({
  command: "/rules",
  run_after: 60 * 60 * 6
});

