import React from 'react';
import {DateRangePicker, SingleDatePicker, DayPickerRangeController} from 'react-dates';
import Slider, {Range} from 'rc-slider';
import {PropagateLoader} from 'react-spinners';
import WheelGraph from './wheelgraph.js';
import 'react-dates/lib/css/_datepicker.css';
import 'rc-slider/assets/index.css';

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
            dest: NAMES[0],
            one_way: true,
            direct: false,
            showForm: true,
            'on-time': 1,
            'connection-length': 1,
            'flexible-times': 1,
            'short-flight': 1,
            'airport-quality': 1,
            'airline-quality': 1,
            'price': 1
        };

        this.handleChange = this
            .handleChange
            .bind(this);
        this.handleSubmit = this
            .handleSubmit
            .bind(this);
        this.onSubmit = this
            .onSubmit
            .bind(this);
    }
    onSubmit(data) {
        this
            .props
            .onSubmit(data);
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
        this.setState({showForm: false})
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
                this.setState({showForm: true});
                this.onSubmit(res.json());
            })
        }
        event.preventDefault();

    }

    render() {
        return (
            <div>
                {this.state.showForm
                    ? <div>
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
                                            onDatesChange=
                                            { ({startDate, endDate}) => this.setState({startDate, endDate}) }
                                            focusedInput={this.state.focusedInput}
                                            onFocusChange=
                                            { focusedInput => this.setState({focusedInput}) }/>
                                        <div className="switch">
                                            <label>
                                                <input
                                                    onChange={this.handleChange}
                                                    name="one_way"
                                                    value={this.state.one_way}
                                                    type="checkbox"/>
                                                One Way
                                            </label>
                                        </div>
                                        <div className="switch">
                                            <label>
                                                <input
                                                    onChange={this.handleChange}
                                                    name="direct"
                                                    value={this.state.direct}
                                                    type="checkbox"/>
                                                Direct
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {VARIABLES.map((obj, i) => {
                                    return (
                                        <div key={i}>
                                            <div className="row">
                                                <div className="col-sm-4">{obj.text}</div>
                                                <div className="col-sm-8">
                                                    <div>
                                                        <Slider
                                                            value={this.state[obj.name]}
                                                            onChange={val => this.setState({
                                                            [obj.name]: val
                                                        })}
                                                            name={obj.name}
                                                            id={obj.name}
                                                            min={1}
                                                            max={5}
                                                            marks={{
                                                            1: 1,
                                                            2: 2,
                                                            3: 3,
                                                            4: 4,
                                                            5: 5
                                                        }}/>
                                                    </div>
                                                </div>
                                            </div>
                                            {React.createElement('br')}
                                        </div>
                                    )
                                })}
                                <input className="btn btn-success" type="submit" value="Submit"/>

                            </form>
                            <WheelGraph data={this.state}/>
                        </div>
                    : <div className="row d-block mx-auto">
                        <PropagateLoader size={30} color={'#85a9e2'} loading={!this.state.showForm}/>
                    </div>}
            </div>
        )
    }
}
export default ProfileForm;