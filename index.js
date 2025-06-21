const express = require("express");
const morgan = require("morgan");
const app = express();
const Person = require("./moduls/agenda.js");
require("dotenv").config();

const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

app.use(express.static("dist"));

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(requestLogger);

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => next(error));
});

app.get("/info", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.send(
        `<p>Estan agendadas una cantidad de ${
          persons.length
        } personas </p> <p>Solicitud realizada: ${new Date()}</p>`
      );
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).json({ error: "Persona no encontrada" });
      }
    })
    .catch((error) => {
      console.log("_________________-----------------");
      next(error);
    });
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(204).send({ message: "Persona correctamente eliminada" });
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatePerson) => {
      res.json(updatePerson);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  // if (!body.number || !body.name) {
  //   return res.status(400).json({ error: "Falta el numero o el nombre" });
  // }
  // if (persons.some((p) => p.name === body.name)) {
  //   return res.status(400).json({ error: "Persona ya agendada" });
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((result) => {
      console.log(
        `Agregado ${person.name} numero: ${person.number} al phonebook`
      );
      res.json(person);
    })
    .catch((error) => {
      next(error);
    });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
