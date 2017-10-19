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
        # trip['slice'][0]['segment'][0]['leg']
        self.legs = [i['leg'] for i in trip['slice'][0]['segment']]
        self.carrier = trip['slice'][0]['segment'][0]['flight']['carrier']
        self.number = trip['slice'][0]['segment'][0]['flight']['number']
        self.n_legs = len(trip['slice'][0]['segment'])
        self.segment = trip['slice'][0]['segment']

    def score(self, score_):
        self._score = score_

    def get_airports(self):
        return tuple([(i['leg'][0]['origin'], i['leg'][0]['destination']) for i in self.segment])

    def get_airlines(self):
        return tuple([i['flight']['carrier'] for i in self.segment])

    def json(self):
        return {'fare': self.fare,
                'legs': self.legs,
                'total_duration': self.total_duration,
                'carrier': self.carrier,
                'number': self.number,
                'score': self._score,
                'n_legs': self.n_legs}
