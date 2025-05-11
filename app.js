const express = require('express')
const morgan = require('morgan')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize')
const {success, getUniqueId} = require('./helper.js')
let pokemons = require('./mock-pokemon')
const PokemonModel = require('./src/models/pokemon')

const app = express()
const port = 3000

const sequelize = new Sequelize(
    'pokedex', //nom de la base de données
    'root', //nom d'utilisateur de la base de données
    '', //mot de passe de la bd
    { // Configuration de la connexion à la base de données
        host: 'localhost', 
        dialect: 'mariadb', // Type de base de données (mariadb, mysql, sqlite, postgres, mssql)
        dialectOptions: { 
            timezone: 'Etc/GMT-2'
        },
        logging: false 
    }
)

sequelize.authenticate()
.then(_ => console.log('La connexion a la BD a bien ete etablie.'))
.catch(error => console.log(`La connexion a la BD a echoue avec l'erreur : ${error}`))

const Pokemon = PokemonModel(sequelize, DataTypes)
// Synchronisation du modèle avec la base de données
sequelize.sync( { force: true }) // force: true pour recréer la table à chaque fois
.then(_ => console.log('La base de donnees "Pokedex" a bien ete synchronise'))

app
.use(favicon(__dirname + '/favicon.ico')) // Middleware pour servir le favicon
.use(morgan('dev')) // Middleware pour logger les requêtes HTTP
.use(bodyParser.json()) // Middleware pour parser le corps des requêtes en JSON

// Utilisation du middleware dans l'application grâce à app.use()
// app.use((req, res, next) => {
//     console.log(`Requete recu avec la methode ${req.method} sur l'url ${req.url}`)
//     next()
// })

// Les routes de l'application
app.get('/', (req, res) => { res.send('Hello World! This is a test.✌')})

app.get('/api/pokemons/:id', (req, res) => { 
    const id = parseInt(req.params.id)
    const pokemon = pokemons.find(pokemon => pokemon.id === id)
    const message = "Un pokemon a bien ete trouve."
    res.json(success(message, pokemon))
})

app.get('/api/pokemons', (req, res) => {
    const message = "Voici la liste des pokemons."
    res.json(success(message, pokemons))
})

// Création d'un nouveau pokemon
// On utilise la méthode POST pour créer un nouveau pokemon
app.post('/api/pokemons', (req, res) => {
    const id = getUniqueId(pokemons)

    // Création d'un nouveau pokemon avec un id et une date de création
    const pokemonCreated = {...req.body, ...{id: id, createdAt: new Date()}}
    pokemons.push(pokemonCreated) // Ajout du pokemon dans le tableau
    const message = `Le pokemon ${pokemonCreated.name} a bien ete cree avec l'id ${id}`
    // Réponse au client avec le pokemon créé 
    res.json(success(message, pokemonCreated)) 
})

// Mise à jour d'un pokemon
// On utilise la méthode PUT pour mettre à jour un pokemon
app.put('/api/pokemons/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const pokemonUpdated = {...req.body, id: id}// On met à jour le pokemon avec les nouvelles données
    pokemons = pokemons.map(pokemon => {
        return pokemon.id === id ? pokemonUpdated : pokemon // On remplace le pokemon par le pokemon mis à jour
    }) 
    const message = `Le pokemon ${pokemonUpdated.name} a bien ete modifie.`
    res.json(success(message, pokemonUpdated)) // Réponse au client avec le pokemon modifié
})

// Suppression d'un pokemon
app.delete('/api/pokemons/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const pokemonDeleted = pokemons.find(pokemon => pokemon.id === id) // On récupère le pokemon à supprimer
    pokemons = pokemons.filter(pokemon => pokemon.id !== id) // On filtre le tableau pour supprimer le pokemon
    const message = `Le pokemon ${pokemonDeleted.name} a bien ete supprime.`
    res.json(success(message, pokemonDeleted)) // Réponse au client avec le pokemon supprimé
})

app.listen(port, () => {
    console.log(`Votre application Node est demarré sur le port http://localhost:${port}`)
})