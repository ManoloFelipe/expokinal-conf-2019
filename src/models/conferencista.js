var mongoose=require("mongoose")
var Schema=mongoose.Schema

var ConferencistaSchema= Schema({
    nombre:String,
    datos: String,
    imagen: String,
    redes:[{
        red: String,
        url: String
    }]
})

module.exports= mongoose.model('Carrousel', ConferencistaSchema)