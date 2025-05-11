exports.success = (message, data) => {
    return { message, data }
}

exports.getUniqueId = (pokemons) => {
    const pokemonsIds = pokemons.map(pokemon => pokemon.id) // On récupère tous les ids des pokemons
    const maxId = pokemonsIds.reduce((a, b) => Math.max(a, b), 0) // On récupère l'id maximum 
    const uniqueId = maxId + 1 // On incrémente l'id max de 1 pour le prochain pokemon

    return uniqueId // On retourne l'id unique
}