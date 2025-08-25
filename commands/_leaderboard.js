/*CMD
  command: /leaderboard
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

let ADMIN_ID = 5084153092; // Replace with your actual admin ID
let limitKey = "leaderboard_usage";
let usage = User.getProperty(limitKey) || { count: 0, lastUsed: 0 };
let now = Date.now();

// Check usage limit (except for admin)
if (user.telegramid !== ADMIN_ID) {
  let since = now - usage.lastUsed;
  let twentyFourHrs = 24 * 60 * 60 * 1000;

  if (since > twentyFourHrs) {
    usage = { count: 0, lastUsed: now };
  }

  if (usage.count >= 3) {
    return Api.sendMessage({
      text: "⛔ You can only use this command thrice every 24 hours.",
      reply_to_message_id: request.message_id
    });
  }

  usage.count += 1;
  usage.lastUsed = now;
  User.setProperty(limitKey, usage, "json");
}

// Fetch leaderboard
let payables = Bot.getProperty("payables") || {};

if (Object.keys(payables).length === 0) {
  return Api.sendMessage({
    text: "⚠️ No earnings data found to generate a leaderboard.",
    parse_mode: "Markdown",
    reply_to_message_id: request.message_id
  });
}

let leaderboard = Object.entries(payables)
  .filter(([_, data]) => data.amount > 0)
  .sort((a, b) => b[1].amount - a[1].amount)
  .slice(0, 35);

let text = "<b>🏆 Leaderboard - Top Earners</b>\n\n";

// Check if today is 10th of month in IST
function isTenthIST() {
  let nowUTC = new Date();
  let nowIST = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000));
  return nowIST.getDate() === 10;
}

let showRewards = isTenthIST();
let rewardLabels = ["+$1.5", "+$1", "+$0.5"];
let crownEmojis = ["🥇", "🥈", "🥉"];

leaderboard.forEach(([id, data], index) => {
  let name = data.username ? `@${data.username}` : `ID:${id}`;
  let prefix = "";

  if (index < 3) {
    prefix = `${crownEmojis[index]} `;
  } else {
    prefix = `${index + 1}) `;
  }

  let rewardText = showRewards && index < 3 ? ` <b>${rewardLabels[index]}</b>` : "";
  text += `${prefix}${name} — <b>$${data.amount.toFixed(3)}</b>${rewardText}\n`;
});

Api.sendMessage({
  text: text,
  parse_mode: "HTML",
  reply_to_message_id: request.message_id
});

