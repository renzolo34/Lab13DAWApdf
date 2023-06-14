const Producto = require("../models/Producto");
const User = require("../models/User");
const { jsPDF } = require('jspdf')
require('jspdf-autotable');

exports.generarPDf = async(req,res) =>{
    try {
        const user =  await User.find().lean();
        const productos = await Producto.find().lean();
        const nombreArchivo = 'ReporteSistema.pdf';
        const doc = new jsPDF();

        const tableOptions = {
            // ... Otras opciones de la tabla ...
            styles: {
              cellPadding: 2.5,
              halign: 'center', // Centrar horizontalmente el texto en las celdas
              valign: 'middle' // Centrar verticalmente el texto en las celdas
            }
          };
        // Generar la tabla de usuarios
        doc.setFontSize(15);
        doc.autoTable({
        theme: 'striped',
        startY: 30,
        head: [[`Usuarios (${user.length})`, 'Email']],
        body: user.map(user => [user.username, user.email]),
        ...tableOptions,
        didDrawPage: function (data) {
            // La generación de la tabla de usuarios se ha completado
            // Ahora podemos generar la tabla de productos

            // Generar la tabla de productos
            doc.setFontSize(15);
            doc.autoTable({
            theme: 'striped',
            startY: data.cursor.y + 10, // Iniciar después de la tabla de usuarios (+10 para agregar un espacio)
            head: [[`Productos (${productos.length})`, 'Categoría', 'Precio', 'Ubicacion', 'Fecha de Creacion']],
            body: productos.map(producto => [
            producto.producto, 
            producto.categoria, 
            `S/.${producto.precio}`, 
            producto.ubicacion, 
            new Date(producto.fechaCreacion).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })]),
            ...tableOptions
            });
        }
        });
        

        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.contentType('application/pdf');
        res.send(Buffer.from(doc.output('arraybuffer')));


    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
        
    }

   
}
