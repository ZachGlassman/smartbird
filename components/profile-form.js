import React from 'react';
import {DateRangePicker, SingleDatePicker, DayPickerRangeController} from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

var NAMES = [
    'Atlanta GA (Metropolitan Area)',
    'Boston MA (Metropolitan Area)',
    'Charlotte NC',
    'Chicago IL',
    'Dallas/Fort Worth TX',
    'Denver CO',
    'Detroit MI',
    'Houston TX',
    'Las Vegas NV',
    'Los Angeles CA (Metropolitan Area)',
    'Miami FL (Metropolitan Area)',
    'Minneapolis/St. Paul MN',
    'Nashville TN',
    'New York City NY (Metropolitan Area)',
    'Orlando FL',
    'Philadelphia PA',
    'Phoenix AZ',
    'Portland OR',
    'Salt Lake City UT',
    'San Diego CA',
    'San Francisco CA (Metropolitan Area)',
    'Seattle WA',
    'St. Louis MO',
    'Tampa FL (Metropolitan Area)',
    'Washington DC (Metropolitan Area)'
];

var VARIABLES = [
    {
        name: 'on-time',
        text: 'On Time flight'
    }, {
        name: 'connection-length',
        text: 'Connection Length'
    }, {
        name: 'flexible-times',
        text: 'Flexible Times'
    }, {
        name: 'short-flight',
        text: 'Short Flight Time'
    }, {
        name: 'airport-quality',
        text: 'Airport Quality'
    }, {
        name: 'airline-quality',
        text: 'Airline Quality'
    }, {
        name: 'price',
        text: 'Price'
    }
];

class ProfileForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            source: NAMES[0],
            dest: NAMES[0]
        };

        this.handleChange = this
            .handleChange
            .bind(this);
        this.handleSubmit = this
            .handleSubmit
            .bind(this);
    }

    componentDidMount() {
        VARIABLES.map((var_) => {
            this.setState({
                [var_.name]: 1
            });
        });
    }

    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox'
            ? target.checked
            : target.value;
        const name = target.name;
        this.setState({[name]: value});
    }

    handleSubmit(event) {
        if (!('startDate' in this.state) || !('endDate' in this.state)) {
            alert('must enter dates');
        } else {
            fetch("/submit", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state)
            }).then((res) => {
                res.json();
            })
        }
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="row">
                            <div className="form-group">
                                <label htmlFor="source">From:</label>
                                <select
                                    value={this.state.source}
                                    onChange={this.handleChange}
                                    name="source"
                                    className="form-control"
                                    id="source">
                                    {NAMES.map((name, i) => {
                                        return <option key={i}>{name}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group">
                                <label htmlFor="dest">To:</label>
                                <select
                                    value={this.state.dest}
                                    onChange={this.handleChange}
                                    name="dest"
                                    className="form-control"
                                    id="dest">
                                    {NAMES.map((name, i) => {
                                        return <option key={i}>{name}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <DateRangePicker
                            startDate={this.state.startDate}
                            endDate={this.state.endDate}
                            onDatesChange={({startDate, endDate}) => this.setState({startDate, endDate})}
                            focusedInput={this.state.focusedInput}
                            onFocusChange={focusedInput => this.setState({focusedInput})}/>
                    </div>
                </div>
                {VARIABLES.map((obj, i) => {
                    return (
                        <div key={i} className="row">
                            <div className="col-sm-8">{obj.text}</div>
                            <div className="col-sm-4">
                                <select
                                    value={this.state[obj.name]}
                                    onChange={this.handleChange}
                                    name={obj.name}
                                    className="form-control"
                                    id={obj.name}>
                                    {[1, 2, 3, 4, 5].map((i) => {
                                        return <option key={i}>{i}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                    )
                })}
                <input className="btn" type="submit" value="Submit"/>
            </form>
        )
    }
}
export default ProfileForm;