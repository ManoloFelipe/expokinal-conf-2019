'use strict'

var express = require('express');
var UserController = require('../controllers/userController');
var CharlaController = require('../controllers/conferenciaController');
var md_auth = require('../middlewares/autheticated');

//SUBIR IMAGEN
var multiparty = require('connect-multiparty');
var md_subir = multiparty({ uploadDir: './src/uploads/users' })


//Rutas
var api = express.Router();
api.get('/productos', md_auth.ensureAuth, UserController.getProductos);
api.post('/producto', UserController.agregarProducto);
api.post('/productoV', md_auth.ensureAuth, UserController.agregarProductoVendidoPorUsuario);
api.put('/productoVendido/:productoId', md_auth.ensureAuth, UserController.ProductoVendido);

api.get('/ejemplo', md_auth.ensureAuth, UserController.ejemplo);
api.get('/usario/:id', md_auth.ensureAuth, UserController.getUser);
api.get('/usuarios', UserController.getUsers);
api.post('/registrar', UserController.registrar);
api.post('/login', UserController.login);
api.post('/subir-imagen-usuario/:id', [md_auth.ensureAuth, md_subir], UserController.subirImagen);
api.get('/obtener-imagen-usuario/:nombreImagen', UserController.obtenerImagen)
api.put('/editar-usuario/:id', md_auth.ensureAuth, UserController.editarUsuario)
api.put('/email/:correo/:codigo', UserController.verificarEmail)

api.post('/charla/register', CharlaController.registrarCharla);
api.put('/charla/edit/:id', CharlaController.editarCharla);
api.put('/charla/occupy/:id', md_auth.ensureAuth, CharlaController.ocuparAsiento);
api.put('/charla/unoccupy/:id', md_auth.ensureAuth, CharlaController.cancelarEntrada);
api.put('/charla/check/:id', md_auth.ensureAuth, CharlaController.confirmarEntrada);
api.get('/charla/list', CharlaController.listarCharlas);
api.get('/charla/search/:id', CharlaController.buscarId);
api.get('/charla/noti/:id', CharlaController.notificacion);
api.delete('/charla/delete/:id', CharlaController.eliminarCharla);
module.exports = api;