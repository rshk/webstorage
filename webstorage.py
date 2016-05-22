import hashlib
import logging
import sys

import flask
from flask import request, url_for
from flask.ext.cors import CORS

import redis

KEY_EXPIRATION_TIME = 30
MAX_CONTENT_LENGTH = 32 * 1024


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
    app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
    CORS(app)
    return app

app = create_app()


def get_redis():
    return redis.StrictRedis(host='localhost', port=6379, db=0)


@app.route('/', methods=['POST'])
def post_data():
    data = request.data
    sha1 = hashlib.sha1(data).hexdigest()
    logger.info("Storing data at %s (%s bytes)", sha1, len(data))
    r = get_redis()
    r.set(sha1, data)
    r.expire(sha1, KEY_EXPIRATION_TIME)

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
