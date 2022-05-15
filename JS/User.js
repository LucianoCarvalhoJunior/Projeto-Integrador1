//Classe (objeto) do usuario
const mongoose = require('mongoose')

//Atributos
const User = mongoose.model('User',{

    name:String,
    email:String,
    password:String
})

//Exportar para utilizar
module.exports = User