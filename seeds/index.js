
// Importamos el módulo mongoose para interactuar con MongoDB
const mongoose = require("mongoose");

//importamos las ciudades, lo que tenemos en el archivo cities.js
const cities = require("./cities");

//importamos los lugares y descriptores
const {places, descriptors} = require("./seedHelpers"); //Se desestructura el objeto

//Importamos el modelo
const Campground = require("../models/campground"); //Van 2 puntos ya que este archivo index esta dentro del directorio seeds

// Definimos una función asincrónica llamada "main" que se encargará de realizar la conexión a la base de datos
async function main() {
    try {
        // Usamos el método "connect" de mongoose para conectarnos a la base de datos
        await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
            // Opciones de conexión
            useNewUrlParser: true,        // Utilizar el nuevo motor de análisis de URL (parser)
            useUnifiedTopology: true      // Utilizar un motor de topología unificada (nueva configuración de red)
        });

        // Imprimimos un mensaje en la consola si la conexión es exitosa
        console.log("Conexión a la base de datos establecida con éxito");
    } catch (err) {
        // Capturamos cualquier error que pueda ocurrir durante la conexión y lo imprimimos en la consola
        console.log("Error al conectar a la base de datos:", err);
    }
}

// Llamamos a la función "main" y manejamos cualquier error que pueda ocurrir durante su ejecución
main().catch(err => console.log(err));

//Creo una funcion para obtener un elemento random de un array, una funcion llamada sample
const sample = array => array[Math.floor(Math.random() * array.length)];



const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 50);
        const price = Math.floor(Math.random()*10000 + 100)
        const camp = new Campground({
            author:'670ad789ccda41f0b608b813',
            location: `${cities[random1000].ciudad}, ${cities[random1000].provincia}`,
            title: `${sample(places)} ${sample(descriptors)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitud,
                    cities[random1000].latitud,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dxkmnc3cq/image/upload/v1742400969/YelpCamp/wdq8ybpvbiowqml6oawk.jpg',
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                },
                {
                    url: 'https://res.cloudinary.com/dxkmnc3cq/image/upload/v1741821944/cld-sample-2.jpg',
                    filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})