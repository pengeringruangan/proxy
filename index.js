const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

// Buat instance client Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Buat instance server Express
const app = express();
const port = process.env.PORT || 3000;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

app.get('/', (req, res) => {
    res.send('Bot Discord berjalan dengan server web!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!getproxies')) {
        try {
            const args = message.content.split(' ');
            if (args.length !== 4) {
                await message.channel.send('Usage: !getproxies <protocol> <timeout> <country>');
                return;
            }

            const protocol = args[1];
            const timeout = args[2];
            const country = args[3].toUpperCase();

            if (!['http', 'socks4', 'socks5'].includes(protocol)) {
                await message.channel.send('Invalid protocol. Choose from: http, socks4, socks5.');
                return;
            }

            if (isNaN(timeout)) {
                await message.channel.send('Invalid timeout. It should be a number representing milliseconds.');
                return;
            }

            if (!['US', 'CA', 'UK', 'DE', 'FR', 'NL', 'JP', 'KR', 'AU', 'CN', 'RU'].includes(country)) {
                await message.channel.send('Invalid country. Choose from: US, CA, UK, DE, FR, NL, JP, KR, AU, CN, RU.');
                return;
            }

            const response = await axios.get(PROXYSCRAPE_API_URL, {
                params: {
                    protocol: protocol,
                    timeout: timeout,
                    country: country,
                    ssl: 'all',
                    anonymity: 'all'
                }
            });

            const proxies = response.data.trim();
            if (proxies) {
                await message.channel.send(`Here are some proxies:\n\`\`\`\n${proxies}\n\`\`\``);
            } else {
                await message.channel.send('No proxies found with the given criteria.');
            }
        } catch (error) {
            await message.channel.send(`An error occurred: ${error.message}`);
        }
    } else if (message.content.startsWith('!checkwebsite')) {
        try {
            const args = message.content.split(' ');
            if (args.length !== 2) {
                await message.channel.send('Usage: !checkwebsite <url>');
                return;
            }

            const url = args[1];
            const response = await axios.get(url);

            if (response.status === 200) {
                await message.channel.send(`Website ${url} is online.`);
            } else {
                await message.channel.send(`Website ${url} is offline. Status code: ${response.status}`);
            }
        } catch (error) {
            await message.channel.send(`An error occurred: ${error.message}`);
        }
    }
});

client.login('YOUR_DISCORD_BOT_TOKEN');
