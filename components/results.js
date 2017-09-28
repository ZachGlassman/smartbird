import React from 'react';
import Modal from 'react-modal';
import * as d3 from 'd3';

class Flight extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            leg: this.props.data.legs[0],
            modal: false
        };
        this.renderTime = this
            .renderTime
            .bind(this);

        this.renderGraph = this
            .renderGraph
            .bind(this);

    }

    renderTime(dateString) {
        let date = new Date(dateString);
        return date.toString();
    }

    renderGraph() {
        //first we generate data from the props.score
        let data = [];
        Object
            .entries(this.props.data.score)
            .forEach(([key, value]) => {
                if (key != 'score') {
                    data.push({'y': value, 'name': key});
                }
            });
        data.sort((a, b) => {
            return a.name - b.name
        })
        for (var i = 0; i < data.length; i++) {
            data[i]['x'] = i;
        }
        let svg = d3.select("svg");
        let margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40
        };
        let width = +svg.attr("width") - margin.left - margin.right;
        let height = +svg.attr("height") - margin.top - margin.bottom;

        let x = d3
            .scaleBand()
            .rangeRound([0, width])
            .padding(0.1);
        let y = d3
            .scaleLinear()
            .rangeRound([height, 0]);

        let g = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(data.map((d) => {
            return d.x;
        }));
        y.domain([
            0, d3.max(data, (d) => {
                return d.y;
            })
        ]);

        g
            .append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g
            .append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10));

        g
            .selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => {
                return x(d.x);
            })
            .attr("y", (d) => {
                return y(d.y);
            })
            .attr("width", x.bandwidth())
            .attr("height", (d) => {
                return height - y(d.y);
            });

    }

    render() {
        return (
            <div className="card mt-5">
                <div className="card-header">
                    {this.props.data.carrier}
                    {this.props.data.number}
                    &nbsp;&nbsp;&nbsp; Score={this
                        .props
                        .data
                        .score
                        .score
                        .toFixed(2)}
                </div>
                <ul>
                    <li>Origin : {this.state.leg.origin}</li>
                    <li>Destination : {this.state.leg.destination}</li>
                    <li>Time : {this.renderTime(this.state.leg.departureTime)}</li>
                    <li>Legs : {this.props.data.n_legs}</li>
                </ul>
                <div className="card-footer">
                    <p>Price: {this.props.data.fare}</p>

                    <button
                        className="btn btn-primary"
                        onClick={() => this.setState({modal: true})}>
                        Info
                    </button>
                    {this.state.modal
                        ? <Modal
                                isOpen={this.state.modal}
                                onAfterOpen={this.renderGraph}
                                contentLabel="Modal">
                                <svg height="400" width="400" id="modal"></svg>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => this.setState({modal: false})}>Close</button>
                            </Modal>
                        : null}
                </div>

            </div>
        )
    }
}
class Results extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="row">
                {this
                    .props
                    .data
                    .sort((a, b) => {
                        return b.score.score - a.score.score
                    })
                    .map((d, i) => {
                        return (
                            <div key={i} className='col-sm-6'><Flight data={d}/></div>
                        )
                    })}
            </div>
        )
    }
}

export default Results;