//  Javascript controller for the AWS S3 File Upload LWC.
//
//  Copyright (c) 2022, salesforce.com, inc.
//  All rights reserved.
//  SPDX-License-Identifier: BSD-3-Clause
//  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
//
//  Contact: john.meyer@salesforce.com

import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import queryAWSFiles from '@salesforce/apex/AWS_S3_Controller.queryAWSFiles';
import createFileRecord from '@salesforce/apex/AWS_S3_Controller.createFileRecord';
import getSignedURL from '@salesforce/apex/AWS_S3_Controller.getSignedURL';

const MAX_FILE_NAME_LENGTH = 80;

export default class AwsS3FileUpload extends LightningElement {
	@api cardTitle = 'AWS S3 File Upload';
	@api hideIcon = false;
	@api recordId;

	columns = [
		{ label: 'File', fieldName: 'name', type: 'text', sortable: true, initialWidth: 300 },
		{
			label: 'Created',
			fieldName: 'fileTimestamp',
			type: 'date',
			typeAttributes: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
		},
		{
			label: 'Last Modified',
			fieldName: 'lastModifiedDate',
			type: 'date',
			typeAttributes: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
		},
		{
			label: 'Uploaded',
			fieldName: 'createdDate',
			type: 'date',
			typeAttributes: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
		},
		{
			label: 'Size',
			fieldName: 'size',
			type: 'string',
			cellAttributes: { alignment: 'right' }
		},
		{
			label: 'Download',
			fieldName: 'link',
			type: 'url',
			cellAttributes: { alignment: 'center' },
			typeAttributes: { label: 'Download', target: '_self' }
		}
	];

	@track fileList = [];
	get fileListEmpty() {
		return this.fileList.length === 0;
	}

	progress = 0;
	uploadProgressList;
	modalVisible = false;
	uploadInProgress = false;

	connectedCallback() {
		this.getFiles();
	}

	getFiles() {
		console.log(`record ID: ${this.recordId}`);
		queryAWSFiles({ parentId: this.recordId })
			.then((result) => {
				console.log(`queryAWSFiles returned: ${JSON.stringify(result)}`);
				this.fileList = [];
				result.forEach((file) => {
					console.log(`getFiles: adding ${file.name} to list`);
					this.fileList.push(file);
				});
			})
			.catch((error) => {
				this.dispatchEvent(
					new ShowToastEvent({
						title: 'Could not get file list',
						message: error.body.message,
						variant: 'error',
						mode: 'sticky'
					})
				);
			});
	}

	createRecord(file) {
		createFileRecord({
			recordId: this.recordId,
			fileName: file.name,
			fileSize: file.size,
			fileLastModified: file.lastModified
		})
			.then((result) => {
				this.getFiles();
			})
			.catch((error) => {
				this.dispatchEvent(
					new ShowToastEvent({
						title: `Could not upload ${file.name}`,
						message: error.body.message,
						variant: 'error',
						mode: 'sticky'
					})
				);
			});
	}

	handleFilesChange(event) {
		this.uploadInProgress = true;
		this.uploadProgressList = [];
		[...event.target.files].forEach((file) => {
			console.log(`uploadFiles: processing file ${file.name}`);
			this.modalVisible = true;
			if (file.name.length > MAX_FILE_NAME_LENGTH) {
				this.dispatchEvent(
					new ShowToastEvent({
						message: `File name "${file.name}" exceeds the maximum length of ${MAX_FILE_NAME_LENGTH} characters.`,
						variant: 'error',
						mode: 'sticky'
					})
				);
			} else {
				let xhr = new XMLHttpRequest();
				this.uploadProgressList.push({
					name: file.name,
					fileType: file.type,
					iconName: 'doctype:unknown',
					statusIcon: null,
					statusIconVariant: null,
					progress: 0,
					finished: false
				});
				xhr.upload.addEventListener('loadstart', (event) => {
					//console.log(`Upload started for ${file.name}, event: ${JSON.stringify(event)}`);
					let item = this.uploadProgressList.find((elem) => elem.name === file.name);
					item.statusIcon = 'utility:threedots';
				});
				xhr.upload.addEventListener('load', (event) => {
					//console.log(`Upload finished event: ${JSON.stringify(event)}`);
					this.createRecord(file);
					let item = this.uploadProgressList.find((elem) => elem.name === file.name);
					item.finished = true;
					item.statusIcon = 'utility:success';
					item.statusIconVariant = 'success';
					this.getFiles();
				});
				xhr.upload.addEventListener('progress', (event) => {
					//console.log(`Upload progress event: ${JSON.stringify(event)}`);
					let item = this.uploadProgressList.find((elem) => elem.name === file.name);
					item.progress = Math.round((event.loaded * 100) / event.total);
					//console.log(`progress ${item.progress}`);
				});
				xhr.upload.addEventListener('error', (event) => {
					console.log(`Upload error event: ${JSON.stringify(event)}`);
					let item = this.uploadProgressList.find((elem) => elem.name === file.name);
					item.statusIcon = 'utility:error';
					item.statusIconVariant = 'error';
				});
				getSignedURL({ method: 'PUT', recordId: this.recordId, fileName: file.name, expires: 3000 })
					.then((result) => {
						//console.log(`got signed URL ${result} with file type ${file.type}`);
						xhr.open('PUT', result);
						//console.log(`XMLHttpRequest open returned status: ${xhr.status}`);
						xhr.setRequestHeader('Content-Type', file.type);
						xhr.send(file);
					})
					.catch((error) => {
						this.dispatchEvent(
							new ShowToastEvent({
								title: `Could not get signed URL for file ${file.name}`,
								message: error.body.message,
								variant: 'error',
								mode: 'sticky'
							})
						);
					});
			}
		});
	}

	handleModalDoneButton(event) {
		this.modalVisible = false;
		this.getFiles();
	}
}
