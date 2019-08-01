var mongoose=require("mongoose")
var Schema=mongoose.Schema

var CarrouselSchema= Schema({
    titulo:String,
    texto: String,
    imagen: String,
    urlButton:Boolean
})

module.exports= mongoose.model('Carrousel', CarrouselSchema)