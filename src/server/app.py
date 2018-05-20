from enum import Enum
from flask import Flask, request
from flask_cors import CORS
from flask_restful import fields, marshal_with, reqparse, abort, Api, Resource
import json
import uuid
import os
from redis import Redis, RedisError
# import redis
import time
import socket

app = Flask(__name__)
api = Api(app)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

parser = reqparse.RequestParser()

# line of credit fields
parser.add_argument('apr')
parser.add_argument('name')
parser.add_argument('principal')

# transaction fields
parser.add_argument('amount')
parser.add_argument('type')
parser.add_argument('lineId')

# Connect to Redis
# redis = redis.StrictRedis(host='0.0.0.0', port=6379, db=0)
redis = Redis(host="redis", db=0, socket_connect_timeout=2, socket_timeout=2)

redis.set('lines', json.dumps([
    {
        "apr": 35,
        "id": "3534536a-da7c-4185-8962-7eaf1d808ca0",
        "interest": 0,
        "name": "credit line 0",
        "principal": 990,
        "timestamp": int(time.time()),
        "transactions": [
            "3534536a-da7c-4185-8962-7eaf1d808ca0",
            "3534536a-da7c-4185-8962-7eaf1d808ca1"
        ],
    }
]))

redis.set('transactions', json.dumps([
    {
        "amount": 5,
        "id": '3534536a-da7c-4185-8962-7eaf1d808ca0',
        "lineId": "3534536a-da7c-4185-8962-7eaf1d808ca0",
        "principal": 995,
        "timestamp": int(time.time()),
        "type": 1,
    },
    {
        "amount": 5,
        "id": '3534536a-da7c-4185-8962-7eaf1d808ca1',
        "lineId": "3534536a-da7c-4185-8962-7eaf1d808ca0",
        "principal": 990,
        "timestamp": int(time.time()),
        "type": 1
    }
]))

class Lines(Resource):
    def __init__(self):
        self.args = parser.parse_args()

    def set_line(self, line):
        lines = json.loads(redis.get('lines'))
        lines.append(line)
        redis.set('lines', json.dumps(lines))

    def calculate_interest(self):
        pass

    # get a list of credit lines
    def get(self):
        lines = redis.get('lines')
        if lines:
            return json.loads(lines)
        else:
            abort(404, message="There are no lines of credit at this time")

    # create a new line of credit
    def post(self):
        apr = int((self.args['apr']))
        name = str((self.args['name']))
        principal = int((self.args['principal']))

        line = {
            "apr": apr,
            "id": str(uuid.uuid4()),
            "interest": 0,
            "name": name,
            "principal": principal,
            "timestamp": int(time.time()),
            "transactions": [],
        }

        self.set_line(line);
        return line, 201

    # delete a line of credit
    def delete(self, line_id):
        lines = json.loads(redis.get('lines'))
        for n, l in enumerate(lines):
            if l['id'] == line_id:
                del lines[n]
        redis.set('lines', json.dumps(lines))
        return 200

class Transactions(Resource):
    def __init__(self):
        self.args = parser.parse_args()

    def set_line_by_id(self, id, line):
        lines = json.loads(redis.get('lines'))
        for n, l in enumerate(lines):
            if l['id'] == id:
                lines[n] = line
        redis.set('lines', json.dumps(lines))

    def get_line_by_id(self, id):
        lines = json.loads(redis.get('lines'))
        line = list(filter(lambda l: str(l['id']) == str(id), lines))
        if line and line[0]:
            return line[0]
        else:
            return None

    def get_transactions_by_line_id(self, id):
        transactions = json.loads(redis.get('transactions'))
        transaction = list(filter(lambda t: str(t['lineId']) == str(id), transactions))
        if transaction:
            return transaction
        else:
            return None

    def perform_transaction(self, amount, t_type, line_id):
        transactions = json.loads(redis.get('transactions'))
        transaction_id = str(uuid.uuid4())
        line = self.get_line_by_id(line_id)
        current_principal = int(line['principal'])

        if int(t_type) == 0:
            next_principal = int(current_principal) + int(amount)
        else:
            next_principal = int(current_principal) - int(amount)

        transaction = {
            'amount': int(amount),
            'id': transaction_id,
            'lineId': str(line_id),
            'principal': next_principal,
            'timestamp': int(time.time()),
            'type': int(t_type)
        }

        line['principal'] = next_principal
        line['transactions'].append(transaction_id)
        self.set_line_by_id(line_id, line)
        transactions.append(transaction)
        return transactions

    # get a list of all transacitons
    def get(self, line_id = None):
        transactions = redis.get('transactions')
        if transactions:
            if line_id:
                return self.get_transactions_by_line_id(line_id)

            return json.loads(transactions)
        else:
            abort(404, message="There are no transactions at this time")

    # perform a transaction
    def post(self):
        amount = int((self.args['amount']))
        line_id = str((self.args['lineId']))
        transaction_type = str((self.args['type']))

        if amount and transaction_type:
            transactions = self.perform_transaction(amount, transaction_type, line_id)
            redis.set('transactions', json.dumps(transactions))

            return transactions[-1], 201
        else:
            abort(404, message="Invaid amount in request payload: {}".format(amount))

##
## Actually setup the Api resource routing here
##
api.add_resource(Lines, '/api/lines', '/api/lines/<string:line_id>')
api.add_resource(Transactions, '/api/transactions/', '/api/transactions/<string:line_id>')

# if __name__ == '__main__':
#    app.run(debug=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
