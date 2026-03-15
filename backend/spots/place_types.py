
#https://developers.google.com/maps/documentation/places/web-service/place-types

SPOT_CATEGORIES = {
    "food_and_drink": {
        "label": "Food & Drink",
        "types": [
            "restaurant", "cafe", "bar", "bakery",
            "meal_delivery", "meal_takeaway", "food_court",
            "coffee_shop", "ice_cream_shop", "confectionery",
        ],
    },
    "entertainment": {
        "label": "Entertainment",
        "types": [
            "amusement_park", "movie_theater", "night_club",
            "bowling_alley", "casino", "concert_hall",
            "comedy_club", "karaoke", "live_music_venue",
            "video_arcade", "water_park", "zoo", "aquarium",
            "event_venue", "opera_house",
        ],
    },
    "parks_and_nature": {
        "label": "Parks & Nature",
        "types": [
            "park", "national_park", "state_park", "city_park",
            "dog_park", "garden", "botanical_garden",
            "hiking_area", "picnic_ground", "playground",
            "beach", "lake", "mountain_peak", "nature_preserve",
            "river", "scenic_spot", "woods", "wildlife_park",
        ],
    },
    "culture": {
        "label": "Culture & Education",
        "types": [
            "museum", "art_gallery", "library",
            "performing_arts_theater", "cultural_center",
            "university", "school", "historical_landmark",
            "monument", "castle", "planetarium",
        ],
    },
    "sport": {
        "label": "Sports & Fitness",
        "types": [
            "gym", "fitness_center", "sports_complex",
            "swimming_pool", "stadium", "tennis_court",
            "golf_course", "ski_resort", "ice_skating_rink",
            "sports_club",
        ],
    },
    "shopping": {
        "label": "Shopping",
        "types": [
            "shopping_mall", "supermarket", "clothing_store",
            "electronics_store", "book_store", "convenience_store",
            "department_store", "furniture_store", "jewelry_store",
            "grocery_store", "market", "gift_shop",
            "home_improvement_store",
        ],
    },
    "health_and_wellness": {
        "label": "Health & Wellness",
        "types": [
            "hospital", "pharmacy", "dentist", "doctor",
            "spa", "massage", "wellness_center",
            "yoga_studio", "beauty_salon", "hair_salon",
        ],
    },
    "lodging": {
        "label": "Lodging",
        "types": [
            "hotel", "hostel", "motel", "lodging",
            "bed_and_breakfast", "resort_hotel", "guest_house",
            "campground",
        ],
    },
    "services": {
        "label": "Services",
        "types": [
            "laundry", "barber_shop", "beauty_salon",
            "real_estate_agency", "insurance_agency",
            "lawyer", "travel_agency", "veterinary_care",
            "locksmith", "car_repair", "car_wash",
        ],
    },
    "transportation": {
        "label": "Transportation",
        "types": [
            "airport", "train_station", "bus_station",
            "subway_station", "taxi_stand", "gas_station",
            "parking", "car_rental",
            "electric_vehicle_charging_station",
        ],
    },
    "finance": {
        "label": "Finance",
        "types": [
            "bank", "atm", "accounting",
        ],
    },
    "government": {
        "label": "Government & Public",
        "types": [
            "city_hall", "courthouse", "embassy",
            "post_office", "police", "fire_station",
            "government_office",
        ],
    },
}
