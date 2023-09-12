const shop = require("../../utils/schema/shop.js");
const list = require("../../utils/schema/list.js");
const {
  imageUrl,
  roleBuyer,
  channelTesti,
  Owner,
} = require("../../config.json");
const Bal = require("../../utils/schema/balance.js");
const Price = require("../../utils/schema/price.js");
const order = require("../../utils/schema/order.js");
const { MessageEmbed, MessageAttachment } = require("discord.js");

module.exports = {
  name: "belanja",
  aliases: ["buy", "beli", "claim"],
  description: "Buy Item",
  accessableby: "everyone",
  usage: "[Item Code] [Jumlah] (Optional, Default 1)",
  run: async (client, message, args) => {
    if (!args[0]) return message.reply("What would you like to buy?");
    let item = args[0];
    const getCode = await list
      .findOne({ code: item })
      .then((res) => {
        return res;
      })
      .catch(console.error);

    if (!getCode) return message.reply("Code Not Found");
    let howmuch = args[1] ? Number(args[1]) : 1;
    if (isNaN(howmuch)) return message.reply("Only Use Number For Amount");
    const user = message.author;
    let getBal = await Bal.findOne({ DiscordID: user.id })
      .then((d) => {
        console.log(d);
        return d;
      })
      .catch((e) => console.error(e));
    if (!getBal)
      return message.reply("Register First Before Using This Command!");
    let wallet = getBal.Balance;
    let price = await Price.findOne({ code: item })
      .then((d) => {
        console.log(d);
        return d?.price;
      })
      .catch((e) => console.error(e));
    if (!price) return message.reply("Tag Owner To Set Price For " + item);

    const data = await shop
      .find({ code: item })
      .then((res) => {
        return res;
      })
      .catch(console.error);

    console.log(price);

    if (data.length == 0) return message.reply("No Stock Yet");
    console.log("Amount :", howmuch);
    console.log("Stock :", data.length);
    if (Number(data.length) < Number(howmuch))
      return message.reply("Not That Much Stock");
    price = Number(price) * Number(howmuch);
    console.log(price);
    if (wallet < price)
      return message.reply("Ur Money Is Less, The Price Is " + price);
    let sending = "";
    if (!item.includes("script")) {
      for (let i = 0; i < howmuch; i++) {
        let send = await shop
          .findOneAndDelete({ code: item })
          .then((res) => {
            return res;
          })
          .catch(console.error);
        sending += send.data + "\n";
      }
    } else {
      let send = await shop
        .findOne({ code: item })
        .then((res) => {
          return res;
        })
        .catch(console.error);
      sending += send.data
    }
    try {
      const doneBuy = new MessageEmbed()
        .setTitle("Purchase was Successfull")
        .setDescription(
          "Purchase was successfull\nYou've successfully purchased " +
            item +
            " for " +
            price +
            " <:wl:1144243463735476245>\ndon't forget to give reps, thanks"
        )
        .setImage(imageUrl)
        .setFooter("**NO REPS NO WARRANTY**");
      user.send({
        content: "This Is Ur Order\n# NO REPS NO WARRANTY",
        files: [
          {
            attachment: Buffer.from(sending),
            name: "order.txt",
          },
        ],
        embeds: [doneBuy],
      });
      client.users.send(Owner, {
        content: "This Is <@" + message.author.id + "> Order",
        files: [
          {
            attachment: Buffer.from(sending),
            name: "order.txt",
          },
        ],
      });
      message.reply("Check Ur DM");
    } catch (e) {
      message.reply(
        "Did you turn off DM? if Yes u can dm Owner, if he is good maybe will be given your order :)"
      );
      client.users.send(Owner, {
        content: "This Is Error <@" + message.author.id + "> Order",
        files: [
          {
            attachment: Buffer.from(sending),
            name: "order.txt",
          },
        ],
      });
    }
    await Bal.updateOne(
      { DiscordID: user.id },
      { $inc: { Balance: -Number(price) } }
    )
      .then((d) => {
        console.log(d);
      })
      .catch((e) => console.error(e));

    const member = message.guild.members.cache.get(user.id);

    if (!member.roles.cache.some((r) => r.id == roleBuyer)) {
      member.roles.add(roleBuyer);
    }
    let orderN = await order
      .findOneAndUpdate({}, { $inc: { Order: 1 } }, { upsert: true, new: true })
      .then((d) => {
        return d?.Order;
      })
      .catch(console.error);
    if (!orderN) orderN = 1;
    const itemName = await list
      .findOne({ code: item })
      .then((res) => {
        return res?.name;
      })
      .catch(console.error);
    const testi = new MessageEmbed()
      .setTitle("#Order Number: " + orderN)
      .setDescription(
        "<a:panah1:1144990418614878268> Pembeli: **<@" +
          user.id +
          ">**\n<a:panah1:1144990418614878268> Produk: **" +
          howmuch +
          " " +
          (itemName || "IDK Name") +
          "**\n<a:panah1:1144990418614878268> Total Price: **" +
          price +
          " <:wl:1144243463735476245>**\n**Thanks For Purchasing Our Product(s)**"
      )
      .setTimestamp()
      .setImage(imageUrl)
      .setFooter("Testimoni");
    const ch = client.channels.cache.get(channelTesti);
    ch.send({ embeds: [testi] });
    const sendToOwner = new MessageEmbed()
      .setTitle("Purchase History")
      .setDescription(
        `
         Buyer: ${
           message.author.id?.toString()
             ? message.author.id.toString()
             : message.author.id
         }
         Item: ${item}
         Amount: ${howmuch}
       `.replace(/ {2,}/g, "")
      )
      .setTimestamp()
      .setFooter("Purchase History");
    client.users.send(Owner, { embeds: [sendToOwner] });
  },
};
