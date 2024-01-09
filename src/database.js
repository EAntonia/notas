const mongoose = require('mongoose');
require('dotenv').config();
const url = process.env.MONGODB_URL;
//const url = "mongodb+srv://m23450794:<-notas.2023>@cluster0.ojebdqv.mongodb.net/?retryWrites=true&w=majority"


mongoose.connect('mongodb://127.0.0.1/notasdb')
//mongoose.connect(url)
        .then( db=> console.log("Base de datos conectada"))
        .catch( err=> console.log(err));