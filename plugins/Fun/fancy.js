const { blazetz } = require("../../devblaze/blazetz");
const fancy = require("../../devblaze/style");
const pkg = require("@whiskeysockets/baileys");
const { generateWAMessageFromContent, proto } = pkg;

// VCard Contact (status style)
const quotedContact = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "MSELA CHUI XMD VERIFIED ✅",
      vcard: `BEGIN:VCARD
VERSION:3.0
FN:MSELA CHUI XMD VERIFIED
ORG:𝐌𝐒𝐄𝐋𝐀-𝐂𝐇𝐔𝐈-𝐗𝐌𝐃 BOT;
TEL;type=CELL;type=VOICE;waid=260774358600:+260774358600
END:VCARD`
    }
  }
};

blazetz(
  {
    nomCom: "fancy",
    categorie: "Funny",
    reaction: "✍️"
  },
  async (from, conn, context) => {
    const { arg, repondre, prefixe } = context;
    const id = arg[0]?.match(/\d+/)?.join("");
    const text = arg.slice(1).join(" ");

    try {
      // Show the available styles when no style number or text is supplied.
      if (!id || !text) {
        return await conn.sendMessage(
          from,
          {
            text:
              `Example:\n${prefixe}fancy 10 𝐌selachui\n\n` +
              fancy.list("𝐌𝐒𝐄𝐋𝐀-𝐂𝐇𝐔𝐈-𝐗𝐌𝐃", fancy)
          },
          { quoted: quotedContact }
        );
      }

      // Match Blaze XMD: the number selects the corresponding style.
      const selectedStyle = fancy[parseInt(id, 10) - 1];
      const resultText = selectedStyle
        ? fancy.apply(selectedStyle, text)
        : "Style not found";

      const buttons = [
        {
          name: "cta_copy",
          buttonParamsJson: JSON.stringify({
            display_text: "📋 COPY TEXT",
            copy_code: resultText
          })
        }
      ];

      const viewOnceMessage = {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: resultText
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: ""
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                title: "",
                subtitle: "",
                hasMediaAttachment: false
              }),
              nativeFlowMessage:
                proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons
                })
            })
          }
        }
      };

      const waMsg = generateWAMessageFromContent(from, viewOnceMessage, {});
      await conn.relayMessage(from, waMsg.message, {
        messageId: waMsg.key.id
      });
    } catch (error) {
      console.error("FANCY ERROR:", error);
      await repondre("An error occurred while processing your request.");
    }
  }
);
