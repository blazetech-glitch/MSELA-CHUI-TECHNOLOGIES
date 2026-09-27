const { blazetz } = require(__dirname + "/../../devblaze/blazetz");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// VCard Contact kwa quoting
const quotedContact = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "MSELA CHUI XMD VERIFIED ✅",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:MSELA CHUI XMD VERIFIED ✅\nORG:𝐌𝐒𝐄𝐋𝐀-𝐂𝐇𝐔𝐈-𝐗𝐌𝐃 BOT;\nTEL;type=CELL;type=VOICE;waid=260774358600:+260774358600\nEND:VCARD"
    }
  }
};

blazetz({ nomCom: "repo", categorie: "General" }, async (dest, client, commandeOptions) => {
    let { ms, repondre } = commandeOptions;

    const repoUrl = "https://api.github.com/repos/shadricksanga7-hub/MSELA-CHUI-TECHNOLOGIES";

    // Random image from /scs folder
    const scsFolder = path.join(__dirname, "../scs");
    const images = fs.readdirSync(scsFolder).filter(f => /^leopard-menu-\d+\.png$/i.test(f));
    const randomImage = images[Math.floor(Math.random() * images.length)];
    const imagePath = randomImage ? path.join(scsFolder, randomImage) : null;

    try {
        const response = await axios.get(repoUrl);
        const repo = response.data;

        let repoInfo = `
╭══════════════⊷❍
┃ *𝐌𝐒𝐄𝐋𝐀-𝐂𝐇𝐔𝐈-𝐗𝐌𝐃 REPOSITORY*
┃══════════════════
┃ ❏ Repo Link:🔗 *${repo.html_url}*
┃ ❏ Name: *${repo.name}*
┃ ❏ Owner: *${repo.owner.login}*
┃ ❏ Stars: ⭐ *${repo.stargazers_count}*
┃ ❏ Forks: 🍴 *${repo.forks_count}*
┃ ❏ Issues: 🛠️ *${repo.open_issues_count}*
┃ ❏ Watchers: 👀 *${repo.watchers_count}*
┃ ❏ Updated: 📅 *${new Date(repo.updated_at).toLocaleString()}*
╰══════════════⊷❍
        `;

        const contextInfo = {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363405040601085@newsletter",
                newsletterName: "𝐌𝐒𝐄𝐋𝐀-𝐂𝐇𝐔𝐈-𝐗𝐌𝐃",
                serverMessageId: 1
            }
        };
        const message = imagePath
            ? {
                image: { url: imagePath },
                caption: repoInfo,
                footer: "*𝐌𝐒𝐄𝐋𝐀-𝐂𝐇𝐔𝐈-𝐗𝐌𝐃 GitHub Repository*",
                contextInfo
            }
            : { text: repoInfo, contextInfo };
        await client.sendMessage(dest, message, { quoted: quotedContact });

    } catch (e) {
        console.log("❌ Error fetching repository data: " + e);
        repondre("❌ Error fetching repository data, please try again later.");
    }
});
