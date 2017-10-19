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
        text: 'On Time flight',
        caption: 'arriving on time'
    }, {
        name: 'connection-length',
        text: 'Connection Length',
        caption: 'reducing connections'
    }, {
        name: 'flexible-times',
        text: 'Predictable Arrivals',
        caption: 'predictable arrival times'
    }, {
        name: 'short-flight',
        text: 'Short Flight Time',
        caption: 'out of the plane quickly'
    }, {
        name: 'airport-quality',
        text: 'Airport Quality',
        caption: 'nice airports'
    }, {
        name: 'airline-quality',
        text: 'Airline Quality',
        caption: 'nice airlines'
    }, {
        name: 'price',
        text: 'Price',
        caption: 'cheaper flights'
    }
];

//format two demical places for string, assume that it comes in as decimal
function formatTwoDecimal(x) {
    let s = x.toString() + '0000'
    let first = s.slice(2, 4);
    let second = s.slice(5, 7);
    return first + '.' + second
}

class ProfileForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'source': NAMES[0],
            'dest': NAMES[5],
            'one_way': true,
            'direct': false,
            showForm: true,
            'on-time': 1,
            'connection-length': 1,
            'flexible-times': 1,
            'short-flight': 1,
            'airport-quality': 1,
            'airline-quality': 1,
            '_total': VARIABLES.length
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

        this.sliderChanged = this
            .sliderChanged
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

    sliderChanged(val, obj) {
        let diff = val - this.state[obj.name];
        let old_total = this.state._total;
        this.setState({
            [obj.name]: val,
            _total: old_total + diff
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
            this.setState({showForm: false});
            fetch("/submit", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
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
                                <div className="row">
                                    <h4>Traveler Profile</h4>
                                </div>
                                <div className="row">
                                    <p>Tell me how you like to fly. Higher percentages mean you care more about that
                                        category.</p>
                                </div>
                                {VARIABLES.map((obj, i) => {
                                    return (
                                        <div key={i}>
                                            <div className="row">
                                                <div className="col-sm-4">
                                                    <b>{obj.text}</b>
                                                    {React.createElement('br')}{obj.caption}</div>
                                                <div className="col-sm-6">
                                                    <div>
                                                        <Slider
                                                            value={this.state[obj.name]}
                                                            onChange={val => {
                                                            this.sliderChanged(val, obj)
                                                        }}
                                                            name={obj.name}
                                                            id={obj.name}
                                                            min={1}
                                                            max={5}
                                                            marks={{
                                                            1: '',
                                                            2: '',
                                                            3: '',
                                                            4: '',
                                                            5: ''
                                                        }}/>
                                                    </div>
                                                </div>
                                                <div className="col-sm-2">
                                                    {formatTwoDecimal(this.state[obj.name] / this.state._total) + ' %'}
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