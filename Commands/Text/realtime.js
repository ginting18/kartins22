const { Admin, Owner } = require("../../config.json");
const { DateTime } = require('luxon');
const { MessageEmbed, WebhookClient } = require("discord.js");
const shop = require("../../utils/schema/shop.js");
const Price = require("../../utils/schema/price.js");
const list = require("../../utils/schema/list.js");

module.exports = {
  name: "realtime",
  aliases: ["rt"],
  accessableby: "admin",
  description: "To Send Realtime Stock",
  usage: "",
  run: async (client, message, args) => {
    if (
      !message.author.bot &&
      !Admin.includes(message.author.id) &&
      message.author.id !== Owner
    )
      return message.reply("Only Admin And Owner Can Use This Command");

    const channel = await message.channel.send({
      content: "Sending Realtime Stock, Send Every 30s",
    });
    setInterval(async () => {
      const getCodes = await list
        .find({})
        .then((res) => {
          return res;
        })
        .catch(console.error);
      if (getCodes.length < 1) return;
      let text = "";
      for (let i = 0; i < getCodes.length; i++) {
        const code = getCodes[i];
        const stock = await shop
          .find({ code: code.code })
          .then((res) => {
            return res;
          })
          .catch(console.error);
        const price = await Price.findOne({ code: code.code })
          .then((res) => {
            return res;
          })
          .catch(console.error);
        text += `===============
            **<a:mahkota:1144243524750020639> ${
              code.name
            } <a:mahkota:1144243524750020639> **
            <a:panah:1144243490797133834> Code: **${code.code}**
            <a:panah:1144243490797133834> Stock: **${
              stock.length > 0 ? stock.length : "0"
            }**
            <a:panah:1144243490797133834> Price: **${
              price ? price.price : "Not Set Yet"
            } <:wl:1144243463735476245>**
            `.replace(/ {2,}/g, "");
      }

      const jakartaTime = DateTime.now().setZone("Asia/Jakarta");
      const formattedTime = jakartaTime.toFormat("yyyy-MM-dd HH:mm:ss");

      console.log(`Waktu di Jakarta sekarang: ${formattedTime}`);

      let embed = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle(
          "<a:warn:1144243567628406805> Stock <a:warn:1144243567628406805>"
        )
        .setTimestamp()
        .setFooter(`MZAJStur (${formattedTime})`)
        .setDescription(text);
      console.log("Sending Realtime Stock");
      channel.edit({ embeds: [embed] });
    }, 30000);
  },
};
