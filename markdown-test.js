#!/usr/bin/env node

var fs = require('fs');
var rp = require('request-promise');
var open = require('open');
var temp = require('temp').track();

var api = 'https://api.github.com';
var mdRawUrl = api + '/markdown/raw';

var tempPrefix = 'markdown';

var mdCss = '<style>' + fs.readFileSync(__dirname + '/github_markdown.css', 'utf-8') + '</style>';


var htmlString = function(htmlString) {
	return mdCss + '<div class="markdown-body">' + htmlString + '</div>';
}

var convertFile = function(githubUserAgent, fileName, mdFileString) {
	var reqOptions = {
		method: 'POST',
		url: mdRawUrl,
		body: mdFileString,
		headers: {
			'Content-type': 'text/plain',
			'User-Agent': githubUserAgent
		}
	};

	return rp(reqOptions)
		.then(function(data) {
			return htmlString(data);
		})
		.catch(console.error);
}

var renderAndOpen = function(agent, filePath) {
	console.log('Rendering : ' + filePath);
	try {
		var fileString = fs.readFileSync(filePath, 'utf-8');
		convertFile(agent, filePath, fileString).then(function(htmlString) {
			temp.open({
				prefix: filePath,
				suffix: '.html'
			}, function(err, info) {
				if (!err) {
					fs.write(info.fd, htmlString);
					fs.close(info.fd, function(err) {
						console.log('Opening : ' + info.path);

						open(info.path);
					});
				} else {
					console.error(err);
				}
			});
		});
	} catch (err) {
		console.error('Failed to read file: ' + fileName);
	}
}

var createDelayManager = function() {
	var timer = 0;
	return function(callback, ms) {
		clearTimeout(timer);
		timer = setTimeout(callback, ms);
	};
};

module.exports = function(agent, filePaths) {

	filePaths.forEach(function(filePath) {
		renderAndOpen(agent, filePath);

		var delayManager = createDelayManager();
		try {
			fs.watch(filePath, function(event, fileName) {
				if (event === 'change') {
					console.log(event + ' : ' + fileName);
					delayManager(function() {
						renderAndOpen(agent, fileName);
					}, 1000); //prevent multi-calls within 1 second	
				}
			});
		} catch (err) {
			console.error(err);
		}

	});

};