'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CharlaSchema = Schema({
    nombreCharla:String,
	descripcion: String,
    comunicador: String,
    salon: String,
    numeroAsiento:Number,
    hora:Date,
    fecha: String,
    capacidad: Number,
    image: String,
    confirmado: Number,
    ocupados: [{type: Schema.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Conferencia', CharlaSchema);