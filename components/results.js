import React from 'react';
import Modal from 'react-modal';
import Flight from './flight';
import * as d3 from 'd3';

class Results extends React.Component {
    constructor(props) {
        super(props);
        let clicked_list = {};
        this
            .props
            .data
            .sort((a, b) => {
                return b.score.score - a.score.score
            })
            .map((d, i) => {
                clicked_list[i.toString()] = false
            });
        this.state = {
            clicked: clicked_list,
            modal: false,
            bokeh_plot_id: ''
        };

        this.onClickChange = this
            .onClickChange
            .bind(this);

        this.renderMultGraph = this
            .renderMultGraph
            .bind(this);

    }

    //need to send only compare data!!!!
    renderMultGraph() {
        let send_data = [];
        for (let i = 0; i < this.props.data.length; i++) {
            if (this.state.clicked[i.toString()]) {
                send_data.push(this.props.data[i])
            }
        }
        fetch("/render-graph", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'data': send_data})
        }).then((res) => {
            res
                .json()
                .then((j) => {
                    //$("#bokeh-plot").html(j['div']);
                    this.setState({bokeh_plot_id: j['id']})
                    $("#for-script").html(j['script'])
                })
        })
    }

    onClickChange(key) {
        let clicked = JSON.parse(JSON.stringify(this.state.clicked));
        clicked[key] = !clicked[key];
        this.setState({clicked: clicked});
    }
    render() {
        return (
            <div>
                <button
                    className="btn btn-success"
                    onClick={() => {
                    let clicked = false;
                    Object
                        .keys(this.state.clicked)
                        .forEach((key) => {
                            if (this.state.clicked[key] == true) {
                                clicked = true;
                            }
                        });
                    if (clicked) {
                        this.setState({modal: true})
                    }
                }}>Compare</button>
                {this.state.modal
                    ? <Modal
                            isOpen={this.state.modal}
                            onAfterOpen={this.renderMultGraph}
                            contentLabel="Modal">
                            <button
                                className="btn btn-danger"
                                onClick={() => this.setState({modal: false})}>Close</button>
                            <div className="bk-root">
                                <div className="bk-plotdiv" id={this.state.bokeh_plot_id}></div>
                            </div>

                        </Modal>
                    : null}
                <div className="row">
                    {this
                        .props
                        .data
                        .sort((a, b) => {
                            return b.score.score - a.score.score
                        })
                        .map((d, i) => {
                            return (
                                <div key={i} className='col-sm-6'>
                                    <Flight
                                        onClickChange={this.onClickChange}
                                        clicked={this.state.clicked[i]}
                                        num={i}
                                        data={d}/>
                                </div>
                            )
                        })}
                </div>
            </div>
        )
    }
}

export default Results;