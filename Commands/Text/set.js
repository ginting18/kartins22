const Bal = require("../../utils/schema/balance.js")
  
module.exports = {
    name: "set",
    aliases: ["register"],
    description: "Set GrowID",
    accessableby: "everyone",
    usage: "[GrowID]",
    run: async (client, message, args) => {
        if (!args[0]) return message.channel.send({ content: 'What is Your GrowID?'}).then(msg => {
            setTimeout(() => msg.delete(), 5000)
        })
        .catch()
        let GrowID = args[0].toLowerCase()
        let user = message.author.id;
        let existingEntry = await Bal.findOne({GrowID: GrowID})
            .then(d => {
                return d.DiscordID 
            })
            .catch(e => console.error(e))
    
        if (existingEntry && existingEntry !== user) {
        	message.reply("Sorry, GrowID Has Been Used")
        } else {
    	    const newData = {
    	        GrowID: GrowID,
                DiscordID: user,
                Balance: 0 
            } 
            await Bal.findOneAndUpdate({ DiscordID: user }, { $set: { GrowID: GrowID }}, { upsert: true, new: true, setDefaultsOnInsert: true })
                .then(res => {
                	console.log(res)
                    message.reply("Succes Adding GrowID To Database")
                    message.reply("GrowID: \n"+res.GrowID)
                })
                .catch(e => console.error(e))
        }
    }
}