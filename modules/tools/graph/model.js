define(function (require) {

    var d3 = require("d3"),
        Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        GraphModel;

    GraphModel = Backbone.Model.extend({
        initialize: function () {
            var channel = Radio.channel("Graph");

            channel.on({
                "createGraph": this.createGraph
            }, this);
            channel.reply({
                "getGraphParams": function () {
                    return this.getGraphParams();
                    }
            }, this);
        },
        createGraph: function (graphConfig) {
            if (graphConfig.graphType === "Linegraph") {
                this.createLineGraph(graphConfig);
            }
        },
        createMaxValue: function (data, attrToShowArray) {
            var value;

            _.each(attrToShowArray, function (attrToShow) {
                value = _.max(data, function (d) {
                    return d[attrToShow];
                });
            });
            return value[attrToShowArray[0]];
        },
        createScaleX: function (data, size, scaletype, attr) {
            var rangeArray = [0, size],
                scale,
                maxValue;

            if (scaletype === "ordinal") {
                scale = this.createOrdinalScale(data, rangeArray, [attr]);
            }
            else if (scaletype === "linear") {
                maxValue = this.createMaxValue(data, [attr]);
                scale = this.createLinearScale(0, maxValue, rangeArray);
            }
            else {
                alert("Scaletype not found");
            }
            return scale;
        },
        createScaleY: function (data, size, scaletype, attrToShowArray) {
            var rangeArray = [size, 0],
                scale,
                maxValue;

            if (scaletype === "ordinal") {
                scale = this.createOrdinalScale(data, rangeArray, attrToShowArray);
            }
            else if (scaletype === "linear") {
                maxValue = this.createMaxValue(data, attrToShowArray);
                scale = this.createLinearScale(0, maxValue, rangeArray);
            }
            else {
                alert("Scaletype not found");
            }

            return scale;
        },
        createOrdinalScale: function (data, rangeArray, attrArray) {
            var values = [];

            _.each(data, function (d) {
                _.each(attrArray, function (attr) {
                    values.push(d[attr]);
                });
            });
            values = _.uniq(values);
            values.sort();
            return d3.scale.ordinal()
                    .domain(values)
                    .rangePoints(rangeArray);
        },
        createLinearScale: function (minValue, maxValue, rangeArray) {
            return d3.scale.linear().range(rangeArray)
                    .domain([minValue, maxValue]);
        },
        // create Axis. if Separator === true (for yAxis), then set thousands-separator "."
        createAxis: function (scale, position, separator) {
            return d3.svg.axis()
                    .scale(scale)
                    .tickFormat(function (d) {
                        d = d.toString();
                        if (separator) {
                            d = d.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                        }
                        return d;
                    })
                    .orient(position);
        },
        createValueLine: function (scaleX, scaleY, xAttr, yAttrToShow, offset) {
            return d3.svg.line()
                    .x(function (d) {
                        return scaleX(d[xAttr]) + offset;
                    })
                    .y(function (d) {
                        return scaleY(d[yAttrToShow]);
                    })
                    .defined(function (d) {
                        return !isNaN(d[yAttrToShow]);
                    });
        },
        appendDataToSvg: function (svg, data, className, object) {
            var data = _.filter(data, function (obj) {
                return obj.yAttrToShow !== "-";
            });

            svg.append("path")
                .data([data])
                .attr("class", className)
                .attr("transform", "translate(0, 20)")
                .attr("d", object);
        },
        appendXAxisToSvg: function (svg, xAxis, xAttr, offset) {
            var svgBBox = svg.node().getBBox(),
                xAxis = svg.append("g")
                    .attr("transform", "translate(" + offset + "," + svgBBox.height + ")")
                    .attr("class", "xAxis")
                    .call(xAxis),
                xAxisBBox = svg.selectAll(".xAxis").node().getBBox();

            // text for xAxis
            xAxis.append("text")
                .attr("x", (xAxisBBox.width / 2))
                .attr("y", (xAxisBBox.height + offset))
                .style("text-anchor", "middle");
        },
        appendYAxisToSvg: function (svg, yAxis, attrToShow, offset) {
            var yAxis = svg.append("g")
                .attr("transform", "translate(0, 20)")
                .attr("class", "yAxis")
                .call(yAxis),
                yAxisBBox = svg.selectAll(".yAxis").node().getBBox();
            // text for yAxis
            yAxis.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", (0 - (yAxisBBox.height / 2)))
                .attr("y", (0 - yAxisBBox.width - (2 * offset)))
                .attr("dy", "1em")
                .style("text-anchor", "middle");
        },
        appendLinePointsToSvg: function (svg, data, scaleX, scaleY, xAttr, yAttrToShow, tooltipDiv, offset) {
            var data = _.filter(data, function (obj) {
                return obj[yAttrToShow] !== "-";
            });

            svg.selectAll("dot")
                .data(data)
                .enter().append("circle")
                .attr("transform", "translate(0, 20)")
                .attr("cx", function (d) {
                    return scaleX(d[xAttr]) + offset;
                })
                .attr("cy", function (d) {
                    return scaleY(d[yAttrToShow]);
                })
                .attr("r", 5)
                .attr("class", "dot")
                .on("mouseover", function (d) {
                    tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltipDiv.html(d[yAttrToShow])
                        .attr("style", "background: gray")
                        .style("left", (d3.event.offsetX + 5) + "px")
                        .style("top", (d3.event.offsetY - 5) + "px");
                    })
                .on("mouseout", function () {
                    tooltipDiv.transition()
                        .duration(500)
                        .style("opacity", 0);
                    })
                .on("click", function (d) {
                    tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltipDiv.html(d[yAttrToShow])
                        .attr("style", "background: gray")
                        .style("left", (d3.event.offsetX + 5) + "px")
                        .style("top", (d3.event.offsetY - 5) + "px");
                    });
        },
        createSvg: function (selector, marginObj, width, height) {
            return d3.select(selector).append("svg")
                    .attr("width", width + marginObj.left + marginObj.right)
                    .attr("height", height + marginObj.top + marginObj.bottom)
                    .attr("class", "graph-svg")
                    .append("g")
                    .attr("transform", "translate(" + marginObj.left + "," + marginObj.top + ")");
        },
        appendLegend: function (svg, attrToShowArray) {
            var legend = svg.append("g")
                    .attr("class", "graph-legend")
                    .selectAll("g")
                    .data([this.createAndGetLegendText(attrToShowArray[0])])
                    .enter()
                    .append("g")
                        .attr("class", "graph-legend-item")
                        .attr("transform", function () {
                            return "translate(" + -60 + "," + -20 + ")";
                    });

            legend.append("circle")
                .attr("cx", 5)
                .attr("cy", 5)
                .attr("r", 5)
                .attr("class", "dot");

            legend.append("text")
                .attr("x", 20)
                .attr("y", 10)
                .text(function (d) {
                    return d;
                });
        },

        createAndGetLegendText: function (value) {
            if (value === "Dtv") {
                return "DTV (Kfz/24h)";
            }
            else if (value === "Dtvw") {
                return "DTVw (Kfz/24h)";
            }
            else {
                return "SV-Anteil am DTVw (%)";
            }
        },

        createLineGraph: function (graphConfig) {
            var selector = graphConfig.selector,
                scaleTypeX = graphConfig.scaleTypeX,
                scaleTypeY = graphConfig.scaleTypeY,
                data = graphConfig.data,
                xAttr = graphConfig.xAttr,
                attrToShowArray = graphConfig.attrToShowArray,
                margin = {top: 20, right: 40, bottom: 100, left: 70},
                // width = $(selector).width() - margin.left - margin.right,
                // height = $(selector).height() - margin.top - margin.bottom,
                width = graphConfig.width - margin.left - margin.right,
                height = graphConfig.height - margin.top - margin.bottom,
                scaleX = this.createScaleX(data, width, scaleTypeX, xAttr),
                scaleY = this.createScaleY(data, height, scaleTypeY, attrToShowArray),
                valueLine,
                tooltipDiv = d3.select(graphConfig.selectorTooltip),
                xAxis = this.createAxis(scaleX, "bottom", false),
                yAxis = this.createAxis(scaleY, "left", true),
                svg = this.createSvg(selector, margin, width, height),
                offset = 10;

            this.appendLegend(svg, attrToShowArray);
            _.each(attrToShowArray, function (yAttrToShow) {

                valueLine = this.createValueLine(scaleX, scaleY, xAttr, yAttrToShow, offset);
                this.appendDataToSvg(svg, data, "line", valueLine);
                // Add the scatterplot for each point in line
                this.appendLinePointsToSvg(svg, data, scaleX, scaleY, xAttr, yAttrToShow, tooltipDiv, offset);
            }, this);
            // Add the Axis
            this.appendYAxisToSvg(svg, yAxis, attrToShowArray[0], offset);
            this.appendXAxisToSvg(svg, xAxis, xAttr, offset);

            this.setGraphParams({
                scaleX: scaleX,
                scaleY: scaleY,
                tooltipDiv: tooltipDiv,
                margin: margin,
                offset: offset
            });
        },

        // getter for graphParams
        getGraphParams: function () {
            return this.get("graphParams");
        },
        // setter for graphParams
        setGraphParams: function (value) {
            this.set("graphParams", value);
        }
    });

    return GraphModel;
});
