'use strict'

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var Producto = require('../models/productos')
var jwt = require('../services/jwt');
var path = require('path');
var fs = require('fs');


function getProductos(req, res) {
    Producto.find().exec((err, productos)=>{
        if (err) return res.status(500).send({ message: 'error en la peticion del producto' })
        if (!productos) return res.status(500).send({ message: 'error en la peticion de los productos' })
        return res.status(200).send({productos})
    })
}


function agregarProducto(req, res) {
    var params = req.body;
    var producto = new Producto();

    if (params.nombreProducto) {
        producto.nombreProducto = params.nombreProducto
        producto.precio = params.precio

        producto.save((err, productoGuardado) => {
            if (err) return res.status(500).send({ message: 'error en la peticion del producto' })
            if (!productoGuardado) return res.status(404).send({ message: 'error al guardar el producto' })
            return res.status(200).send({
                producto: productoGuardado
            })
        })
    }

}

function ProductoVendido(req, res) {
    var params = req.body;
    var productId = req.params.productoId;
    var cantidad = 1;
    var sum = 0
    var totalMulti = 0;
    Producto.findById(productId, (err, productoEnc) => {
        if (err) return res.status(500).send({ message: 'error en la peticion del usuario' })
        if (!productoEnc) return res.status(200).send({ message: 'producto no existente' })
        if (productoEnc) {
            User.findOne({ _id: req.user.sub, productosVendidos: { $elemMatch: { productTableId: productId } } }, (err, userEnc) => {


                if (err) return res.status(500).send({ message: 'error en la peticion del usuario' })
                if (!userEnc) {
                    User.findByIdAndUpdate(req.user.sub, {
                        $push: {
                            productosVendidos: {
                                productTableId: productId, nombreProducto: productoEnc.nombreProducto,
                                cantidad: cantidad, precioIndividual: productoEnc.precio, totalProducto: cantidad * productoEnc.precio
                            }
                        }
                    },
                        { new: true }, (err, usuarioActualizado) => {
                            if (err) return res.status(500).send({ message: 'error en la peticion del usuario con producto' })
                            if (!usuarioActualizado) return res.status(200).send({ message: 'producto no añadido a usuario' })
                            usuarioActualizado.productosVendidos.forEach(element => {
                                sum += element.totalProducto
                            });

                            usuarioActualizado.totalVendido = sum;
                            usuarioActualizado.save()
                            return res.status(200).send({ usuario: usuarioActualizado })
                        })
                }
                if (userEnc) {
                    for (let x = 0; x < userEnc.productosVendidos.length; x++) {
                        if (userEnc.productosVendidos[x].productTableId === productId) {
                            totalMulti = (userEnc.productosVendidos[x].cantidad + 1) * userEnc.productosVendidos[x].precioIndividual;
                        }
                    }
                    User.findOneAndUpdate({ _id: req.user.sub, productosVendidos: { $elemMatch: { productTableId: productId } } },
                        { $inc: { "productosVendidos.$.cantidad": cantidad }, "productosVendidos.$.totalProducto": totalMulti }, { new: true }, (err, usuarioActualizado) => {
                            if (err) return res.status(500).send({ message: 'error en la peticion de aumentar candidad a producto de usuario' })
                            if (!usuarioActualizado) return res.status(200).send({ message: 'cantidad no aumentada a producto de usuario' })
                            usuarioActualizado.productosVendidos.forEach(element => {
                                sum += element.totalProducto
                            });

                            usuarioActualizado.totalVendido = sum;
                            usuarioActualizado.save()
                            return res.status(200).send({ usuario: usuarioActualizado })
                        })
                }
            })
        }
    })


}

function agregarProductoVendidoPorUsuario(req, res) {
    var params = req.body;
    var productoEnc = true;
    var producto = new Producto();
    var productosV = {
        nombreProducto: params.nombreProducto,
        cantidad: parseInt(params.cantidad)
    }


    User.findById(req.user.sub, (err, usuarioEncontrado) => {
        for (let x = 0; x < usuarioEncontrado.productosVendidos.length; x++) {

            if (usuarioEncontrado.productosVendidos[x].nombreProducto === productosV.nombreProducto) {
                var cantidadExistente = usuarioEncontrado.productosVendidos[x].cantidad
                var cantidadSumada = parseInt(cantidadExistente) + parseInt(productosV.cantidad)
                productosV.cantidad = cantidadSumada
                if (x > -1) {
                    usuarioEncontrado.productosVendidos.splice(x, 1);
                }

                usuarioEncontrado.productosVendidos.push(productosV)
                usuarioEncontrado.save()
                productoEnc = false;
                return res.status(200).send({ usuarioEncontrado })
            } else {
                console.log("no funciono if for")
            }
        }
        if (productoEnc === true) {
            usuarioEncontrado.productosVendidos.push(productosV)
            usuarioEncontrado.save();

            return res.status(200).send(usuarioEncontrado)
        }



    })

}


function ejemplo(req, res) {
    res.status(200).send({
        message: 'Hola'
    });
}

function getUser(req,res){
    var userId = req.params.id;

    User.findById(userId,(err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ message: 'error en la peticion' })
        if (!usuarioEncontrado) return res.status(400).send({ message: 'error en la busqueda del usuario' })
        return res.status(200).send({ user: usuarioEncontrado })
    })
}

function getUsers(req, res) {
    User.find().exec((err, usuariosEncontrados) => {
        if (err) return res.status(500).send({ message: 'error en la peticion' })
        if (!usuariosEncontrados) return res.status(400).send({ message: 'error en la busqueda de usuarios' })
        return res.status(200).send({ usuarios: usuariosEncontrados })
    })
}

function registrar(req, res) {
    var user = new User();
    var params = req.body;

    if (params.nombre && params.email && params.password) {
        user.carnet = params.carnet;
        user.nombre = params.nombre;
        user.email = params.email;
        user.rol = 'ROLE_USUARIO';
        user.productosVendidos = []
        user.totalVendido = 0;
        user.image = null;


        User.find({
            $or: [
                { email: user.email.toLowerCase() },
            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion de usuarios' });

            if (users && users.length >= 1) {
                return res.status(500).send({ message: 'El usuario ya existe' });
            } else {
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error al guardar el usuario' });

                        if (userStored) {
                            res.status(200).send({ message: 'Usuario creado exitosamente' })
                        } else {
                            res.status(404).send({ message: 'no se ha registrado el usuario' });
                        }
                    });
                });
            }
        });
    } else {
        res.status(200).send({
            message: 'Rellene todos los datos necesarios'
        });
    }

}

function login(req, res) {
    var params = req.body;
    var email2 = params.email;
    var password = params.password;

    User.findOne({ email: email2 }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' })

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    if (params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        })
                    } else {
                        user.password = undefined;
                        return res.status(200).send({ user })
                    }
                } else {
                    return res.status(404).send({ message: 'el usuario no se a podido identificar' })
                }
            });
        } else {
            return res.status(404).send({ message: 'el usuairo no se a podido logear' })
        }
    });
}

function subirImagen(req, res) {
    var userId = req.params.id;

    if (req.files) {
        var file_path = req.files.image.path;
        console.log(file_path);

        var file_split = file_path.split('\\');
        console.log(file_split);

        var file_name = file_split[3];
        console.log(file_name);

        var ext_split = file_name.split('\.');
        console.log(ext_split);

        var file_ext = ext_split[1];
        console.log(file_ext);

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, usuarioActualizado) => {
                if (err) return res.status(500).send({ message: ' no se a podido actualizar el usuario' })

                if (!usuarioActualizado) return res.status(404).send({ message: 'error en los datos del usuario, no se pudo actualizar' })

                return res.status(200).send({ user: usuarioActualizado });
            })
        } else {
            return removeFilesOfUploads(res, file_path, 'extension no valida')
        }

    }
}

function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message })
    })
}

function obtenerImagen(req, res) {
    var image_file = req.params.nombreImagen;
    var path_file = './src/uploads/users/' + image_file;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'no existe la imagen' })
        }
    });
}

function editarUsuario(req, res) {
    var userId = req.params.id;
    var params = req.body;

    //BORRAR LA PROPIEDAD DE PASSWORD
    delete params.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'no tiene los permisos para actualizar los datos de este usuario' })
    }

    User.findByIdAndUpdate(userId, params, { new: true }, (err, usuarioActualizado) => {
        if (err) return res.status(500).send({ message: 'error en la peticion' })

        if (!usuarioActualizado) return res.status(404).send({ message: 'no se a podido actualizar los datos del usuario' })

        return res.status(200).send({ user: usuarioActualizado })
    })
}


module.exports = {
    ejemplo,
    registrar,
    login,
    subirImagen,
    obtenerImagen,
    editarUsuario,
    getUser,
    getUsers,
    agregarProducto,
    agregarProductoVendidoPorUsuario,
    ProductoVendido,
    getProductos
}
