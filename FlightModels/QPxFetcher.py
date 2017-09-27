import requests
import json


class QPxFetcher(object):
    def __init__(self, api_key):
        self.url = 'https://www.googleapis.com/qpxExpress/v1/trips/search?key={}'.format(
            api_key)
        self._params = {
            'n_adults': 1,
            'n_kids': 0,
            'max_stops': 1,
            'max_connection_duration': 2,
            'preferred_cabin': 'COACH',
            'earliest_time': '00:00',
            'latest_time': '23:59',
            'origin': '',
            'dest': '',
            'date': ''
        }

    def set_param(self, key, value):
        assert key in self._params.keys()
        self._params[key] = value

    def generate_payload(self):
        return {
            "request": {
                "passengers": {
                    "kind": "qpxexpress#passengerCounts",
                    "adultCount": self._params['n_adults'],
                },
                "slice": [
                    {
                        "kind": "qpxexpress#sliceInput",
                        "origin": self._params['origin'],
                        "destination": self._params['dest'],
                        "date": self._params['date'],
                    }
                ],
                "solutions": 50
            }
        }

    def get(self):
        r = requests.post(self.url, data=json.dumps(self.generate_payload()),
                          headers={'content-type': 'application/json'})
        return r.json()
