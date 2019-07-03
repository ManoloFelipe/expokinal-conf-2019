'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    nombreProducto: String,
    precio: Number
});

module.exports = mongoose.model('Producto', ProductoSchema);