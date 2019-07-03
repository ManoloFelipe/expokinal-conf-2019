'use strict'

var Charla = require('../models/conferencia');


function registrarCharla(req, res) {
    var charla = new Charla();
    var params = req.body;
    
    if(params.nombreCharla && params.descripcion &&params.comunicador && params.salon && params.numeroAsiento && params.fecha){
        charla.nombreCharla = params.nombreCharla;
        charla.descripcion = params.descripcion;
        charla.comunicador = params.comunicador;
        charla.salon = params.salon;
        charla.numeroAsiento = params.numeroAsiento;
        charla.fecha = params.fecha;
        charla.capacidad = params.numeroAsiento;
        charla.image = params.image;
        charla.ocupados = [];
        Charla.find({$or: [
            {nombreCharla: charla.nombreCharla}
        ]}).exec((err, charlas)=>{
            
            if(err) return res.status(500).send({message: 'Error en la peticion de usuario'})
            
            if(charla && charlas.length >= 1){
                return res.status(500).send({message: 'el evento ya existe'});
            }else{

                    charla.save((err, charlaGuardada)=>{
                        if(err) return res.status(500).send({message: 'Error al guardar el evento'}) 
                        
                        if(charlaGuardada){
                            res.status(200).send({charla: charlaGuardada})
                        }else{
                            res.status(404).send({message: 'no se a podido registrar el evento'})
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


function editarCharla(req, res) {
    var charlaId = req.params.id;
    var params = req.body;
    var conteo = 0;
    var conteo2 = 0;
    Charla.findById(charlaId, (err, enc)=>{
        for (let i = 0; i < enc.ocupados.length; i++) {
            if (enc.ocupados[i] != null) {
                conteo +=1
            }      
        }
        delete params.ocupados;
        params.capacidad = params.numeroAsiento - conteo;
        Charla.findByIdAndUpdate(charlaId , params, {new:true},(err, charlaActualizada)=>{
            if(err) return res.status(500).send({message: 'error en la peticion'});

            if(!charlaActualizada) return res.status(404).send({message: 'no se a podido actualizar el evento'});

            return res.status(200).send({charla: charlaActualizada});
        })
    })
}

function eliminarCharla(req, res) {
    var charlaId = req.params.id;
    var params = req.body;

    Charla.findByIdAndDelete(charlaId,(err, charlaEliminada)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!charlaEliminada) return res.status(404).send({message: 'no se a podido eliminar el evento'});

        return res.status(200).send({conferencia: charlaEliminada});
    })
}

function listarCharlas(req, res) {


    Charla.find((err, charlas)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'});

        if(!charlas) return res.status(404).send({message: 'no se a podido eliminar el evento'});

        return res.status(200).send({charlas: charlas});
    })
}

function buscarId(req,res) {
    var id = req.params.id;

    Charla.findById(id, (err, enc)=>{
        if (err) return res.status(500).send({message: 'error en la peticion'});

        if(!enc) return res.status(404).send({message: 'sin charlas'});
 
        return res.status(200).send({charla: enc});
    })
}

function ocuparAsiento(req,res) {
    var charlaId = req.params.id;
    var userId = req.user.sub

    Charla.findById(charlaId, (err,enc)=>{
        
        if (err) return res.status(500).send({message: 'error en la peticion'});
        if(!enc) return res.status(404).send({message: 'la charla no existe'});
        if(enc.capacidad == 0) return res.status(200).send({message: 'Evento lleno, por favor, busque otro'});
        
        var nuevosOcupados = enc.ocupados
        var nuevaCapacidad = enc.capacidad

        for (let i = 0; i < nuevosOcupados.length+1; i++) {
            if (nuevosOcupados[i] == userId) return res.status(200).send({message: 'ya esta registrado a este evento'});
            if (i < nuevosOcupados.length+1) {
                nuevosOcupados[i] = userId;
                nuevaCapacidad = nuevaCapacidad - 1;
                break;
            }            
        }
        Charla.findByIdAndUpdate(charlaId, {ocupados : nuevosOcupados, capacidad : nuevaCapacidad},{new: true}, (err, newOcupado)=>{
            if(err) return res.status(500).send({message: 'error en la peticion'});

            if(!newOcupado) return res.status(404).send({message: 'no se ha podido generar una inscripcion'});
            
            return res.status(200).send({message: 'inscripcion generada exitosamente'});
        })
    })
}

module.exports = {
    registrarCharla,
    editarCharla,
    listarCharlas,
    eliminarCharla,
    buscarId,
    ocuparAsiento
}