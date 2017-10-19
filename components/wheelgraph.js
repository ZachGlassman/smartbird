import React from 'react';
import * as d3 from 'd3';

class WheelGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 300,
            width: 450
        }
        this.createChart = this
            .createChart
            .bind(this);
    }

    componentWillReceiveProps(props) {
        this.setState({
            data: [
                {
                    'value': props.data['on-time'],
                    'name': 'On time'
                }, {
                    'value': props.data['connection-length'],
                    'name': 'Connection Length'
                }, {
                    'value': props.data['flexible-times'],
                    'name': 'Flexible times'
                }, {
                    'value': props.data['short-flight'],
                    'name': 'Short Flight'
                }, {
                    'value': props.data['airport-quality'],
                    'name': 'Airport quality'
                }, {
                    'value': props.data['airline-quality'],
                    'name': 'Airline Quality'
                }, {
                    'value': props.data.price,
                    'name': 'Price'
                }
            ]
        });
    }

    componentDidUpdate() {
        this.createChart();
    }

    createChart() {
        let node = this.node;
        let width = this.state.width;
        let height = this.state.height;
        let radius = this.state.height / 2
        let arc = d3
            .arc()
            .outerRadius(radius)
            .innerRadius(radius / 2);

        let color = d3.scaleOrdinal(d3.schemeCategory10);
        let pie = d3
            .pie()
            .sort(null)
            .value((d) => {
                return d.value
            });

        d3
            .selectAll("svg > *")
            .remove();
        let svg = d3
            .select(node)
            .append("svg")
            .attr("width", width)
            .attr('height', height)
            .append("g")
            .attr("transform", "translate(" + width / 2.5 + "," + height / 2 + ")");

        let g = svg
            .selectAll(".arc")
            .data(pie(this.state.data))
            .enter()
            .append("g")
            .attr("class", "arc");

        g
            .append("path")
            .attr("d", arc)
            .style("fill", (d, i) => {
                return color(i);
            });

        g
            .append("text")
            .attr("transform", (d) => {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .text((d) => {
                return d.data.name;
            })
            .style("fill", "black")
            .style("stroke", "black")
            .style('line-width', '1px');
    }

    render() {
        return (
            <div>
                <svg
                    ref={node => this.node = node}
                    height={this.state.height}
                    width={this.state.width}></svg>
            </div>
        )
    }
}

export default WheelGraph;