const { WebhookClient } = require('discord.js');

module.exports = async (req, res) => {
    const { user, code } = req.query;

    if (!user || !code) {
        return res.status(400).json({ error: 'Missing user or code' });
    }

    // You can store the user and code in a database here
    // For now, we just send a webhook message

    const webhook = new WebhookClient({ url: process.env.WEBHOOK_URL });
    await webhook.send({
        content: `✅ User ${user} has been verified with code ${code}.`,
        embeds: [{
            title: 'Verification Complete',
            description: `User: ${user}\nCode: ${code}\nTime: ${new Date().toISOString()}`,
            color: 0x43b581
        }]
    });

    res.status(200).json({ success: true });
};
