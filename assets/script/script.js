
$('#file_input').change(function(e) {
	// rawData = e.target.files
	var fileList = [];
	fileData = {};
	for(var i = 0; i < e.target.files.length; i++) {
		fileList.push(e.target.files[i].webkitRelativePath)
		rawData[e.target.files[i].webkitRelativePath] = e.target.files[i]
	}

	fileData = flatten(buildFromPathList(fileList))
	initialize(fileData)

	if(e.target.files.length == 0) {
		$('#files').text("no file")
	}
	else {
		$('#files').text(e.target.files.length + " files uploaded")
	}
})

$('#reset').click(function() {
	initialize(fileData);
})

$('#clear').click(function() {
	reset();
	update();
})


