
'use strict'

var Texto = require('../models/Texto');
var path = require('path');
var fs = require('fs');

function agregarTexto(req, res) {

    var texto = new Texto();
    var params = req.body;

    if (params.titulo && params.descripcion) {
        texto.titulo = params.titulo;
        texto.descripcion = params.descripcion;
        texto.image = null;


        texto.save((err, textoGuardado) => {
            if (err) return res.status(500).send({ message: 'Errpr al momento de guardar el Texto' });

            if (textoGuardado) {
                res.status(200).send({ texto: textoGuardado });
            } else {
                res.status(404).send({ message: 'No a podido guardarse el Texto' });
            }
        })
    } else {
        res.status(200).send({
            message: 'Debe Rellenar Los Campos Necesarios'
        });
    }
}


function subirImagen(req, res) {
    var textoId = req.params.id;

    if (req.files) {
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

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            Texto.findByIdAndUpdate(textoId, { image: file_name }, { new: true }, (err, usuarioActualizado) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion' })

                if (!usuarioActualizado) return res.status(404).send({ message: 'no se a podido actualizar la imagen' })

                return res.status(200).send({ user: usuarioActualizado })
            })
        } else {
            return removeFilerOfUploads(res, file_path, 'Extension no valida')
        }
    }
}


function removeFilerOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message })
    })
}

function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './src/uploads/' + image_file;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'no existe la imagen' })
        }
    })
}

function editarTexto(req, res) {
    var params = req.body;
    var textoId = req.params.id;


    Texto.findByIdAndUpdate(textoId, params, { new: true }, (err, textoActualizado) => {
        if (err) return res.status(500).send({ message: 'No pudo realizarse la peticion' });

        if (!textoActualizado) return res.status(404).send({ message: 'No se a podido actualizar el texto' });

        return res.status(200).send({ texto: textoActualizado });
    })

}

function eliminarTexto(req, res) {

    var textoId = req.params.id;

    Texto.findByIdAndDelete(textoId, (err, textoEliminado) => {

        if (err) return res.status(500).send({ message: 'No se a podido realizar la peticion' });

        if (!textoEliminado) 
            return res.status(404).send({ message: 'No se a podido eliminar el texto' });
       
            return res.status(404).send({ message: 'El texto Fue eliminado' });
        
    })
}

function listarTexto(req, res) {

    Texto.find((err, TextoEncontrado) => {
        if (err) return res.status(500).send({ message: 'No pudo realizarse la peticion' });

        if (!TextoEncontrado) return res.status(404).send({ message: 'No  hay ningun texto' });

        return res.status(200).send({ texto: TextoEncontrado });
    })
}

function buscarTexto(req,res){

    var NombreT=req.params.titulo

    Texto.find({titulo: {$regex: new RegExp(NombreT)}},(err,TextoEnc)=>{
        if(err) return res.status(500).send({message:'Error al Procesar su Peticion'});
        if(TextoEnc){
        return res.status(200).send({message:TextoEnc});
        
    }else
        return res.status(404).send({message:'El Usuario No ha sido Encontrado'});
        
        

    })
    
}

module.exports = {

    agregarTexto,
    editarTexto,
    eliminarTexto,
    listarTexto,
    buscarTexto,
    subirImagen,
    getImageFile
   

}




