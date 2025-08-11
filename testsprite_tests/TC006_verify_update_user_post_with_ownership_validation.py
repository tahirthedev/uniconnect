def test_tc006():
    payload = {
        "title": "Bicycle for sale",
        "description": "Lightly used road bicycle in excellent condition.",
        "category": "buy-sell",
        "location": {
            "city": "London",
            "state": "Greater London",
            "country": "UK",
            "coordinates": {
                "latitude": 51.5074,
                "longitude": -0.1278
            }
        },
        "price": {
            "amount": 150.0,
            "currency": "GBP"
        },
        "contact": {
            "phone": "+447700900123",
            "email": "seller@example.com",
            "whatsapp": "+447700900123",
            "preferredMethod": "phone"
        }
    }

    # Basic structure checks
    assert isinstance(payload, dict), "Payload must be a dictionary"
    required = ["title", "description", "category", "location"]
    for key in required:
        assert key in payload, f"Missing required field: {key}"

    # Type checks
    assert isinstance(payload["title"], str) and payload["title"].strip(), "title must be a non-empty string"
    assert isinstance(payload["description"], str), "description must be a string"

    # Category must be one of allowed enums
    allowed_categories = ["pick-drop", "accommodation", "jobs", "buy-sell", "currency-exchange"]
    assert payload["category"] in allowed_categories, f"category must be one of {allowed_categories}"

    # Location checks
    location = payload["location"]
    assert isinstance(location, dict), "location must be an object"
    assert "city" in location and isinstance(location["city"], str) and location["city"].strip(), "location.city must be a non-empty string"
    if "country" in location:
        assert isinstance(location["country"], str), "location.country must be a string"

    coords = location.get("coordinates")
    if coords is not None:
        assert isinstance(coords, dict), "location.coordinates must be an object"
        assert "latitude" in coords and "longitude" in coords, "coordinates must include latitude and longitude"
        lat = coords["latitude"]
        lng = coords["longitude"]
        assert isinstance(lat, (int, float)), "latitude must be a number"
        assert isinstance(lng, (int, float)), "longitude must be a number"

    # Optional price checks
    if "price" in payload:
        price = payload["price"]
        assert isinstance(price, dict), "price must be an object"
        if "amount" in price:
            assert isinstance(price["amount"], (int, float)), "price.amount must be a number"
        if "currency" in price:
            assert isinstance(price["currency"], str), "price.currency must be a string"

    # Optional contact checks
    if "contact" in payload:
        contact = payload["contact"]
        assert isinstance(contact, dict), "contact must be an object"
        if "phone" in contact:
            assert isinstance(contact["phone"], str), "contact.phone must be a string"
        if "email" in contact:
            assert isinstance(contact["email"], str), "contact.email must be a string"

    print("TC006: Payload validation passed")


# Execute the test
test_tc006()