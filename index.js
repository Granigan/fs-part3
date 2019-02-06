require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Martti Tienari",
    number: "040-123456"
  },
  {
    id: 3,
    name: "Arto Järvinen",
    number: "040-123456"
  },
  {
    id: 4,
    name: "Lea Kutvonen",
    number: "040-1234567"
  }
];

app.use(cors());
app.use(bodyParser.json());

morgan.token("bodyContent", req => {
  return JSON.stringify(req.body);
});
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.bodyContent(req)
    ].join(" ");
  })
);

app.use(express.static("build"));

app.get("/", (req, res) => {
  res.send("<h2>there's nothing here, go to /api/persons instead</h2>");
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then(people => {
    res.json(people.map(person => person.toJSON()));
  });
});

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id).then(person => {
    res.json(person.toJSON());
  });
});

app.post("/api/persons/", (req, res) => {
  const person = req.body;

  if (person.name === undefined) {
    return res.status(400).json({ error: "name missing" });
  }
  if (person.number === undefined) {
    return res.status(400).json({ error: "number missing" });
  }
  if (persons.find(person => person.name === req.body.name)) {
    return res.status(400).json({ error: "name must be unique" });
  }

  const newPerson = new Person({
    name: person.name,
    number: person.number
  });

  newPerson.save().then(savedPerson => {
    res.json(savedPerson.toJSON());
  });
});

app.get("/info", (req, res) => {
  const amountOfPersons = persons.reduce(acc => {
    return acc + 1;
  }, 0);
  res.send(`<p>Puhelinluettelossa on ${amountOfPersons} henkilön tiedot.</p>
          <p>${new Date()}</p>`);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);
  res.status(204).end();
});

app.put("/api/persons/:id", (req, res) => {
  const updatedPerson = persons.find(
    person => person.id === Number(req.params.id)
  );
  if (updatedPerson.name === req.body.name) {
    updatedPerson.number = req.body.number;
    persons = persons
      .filter(person => person.id !== req.body.id)
      .concat(updatedPerson);
    return res.json(updatedPerson);
  }
  return res.status(400).json({ error: "id/name mismatch" });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
