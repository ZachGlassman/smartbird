import os
from flask import Flask, render_template, url_for, jsonify, request
from flask_security import current_user, Security, SQLAlchemyUserDatastore, UserMixin, RoleMixin, login_required
from flask_sqlalchemy import SQLAlchemy
#from FlightScore import FlightScore
from FlightModels.QPxFetcher import QPxFetcher
from FlightModels.bokeh_plots import create_bokeh_plot
import json


app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL')
app.config['SECURITY_REGISTERABLE'] = True
app.config['SECURITY_PASSWORD_SALT'] = os.environ.get('SECURITY_PASSWORD_SALT')
app.config['SECURITY_SEND_REGISTER_EMAIL'] = False
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
roles_users = db.Table('roles_users',
                       db.Column('user_id', db.Integer(),
                                 db.ForeignKey('user.id')),
                       db.Column('role_id', db.Integer(),
                                 db.ForeignKey('role.id'))
                       )


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    confirmed_at = db.Column(db.DateTime())
    roles = db.relationship('Role', secondary=roles_users,
                            backref=db.backref('users', lazy='dynamic'))


class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.Integer)
    source = db.Column(db.String(255))
    destination = db.Column(db.String(255))
    on_time = db.Column(db.Integer)
    connection_length = db.Column(db.Integer)
    flex_times = db.Column(db.Integer)
    flight_time = db.Column(db.Integer)
    airport_quality = db.Column(db.Integer)
    airline_quality = db.Column(db.Integer)
    price = db.Column(db.Integer)


class Cities(db.Model):
    Code = db.Column(db.Integer, primary_key=True)
    Description = db.Column(db.String(255))
    state = db.Column(db.String(255))
    town = db.Column(db.String(255))

    def serialize(self):
        return {'code': self.Code,
                'description': self.Description,
                'state': self.state,
                'town': self.town}


class Airports(db.Model):
    index = db.Column(db.Integer, primary_key=True)
    AIRPORT_SEQ_ID = db.Column(db.Integer)
    AIRPORT_ID = db.Column(db.Integer)
    AIRPORT = db.Column(db.String(255))
    DISPLAY_AIRPORT_NAME = db.Column(db.String(255))
    DISPLAY_AIRPORT_CITY_NAME_FULL = db.Column(db.String(255))
    AIRPORT_WAC = db.Column(db.Integer)
    AIRPORT_COUNTRY_NAME = db.Column(db.String(255))
    AIRPORT_COUNTRY_CODE_ISO = db.Column(db.String(255))
    AIRPORT_STATE_NAME = db.Column(db.String(255))
    AIRPORT_STATE_CODE = db.Column(db.String(255))
    AIRPORT_STATE_FIPS = db.Column(db.Float)
    CITY_MARKET_ID = db.Column(db.Integer)
    DISPLAY_CITY_MARKET_NAME_FULL = db.Column(db.String(255))
    CITY_MARKET_WAC = db.Column(db.Integer)
    LAT_DEGREES = db.Column(db.Float)
    LAT_HEMISPHERE = db.Column(db.String(255))
    LAT_MINUTES = db.Column(db.Float)
    LAT_SECONDS = db.Column(db.Float)
    LATITUDE = db.Column(db.Float)
    LON_DEGREES = db.Column(db.Float)
    LON_HEMISPHERE = db.Column(db.String(255))
    LON_MINUTES = db.Column(db.Float)
    LON_SECONDS = db.Column(db.Float)
    LONGITUDE = db.Column(db.Float)
    AIRPORT_START_DATE = db.Column(db.String(255))
    AIRPORT_THRU_DATE = db.Column(db.String(255))
    AIRPORT_IS_CLOSED = db.Column(db.Integer)
    AIRPORT_IS_LATEST = db.Column(db.Integer)
    #db.relationship("DelayData", foreign_keys='airports."AIRPORT"')
    #db.relationship("DelayData", foreign_keys='airports."AIRPORT"')


class Airlines(db.Model):
    index = db.Column(db.Integer, primary_key=True)
    letter_code = db.Column(db.String(255))
    name = db.Column(db.String(255))
    Code = db.Column(db.Integer)


class DelayData(db.Model):
    __tablename__ = 'delay_data'
    index = db.Column(db.Integer, primary_key=True)
    YEAR = db.Column(db.Integer)
    QUARTER = db.Column(db.Integer)
    MONTH = db.Column(db.Integer)
    DAY_OF_MONTH = db.Column(db.Integer)
    DAY_OF_WEEK = db.Column(db.Integer)
    FL_DATE = db.Column(db.String(255))
    UNIQUE_CARRIER = db.Column(db.String(255))
    AIRLINE_ID = db.Column(db.Integer)
    CARRIER = db.Column(db.String(255))
    TAIL_NUM = db.Column(db.String(255))
    FL_NUM = db.Column(db.Integer)
    ORIGIN_AIRPORT_ID = db.Column(db.Integer)
    ORIGIN_AIRPORT_SEQ_ID = db.Column(db.Integer)
    ORIGIN_CITY_MARKET_ID = db.Column(db.Integer)
    DEST_AIRPORT_ID = db.Column(db.Integer)
    DEST_AIRPORT_SEQ_ID = db.Column(db.Integer)
    DEST_CITY_MARKET_ID = db.Column(db.Integer)
    CRS_DEP_TIME = db.Column(db.Integer)
    DEP_TIME = db.Column(db.Float)
    DEP_DELAY = db.Column(db.Float)
    DEP_DELAY_NEW = db.Column(db.Float)
    DEP_DEL15 = db.Column(db.Float)
    DEP_DELAY_GROUP = db.Column(db.Float)
    DEP_TIME_BLK = db.Column(db.String(255))
    TAXI_OUT = db.Column(db.Float)
    WHEELS_OFF = db.Column(db.Float)
    WHEELS_ON = db.Column(db.Float)
    TAXI_IN = db.Column(db.Float)
    CRS_ARR_TIME = db.Column(db.Integer)
    ARR_TIME = db.Column(db.Float)
    ARR_DELAY = db.Column(db.Float)
    ARR_DELAY_NEW = db.Column(db.Float)
    ARR_DEL15 = db.Column(db.Float)
    ARR_DELAY_GROUP = db.Column(db.Float)
    ARR_TIME_BLK = db.Column(db.String(255))
    CANCELLED = db.Column(db.Float)
    CANCELLATION_CODE = db.Column(db.String(255))
    DIVERTED = db.Column(db.Float)
    CRS_ELAPSED_TIME = db.Column(db.Float)
    ACTUAL_ELAPSED_TIME = db.Column(db.Float)
    AIR_TIME = db.Column(db.Float)
    FLIGHTS = db.Column(db.Float)
    DISTANCE = db.Column(db.Float)
    DISTANCE_GROUP = db.Column(db.Integer)
    CARRIER_DELAY = db.Column(db.Float)
    WEATHER_DELAY = db.Column(db.Float)
    NAS_DELAY = db.Column(db.Float)
    SECURITY_DELAY = db.Column(db.Float)
    LATE_AIRCRAFT_DELAY = db.Column(db.Float)
    FIRST_DEP_TIME = db.Column(db.Float)
    TOTAL_ADD_GTIME = db.Column(db.Float)
    LONGEST_ADD_GTIME = db.Column(db.Float)
    #Unnamed: 52 = db.Column(db.Float)

    # origin = db.relationship("Airports",
    #                         primaryjoin='DelayData.ORIGIN_AIRPORT_ID == Airports.AIRPORT')
    # dest = db.relationship("Airports",
    #                       primaryjoin='DelayData.DEST_AIRPORT_ID == Airports.AIRPORT')


# setup security
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(app, user_datastore)

db.create_all()


@app.route('/profile')
def profile():
    return render_template('profile_form.html', add_react=False)


@app.route('/')
def index():
    return render_template('index.html', add_react=True)


@app.route('/about')
def about():
    return render_template('about.html')


# TODO query city market database to get all relevent airports
kluge = {
    'Atlanta GA (Metropolitan Area)': 'ATL',
    'Boston MA (Metropolitan Area)': 'BOS',
    'Charlotte NC': 'CLT',
    'Chicago IL': 'ORD',
    'Dallas/Fort Worth TX': 'DFW',
    'Denver CO': 'DEN',
    'Detroit MI': 'DTW',
    'Houston TX': 'IAH',
    'Las Vegas NV': 'LAS',
    'Los Angeles CA (Metropolitan Area)': 'LAX',
    'Miami FL (Metropolitan Area)': 'MIA',
    'Minneapolis/St. Paul MN': 'MSP',
    'Nashville TN': 'BNA',
    'New York City NY (Metropolitan Area)': 'JFK',
    'Orlando FL': 'MCO',
    'Philadelphia PA': 'PHL',
    'Phoenix AZ': 'PHX',
    'Portland OR': 'PWM',
    'Salt Lake City UT': 'SLC',
    'San Diego CA': 'SAN',
    'San Francisco CA (Metropolitan Area)': 'SFO',
    'Seattle WA': 'SEA',
    'St. Louis MO': 'STL',
    'Tampa FL (Metropolitan Area)': 'TPA',
    'Washington DC (Metropolitan Area)': 'IAD'
}


@app.route('/submit', methods=['POST'])
def submit():
    data = request.json
    qpx = QPxFetcher(os.environ.get('QPX_API_KEY'))
    qpx.set_param('origin', kluge[data['source']])
    qpx.set_param('dest', kluge[data['dest']])
    qpx.set_param('date', data['startDate'])
    list_of_flights = qpx.get()
    # set variables then find the score
    from FlightScore import FlightScore
    fc = FlightScore()
    fc.set_variables(data)
    fc.set_flights(list_of_flights)
    scored = fc.score()
    return jsonify({'data': data, 'scores': scored})


@app.route('/render-graph', methods=['POST'])
def render_graph():
    data = request.json
    script, id = create_bokeh_plot(data['data'])
    return jsonify(dict(script=script, id=id))


@app.route('/get_cities', methods=['GET'])
def get_cities():
    res = Cities.query.all()
    return jsonify(json.dumps([i.serialize() for i in res]))


from sqlalchemy.sql.expression import func


@app.route('/random_airports', methods=['GET'])
def get_airpots():
    """get two random airports"""
    res = Airports.query.with_entities(
        Airports.DISPLAY_AIRPORT_NAME,
        Airports.LATITUDE,
        Airports.LONGITUDE).filter(
            Airports.AIRPORT_COUNTRY_NAME == 'United States'
    ).filter(Airports.AIRPORT_STATE_NAME != 'Alaska').filter(Airports.AIRPORT_STATE_NAME != 'Hawaii').order_by(func.random()).limit(2).all()

    ans = []
    for i in res:
        ans.append({'name': i[0], 'latitude': i[1], 'longitude': i[2]})
    return jsonify(ans)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(host='0.0.0.0', port=port)
