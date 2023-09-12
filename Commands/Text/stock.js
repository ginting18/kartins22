const { MessageEmbed } = require("discord.js");
const shop = require("../../utils/schema/shop.js");
const Price = require("../../utils/schema/price.js");
const list = require("../../utils/schema/list.js");
const {
  roleBuyer,
  channelTesti,
  Owner,
  Admin,
  channelIdStock,
} = require("../../config.json");
const stock = require("../../utils/schema/stock.js");

module.exports = {
  name: "stock",
  aliases: ["check"],
  description: "Check Stock",
  accessableby: "admin",
  usage: "",
  run: async (client, message, args) => {
    const stockAccess = await stock
      .findOne({})
      .then((d) => {
        return d?.Public;
      })
      .catch(console.error);
    if (!stockAccess) {
      if (
        !message.author.bot &&
        !Admin.includes(message.author.id) &&
        message.author.id !== Owner
      )
        return message.reply(`U Can Check Stock At <#${channelIdStock}>`);
    }
    const getCodes = await list
      .find({})
      .then((res) => {
        return res;
      })
      .catch(console.error);
    if (getCodes.length < 1) {
      return message.reply("The owner hasn't added any products yet");
    }

    console.log(getCodes);
    let text = "";
    for (let i = 0; i < getCodes.length; i++) {
      const code = getCodes[i];
      console.log(code.code);
      const stock = await shop
        .find({ code: code.code })
        .then((res) => {
          return res;
        })
        .catch(console.error);
      const price = await Price.findOne({ code: code.code })
        .then((res) => {
          console.log(res);
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
    console.log("Text: ", text);
    const send = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle(
        "<a:warn:1144243567628406805> Stock <a:warn:1144243567628406805>"
      )
      .setTimestamp()
      .setFooter("MZAJ")
      .setDescription(text);
    message.channel.send({ embeds: [send] });
  },
};
