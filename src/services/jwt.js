'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_IN6BM';

exports.createToken = function(user){
    var payload = {
        sub: user._id,
        carnet: user.carnet,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        productosVendidos: user.productosVendidos,
        totalVendido: user.totalVendido,
        image: user.image,
        iat: moment().unix(),
        exp: moment().day(30, 'days').unix
    };

    return jwt.encode(payload, secret);
}