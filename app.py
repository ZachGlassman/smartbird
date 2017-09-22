import os
from flask import Flask, render_template, url_for, jsonify, request
from flask_security import current_user, Security, SQLAlchemyUserDatastore, UserMixin, RoleMixin, login_required
from flask_sqlalchemy import SQLAlchemy
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL')
app.config['SECURITY_REGISTERABLE'] = True
app.config['SECURITY_PASSWORD_SALT'] = os.environ.get('SECURITY_PASSWORD_SALT')
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


@app.route('/submit', methods=['POST'])
def submit():
    data = request.json
    return jsonify({})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(host='0.0.0.0', port=port)
