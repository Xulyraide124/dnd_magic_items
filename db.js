let favorites = [];
module.exports = {
    addFavorite: async (index) => {
        if (!favorites.includes(index)) favorites.push(index);
        console.log("Favoris actuels:", favorites);
        return true;
    },
    getFavorites: async () => favorites
};