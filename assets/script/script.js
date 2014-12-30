var		w = 700,
		h = 700;

var circleWidth = 5;

var palette = {
      "lightgray": "#819090",
      "gray": "#708284",
      "mediumgray": "#536870",
      "darkgray": "#475B62",

      "darkblue": "#0A2933",
      "darkerblue": "#042029",

      "paleryellow": "#FCF4DC",
      "paleyellow": "#EAE3CB",
      "yellow": "#A57706",
      "orange": "#BD3613",
      "red": "#D11C24",
      "pink": "#C61C6F",
      "purple": "#595AB7",
      "blue": "#2176C7",
      "green": "#259286",
      "yellowgreen": "#738A05"
  };

var force = d3.layout.force()
    .charge(-50)
    .linkDistance(15)
    .size([w, h])
    .on("tick", tick);

var svg = d3.select('#chart')
			.append('svg')
			.attr('width', w)
			.attr('height', h)

var tooltip = svg.append('text')
				.attr({
					x: 50,
					y: 50,
				})

var nodes = [], links = []
var node = svg.selectAll('circle'),
	link = svg.selectAll('line')
var selected_node = null;

function reset() {
	nodes = [];
	links = [];
	selected_node = null;
	node = svg.selectAll('circle'),
	link = svg.selectAll('line')
}

function initialize(input) {
	reset()

	for (var i in input) {
		nodes.push({
			name: i,
			children: input[i].children,
			parent: input[i].parent
		})
	}
	for (var i in nodes) {
		if(nodes[i].children != null && nodes[i].children.length != 0) {
			for (var k in nodes[i].children) {
				links.push({
					source: nodes[i],
					target: findNode(nodes[i].name + "/" + nodes[i].children[k], nodes)
				})
			}
		}
	}

	update()
}

function update() {
	force
		.nodes(nodes)
		.links(links)
		.start();

	link.remove();
	link = svg.selectAll('line')
			.data(links)
			.enter().append('line')
			.attr('stroke', palette.gray)

	node.remove();
	node = svg.selectAll('circle')
			.data(nodes)
			.enter().append('g')
			.on("mouseover", hover)
			.on("mouseout", clear)
			.on("click", click)
			.call(force.drag)

	node.append('circle')
			.attr('r', function(d) {
				if(d.parent == "") d.r = 2 * circleWidth
				else return d.r = circleWidth;
				return d.r
			})
			.attr('fill', function(d) {
				if(d.children == null) d.col = palette.blue;
				else d.col = palette.pink;
				return d.col
			})

	node.append('circle')
			.attr('r', function(d) {
				if (d.selected) return 1.5 * d.r;
				else return 0;
			})
			.attr('fill-opacity', 0)
			.style('stroke-width', '1.5px')
			.style('stroke', function(d) {
				return d.col;
			})
}

function tick() {
	node
		.attr('transform', function(d, i) {
			return 'translate(' + d.x + ', ' + d.y + ')';
		})

	link
		.attr('x1', function(d) {return d.source.x; })
        .attr('y1', function(d) {return d.source.y; })
        .attr('x2', function(d) {return d.target.x; })
        .attr('y2', function(d) {return d.target.y; })
}

function click(d) {
	if (d3.event.defaultPrevented) return; // ignore drag
	if (d.selected) {
		selected_node = null;
		d.selected = false;
	}
	else {
		d.selected = true;
		if (selected_node) selected_node.selected = false;
		selected_node = d;
	}
	update();
}

function hover(d) {
	tooltip.text(d.name)
}

function clear(d) {
	tooltip.text("")
}

function findNode(nodeName, nodes) {
	for (var i in nodes) {
		if(nodeName == nodes[i].name) return nodes[i];
	}
	return null;
}

$('#file_input').change(function(e) {
	var fileList = [];
	var fileData = {};
	for(var i = 0; i < e.target.files.length; i++)
		fileList.push(e.target.files[i].webkitRelativePath)

	fileData = flatten(buildFromPathList(fileList))
	initialize(fileData)
})

function buildFromPathList(paths) {
	var tree = {};
	for (var i = 0, path; path = paths[i]; ++i) {
		var pathParts = path.split('/');
		var subObj = tree;
		for (var j = 0, folderName; folderName = pathParts[j]; ++j) {
			if (!subObj[folderName]) {
				subObj[folderName] = j < pathParts.length - 1 ? {} : null;
			}
			subObj = subObj[folderName];
		}
	}
	return tree;
}

function flatten(tree) {
	var ret = {};

	recurse("", tree, ret);
	return ret;
}

function recurse(parentPath, data, ret) {
	for(var i in data) {
		if(i != "__proto__") {
			ret[parentPath + "/" + i] = {
				"parent" : parentPath,
				"children" : data[i] ? Object.keys(data[i]) : null
			}
			recurse(parentPath + "/" + i, data[i], ret)
		}
	}
}

