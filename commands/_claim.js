/*CMD
  command: /claim
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

// Check if the user has an active uncompleted claim

let bannedUsers = Bot.getProperty("bannedUsers") || [];

if (bannedUsers.includes(user.telegramid)) {
  return Api.sendMessage({
    text: "⛔ You are currently restricted from claiming tasks due to a policy violation.",
    reply_to_message_id: request.message_id
  });
}

let activeClaim = User.getProperty("active_claim");
if (activeClaim && activeClaim.status === "not_completed") {
  return Api.sendMessage({
    text: "⚠️ You have an uncompleted task. Please complete it before claiming a new one.",
    reply_to_message_id: request.message_id
  });
}

// Ensure the command is a reply to a task post
if (!request.reply_to_message) {
  return Api.sendMessage({
    chat_id: user.telegramid,
    text: "⚠️ Please reply to the task post you want to claim comments for."
  });
}

// Validate the input parameter
if (!params || isNaN(params)) {
  return Api.sendMessage({
    chat_id: user.telegramid,
    text: "⚠️ Usage: /claim [number], e.g., /claim 15"
  });
}

let claimCount = parseInt(params);
if (claimCount <= 0) {
  return Api.sendMessage({
    chat_id: user.telegramid,
    text: "❌ Number to claim must be a positive number."
  });
}

const MAX_CLAIM_LIMIT = 10;
if (claimCount > MAX_CLAIM_LIMIT) {
  return Api.sendMessage({
    chat_id: user.telegramid,
    text: `❌ You can claim a maximum of ${MAX_CLAIM_LIMIT} comments at a time.`
  });
}

// Verify that the task post is a comment task
if (
  request.reply_to_message.text &&
  !request.reply_to_message.text.includes("0.008 USDT")
) {
  return Api.sendMessage({
    chat_id: user.telegramid,
    text: "⚠️ This task is not a <b>(Comment)</b> task.",
    parse_mode: "HTML"
  });
}

// Use the message_id of the replied-to post as the task identifier
let taskMessageId = request.reply_to_message.message_id;
let taskId = `claim_${taskMessageId}`;

// Retrieve or initialize total count for this task
let totalCountCache = Bot.getProperty("totalCountCache") || {};
let totalCount = totalCountCache[taskMessageId];

if (!totalCount) {
  // Extract total count from the task post
  let taskText = request.reply_to_message.text || "";
  let totalCountMatch = taskText.match(/Total Count :-\s*(\d+)/);
  if (!totalCountMatch) {
    return Api.sendMessage({
      chat_id: user.telegramid,
      text: "❌ Could not extract total count from the task post. Please ensure it includes 'Total Count :- [number]'."
    });
  }

  totalCount = parseInt(totalCountMatch[1]);
  if (isNaN(totalCount) || totalCount <= 0) {
    return Api.sendMessage({
      chat_id: user.telegramid,
      text: "❌ Invalid total count extracted from the task post."
    });
  }

  // Store the total count for future claims
  totalCountCache[taskMessageId] = totalCount;
  Bot.setProperty("totalCountCache", totalCountCache, "json");
}

// Retrieve existing claims for this task
let claims = Bot.getProperty(taskId) || [];

// Sort claims by start number
claims.sort((a, b) => a.start - b.start);

// Function to find available ranges
function findAvailableRanges(claims, totalCount) {
  let availableRanges = [];
  let current = 1;

  for (let claim of claims) {
    if (current < claim.start) {
      availableRanges.push({ start: current, end: claim.start - 1 });
    }
    current = claim.end + 1;
  }

  if (current <= totalCount) {
    availableRanges.push({ start: current, end: totalCount });
  }

  return availableRanges;
}

// Find available ranges
let availableRanges = findAvailableRanges(claims, totalCount);

// Determine if there's a range that can accommodate the requested claimCount
let assignedRange = null;
for (let range of availableRanges) {
  let rangeSize = range.end - range.start + 1;
  if (rangeSize >= claimCount) {
    assignedRange = { start: range.start, end: range.start + claimCount - 1 };
    break;
  }
}

if (!assignedRange) {
  return Api.sendMessage({
    chat_id: user.telegramid,
    text: "❌ Not enough available comments to fulfill your claim request."
  });
}

// Record the new claim
claims.push({
  user: user.username || user.first_name,
  user_id: user.telegramid, // ← Add this
  start: assignedRange.start,
  end: assignedRange.end,
  timestamp: Date.now()
});
Bot.setProperty(taskId, claims, "json");

// Send a confirmation message
Api.sendMessage({
  text: `✅ Comments ${assignedRange.start}-${assignedRange.end} have been claimed by @${user.username || user.first_name} and shall not be completed by any other.`,
  reply_to_message_id: request.message_id
});

// Update user's active claim status
User.setProperty("active_claim", {
  task_id: taskMessageId,
  count: claimCount,
  status: "not_completed"
}, "json");

