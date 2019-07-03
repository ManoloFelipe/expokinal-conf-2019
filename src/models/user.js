'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
    carnet: String,
    nombre: String,
    email: String,
    password: String,
    rol: String,
    productosVendidos: [{
        productTableId: String,
        nombreProducto: String,
        cantidad: Number,
        precioIndividual:Number,
        totalProducto:Number
    }],
    totalVendido: Number,
    image: String
});

module.exports = mongoose.model('User', UserSchema);