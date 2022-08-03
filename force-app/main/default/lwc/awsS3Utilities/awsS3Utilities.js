//  Service component for the AWS S3 Files LWCs.
//
//  Copyright (c) 2022, salesforce.com, inc.
//  All rights reserved.
//  SPDX-License-Identifier: BSD-3-Clause
//  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
//
//  Contact: john.meyer@salesforce.com

const humanReadableSize = (bytes) => {
	let size = parseInt(bytes);
	for (const unit of ['B', 'KB', 'MB', 'GB', 'TB', 'PB']) {
		if (size < 1024) return `${size.toFixed(1)} ${unit}`;
		size /= 1024.0;
	}
};

const getFileExtension = (fileName) => {
	const dotIndex = fileName.lastIndexOf('.');
	if (dotIndex === -1) return '';
	else return fileName.substring(dotIndex + 1, fileName.length).toLowerCase();
};

const getIconName = (fileName) => {
	switch (getFileExtension(fileName)) {
		case 'htm':
		case 'html':
		case 'shtml':
		case 'xhtml':
			return 'doctype:html';
		case 'xml':
			return 'doctype:xml';
		case 'exe':
			return 'doctype:exe';
		case 'pdf':
			return 'doctype:pdf';
		case 'eps':
			return 'doctype:eps';
		case 'ppt':
		case 'pptx':
			return 'doctype:ppt';
		case 'xls':
		case 'xlsx':
			return 'doctype:excel';
		case 'pages':
			return 'doctype:pages';
		case 'key':
			return 'doctype:keynote';
		case 'csv':
			return 'doctype:csv';
		case 'txt':
			return 'doctype:txt';
		case 'xml':
			return 'doctype:xml';
		case 'doc':
		case 'docx':
			return 'doctype:word';
		case 'vsd':
		case 'vsdx':
			return 'doctype:visio';
		case 'zip':
			return 'doctype:zip';
		case 'rtf':
			return 'doctype:rtf';
		case 'psd':
			return 'doctype:psd';
		case 'ai':
			return 'doctype:ai';
		case 'html':
			return 'doctype:html';
		case 'gdoc':
			return 'doctype:gdoc';
		case 'gpres':
			return 'doctype:gpres';
		case 'gsheet':
			return 'doctype:gsheet';
		case 'gform':
			return 'doctype:gform';
		case 'mp4':
		case 'm4v':
			return 'doctype:mp4';
		case 'mov':
		case 'wmv':
		case 'avi':
		case 'avchd':
		case 'mkv':
		case 'webm':
		case 'mpg':
		case 'mpeg':
			return 'doctype:video';
		case 'flv':
		case 'f4v':
		case 'fla':
		case 'swf':
			return 'doctype:flash';
		case 'jpg':
		case 'jpeg':
		case 'gif':
		case 'png':
			return 'doctype:image';
		case 'mp3':
		case 'au':
		case 'wav':
		case 'flac':
		case 'm4a':
			return 'doctype:audio';
		case 'webloc':
		case 'lnk':
			return 'doctype:link';
		case 'zip':
			return 'doctype:zip';
		default:
			return 'doctype:unknown';
	}
};

export { humanReadableSize, getIconName, getFileExtension };
