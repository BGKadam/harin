function initMap() {
    var map = new google.maps.Map(document.createElement('div'), {
        center: { lat: -33.866, lng: 151.196 },
        zoom: 15
    });
    var service = new google.maps.places.PlacesService(map);
    service.getDetails({
        placeId: 'ChIJJSHW6YaXyzsRwkBmXEwcnb8',
        fields: ['reviews', 'user_ratings_total', 'rating']
    }, function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var totalReviews = place.user_ratings_total; // Get the total number of reviews
            var overallRating = place.rating; // Get the overall rating

            console.log('Total Reviews:', totalReviews);
            console.log('Overall Rating:', overallRating);

            // Display the overall rating
            var overallRatingHTML = overallRating.toFixed(1) + ' ';
            for (var k = 0; k < Math.round(overallRating); k++) {
                overallRatingHTML += '<i class="fas fa-star"></i>';
            }
            document.getElementById('overall-rating').innerHTML = overallRatingHTML;

            if (place.reviews) {
                var reviewsContainer = document.querySelector('#google-reviews .carousel-inner');
                for (var i = 0; i < place.reviews.length; i += 3) {
                    var slideHTML = '<div class="carousel-item ' + (i === 0 ? 'active' : '') + '"><div class="row">';
                    for (var j = 0; j < 3 && i + j < place.reviews.length; j++) {
                        var review = place.reviews[i + j];
                        var starsHTML = '';
                        for (var l = 0; l < review.rating; l++) {
                            starsHTML += '<i class="fas fa-star"></i>';
                        }
                        slideHTML += '<div class="col-sm-4"><div class="card"><div class="card-body"><h5 class="card-title">' + review.author_name + ' - ' + starsHTML + '</h5><p class="card-text review-text">' + review.text + '</p><p class="card-text"><small class="text-muted">' + review.relative_time_description + '</small></p></div></div></div>';
                    }
                    slideHTML += '</div></div>';
                    reviewsContainer.innerHTML += slideHTML;
                }
                document.getElementById('total-reviews').innerText = totalReviews + ' Reviews';
            }
        }
    });
}
