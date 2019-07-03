'use strict'

const mongoose = require("mongoose");
const app = require("./app");

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://kinal:kinal123@ds213705.mlab.com:13705/heroku_gq8bqg39', { useNewUrlParser: true }).then(()=>{
    console.log('Se encuentra conectado a la Base de Datos en la nube');

    app.set('port', process.env.PORT || 3000 );
    app.listen(app.get('port'), ()=>{
        console.log(`El servidor esta corriendo en el puerto: '${app.get('port')}'`);
    });
}).catch(err => console.log(err));