/*CMD
  command: /botinfo
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

function toIST(utcString) {
  let date = new Date(utcString);
  // Add 5.5 hours in milliseconds
  let istOffset = 5.5 * 60 * 60 * 1000;
  let istDate = new Date(date.getTime() + istOffset);
  
  // Format to readable IST format
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const day = istDate.getUTCDate();
  const month = months[istDate.getUTCMonth()];
  const year = istDate.getUTCFullYear();
  const hours = istDate.getUTCHours().toString().padStart(2, '0');
  const minutes = istDate.getUTCMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

let q = iteration_quota;
let remaining = q.limit - q.progress;

let message = `
<b>📊 Bot Iteration Quota (IST)</b>

<b>Total Quota:</b> ${q.limit}
<b>Used:</b> ${q.progress}
<b>Remaining:</b> ${remaining}

<b>Quota Period:</b>
Start: <code>${toIST(q.started_at)}</code>
End: <code>${toIST(q.ended_at)}</code>

<b>Extra Points:</b> ${q.extra_points}
<b>Paid Cycles:</b> ${q.paid_cycles_count}
<b>Has Ads:</b> ${q.have_ads ? "Yes" : "No"}

<b>Last Updated:</b>
<code>${toIST(q.updated_at)}</code>
`;

Api.sendMessage({
  text: message,
  parse_mode: "HTML",
  reply_to_message_id: request.message_id
});
