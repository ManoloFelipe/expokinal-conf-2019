var mongoose=require("mongoose")
var Schema=mongoose.Schema

var HistoriaSchema= Schema({
    titulo:String,
    texto: String,
    imagen: String,
    anio: String,
})

module.exports= mongoose.model('Historia', HistoriaSchema)