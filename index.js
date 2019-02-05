const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

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

morgan.token("dexter", req => {
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
      tokens.dexter(req)
    ].join(" ");
  })
);

app.get("/", (req, res) => {
  res.send("<h2>there's nothing here, go to /api/persons instead</h2>");
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  const amountOfPersons = persons.reduce(acc => {
    return acc + 1;
  }, 0);
  res.send(`<p>Puhelinluettelossa on ${amountOfPersons} henkilön tiedot.</p>
          <p>${new Date()}</p>`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);
  res.status(204).end();
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

  person.id = Math.round(Math.random() * 1000);
  persons = persons.concat(person);
  res.json(person);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
