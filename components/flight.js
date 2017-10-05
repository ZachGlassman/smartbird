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

        this.onClickChange = this
            .props
            .onClickChange
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

        let svg = d3.select("svg");
        let margin = {
            top: 20,
            right: 20,
            bottom: 90,
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
            return d.name;
        }));
        y.domain([
            0, d3.max(data, (d) => {
                return d.y;
            })
        ]);

        let div = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("background", "white");

        g
            .append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        g
            .append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10));

        let color = d3.scaleOrdinal(d3.schemeCategory10);

        g
            .selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => {
                return x(d.name);
            })
            .attr("y", (d) => {
                return y(d.y);
            })
            .attr("width", x.bandwidth())
            .attr("height", (d) => {
                return height - y(d.y);
            })
            .attr("fill", (d, i) => {
                return color(i);
            })
            .on("mouseover", (d) => {
                div
                    .transition()
                    .duration(200)
                    .style("opacity", .9);
                div
                    .html(d.y)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", (d) => {
                div
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
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
                        .toFixed(2)} {this.props.clicked
                        ? <button
                                className="btn btn-small btn-warning"
                                onClick={() => {
                                this.onClickChange(this.props.num)
                            }}>- Compare</button>
                        : <button
                            className="btn btn-small btn-primary"
                            onClick={() => {
                            this.onClickChange(this.props.num)
                        }}>+ Compare</button>}

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
                        className="btn btn-info"
                        onClick={() => {
                        this.setState({
                            modal: true
                        }, () => {
                            this.renderGraph();
                        });
                    }}>
                        Info
                    </button>

                    {this.state.modal
                        ? <Modal
                                isOpen={this.state.modal}
                                onAfterOpen={this.renderGraph}
                                contentLabel="Modal">
                                <svg height="600" width="600" id="modal"></svg>
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

export default Flight;