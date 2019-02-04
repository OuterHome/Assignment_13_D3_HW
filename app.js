// wrap entire process in function to make the page responsive
function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("#scatter").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  var margin = {
      top: 20,
      right: 40,
      bottom: 80,
      left: 100
  };

  var height = svgHeight - margin.top - margin.bottom;
  var width = svgHeight - margin.left - margin.right;

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

// Append group to hold bound data in elements
var chartElements = chartGroup.append("g")

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
// create scales
var xLinearScale = d3.scaleLinear()
  .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
    d3.max(healthData, d => d[chosenXAxis]) * 1.2
  ])
  .range([0, width]);

return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
// create scales
var yLinearScale = d3.scaleLinear()
  .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
    d3.max(healthData, d => d[chosenYAxis]) * 1.2
  ])
  .range([height, 0]);

return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
var bottomAxis = d3.axisBottom(newXScale);

xAxis.transition()
  .duration(1000)
  .call(bottomAxis);

return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
var leftAxis = d3.axisLeft(newYScale);

yAxis.transition()
  .duration(1000)
  .call(leftAxis);

return yAxis;
}

// function used for updating circles group with a transition to
// new circles for the x axis
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

circlesGroup.transition()
  .duration(1000)
  .attr("cx", d => newXScale(d[chosenXAxis]));

return circlesGroup;
}

// function used for updating circles group with a transition to
// new circles for the y axis
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

circlesGroup.transition()
  .duration(1000)
  .attr("cy", d => newYScale(d[chosenYAxis]));

return circlesGroup;
}

// function used for updating circle text group with a transition to
// new circle text for x axis
function renderXText(textGroup, newXScale, chosenXAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]))

  return textGroup;
} 

// function used for updating circle text group with a transition to
// new circle text for y axis
function renderYText(textGroup, newYScale, chosenYAxis) {

textGroup.transition()
  .duration(1000)
  .attr("dy", d => newYScale(d[chosenYAxis]-0.10))

return textGroup;
} 

// function used for updating circles group with new tooltip for axis change
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  console.log(chosenXAxis)
  switch(chosenXAxis) {
  case "poverty":
  var labelX = "% poverty: ";
  break;

  case "income":
  var labelX = "income: ";
  break;
  }
  
  console.log(chosenYAxis)
  switch(chosenYAxis) {
  case "smokes":
  var labelY = "% Who Smoke: ";
  break;

  case "healthcare":
  var labelY = "% lacking healthcare: ";
  break;
}

  console.log(labelX, labelY)

var toolTip = d3.tip()
.attr("class", "d3-tip")
.offset([-3, 0])
.html(function(d) {
  return (`${d.abbr}<br>${labelX}${d[chosenXAxis]}<br>${labelY}${d[chosenYAxis]}%`);
});

circlesGroup.call(toolTip);

circlesGroup.on("mouseover", function(data) {
  toolTip.show(data, this);
})
  // onmouseout event
  .on("mouseout", function(data, index) {
    toolTip.hide(data, this);
  });

return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(healthData) {

// parse data
healthData.forEach(function(data) {
/*     data.id = +data.id; */
  data.state = String(data.state);
  data.abbr = String(data.abbr);
  data.poverty = +data.poverty;
/*     data.povertyMoe = +data.povertyMoe; */
/*     data.age = +data.age;
  data.ageMoe = +data.ageMoe; */
  data.income = +data.income;
/*     data.incomeMoe = +data.incomeMoe; */
  data.healthcare = +data.healthcare;
/*     data.healthcareLow = +data.healthcareLow;
  data.healthcareHigh = +data.healthcareHigh;
  data.obesity = +data.obesity;
  data.obesityLow = +data.obesityLow;
  data.obesityHigh = +data.obesityHigh; */
  data.smokes = +data.smokes;
/*     data.smokesLow = +data.smokesLow;
  data.smokesHigh = +data.smokesHigh; */
});

// xLinearScale function above csv import
var xLinearScale = xScale(healthData, chosenXAxis);

// Create y scale function
var yLinearScale = yScale(healthData, chosenYAxis)
  .range([height, 0]);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

// append y axis
var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);
  
// append initial circles
var circlesGroup = chartElements.selectAll("circle")
  .data(healthData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d[chosenYAxis]))
  .attr("r", 10)
  .attr("fill", "#89bdd3")
  .attr("stroke", "#e3e3e3")
  .attr("opacity", ".8");

var textGroup = chartElements.selectAll("text")
.classed(".stateText", true)
.data(healthData)
.enter()
.append("text")
.attr("dx", d => xLinearScale((d[chosenXAxis])))
.attr("dy", d => yLinearScale((d[chosenYAxis])-0.10))
.text(d => d.abbr)
.style("text-anchor", "middle")
.style("color", "#FFFFFF")
.each(getFontSize)
.style("font-size", function(d) { return d.scale + "px"; })
.style("pointer-events", "none");

function getFontSize(d) {
  var radius = circlesGroup.attr('r');
      scale = Math.min(radius);
  d.scale = scale;
}

// Create group for 2 x-axis labels
var xLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`)
  .classed("x-labels", true);

var povertyLabel = xLabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "poverty") // value to grab for event listener
  .classed("active", true)
  .text("Percentage of Population in Poverty");

var incomeLabel = xLabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Median Household Income");

// Create group for 2 y-axis labels
var yLabelsGroup = chartGroup.append("g")
.classed("y-labels", true);
//.attr("transform", `translate(${height / 2}, ${width + 20})`);

var healthLabel = yLabelsGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -400)//350)
  .attr("y", -70)//-500)
  .attr("value", "healthcare") // value to grab for event listener
  .attr("dy", "1em")
  .classed("active", true)
  .text("% Population Lacking Healthcare");

var smokesLabel = yLabelsGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("x", -400)
.attr("y", -50)
.attr("value", "smokes") // value to grab for event listener
.attr("dy", "1em")
.classed("inactive", true)
.text("% Population That Smokes");

// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

// x axis labels event listener
xLabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // updates x scale for new data
      xLinearScale = xScale(healthData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxis(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

      // Updates circle text with new x values
      textGroup = renderXText(textGroup, xLinearScale, chosenXAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "poverty") {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });

    // y axis labels event listener
yLabelsGroup.selectAll("text")
.on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value !== chosenYAxis) {

    // replaces chosenYAxis with value
    chosenYAxis = value;

    // updates y scale for new data
    yLinearScale = yScale(healthData, chosenYAxis);

    // updates y axis with transition
    yAxis = renderYAxis(yLinearScale, yAxis);

    // updates circles with new y values
    circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

    // Updates circle text with new y values
    textGroup = renderYText(textGroup, yLinearScale, chosenYAxis);

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // changes classes to change bold text
    if (chosenYAxis === "healthcare") {
      healthLabel
        .classed("active", true)
        .classed("inactive", false);
      smokesLabel
        .classed("active", false)
        .classed("inactive", true);
    }
    else {
      healthLabel
        .classed("active", false)
        .classed("inactive", true);
      smokesLabel
        .classed("active", true)
        .classed("inactive", false);
    }
  }
});
})};

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);