from flask import Flask, request
from redis import Redis, RedisError
# import redis
from flask_restful import reqparse, abort, Api, Resource
import os
import socket
import time
from enum import Enum
import json

# Connect to Redis
# redis = redis.StrictRedis(host='0.0.0.0', port=6379, db=0)
redis = Redis(host="redis", db=0, socket_connect_timeout=2, socket_timeout=2)
redis.set('principal', 990)
redis.set('transactions', json.dumps([
    {
        "id": 0,
        "type": 1,
        "amount": 5,
        "timestamp": 298372384782374
    },
    {
        "id": 1,
        "type": 1,
        "amount": 5,
        "timestamp": 298372384782374
    }
]))

app = Flask(__name__)
api = Api(app)

parser = reqparse.RequestParser()
parser.add_argument('amount')
parser.add_argument('type')

class TransactionType(Enum):
    PAY = 0
    DRAW = 1

class GetAllTransactions(Resource):
    def get(self):
        return json.loads(redis.get('transactions'))

class GetSingleTransaction(Resource):
    def get(self, transaction_id):
        transactions = json.loads(redis.get('transactions'))
        transaction = list(filter(lambda t: t['id'] == int(transaction_id), transactions))
        if len(transaction):
            return transaction[0]
        else:
            abort(404, message="Transaction {} doesn't exist".format(transaction_id))

class PerformTransaction(Resource):
    def post(self):
        args = parser.parse_args()
        amount = int((args['amount']))
        transactionType = str((args['type']))

        if amount and transactionType:
            transactions = json.loads(redis.get('transactions'))
            principal = redis.get('principal')

            if transactionType == TransactionType.PAY:
                nextPrincipal = int(principal) + int(amount)
            else:
                nextPrincipal = int(principal) - int(amount)

            transaction = {
                'id': int(len(transactions) + 1),
                'type': int(transactionType),
                'amount': int(amount),
                'timestamp': time.time()
            }

            transactions.append(transaction)
            redis.set('transactions', json.dumps(transactions))
            redis.set('principal', nextPrincipal)

            return {
                'transaction': transaction,
                'principal': int(redis.get('principal'))
            }, 201
        else:
            abort(404, message="Invaid amount in request payload: {}".format(amount))

##
## Actually setup the Api resource routing here
##
api.add_resource(GetAllTransactions, '/transactions')
api.add_resource(GetSingleTransaction, '/transactions/<transaction_id>')
api.add_resource(PerformTransaction, '/transaction')

# if __name__ == '__main__':
#     app.run(debug=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
