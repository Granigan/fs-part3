require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: 2,
    name: 'Martti Tienari',
    number: '040-123456'
  },
  {
    id: 3,
    name: 'Arto Järvinen',
    number: '040-123456'
  },
  {
    id: 4,
    name: 'Lea Kutvonen',
    number: '040-1234567'
  }
]

app.use(express.static('build'))
app.use(cors())
app.use(bodyParser.json())

morgan.token('bodyContent', req => {
  return JSON.stringify(req.body)
})
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.bodyContent(req)
    ].join(' ')
  })
)

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

app.get('/', (req, res) => {
  res.send('<h2>there\'s nothing here, go to /api/persons instead</h2>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON())
      } else {
        res.status(204).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons/', (req, res, next) => {
  const person = req.body

  if (person.name === undefined) {
    return res.status(400).json({ error: 'name missing' })
  }
  if (person.number === undefined) {
    return res.status(400).json({ error: 'number missing' })
  }
  if (persons.find(person => person.name === req.body.name)) {
    return res.status(400).json({ error: 'name must be unique' })
  }

  const newPerson = new Person({
    name: person.name,
    number: person.number
  })

  newPerson
    .save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
  Person.find({}).then(people => {
    res.send(`<p>Puhelinluettelossa on ${people.reduce(sum => {
      return sum + 1
    }, 0)} henkilön tiedot.</p>
          <p>${new Date()}</p>`)
  })
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const person = {
    number: req.body.number
  }
  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query'
  })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
