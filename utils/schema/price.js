const { Schema, model } = require("mongoose")

const schema = new Schema({
	code: String,
	price: Number
})

const price = model("Price", schema)

module.exports = price