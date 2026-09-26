const { blazetz } = require('../../devblaze/blazetz');
const { addOrUpdateDataInAlive, getDataFromAlive } = require('../../lib/alive');
const moment = require("moment-timezone");
const s = require(__dirname + "/../../settings");
const path = require("path");
const fs = require("fs");

// VCard Contact (MSELA CHUI XMD VERIFIED ✅)
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

// Newsletter context
const newsletterContext = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363405040601085@newsletter",
      newsletterName: "𝐌𝐒𝐄𝐋𝐀-𝐂𝐇𝐔𝐈-𝐗𝐌𝐃",
      serverMessageId: 1
    }
  }
};

// Function to send random image from /scs folder
async function sendAliveImage(client, dest, caption, repondre) {
    const scsFolder = path.join(__dirname, "../scs");
    const images = fs.existsSync(scsFolder)
        ? fs.readdirSync(scsFolder, { withFileTypes: true })
            .filter(entry => entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name))
            .map(entry => entry.name)
        : [];
    // MSELA assets use leopard-menu-N.jpg rather than menuN.jpg.
    // If an image is unavailable, keep alive useful by returning the status text.
    if (images.length === 0) return repondre(caption);

    const randomImage = images[Math.floor(Math.random() * images.length)];
    const imagePath = path.join(scsFolder, randomImage);

    await client.sendMessage(dest, {
        image: { url: imagePath },
        caption: caption,
        ...newsletterContext
    }, { quoted: quotedContact });
}

blazetz(
    {
        nomCom: 'alive',
        categorie: 'General',
        reaction: "🟢"
    },
    async (dest, client, { ms, arg, repondre, superUser }) => {
        const data = await getDataFromAlive();
        const time = moment().tz('Etc/GMT').format('HH:mm:ss');
        const date = moment().format('DD/MM/YYYY');

        if (!arg || !arg[0]) {
            const aliveMsg = `┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃       𝐌𝐒𝐄𝐋𝐀-𝐂𝐇𝐔𝐈-𝐗𝐌𝐃 𝗔𝗟𝗜𝗩𝗘       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📅 Date    : ${date}
┃ 🕒 Time    : ${time}
┃ 👑 Owner   : ${s.OWNER_NAME}
┃ 🔵 Platform : *Node.js*
┗━━━━━━━━━━━━━━━━━━━━━━━┛`;

            try {
                if (data && data.lien) {
                    const lien = data.lien;
                    if (lien.match(/\.(mp4|gif)$/i)) {
                        await client.sendMessage(dest, {
                            video: { url: lien },
                            caption: aliveMsg,
                            ...newsletterContext
                        }, { quoted: quotedContact });
                    } else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
                        await client.sendMessage(dest, {
                            image: { url: lien },
                            caption: aliveMsg,
                            ...newsletterContext
                        }, { quoted: quotedContact });
                    } else {
                        await sendAliveImage(client, dest, aliveMsg, repondre);
                    }
                } else {
                    await sendAliveImage(client, dest, aliveMsg, repondre);
                }
            } catch (e) {
                console.error("Error:", e);
                repondre(`❌ Failed to show Alive Message: ${e.message}`);
            }
        } else {
            if (!superUser) {
                repondre("❌ Only the owner can update Alive message.");
                return;
            }

            const [texte, tlien] = arg.join(' ').split(';');
            await addOrUpdateDataInAlive(texte, tlien);
            repondre(`✅ Alive message updated successfully!`);
        }
    }
);
