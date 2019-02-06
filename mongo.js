const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Please give password as an argument.");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb://fullstack:${password}@ds223605.mlab.com:23605/fs_part3c`;

mongoose.connect(url, { useNewUrlParser: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});
const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 5) {
  const name = process.argv[3];
  const number = process.argv[4];

  const person = new Person({
    name: name,
    number: number
  });

  person.save().then(res => {
    console.log(res);

    console.log(`Lisätään ${name}, ${number} luetteloon.`);
    mongoose.connection.close();
  });
} else {
  console.log("Puhelinluettelo:");

  Person.find({}).then(res => {
    res.forEach(person => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
}
