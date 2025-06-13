const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  res.send(
    `<p>Estan agendadas una cantidad de ${
      persons.length
    } personas </p> <p>Solicitud realizada: ${new Date()}</p>`
  );
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const persona = persons.find((p) => p.id === id);

  if (!persona) {
    res.status(404).end();
  }

  res.json(persona);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((p) => p.id !== id);

  res.status(204).end();
});

const generarId = () => {
  let idDuplicado = false;
  do {
    const idGenerado = Math.floor(Math.random() * 100000);
    console.log(idGenerado);
    if (persons.some((p) => p.id === idGenerado)) {
      idDuplicado = true;
    } else {
      console.log(idGenerado);
      return idGenerado;
    }
  } while (idDuplicado);
};

app.post("/api/persons", (req, res) => {
  const body = req.body;
  console.log(req.body);

  if (!body.number || !body.name) {
    return res.status(400).json({ error: "Falta el numero o el nombre" });
  }
  if (persons.some((p) => p.name === body.name)) {
    return res.status(400).json({ error: "Persona ya agendada" });
  }

  const person = {
    id: generarId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  res.json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
