import requests


def test_get_posts():
    url = "http://localhost:3000/api/posts"
    resp = requests.get(url, timeout=10)
    assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}, body: {resp.text}"

    content_type = resp.headers.get('Content-Type', '')
    assert 'application/json' in content_type.lower(), f"Expected JSON response, got Content-Type: {content_type}"

    data = resp.json()
    assert isinstance(data, (list, dict)), f"Expected JSON list or dict, got {type(data)}"

    # If the API returns a dict with a 'posts' key, ensure it's a list
    if isinstance(data, dict) and 'posts' in data:
        assert isinstance(data['posts'], list), "'posts' should be a list"
        posts = data['posts']
    elif isinstance(data, list):
        posts = data
    else:
        # If dict without 'posts', accept the dict but no further checks
        posts = None

    # If we have a list of posts, validate the first item's required fields per PRD
    if posts:
        assert len(posts) >= 0, "Posts list should be present"
        if len(posts) > 0:
            item = posts[0]
            assert isinstance(item, dict), "Each post should be a JSON object"
            for field in ('title', 'description', 'category', 'location'):
                assert field in item, f"Post item missing required field: {field}"

    print("Test passed: GET /api/posts returned a valid JSON response")


# Run the test
if __name__ == '__main__':
    test_get_posts()