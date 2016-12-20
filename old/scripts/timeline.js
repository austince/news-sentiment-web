/**
 * Created by austin on 4/21/16.
 */
/**
 * Created by austin on 4/21/16.
 */
"use strict";
var apiBase = "http://localhost:5000";
var container, svg, timerange, timeText;
var articleWeb;
var width, height;
var timeTextOffset = {x: 400, y: 40};
var startDate, endDate;

$(function() {
    setup();
    d3_queue.queue()
        //.defer(d3.json, apiBase + '/articles')
        // .defer(d3.json,  'test/articleData.json')
        .defer(d3.json,  'test/articleDataLinked.json')
        .await(loaded);
});

$(window).resize(function() {
    width = parseFloat(svg.style('width').replace('px', ''));
    height = parseFloat(svg.style('height').replace('px', ''));
    timeText.attr("x", width-timeTextOffset.x).attr("y", height-timeTextOffset.y);
    if (articleWeb  )
        articleWeb.resize(width, height);
});

/**
 * Create the svg space where the visualization will take place
 */
function setup() {
    container = d3.select("#timeline");

    svg = container.append("svg").attr("class", "main");

    width = parseFloat(svg.style('width').replace('px', ''));
    height = parseFloat(svg.style('height').replace('px', ''));

    timeText = svg.append("text").attr("id", "timeText")
        .attr("class", "subtext")
        .attr("x", width-timeTextOffset.x)
        .attr("y", height-timeTextOffset.y)
        .style("font-size", "20")
        .style("fill", "#ffffff")
        .style("stroke", "#ffffff")
        .style("font-family", "Open Sans");

    timerange = container.append("xhmtl:div").attr("class", "timerangeContainer")
        .append("xhmtl:div").attr("id", "timerange");

    timerange = noUiSlider.create(timerange[0][0], {
        start: [0,0],
        connect: true,
        orientation: 'horizontal',
        behavior: 'tap-drag',
        range: {
            min: 0,
            max: 100
        }
    });

    timerange.on('update', function(values, handle) {
        if (values[0] != 0) {
            startDate = new Date(values[0] * 1000);
            endDate = new Date(values[1] * 1000);
            if (articleWeb)
                articleWeb.updateTimeframe(startDate, endDate);

            timeText.text(startDate.toDateString() + " - " + endDate.toDateString());
        }
    });
}

function loaded(error, data) {
    if (error)
        throw error;

    // Contains higher level things
    var response = JSON.parse(data);
    var articles = JSON.parse(response.result);

    for (var i = 0; i < articles.length; i++) {
        articles[i] = new Article(articles[i]);
    }

    articleWeb = new ArticleTimelineWeb(svg, width, height, articles);

    // Set the bound for the time range
    // Should be ordered by date, so index 0 to end
    var minDate = articles[articles.length-1].date;
    var maxDate = articles[0].date;

    timerange.updateOptions({
        step: 86400,
        range: {
           min: minDate.getTime()/1000,
           max: maxDate.getTime()/1000
        },
        start: [minDate.getTime()/1000, maxDate.getTime()/1000]
    });
}

/**
 *
 * @param index
 * @param article
 * @constructor
 */
function ArticleTimelineNode(index, article) {
    // The index in the articlesShowing array
    this.index = index;
    // The articles index in the articles array
    this.article = article;
    this.linked = [];

    this.fixed = false;
    // Starts off with no links
    this.weight = 0;

    // These will be set as defaults by the force layout
    // Do not override them
   /* this.x;
    this.y;
    this.px;
    this.py;*/
}

ArticleTimelineNode.prototype.addConnection = function(article) {
    this.linked.push(article);
    this.weight++;
};

ArticleTimelineNode.prototype.getSize = function(endDate) {
    return Math.log(this.article.getInteractionBefore(endDate) + 1);
};

/**
 *
 * @param svg
 * @param x
 * @param y
 * @param width
 * @param height
 * @param isShowing
 * @constructor
 */
function ArticleInfoWindow(svg, x, y, width, height, isShowing) {
    this.container = svg.append("foreignObject")
        .attr("xmlns", "http://www.w3.org/1999/xhtml")
        .attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", height);
    if (isShowing) {
        this.show();
    } else {
        this.hide();
    }
    this.content = this.container.append("xhtml:aside")
        .attr("class", "articleInfo");

    this.header = this.content.append("xhmtl:header");
    this.titleLink = this.header.append("xhtml:a").attr("target", "_blank");
    this.title = this.titleLink.append("xhtml:h1");

    this.body = this.content.append("xhtml:section");
    this.texts = this.body.append("xhtml:span").attr("class", "texts");
    this.date = this.texts.append("xhtml:p");
    this.site = this.texts.append("xhmtl:p");

    this.fbInfo = this.body.append("xhtml:span").attr("id", "fbInfo");
    this.fbLikes = this.fbInfo.append("xhmtl:p");
    this.fbComments = this.fbInfo.append("xhmtl:p");
    this.fbShares = this.fbInfo.append("xhmtl:p");

    this.sentimentChart = this.body.append("xhtml:div")
        .attr("id", "sentimentChart");
}

ArticleInfoWindow.prototype.setArticle = function(article) {
    this.titleLink.attr("href", article.url);
    this.title.text(article.title);
    this.date.text(article.date.toISOString().substring(0, 10));
    this.site.text(article.site);

    // Set up the sentiment bar chart
    var data = [
        {"label": "Negative", "value": article.textAnalysis.neg},
        // {"label": "Neutral", "value": article.textAnalysis.neutral},
        {"label": "Positive", "value": article.textAnalysis.pos}
    ];
    this.sentimentChart.selectAll("div").remove();
    // Todo: make responsive lol
    var x = d3.scale.linear().domain([0, 100]).range([0, 300]);
    this.sentimentChart.selectAll("div")
        .data(data)
        .enter().append("div")
        .attr("class", "bar")
        .style("width", function (d) {return x(d.value) + "px" ;})
        .text(function (d) { return d.label + ' ' + d.value + "%"; });
};

ArticleInfoWindow.prototype.show = function() {
    this.container.style("display", "inherit");
};

ArticleInfoWindow.prototype.hide = function() {
    this.container.style("display", "none");
};


/**
 *
 * @param svg
 * @param width
 * @param height
 * @param articles
 * @constructor
 */
function ArticleTimelineWeb(svg, width, height, articles) {
    this.svg = svg;
    this.container = this.svg.append("g");
    this.width = width;
    this.height = height;
    this.articleInfo = new ArticleInfoWindow(svg, 10, height-200, 500, 100, false);
    this.articleSelected = false;
    // A list of article nodes
    this.links = [];
    this.articleNodes = [];
    this.articles = articles;

    this.startDate = articles[articles.length-1].date;
    this.endDate = articles[0].date;

    //this.zoom = d3.behavior.zoom().scaleExtent([1,10]).on("zoom", this.zoomed);
    //this.svg.call(this.zoom);
    /*this.zoomRect = this.svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all");*/

    this.colorScale = d3.scale.linear()
        .domain([0, 5, 10, 25, 50, 75, 90, 95, 100])
        .range(colorbrewer.RdBu[9]);

    this.svg.on("click", this.nodeOutsideClick);

    this.updateArticles();

    this.setupLegend();
}

ArticleTimelineWeb.prototype.updateTimeframe = function(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.updateArticles();
};

ArticleTimelineWeb.prototype.updateArticles = function() {
    this.setupNodes();

    this.container.selectAll('g').remove();
    this.container.selectAll('line').remove();
    // All default values for now
    this.force = d3.layout.force()
        .nodes(this.articleNodes)
        .links(this.links)
        .size([width, height])
        .linkStrength(0.1)
        .friction(0.9)
        .linkDistance(20)
        .charge(-30)
        .gravity(0.1)
        .theta(0.8)
        .alpha(0.1);

    var web = this;
    var linkVis = this.container.selectAll("line")
        .data(this.links)
        .enter().append("line");

    var nodeVis = this.container
        .append("g").attr("class", "node")
        .selectAll("circle")
        .data(this.articleNodes)
        .enter().append("circle")
        .on("click", this.nodeClick)
        .on("mouseover", this.nodeMouseOver)
        .on("mouseout", this.nodeMouseExit)
        .call(this.force.drag);

    this.force.on("tick", function() {
        linkVis.attr("x1", function(d) {
            return d.source.x; })
            .attr("y1", function(d) {return d.source.y;})
            .attr("x2", function(d) {return d.target.x;})
            .attr("y2", function(d) {return d.target.y;})
            .attr("class", "link");

        nodeVis.attr("cx", function(d) {
            return d.x; })
            .attr("cy", function(d) {
                return d.y; })
            .attr("fill", function(d) {
                return web.colorScale(d.article.getWeightedSentiment());})
            .attr("r", function(d) {
                // Todo: account for svg size
                return d.getSize(endDate);});
    });



    this.force.start();
    d3.timer(this.force.resume);
};

ArticleTimelineWeb.prototype.zoomed = function() {
    articleWeb.container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
};


ArticleTimelineWeb.prototype.setupNodes = function() {
    this.links = [];
    this.articleNodes = [];

    // Articles in reverse order by date
    var startIndex = dateBinSearch(this.articles, this.endDate, true);
    var endIndex = dateBinSearch(this.articles, this.startDate, true);

    console.log("Articles from: " + startIndex + " to " + endIndex);

    for (var i = startIndex; i <= endIndex; i++) {
        var articleNode = new ArticleTimelineNode(i, this.articles[i]);
        this.articleNodes.push(articleNode);
    }

    // Need to cycle through and find all links
    // Basically a linked list graph rep
    for (var i = startIndex; i <= endIndex; i++) {
        for (var j = startIndex; j <= endIndex; j++) {
            if (this.articles[i].relatedArticles.indexOf(this.articles[j].id) != -1) {
                // Need to normalize for indexing
                var normI = i - startIndex;
                var normJ = j - startIndex;
                this.articleNodes[normI].addConnection(normJ);
                this.links.push({source: this.articleNodes[normI], target: this.articleNodes[normJ]});
            }
        }
    }
};

ArticleTimelineWeb.prototype.setupLegend = function() {
    // Setup the color scale, from 0 to 100 as sentiment totals 100 neg + neu + pos

    var gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "timelineLegendGradient")
        .attr("x1", "50%")
        .attr("y1", "0%")
        .attr("x2", "50%")
        .attr("y2", "100%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", this.colorScale(0))
        .attr("stop-opacity", 1);
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", this.colorScale(100))
        .attr("stop-opacity", 1);

    this.legend = svg.append("rect")
        .attr("class", "legend")
        .attr("x", width-20)
        .attr("y", 0)
        .style("fill", "url(#timelineLegendGradient");
};

/**
 * Show a little info window
 * Should contain title, sentiment, fb interactions
 * @param node
 */
ArticleTimelineWeb.prototype.nodeMouseOver = function(node) {
    // Doesn't pass this variable. Unhappy about that.
    // this === the svg node clicked
    if(!articleWeb.articleSelected) {
        articleWeb.articleInfo.setArticle(node.article);
        articleWeb.articleInfo.show();
    }
};

/**
 * Reverse of nodeMouseOver
 * @param node
 */
ArticleTimelineWeb.prototype.nodeMouseExit = function(node) {
    if (!articleWeb.articleSelected)
        articleWeb.articleInfo.hide();
};

/**
 * Highlight the related paths
 * Zoom?
 * @param node
 * @returns {*}
 */
ArticleTimelineWeb.prototype.nodeClick = function(node) {
    articleWeb.articleInfo.setArticle(node.article);
    articleWeb.articleSelected = true;
    articleWeb.articleInfo.show();
    d3.event.stopPropagation();
};

ArticleTimelineWeb.prototype.nodeOutsideClick = function(click) {
    articleWeb.articleInfo.hide();
    articleWeb.articleSelected = false;
};

ArticleTimelineWeb.prototype.resize = function(width, height) {
    this.legend.attr("x", width-20).attr("y", 0);
    this.force.size([width, height]).resume();
};

function dateBinSearch(arr, searchDate, isReversed) {
    var minIndex = 0;
    var maxIndex = arr.length - 1;
    var currentIndex;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;

        if (arr[currentIndex].date < searchDate) {
            if (isReversed)
                maxIndex = currentIndex - 1;
            else
                minIndex = currentIndex + 1;
        }
        else if (arr[currentIndex].date > searchDate) {
            if (isReversed)
                minIndex = currentIndex + 1;
            else
                maxIndex = currentIndex - 1;
        }
        else {
            // Found exactly
            return currentIndex;
        }
    }
    return currentIndex;
}