'use strict'

var Historia = require('../models/historia');
var path = require('path');
var fs = require('fs');


function addHistoria(req, res) {
    var historia = new Historia();
    var params = req.body;
    
    if(params.titulo && params.texto && params.urlButton ){
        historia.titulo=params.titulo;    
        historia.texto = params.texto;
        historia.imagen = params.imagen;
        historia.anio = params.anio;

        historia.find({$or: [
            {titulo: historia.titulo.toLowerCase()}
        ]}).exec((err, historias)=>{
            if(err) return res.status(500).send({message: 'Error en la peticion de usuario'})
            
            if(historias && historias.length >= 1){
                return res.status(500).send({message: 'la historia ya existe'});
            }else{

                    historia.save((err, histSave)=>{
                        if(err) return res.status(500).send({message: 'Error al guardar el evento'}) 
                        
                        if(histSave){
                            res.status(200).send({historia: histSave})
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


function editHistoria(req, res) {
    var hisId = req.params.id;
    var params = req.body;

    Historia.findByIdAndUpdate(hisId , params, {new:true},(err, hisAct)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!hisAct) return res.status(404).send({message: 'no se a podido actualizar el texto'});

        return res.status(200).send({historia: hisAct});
    })
}

function deleteHistoria(req, res) {
    var historiaId = req.params.id;

    Historia.findByIdAndDelete(historiaId,(err, hisDelete)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!hisDelete) return res.status(404).send({message: 'no se a podido eliminar el evento'});

        return res.status(200).send({historia: hisDelete});
    })
}

function listarHistorias(req, res) {


    Historia.find((err, historias)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!historias) return res.status(404).send({message: 'no se a podido eliminar el evento'});

        return res.status(200).send({historia: historias});
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
            User.findByIdAndUpdate(userId, {image: file_name}, {new:true},(err, histAct)=>{
                if(err) return res.status(500).send({message: 'Error en la peticion'})
                
                if(!histAct) return res.status(404).send({message: 'no se a podido actualizar el usuario'})
                
                return res.status(200).send({user: histAct})
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
    addHistoria,
    deleteHistoria,
    listarHistorias,
    editHistoria,
    subirImagen,
    getImageFile
}