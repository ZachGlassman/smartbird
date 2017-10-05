
import abc
import random


class Scorer(object):
    def __init__(self, name):
        self._name = name

    @abc.abstractmethod
    def _score(self, flights):
        pass

    def _normalize(self, res):
        max_ = max(res)
        min_ = min(res)
        return [(i - min_) / (max_ - min_) for i in res]

    def score(self, flights):
        self.result = self._normalize(self._score(flights))


class RandomScorer(Scorer):
    def _score(self, flights):
        return [random.randint(0, 100) for _ in range(len(flights))]


class NormalizeScorer(Scorer):
    def _score(self, flights):
        return [float(getattr(i, self._name)) for i in flights]


class FlightScore(object):
    def __init__(self):
        self._vars = {}
        self._scorers = {'on-time': RandomScorer('on-time'),
                         'connection-length': RandomScorer('connection-length'),
                         'flexible-times': RandomScorer('flexible-times'),
                         'short-flight': NormalizeScorer('total_duration'),
                         'airport-quality': RandomScorer('airport-quality'),
                         'airline-quality': RandomScorer('airline-quality'),
                         'price': NormalizeScorer('fare')}
        self._res_calc = {'on-time': lambda x: x,
                          'connection-length': lambda x: x,
                          'flexible-times': lambda x: x,
                          'short-flight': lambda x: 6 - x,
                          'airport-quality': lambda x: x,
                          'airline-quality': lambda x: x,
                          'price': lambda x: 6 - x}

    def set_variables(self, d):
        self._vars.update(d)

    def set_flights(self, flights):
        self._flights = flights

    def score(self):
        assert self._flights is not None
    # for now randomlize

        for key in ['on-time', 'connection-length', 'flexible-times', 'short-flight', 'airport-quality', 'airline-quality', 'price']:
            self._scorers[key].score(self._flights)
        for i, flight in enumerate(self._flights):
            score_dict = {k: v.result[i] for k, v in self._scorers.items()}
            score_dict['score'] = sum([v * self._res_calc[k](self._vars[k])
                                       for k, v in score_dict.items()])
            flight.score(score_dict)
        return [i.json() for i in self._flights]
