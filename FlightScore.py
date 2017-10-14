import abc
import random

from app import DelayData, Airports
from sqlalchemy.orm import aliased
from datetime import datetime
from sqlalchemy.sql.expression import func


def _database_fetch(pairs, start_date, end_date):
    """run query for an origin and destination

    for now filter on day of week and month for one way
    """
    string_pairs = ["{}_{}".format(i[0], i[1]) for i in pairs]
    orig = [i[0] for i in pairs]
    dest = [i[1] for i in pairs]
    a1 = aliased(Airports)
    res = DelayData.query.join(
        a1, a1.AIRPORT_ID == DelayData.ORIGIN_AIRPORT_ID) \
        .join(Airports, Airports.AIRPORT_ID ==
              DelayData.DEST_AIRPORT_ID) \
        .with_entities(func.avg(DelayData.ARR_DELAY),
                       func.stddev(DelayData.ARR_DELAY),
                       a1.AIRPORT, Airports.AIRPORT) \
        .filter(DelayData.MONTH == start_date.month) \
        .filter(DelayData.DAY_OF_WEEK == (start_date.weekday() + 1)) \
        .filter(a1.AIRPORT.in_(orig)) \
        .filter(Airports.AIRPORT.in_(dest)) \
        .group_by(a1.AIRPORT, Airports.AIRPORT) \
        .having((a1.AIRPORT + '_' + Airports.AIRPORT).in_(string_pairs))

    return res.all()


def _parse_date(date):
    return datetime.strptime(date, '%Y-%m-%dT%H:%M:%S.%fZ')


def _parse_dates(startDate, endDate, **kwargs):
    """return month and day of week from date string"""
    s_date = _parse_date(startDate)
    e_date = _parse_date(endDate)
    return s_date, e_date


class Scorer(object):
    def __init__(self, name):
        self._name = name
        self.result = None

    @abc.abstractmethod
    def _score(self, flights, *args, **kwargs):
        pass

    def _normalize(self, res):
        max_ = max(res)
        min_ = min(res)
        return [(i - min_) / (max_ - min_) for i in res]

    def score(self, flights, *args, **kwargs):
        self.result = self._normalize(self._score(flights, *args, **kwargs))


class RandomScorer(Scorer):
    def _score(self, flights, *args, **kwargs):
        return [random.randint(0, 100) for _ in range(len(flights))]


class NormalizeScorer(Scorer):
    def _score(self, flights, *args, **kwargs):
        return [float(getattr(i, self._name)) for i in flights]


class FlightTimeScorer(Scorer):
    """class to run SQL query and get flight times
    return minus the answer"""

    def _score(self, flights, ret_dict, **kwargs):
        rel_airports = [flight.get_airports() for flight in flights]
        ans = []
        for pairs in rel_airports:
            # loop through the pars and take the maximim
            sum_ = 0
            for i in pairs:
                try:
                    sum_ = max(
                        ret_dict["{}_{}".format(i[0], i[1])]['mean'], sum_)
                except KeyError:
                    sum_ += 1000
            ans.append(-sum_)

        return ans


class FlightSTDScorer(Scorer):
    """class to run SQL query and get flight times"""

    def _score(self, flights, ret_dict, *args, **kwargs):
        rel_airports = [flight.get_airports() for flight in flights]
        ans = []
        for pairs in rel_airports:
            # loop through the pars and take the maximim
            sum_ = 0
            for i in pairs:
                try:
                    sum_ += ret_dict["{}_{}".format(i[0], i[1])]['std']**2
                except KeyError:
                    sum_ += 1000
            ans.append(-sum_)

        return ans


class ConnectionScorer(Scorer):
    """class to find connection length for flights
    for now just return number of connections
    """

    def _score(self, flights, *args, **kwargs):
        rel_airports = [flight.get_airports() for flight in flights]
        return [-len(i) for i in rel_airports]


class AirlineQualityScorer(Scorer):
    ranking_dict = {
        'AS': 1,
        'UA': 2,
        'VX': 3,
        'B6': 4,
        'AA': 5,
        'WN': 6,
        'DL': 7,
        'HA': 8,
        'F9': 9,
        'NK': 10,
    }

    def _score(self, flights, *args, **kwargs):
        airlines = [flight.get_airlines() for flight in flights]
        rankings = [[self.ranking_dict.get(i, 5) for i in j] for j in airlines]

        return [-sum(i) / len(i) for i in rankings]


class FlightScore(object):
    def __init__(self):
        self._vars = {}
        self._scorers = {'on-time': FlightTimeScorer('on-time'),
                         'connection-length': ConnectionScorer('connection-length'),
                         'flexible-times': FlightSTDScorer('flexible-times'),
                         'short-flight': NormalizeScorer('total_duration'),
                         'airport-quality': RandomScorer('airport-quality'),
                         'airline-quality': AirlineQualityScorer('airline-quality'),
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
        try:
            self._vars['origin'] = self._vars['source']
        except:
            pass

    def set_flights(self, flights):
        self._flights = flights

    def score(self):
        assert self._flights is not None
        # lets do the database fetch once, for now we will
        # hardcode the values in, but latter will pull them
        # from each of the scorers
        rel_airports = [flight.get_airports() for flight in self._flights]
        unique = set(rel_airports)
        start_date, end_date = _parse_dates(**self._vars)
        # now we can find uniqueness within even the subqueiries
        pairs = [j for i in unique for j in i]
        db_ret = _database_fetch(set(pairs), start_date, end_date)
        ret_dict = {"{}_{}".format(i[2], i[3]): {
            'mean': i[0], 'std': i[1]} for i in db_ret}

        # we can now pass results to what we need

        for key in ['on-time', 'connection-length', 'flexible-times', 'short-flight', 'airport-quality', 'airline-quality', 'price']:
            self._scorers[key].score(self._flights, ret_dict, **self._vars)
        for i, flight in enumerate(self._flights):
            score_dict = {k: v.result[i] for k, v in self._scorers.items()}
            score_dict['score'] = sum([v * self._res_calc[k](self._vars[k])
                                       for k, v in score_dict.items()])
            flight.score(score_dict)
        return [i.json() for i in self._flights]
