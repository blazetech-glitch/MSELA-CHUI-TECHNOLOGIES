"use strict";

const { blazetz } = require("../../devblaze/blazetz");
const {
  getCachedSettingsSync,
  updateCachedSetting,
} = require("../../lib/settingsCache");

/**
 * Controls whether incoming private messages are marked as read automatically.
 * Group auto-read remains controlled separately by AUTO_READ.
 */
blazetz(
  {
    nomCom: "autoread",
    alias: ["autoreadpm", "pmread"],
    categorie: "Settings",
    reaction: "📖",
  },
  async (dest, client, { arg = [], repondre, superUser }) => {
    if (!superUser) {
      return repondre(
        "🚫 Only the bot owner can change private-message auto-read.",
      );
    }

    const option = String(arg[0] || "status")
      .trim()
      .toLowerCase();
    const current = String(
      getCachedSettingsSync().AUTO_READ_PM || "off",
    ).toLowerCase();

    if (option === "status") {
      return repondre(
        `📖 *PRIVATE-MESSAGE AUTO-READ*\n\nStatus: *${current.toUpperCase()}*\n\nUse ".autoread on" or ".autoread off" to change it.`,
      );
    }

    if (option !== "on" && option !== "off") {
      return repondre(
        "Use: `.autoread on`, `.autoread off`, or `.autoread status`",
      );
    }

    await updateCachedSetting("AUTO_READ_PM", option);
    return repondre(
      `✅ Private-message auto-read is now *${option.toUpperCase()}*.`,
    );
  },
);
