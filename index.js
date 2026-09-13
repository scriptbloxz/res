const { Client, GatewayIntentBits, Collection, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, WebhookClient } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const BACKEND_URL = process.env.BACKEND_URL; // This will be your Render URL

// Slash Command: /verify
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'verify') {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Account Verification')
            .setDescription('Click the button below to verify your account using our secure OAuth2 system. This process is instant and secure.')
            .setColor(0x0099FF)
            .setFooter({ text: 'Trust & Safety Systems' })
            .setTimestamp();

        const button = new ButtonBuilder()
            .setCustomId('verify_start')
            .setLabel('Verify Now')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✅');

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({ embeds: [embed], components: [row] });
    }
});

// Button Interaction: Start Verification
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'verify_start') {
        // Create a unique code for this user to prevent replay attacks
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Store the code and user ID temporarily (in a real app, use a database)
        // For this demo, we'll just send the code to the user via DM or embed
        const embed = new EmbedBuilder()
            .setTitle('🔐 Step 1: Generate Code')
            .setDescription(`Your unique verification code is: \`\`${code}\`\`\n\nPlease copy this code. You will need it in the next step.`)
            .setColor(0xFFD700);

        await interaction.reply({ embeds: [embed], ephemeral: true });

        // Open a link to your backend where the user enters the code
        const verifyLink = `${BACKEND_URL}?user=${interaction.user.id}&code=${code}`;
        
        const openButton = new ButtonBuilder()
            .setCustomId('open_verify_page')
            .setLabel('Open Verification Page')
            .setStyle(ButtonStyle.Link)
            .setURL(verifyLink);

        const row = new ActionRowBuilder().addComponents(openButton);
        await interaction.followUp({ components: [row], ephemeral: true });
    }

    if (interaction.customId === 'open_verify_page') {
        // This is just to confirm the button click, the real action happens on the page
        await interaction.deferUpdate();
    }
});

// Webhook listener for when the page verifies the code
client.on('messageCreate', async message => {
    if (message.webhookId) {
        // This is a message sent by our own webhook
        const embed = message.embeds[0];
        if (embed && embed.title === '✅ Verification Complete') {
            // Optional: Send a confirmation message in the server
            const channel = message.guild?.channels.cache.get(process.env.VERIFY_CHANNEL_ID);
            if (channel) {
                await channel.send(`User ${embed.fields[0].value} has been verified!`);
            }
        }
    }
});

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
