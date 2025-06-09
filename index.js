
require('dotenv/config');
const { Client } = require('discord.js');
const { OpenAI } = require('openai');

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

client.on('ready', () =>{
    console.log('The bot is online ')
});

const IGNORE_PREFIX = "!";
const CHANNEL =  [1347915772369965120];

const openai = new OpenAI({
    apiKey : process.env.OPENAI_KEY,
})


client.on('messageCreate', async (message) => {
   if (message.author.bot) return;
   if (message.content.startsWith(IGNORE_PREFIX)) return;
   if(!CHANNEL .includes(message.channelId) && !message.mentions.has(client.user.id)) return;

await message.channel.sendTyping();

const sendTypingInterval = setInterval(() => {
    message.channel.sendTyping();
}, 5000 );

   let conservation = [];

   conservation.push({
    role: 'system',
    content: 'chat gpt is a frienly chatbot.', 
   });

   let prevMessages = await message.channel.messages.fetch({ limit: 10});
   prevMessages.reverse();

   prevMessages.forEach((msg) => {
    if (msg.author.bot && msg.author.id !== client.user.id) return;
    if (msg.content.startsWith(IGNORE_PREFIX)) return;

    const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');
    if (msg.author.id === client.user.id) {
        conservation.push({
            role : 'assistant',
            name: username,
            content: msg.content,
        });
        return;
    }

    conservation.push({
        role : 'assistant',
        name: username,
        content: msg.content,
    });
})


    const response = await openai.chat.completions
    .create({
        model : 'gpt-3.5-turbo', 
        messages : conservation,
    })
    .catch((error) =>  console.error('OpenAi Error:\n', error));

    if (!response) {
        message.reply("i'm having some trouble with the OpenAi API");
        return;
    }
    const responseMessage = response.choices[0].message.content;
    const chunkSizeLimit = 2000;

    for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
        const chunk = responseMessage.substring(i, i + chunkSizeLimit);

        await message.reply(chunk);
    }



   
});



client.login(process.env.TOKEN);