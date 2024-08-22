const express = require('express')
const sql = require('mssql');
const cors = require('cors')
const { json } = require('express')
const app = express()

app.use(express.json())
app.use(cors())

// Configuración de la conexión
const conexion = {
    user: 'sa',
    password: 'root',
    server: 'localhost', 
    database: 'articulos_db',
    options: {
        encrypt: true, // Use encrypt for Azure SQL Database
        trustServerCertificate: true // Solo para entornos de desarrollo, ajustar para producción
    }
};

// Función para conectarse a la base de datos y realizar una consulta
async function connectToDatabase() {
    try {
        // Establecer la conexión
        await sql.connect(conexion);

        /* TesT rapido de prueba visualiza DB
        const result = await sql.query`SELECT * FROM articulos`;
        */
        console.log("Conexion Exitosa"); // indicar const result para Imprimir los resultados de la consulta

    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
    } finally {
        // Cerrar la conexión
        await sql.close();
    }
}

// Llamar a la función
connectToDatabase();

app.get('/', function(req,res){
    res.send('Ruta INICIO')
})
//Mostrar todos los artículos
app.get('/api/articulos', (req,res)=>{
    conexion.query('SELECT * FROM articulos', (error,filas)=>{
        if(error){
            throw error
        }else{
            res.send(filas)
        }
    })
    sql.close();
})

//Mostrar un SOLO artículo
app.get('/api/articulo:id', (req,res)=>{
    conexion.query('SELECT * FROM articulos WHERE id = ?', [req.params.id], (error, fila)=>{
        if(error){
            throw error
        }else{
            res.send(fila)
        }
    })
})
//Crear un artículo
app.post('/api/crearArticulo', (req,res)=>{
    let data = {descripcion:req.body.descripcion, precio:req.body.precio, stock:req.body.stock}
    let sql = "INSERT INTO articulos SET ?"
    conexion.query(sql, data, function(err, result){
            if(err){
               throw err
            }else{              
             /*Esto es lo nuevo que agregamos para el CRUD con Javascript*/
             Object.assign(data, {id: result.insertId }) //agregamos el ID al objeto data             
             res.send(data) //enviamos los valores                         
        }
    })
})
//Editar articulo
app.put('/api/articuloEditar:id', (req, res)=>{
    let id = req.params.id
    let descripcion = req.body.descripcion
    let precio = req.body.precio
    let stock = req.body.stock
    let sql = "UPDATE articulos SET descripcion = ?, precio = ?, stock = ? WHERE id = ?"
    conexion.query(sql, [descripcion, precio, stock, id], function(error, results){
        if(error){
            throw error
        }else{              
            res.send(results)
        }
    })
})
//Eliminar articulo
app.delete('/api/articuloEliminar/:id', (req,res)=>{
    conexion.query('DELETE FROM articulos WHERE id = ?', [req.params.id], function(error, filas){
        if(error){
            throw error
        }else{              
            res.send(filas)
        }
    })
})
const puerto = process.env.PUERTO || 3000
app.listen(puerto, function(){
    console.log("Servidor Ok en puerto:"+puerto)
})