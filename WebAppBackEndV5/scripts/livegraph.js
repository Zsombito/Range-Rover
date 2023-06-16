var dps = []; // dataPoints
var chart = new CanvasJS.Chart("chartContainer", {
    backgroundColor: '#F58200',
    zoomEnabled:true,
	title :{
		text: "Battery Usage",
        fontColor: "white",
        cornerRadius: 4,
        fontFamily: "Lato",
        fontSize:"18",
        fontWeight:"700"
	},
    axisX:{
        title: "Time",
        titleFontColor: "white",
        labelFontColor: "white",
        gridColor: "white",
        tickColor: "white"
    },
    axisY:{
        title: "Battery Charge",
        titleFontColor: "white",
        labelFontColor: "white",
        gridColor: "white",
        tickColor: "white",
        minimum: 0,
        maximum: 100,
    },
	data: [{
		type: "line",
        markerColor: "#ffffff",
        lineColor: "#ffffff",
		dataPoints: dps
	}]
});

var xval = 0;
var updateInterval = 500;
var dataLength = 360; // number of dataPoints visible at any point
var url_g = '/data/battery'
var updateChart = function (yval) {
        yval*=100
		dps.push({
			x: xval,
			y: yval
		});
        if(dps.length>dataLength){
            dps.shift()
        }
        xval++
	chart.render();
};


async function rcvbat(url) {
    let response = await fetch(url);
    let data = await response.json();
    await updateChart(data.percent);
    //setInterval(function(){updateChart()}, updateInterval);
    await rcvbat(url)
}

rcvbat(url_g)




