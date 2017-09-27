import React from 'react';
import ReactDOM from 'react-dom';
import createFilterOptions from 'react-select-fast-filter-options';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';
import 'pretty-checkbox/src/pretty.css';
import ProfileForm from './components/profile-form.js';

const options = ['one', 'two', 'three'].map((name) => {
    return {value: name, label: name}
})
const filterOptions = createFilterOptions({options})

class GetOptions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (<VirtualizedSelect
            id="ticker-select"
            name="ticker-select"
            multi={true}
            joinValues={true}
            filterOptions={filterOptions}
            options={options}
            onChange={(selectValue) => this.setState({selectValue})}
            value={this.state.selectValue}/>)
    }
}

class SmartBird extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            form: true
        }
        this.onSubmit = this
            .onSubmit
            .bind(this);
    }
    onSubmit() {
        this.state.form = false;
    }
    render() {
        return (
            <div>
                {this.state.form
                    ? <ProfileForm onSubmit={this.onSubmit}/>
                    : null}
            </div>
        )
    }
}

ReactDOM.render(
    <div>
    <SmartBird/></div>, document.getElementById('root'));