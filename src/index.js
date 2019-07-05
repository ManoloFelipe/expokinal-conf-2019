'use strict'

const mongoose = require("mongoose");
const app = require("./app");

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/ExpoKinal', {useNewUrlParser: true}).then(()=>{
    console.log("La base de datos esta corriendo correctamente");

    app.set('port', process.env.PORT || 3000);
    app.listen(app.get('port'), ()=>{
        console.log(`El servidor esta corriendo en http://localhost:${app.get('port')}`);
    });
}).catch(err => console.log(err));