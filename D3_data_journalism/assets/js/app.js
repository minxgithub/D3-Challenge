// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads, remove it
    // and replace it with a resized version of the chart
    var svgArea = d3.select("#scatter").select("svg");
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgHeight = window.innerHeight;
    var svgWidth = window.innerWidth;
    
    var chartMargin = {
        top: 50,
        bottom: 50,
        right: 50,
        left: 50
        };

    var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;
    var chartWidth = svgWidth - chartMargin.left - chartMargin.right;

    // Append SVG element
    var svg = d3.select("#scatter")
                .append("svg")
                .attr("height", svgHeight)
                .attr("width", svgWidth);

    // Append chartGroup element
    var chartGroup = svg.append("g")
                        .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

    // Read CSV
    d3.csv("assets/data/data.csv").then(function(data){
        // parse data
        data.forEach(function(d) {
            d.poverty = +d.poverty;
            d.healthcare = +d.healthcare;
            // d.age = +d.age;
            // d.smokes = +d.smokes;            
        });

        // create scale functions
        var xLinearScale = d3.scaleLinear()
                             .domain([d3.min(data, d => d.poverty)-1, d3.max(data, d => d.poverty)+1])
                             .range([0, chartWidth]);
        var yLinearScale = d3.scaleLinear()
                             .domain([d3.min(data, d => d.healthcare)-0.5, d3.max(data, d => d.healthcare)+0.5])
                             .range([chartHeight, 0]);

        // create axes functions
        var xAxis = d3.axisBottom(xLinearScale);
        var yAxis = d3.axisLeft(yLinearScale);

        // append axes to the chart
        chartGroup.append("g")
                  .attr("transform", `translate(0, ${chartHeight})`)
                  .call(xAxis);
        chartGroup.append("g")
                  .call(yAxis);

        // create circles
        var circlesGroup = chartGroup.selectAll("circle")
                                     .data(data)
                                     .enter()
                                     .append("circle")
                                     .attr("cx", d => xLinearScale(d.poverty))
                                     .attr("cy", d => yLinearScale(d.healthcare))
                                     .attr("r", "10")
                                     .attr("class", "stateCircle")
                                     .attr("opacity", ".8");
                    
                                     
        // add state abbr to circles
        chartGroup.selectAll(".stateText")
                  .data(data)
                  .enter()
                  .append("text")
                  .text(d => d.abbr)
                  .attr("x", d => xLinearScale(d.poverty))
                  .attr("y", d => yLinearScale(d.healthcare)+4)
                  .attr("class", "stateText")
                  .attr("font-size", "10px");
                  
                  
        // initialize tool tip
        var toolTip = d3.tip()
                        .attr("class", "tooltip")
                        .offset([80, -60])
                        .html(function(d) {
                            return (`<strong>${d.state}</strong><br>Lacks Healthcare: ${d.healthcare}%<br>In Poverty: ${d.poverty}%`);
                        }); 
        // create tooltip in the chart
        chartGroup.call(toolTip);

        // create event listeners to display and hide the tooltip
        circlesGroup.on("click", function(d) {
                       toolTip.show(d, this);
                    })
                    .on("mouseout", function(d, i) {
                        toolTip.hide(d);
                    });

        // create axes labels
        chartGroup.append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 0 - chartMargin.left)
                  .attr("x", 0 - (chartHeight / 2))
                  .attr("dy", "1em")
                  .attr("class", "aText")
                  .text("Lacks Healthcare (%)");
  
        chartGroup.append("text")
                  .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + chartMargin.bottom-10})`)
                  .attr("class", "aText")
                  .text("In Poverty (%)");

}).catch(function(error) {
    console.log(error);
    });

}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);