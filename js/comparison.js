document.addEventListener('DOMContentLoaded', function() {
    const favoritesContainer = document.getElementById('favorites-container');
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
      favoritesContainer.innerHTML = '<p>No tienes lugares favoritos aún.</p>';
      return;
    }
    
    // Mostrar cada favorito
    favorites.forEach(placeId => {
      const placeElement = document.createElement('div');
      placeElement.className = 'favorite-place';
      placeElement.textContent = placeId; // Aquí podrías mostrar más información
      favoritesContainer.appendChild(placeElement);
    });
  });