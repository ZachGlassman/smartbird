import React from 'react';
import ReactDOM from 'react-dom';
import createFilterOptions from 'react-select-fast-filter-options';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';
import 'pretty-checkbox/src/pretty.css';
import ProfileForm from './components/profile-form.js';
import Results from './components/results.js';

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
            form: true,
            result: false,
            data: null
        }
        this.onSubmit = this
            .onSubmit
            .bind(this);
        this.backButton = this
            .backButton
            .bind(this);
    }
    //can pass state of component through here and save it!
    onSubmit(data) {
        this.setState({form: false})
        data.then((d) => {
            this.setState({result: true, data: d})
        })
    }
    backButton() {
        this.setState({form: true, result: false})
    }
    render() {
        return (
            <div>
                {this.state.form
                    ? <ProfileForm onSubmit={this.onSubmit}/>
                    : null}
                {this.state.result
                    ? (
                        <div>
                            <button className="btn btn-danger" onClick={this.backButton}>Back</button><Results data={this.state.data}/></div>
                    )
                    : null}
            </div>
        )
    }
}

ReactDOM.render(
    <div>
    <SmartBird/></div>, document.getElementById('root'));