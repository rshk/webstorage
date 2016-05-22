import hashlib
import logging
import os
import sys

import flask
from flask import request, current_app
from flask.ext.cors import CORS

import redis


def setup_logging():
    logger = logging.getLogger('webstorage')
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(logging.Formatter(
        '%(created)s: %(levelname)s [%(name)s] %(message)s'))
    handler.setLevel(logging.INFO)
    logger.addHandler(handler)
    logging.getLogger().setLevel(logging.INFO)
    return logger

logger = setup_logging()


def create_app():
    app = flask.Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = \
        int(os.environ.get('MAX_CONTENT_LENGTH', 32 * 1024))
    app.config['WEBSTORAGE_KEY_EXPIRATION_TIME'] = \
        int(os.environ.get('WEBSTORAGE_KEY_EXPIRATION_TIME', 600))
    CORS(app)
    return app

app = create_app()


def get_redis():
    url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    return redis.StrictRedis.from_url(url)


@app.route('/', methods=['POST'])
def post_data():
    data = request.data
    sha1 = hashlib.sha1(data).hexdigest()
    logger.info("Storing data at %s (%s bytes)", sha1, len(data))
    r = get_redis()
    r.set(sha1, data)
    r.expire(sha1, current_app.config['WEBSTORAGE_KEY_EXPIRATION_TIME'])

    # TODO: set location header? url_for('get_data', sha1=sha1, _external=True)
    return sha1, 201


@app.route('/<string:sha1>', methods=['GET'])
def get_data(sha1):
    r = get_redis()
    data = r.get(sha1)
    if data is None:
        return 'Not found', 404
    return data


if __name__ == '__main__':
    app.run(debug=True, port=5000)
