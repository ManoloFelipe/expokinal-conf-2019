'use strict'

var Conferencista = require('../models/conferencista');
var Conferencia = require('../models/conferencia');
var path = require('path');
var fs = require('fs');


function addConferencista(req, res) {
    var conferencista = new Conferencista();
    var params = req.body;
    
    if(params.nombre && params.datos ){
        conferencista.nombre=params.nombre;    
        conferencista.datos = params.datos;
        conferencista.imagen = params.imagen;
        conferencista.redes = [];

        conferencista.find({$or: [
            {nombre: conferencista.nombre.toLowerCase()}
        ]}).exec((err, conferencistas)=>{
            if(err) return res.status(500).send({message: 'Error en la peticion de usuario'})
            
            if(conferencistas && conferencistas.length >= 1){
                return res.status(500).send({message: 'el conferencista ya existe a esa hora'});
            }else{

                    conferencista.save((err, conferencistaGuard)=>{
                        if(err) return res.status(500).send({message: 'Error al guardar el conferencista'}) 
                        
                        if(conferencistaGuard){
                            res.status(200).send({carrousel: conferencistaGuard})
                        }else{
                            res.status(404).send({message: 'no se a podido registrar el conferencista'})
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


function editConferencista(req, res) {
    var conferId = req.params.id;
    var params = req.body;

    if (params.redes)delete params.redes;

    Conferencista.findByIdAndUpdate(conferId , params, {new:true},(err, confEdit)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!confEdit) return res.status(404).send({message: 'no se a podido actualizar el conferencista'});

        return res.status(200).send({carrousel: confEdit});
    })
}

function addRed(req, res) {
    var conferId = req.params.id;
    var urlN = req.params.url;
    var redN = req.params.redSocial;

    Conferencista.findOne({_id: conferId, redes:{$elemMatch:{red: redN}}}, (err, enc)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!enc) {
            Conferencista.findByIdAndUpdate(conferId, {
                $push: {
                    redes:{
                        red: redN,
                        url: urlN
                    }
                }
            },
                {new:true}, (err,enc)=>{
                    if (err) return res.status(500).send({ message: 'error en la peticion del usuario al agregar red' })

                    if (!enc) return res.status(200).send({ message: 'red no añadido a usuario' })
                    
                    return res.status(200).send({ message: 'Red registrada' })
                })
        }else{
            Conferencista.findOneAndUpdate({_id: conferId, redes:{$elemMatch:{red: redN}}}, {"redes.$.url": urlN},{new: true},(err, act)=>{
                if (err) return res.status(500).send({ message: 'error en la peticion del usuario al actualizar red' })

                if (!act) return res.status(200).send({ message: 'red no actualizada' })
                    
                return res.status(200).send({ message: 'Red actualizada'})
            })
        }
    })
}

function deleteConferencista(req, res) {
    var confId = req.params.id;

    Conferencista.findByIdAndDelete(confId,(err, confEliminado)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!confEliminado) return res.status(404).send({message: 'no se a podido eliminar el evento'});

        Conferencia.findOne( {comunicador: confId}, (err, enc)=>{
            if (err) return res.status(500).send({ message: 'Error al eliminar usuario' });
      
            if (enc){
              Conferencia.findByIdAndUpdate(enc.id, {$pull:{comunicador:confId}},{new : true}, (err, eli)=>{
                if (err) return res.status(500).send({ message: 'Error al eliminar comunicador de conferencias' });
      
                if (!eli)return res.status(404).send({ message: 'Usuario no encontrado' });
                  
                return res.status(200).send({ message: 'Usuario eliminado' });
              })  
            }

            return res.status(200).send({ message: 'Usuario eliminado' });
        })
    })
}

function listarComunicadores(req, res) {


    Conferencista.find((err, comunicadores)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!comunicadores) return res.status(404).send({message: 'no se a podido eliminar el evento'});

        return res.status(200).send({carrousel: comunicadores});
    })
}

function listarComunicador(req, res) {
    var comId = req.params.id

    Conferencista.findById(comId,(err, comunicador)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!comunicador) return res.status(404).send({message: 'no se a podido eliminar el evento'});

        return res.status(200).send({carrousel: comunicador});
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
    addConferencista,
    editConferencista,
    deleteConferencista,
    listarComunicador,
    listarComunicadores,
    addRed,
    subirImagen,
    getImageFile
}