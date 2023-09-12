const depo = require("../../utils/schema/depo.js");
const { MessageEmbed } = require("discord.js");
const dl = require("../../utils/schema/dl.js");

module.exports = {
  name: "depo",
  aliases: ["d"],
  description: "Show World Deposit",
  accessableby: "everyone",
  usage: "",
  run: async (client, message, args) => {
    const deposit = await depo
      .findOne({})
      .then((d) => {
        console.log(d);
        return d;
      })
      .catch((e) => console.error(e));
    const rateDl = await dl
      .findOne({})
      .then((res) => {
        return res?.Rate;
      })
      .catch(console.error);

    const embed = new MessageEmbed()
      .setTitle("Depo World")
      .setDescription(
        "<a:panah:1144287062460223519> World: **" +
          (deposit?.world ? deposit.world : "Not Set Yet") +
          "**\n<a:panah:1144287062460223519> Owner: **" +
          (deposit?.owner ? deposit.owner : "Not Set Yet") +
          "**\n<a:panah:1144287062460223519> Bot Name: **" +
          (deposit?.botName ? deposit.botName : "Not Set Yet") +
          "**\n<a:panah:1144287062460223519> Saweria Link: **" +
          (!rateDl && deposit?.saweria != "No Set"
            ? "Owner Hasn't Set DL Rate for Saweria"
            : deposit?.saweria == "No Set"
            ? "I Don't Accept Payment Using Saweria"
            : deposit?.saweria) +
          "**"
      )
      .setFooter("Don't Donate If Bot Isn't In The World");
    message.reply({ embeds: [embed] });
  },
};
