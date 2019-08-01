'use strict'

var Carrousel = require('../models/carrousel');
var path = require('path');
var fs = require('fs');


function agregarCarrousel(req, res) {
    var carrousel = new Carrousel();
    var params = req.body;
    
    if(params.titulo && params.texto && params.urlButton ){
        carrousel.titulo=params.titulo;    
        carrousel.texto = params.texto;
        carrousel.imagen = params.imagen;
        carrousel.urlButton = params.urlButton;

        carrousel.find({$or: [
            {titulo: carrousel.titulo.toLowerCase()}
        ]}).exec((err, carrousels)=>{
            if(err) return res.status(500).send({message: 'Error en la peticion de usuario'})
            
            if(carrousels && carrousels.length >= 1){
                return res.status(500).send({message: 'el titulo ya existe a esa hora'});
            }else{

                    carrousel.save((err, carrouselGuardada)=>{
                        if(err) return res.status(500).send({message: 'Error al guardar el evento'}) 
                        
                        if(carrouselGuardada){
                            res.status(200).send({carrousel: carrouselGuardada})
                        }else{
                            res.status(404).send({message: 'no se a podido registrar el texto'})
                        }
                    })
                
            }
        })
    }else{
        res.status(200).send({
            message: 'rellene los datos necesarios'
        })
    }
}


function editarcarrousel(req, res) {
    var carrouselId = req.params.id;
    var params = req.body;

    Carrousel.findByIdAndUpdate(carrouselId , params, {new:true},(err, carrouselActualizada)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!carrouselActualizada) return res.status(404).send({message: 'no se a podido actualizar el texto'});

        return res.status(200).send({carrousel: carrouselActualizada});
    })
}

function eliminarcarrousel(req, res) {
    var carrouselId = req.params.id;

    Carrousel.findByIdAndDelete(carrouselId,(err, carrouselEliminada)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!carrouselEliminada) return res.status(404).send({message: 'no se a podido eliminar el evento'});

        return res.status(200).send({carrousel: carrouselEliminada});
    })
}

function listarcarrousels(req, res) {


    Carrousel.find((err, carrousels)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!carrousels) return res.status(404).send({message: 'no se a podido eliminar el evento'});

        return res.status(200).send({carrousel: carrousels});
    })
}

function subirImagen(req, res) {
    var userId = req.params.id;

    if(req.files){
        var file_path = req.files.image.path;
        console.log(file_path);

        var file_split = file_path.split('\\');
        console.log(file_split);

        var file_name = file_split[3];
        console.log(file_name);

        var ext_xplit = file_name.split('\.');
        console.log(ext_xplit);

        var file_ext = ext_xplit[1];
        console.log(file_ext);

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            User.findByIdAndUpdate(userId, {image: file_name}, {new:true},(err, usuarioActualizado)=>{
                if(err) return res.status(500).send({message: 'Error en la peticion'})
                
                if(!usuarioActualizado) return res.status(404).send({message: 'no se a podido actualizar el usuario'})
                
                return res.status(200).send({user: usuarioActualizado})
            })
        }else{
            return removeFilerOfUploads(res, file_path, 'Extension no valida')
        }
    }
}

function removeFilerOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err)=>{
        return res.status(200).send({message: message})
    })
}

function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './src/uploads/users/' + image_file;

    fs.exists(path_file, (exists) =>{
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: 'no existe la imagen'})
        }
    })
}

module.exports = {
    registrarcarrousel,
    editarcarrousel,
    listarcarrousels,
    eliminarcarrousel,
    subirImagen,
    getImageFile
}