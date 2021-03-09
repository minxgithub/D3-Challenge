var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
}

// function used for updating xAxis var upon click on axis label
function renderxAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderyAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
  
  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateXToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "% In Poverty: ";
  } else if (chosenXAxis === "age") {
    label = "Median Age: ";
  } else if (chosenXAxis === "income") {
    label = "Income: ";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(d) {
    toolTip.show(d);
  })
    // onmouseout event
    .on("mouseout", function(d, i) {
      toolTip.hide(d);
    });

  return circlesGroup;
}

function updateYToolTip(chosenYAxis, circlesGroup) {

    var label;
  
    if (chosenYAxis === "healthcare") {
      label = "% Lacks Healthcare: ";
    } else if (chosenYAxis === "smokes") {
      label = "% Smokes: ";
    } else if (chosenYAxis === "obesity") {
      label = "% Obese: ";
    }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(d) {
      toolTip.show(d);
    })
      // onmouseout event
      .on("mouseout", function(d, i) {
        toolTip.hide(d);
      });
  
    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err) {
  if (err) throw err;

  // parse data
  data.forEach(function(d) {
    d.poverty = +d.poverty;
    d.healthcare = +d.healthcare;
    d.age = +d.age;
    d.smokes = +d.smokes;
    d.income = +d.income;
    d.obesity = +d.obesity;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("class", "stateCircle");
    // .attr("opacity", ".8");]

  // add initial state abbr to circles
  chartGroup.selectAll(".stateText")
    .data(data)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis])+4)
    .attr("class", "stateText")
    .attr("font-size", "10px");

  // Create group for two x-axis labels
  var XlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + margin.bottom-10})`);

    var povertyLabel = XlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", -35)
      .attr("value", "poverty") // value to grab for event listener
      .attr("class", "aText")
      .text("In Poverty (%)");

    var ageLabel = XlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", -15)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");
    
    var incomeLabel = XlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 5)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
  
  // Create group for two y-axis labels
  var YlabelsGroup = chartGroup.append("g")
     .attr("transform", "rotate(-90)");

    var healthcareLabel = YlabelsGroup.append("text")
      .attr("x", -180)
      .attr("y", -30)
      .attr("value", "healthcare") // value to grab for event listener
      .attr("class", "aText")
      .text("Lacks Healthcare (%)");

    var smokesLabel = YlabelsGroup.append("text")
      .attr("x", -180)
      .attr("y", -55)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");
    
    var obesityLabel = YlabelsGroup.append("text")
      .attr("x", -180)
      .attr("y", -80)
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");

  // updateToolTip function above csv import
  // var XcirclesGroup = updateXToolTip(chosenXAxis, XcirclesGroup);
  // var YcirclesGroup = updateYToolTip(chosenYAxis, YcirclesGroup);

  // x axis labels event listener
  XlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderxAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateXToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        } else if (chosenXAxis === "income") {
          ageLabel
           .classed("active", false)
           .classed("inactive", true);
          povertyLabel
           .classed("active", false)
           .classed("inactive", true);
          incomeLabel
           .classed("active", true)
           .classed("inactive", false);
        } else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });
  // y axis labels event listener
  YlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates y axis with transition
        yAxis = renderyAxis(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateYToolTip(chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        } else if (chosenYAxis === "obesity") {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        } else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }

});
}).catch(function(error) {
  console.log(error);
});
