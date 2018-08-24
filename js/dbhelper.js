let fetchedCuisines;
let fetchedNeighborhoods;

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
  * IndexedDB Promised
	*/

  static get dbPromise() {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    } else {
      return idb.open('restaurants', 2, function(upgradeDb) {
        switch (upgradeDb.oldVersion) {
          case 0:
            upgradeDb.createObjectStore('all-restaurants', {
              keyPath: 'id'
            });
          case 1:
            const reviewsStore = upgradeDb.createObjectStore('all-reviews', {
              keyPath: 'id'
            });
            reviewsStore.createIndex('restaurant', 'restaurant_id');
        }
      });
    }
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.dbPromise.then(db => {
      if (!db) return;
      const tx = db.transaction('all-restaurants');
      const store = tx.objectStore('all-restaurants');
      store.getAll().then(results => {
        if (results.length === 0) {
          fetch(`${DBHelper.DATABASE_URL}/restaurants`)
            .then(response => {
              return response.json();
            })
            .then(restaurants => {
              const tx = db.transaction('all-restaurants', 'readwrite');
              const store = tx.objectStore('all-restaurants');
              restaurants.forEach(restaurant => {
                store.put(restaurant);
              })
              callback(null, restaurants);
            })
            .catch(error => {
              callback(error, null);
            });
        } else {
          callback(null, results);
        }
      })

    });
  }



  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          callback(null, restaurant);
        } else {
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') {
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
	 * Fetch all reviews for a restaurant
	 */
	static fetchRestaurantReviews(restaurant, callback) {
		DBHelper.dbPromise.then(db => {
			if (!db) return;
			// 1. Check if there are reviews in the IDB
			const tx = db.transaction('all-reviews');
			const store = tx.objectStore('all-reviews');
			store.getAll().then(results => {
				if (results && results.length > 0) {
          // Continue with reviews from IDB
          console.log(results);
					callback(null, results);
				} else {
					// 2. If there are no reviews in the IDB, fetch reviews from the network
					fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${restaurant.id}`)
					.then(response => {
						return response.json();
					})
					.then(reviews => {
						this.dbPromise.then(db => {
							if (!db) return;
							// 3. Put fetched reviews into IDB
							const tx = db.transaction('all-reviews', 'readwrite');
							const store = tx.objectStore('all-reviews');
							reviews.forEach(review => {
								store.put(review);
							})
						});
						// Continue with reviews from network
						callback(null, reviews);
					})
					.catch(error => {
						// Unable to fetch reviews from network
						callback(error, null);
					})
				}
			})
		});
	}

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.photograph) {
      return (`/public/images/${restaurant.photograph}.webp`);
    } else {
      return (`/public/images/placeholder.webp`);
    }
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    }
    );
    return marker;
  }

}
