import urllib.request
import urllib.error
import json


def test_get_posts():
    url = 'http://localhost:3000/api/posts'
    req = urllib.request.Request(url, method='GET')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.getcode()
            body = resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode('utf-8')
        except Exception:
            body = ''
        raise AssertionError(f'HTTPError when calling {url}: {e.code}, body: {body}')
    except Exception as e:
        raise AssertionError(f'Network error when calling {url}: {e}')

    assert status == 200, f'Expected status 200, got {status}. Body: {body}'

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        raise AssertionError('Response is not valid JSON')

    assert isinstance(data, dict), 'Response JSON must be an object'
    assert 'success' in data, "Response JSON must contain 'success'"
    assert isinstance(data['success'], bool), "'success' must be a boolean"
    assert 'posts' in data, "Response JSON must contain 'posts'"
    assert isinstance(data['posts'], list), "'posts' must be a list"


if __name__ == '__main__':
    test_get_posts()
    print('Test passed')