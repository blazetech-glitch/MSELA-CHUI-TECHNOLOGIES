const { blazetz } = require("../../devblaze/blazetz");
const fancy = require("../../devblaze/style");

const pkg = require("@whiskeysockets/baileys");
const { generateWAMessageFromContent, proto } = pkg;

function getStyles() {
  return Object.keys(fancy)
    .filter((key) => /^\d+$/.test(key) && fancy[key] && typeof fancy[key] === 'object')
    .map(Number)
    .sort((a, b) => a - b);
}

function renderStyle(style, text) {
  // Clone the map so every preview is rendered independently.
  return fancy.apply({ ...fancy[style] }, String(text));
}

function renderAllPreviews(text) {
  const styles = getStyles();
  return [
    '*Available Fancy previews for 𝐌𝐒𝐄𝐋𝐀-𝐂𝐇𝐔𝐈-𝐗𝐌𝐃:*',
    '',
    ...styles.map((style) => `${String(style + 1).padStart(2, '0')} │ ${renderStyle(style, text)}`),
    '',
    'Use: .fancy <number> <text> for one style.',
    'Use: .fancy all <text> to preview every style.'
  ].join('\n');
}

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
    const { arg, repondre, prefixe, ms } = context;

    const first = String(arg[0] || '').toLowerCase();
    const allMode = first === 'all' || first === 'styles' || first === 'preview';
    const id = String(arg[0] || '').match(/^\d+$/)?.[0];
    const text = id || allMode ? arg.slice(1).join(" ") : arg.join(" ");

    try {
      // Hakuna ID au text → onyesha list
      if (!text) {
        return await conn.sendMessage(
          from,
          {
            text:
              `Example:\n${prefixe}fancy 10 𝐌selachui\n\n` +
              renderAllPreviews("𝐌𝐒𝐄𝐋𝐀-𝐂𝐇𝐔𝐈-𝐗𝐌𝐃")
          },
          { quoted: quotedContact }
        );
      }

      // With plain text, return every available style so deployments do not
      // appear to support only one font. A numeric first argument selects one.
      if (!id || allMode) {
        return await conn.sendMessage(
          from,
          { text: renderAllPreviews(text) },
          { quoted: quotedContact }
        );
      }

      const styleNumber = Number(id);
      const styleKeys = getStyles();
      const selectedStyle = Number.isInteger(styleNumber) && styleKeys.includes(styleNumber - 1) ? styleNumber - 1 : null;
      const resultText = selectedStyle !== null
        ? renderStyle(selectedStyle, text)
        : `Style not found. Choose one of the ${styleKeys.length} styles shown in the list.`;

      // 🔘 COPY BUTTON
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
