class QPxFlight(object):
    def __init__(self, trip, aircraft, airport, city, tax, carrier):
        self._aircraft = aircraft
        self._airport = airport
        self._city = city
        self._tax = tax
        self._carrier = carrier
        self._parse_trip(trip)
        self._score = 1

    def _parse_trip(self, trip):
        self.fare = trip['saleTotal'].lstrip('USD')
        self.total_duration = trip['slice'][0]['segment'][0]['duration']
        self.legs = trip['slice'][0]['segment'][0]['leg']
        self.carrier = trip['slice'][0]['segment'][0]['flight']['carrier']
        self.number = trip['slice'][0]['segment'][0]['flight']['number']
        self.n_legs = len(trip['slice'][0]['segment'])

    def score(self, score_):
        self._score = score_

    def json(self):
        return {'fare': self.fare,
                'legs': self.legs,
                'total_duration': self.total_duration,
                'carrier': self.carrier,
                'number': self.number,
                'score': self._score,
                'n_legs': self.n_legs}
