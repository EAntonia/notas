const express = require('express');
const router = express.Router();

//Modelo de datos para las notas
const Nota = require('../model/Notes');

//Autenticación de usuarios
const { isAuthenticated } = require('../helpers/auth');

//Ruta para agregar notas
router.get('/notes/add', isAuthenticated, (req, res)=>{
    res.render('notes/nueva-nota');
});

//Ruta para listar las notas
router.get('/notes',isAuthenticated, async (req, res)=>{
    //res.send('Notas de la base de datos');
    await Nota.find({usuario: req.user._id})
              .lean().sort({fecha:'desc'})
              .then( (notas)=>{
                  //console.log(notas);
                  //res.send("Notas");
                  res.render('notes/consulta-notas',{notas})
              })
              .catch( (err)=>{
                  console.log(err);
                  res.redirect('error');
              })
});//Fin del método para listar las notas
//cuando el usuario presione enviar
router.post('/notes/nueva-nota', isAuthenticated, async (req, res)=>{
    //req.body contiene todos los datos enviados desde el servidor
    //console.log(req.body);

    //Obtenemos los datos en constantes
    const {titulo, descripcion,categoria} = req.body;
    const errores = [];

    if (!titulo)
        errores.push({text: ' Por favor inserta el título'});

    if (!descripcion)
        errores.push({text: 'Por favor inserta la descripción'})

    if (errores.length > 0)
        res.render('notes/nueva-nota', {
            errores,
            titulo,
            descripcion
        });
    else{
        const id = req.user._id;
        const nuevaNota = new Nota({titulo, descripcion,categoria, usuario:id});
        await nuevaNota.save() //await guarda la nota en la db de manera asíncrona
                       .then( ()=>{
                          //Enviamos un mensaje al fronend indicando que la nota se almaceno
                          req.flash('success_msg', 'Nota agregada de manera exitosa');
                          //Redirigimos el flujo de la app a la lista de todas las notas
                          res.redirect('/notes');
                       })
                       .catch( (err)=>{
                          console.log(err);
                          //En caso de algún error redirigimos a una página de error
                          res.redirect('/error');
                       })
        //console.log(nuevaNota);
        //res.send("ok");
    }    
}); //Fin del método nueva-nota

//Ruta para editar una nota
router.get('/notes/edit:id', isAuthenticated, async (req, res)=>{
    try {
        // Obtener el ObjectId que viene de la URL
        // Eliminar los dos puntos que se incluyen al inicio
        var _id = req.params.id.substring(1);
        
        const nota = await Nota.findById(_id);
        
        const { titulo, descripcion, categoria } = nota;
        
        res.render('notes/editar-nota', { titulo, descripcion, categoria, _id });
    } catch(error){
        console.log(error);
        res.redirect('/error');
    }
});// Fin de editar nota

// Ruta para guardar una nota editada en la bd
router.put('/notes/editar-nota/:id', isAuthenticated, async (req, res)=>{
    const { titulo, descripcion, categoria } = req.body;
    const _id = req.params.id;
    
    const errores = [];

    if (!titulo) errores.push({text: 'Por favor inserta el título'});
    if (!descripcion) errores.push({text: 'Por favor inserta la descripción'});
    // Puedes agregar validaciones adicionales para la categoría si es necesario

    if (errores.length > 0) {
        res.render('notes/editar-nota', {
            errores,
            titulo,
            descripcion,
            categoria,
            _id
        });
    } else {
        // No hay errores, se actualiza la nota en la bd
        await Nota.findByIdAndUpdate(_id, {titulo, descripcion, categoria}) 
            .then(() => {
                // Enviamos un mensaje al frontend indicando que la nota se actualizó
                req.flash('success_msg', 'Nota actualizada de manera exitosa');
                res.redirect('/notes');
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/error');
            });
    }
})// Fin de guardar nota editada

//Ruta para eliminar una nota
router.get('/notes/delete:id', isAuthenticated, async (req, res)=>{
    //Eliminar los dos puntos del id
    try {
         var _id = req.params.id;
         _id = _id.substring(1);
         await Nota.findByIdAndDelete(_id);
         req.flash('success_msg', 'Nota eliminada correctamente');
         res.redirect('/notes/')
    } catch (error) {
        res.send(404);
        console.log(error);
        res.redirect('/error')
    }
});//Fin de eliminar nota
// Ruta para listar notas de categoría "trabajo"
router.get('/notes/categoria=trabajo', isAuthenticated, async (req, res) => {
  const notasTrabajo = await Nota.find({ usuario: req.user._id, categoria: 'trabajo' })
    .lean()
    .sort({ fecha: 'desc' });
  
  res.render('notes/consulta-notas', { notas: notasTrabajo });
});

// Ruta para listar notas de categoría "casa"
router.get('/notes/categoria=casa', isAuthenticated, async (req, res) => {
  const notasCasa = await Nota.find({ usuario: req.user._id, categoria: 'casa' })
    .lean()
    .sort({ fecha: 'desc' });
  
  res.render('notes/consulta-notas', { notas: notasCasa });
});
module.exports = router;
