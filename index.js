const express = require("express");
const app = express();

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

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
