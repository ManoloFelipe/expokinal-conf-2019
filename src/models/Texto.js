'use strict'

var mongoose= require('mongoose');
var Schema = mongoose.Schema;

var TextoSchema= Schema({
    titulo: String,
    descripcion: String,
    imagen:String,

})

module.exports = mongoose.model('Texto',TextoSchema);