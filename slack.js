require('dotenv').config();

const fs = require('fs');

const { WebClient } = require('@slack/client')
const token = process.env.SLACK_TOKEN
const web = new WebClient(token)

async function getAllChannels() {
  const param = {
    exclude_archived: true,
    types: 'public_channel,private_channel,mpim,im',
    limit: 100
  }

  return await web.conversations.list(param)
    .then(results => { return results.channels })
    .catch(console.error)
}

async function getConversations(conversationId) {
  const params = {
    channel: conversationId,
    limit: 500
  }

  return await web.conversations.history(params)
    .then(data => { return data.messages })
    .catch(console.error)
}

fs.writeFileSync("./messages.json", JSON.stringify([], null, 2))

getAllChannels().then(channels => {
  channels.forEach(channel => {
    getConversations(channel.id).then(messages => {
      fs.readFile('./messages.json', (err, data) => {
        let json = JSON.parse(data)
        json.push({channelId: channel.id, messages})

        fs.writeFileSync("./messages.json", JSON.stringify(json, null, 2))
      })
    })
  })
})


