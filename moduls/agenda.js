const mongoose = require("mongoose");
require("dotenv").config();

const URL = process.env.MONGO_DB_URI;

mongoose.set("strictQuery", false);

mongoose
  .connect(URL)
  .then(() => {
    console.log("Se conecto exitosamente a MongoDB");
  })
  .catch(() => {
    console.log("Hubo un error al conectarse a MongoDB");
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, "El nombre debe tener al menos 3 caracteres"],
    required: [true, "El nombre es obligatorio"],
    trim: true,
  },
  number: {
    type: String, // Changed to String
    required: [true, "El número es obligatorio"],
    validate: {
      validator: function (value) {
        // More flexible regex that handles various formats
        const phoneRegex = /^\d{2,3}-\d{6,}$/;
        return phoneRegex.test(value);
      },
      message: (props) =>
        `${props.value} no es un número de teléfono válido. Use el formato XX-XXXXXX o XXX-XXXXXX`,
    },
    trim: true,
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
