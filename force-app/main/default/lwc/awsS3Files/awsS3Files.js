//  Javascript controller for the AWS S3 Files LWC.
//
//  Copyright (c) 2022, salesforce.com, inc.
//  All rights reserved.
//  SPDX-License-Identifier: BSD-3-Clause
//  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
//
//  Contact: john.meyer@salesforce.com

import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript } from 'lightning/platformResourceLoader';
import { humanReadableSize, getIconName, getFileExtension, isAudioFile, isVideoFile } from 'c/awsS3Utilities';
import AWS_S3_SDK from '@salesforce/resourceUrl/AWS_S3_SDK';

const MAX_FILE_NAME_LENGTH = 1024;
const UNCONFIGURED_ACCESS_KEY_ID = 'XXXXXXXXXXXXXXXXXXXX';
const UNCONFIGURED_SECRET_ACCESS_KEY = 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY';
const LINK_EXPIRATION_SECS = 24 * 60 * 60;

export default class AwsS3Files extends LightningElement {
	@api cardTitle = 'AWS Files';
	@api hideIcon = false;
	@api hideViewAndTranscription = false;
	@api prefix = null;
	@api awsRegion;
	@api awsAccessKeyId;
	@api awsSecretAccessKey;
	@api awsBucketName;
	@api recordId;

	spinnerVisible = false;

	@track s3;

	awsBucketPrefix;
	componentConfigured;

	@track fileList = [];

	get fileListEmpty() {
		return this.fileList.length === 0;
	}

	get selectAll() {
		return this.fileList.reduce((selected, file) => selected && file.selected, true);
	}

	get somethingSelected() {
		return this.fileList.reduce((selected, file) => selected || file.selected, false);
	}

	get deleteButtonDisabled() {
		return !this.somethingSelected;
	}

	@track uploadProgressList;
	progress = 0;
	uploadModalVisible = false;
	uploadInProgress = false;

	get uploadFinished() {
		return this.uploadProgressList.reduce((finished, file) => finished && file.finished, true);
	}

	get doneButtonDisabled() {
		return !this.uploadFinished;
	}

	viewModalVisible = false;
	fileBeingViewed = null;
	fileBeingViewedIsVideo = false;
	fileBeingViewedIsAudio = false;
	fileNameBeingViewed = '';
	fileBeingViewedIcon = null;

	connectedCallback() {
		this.componentConfigured =
			this.awsAccessKeyId !== UNCONFIGURED_ACCESS_KEY_ID && this.awsSecretAccessKey !== UNCONFIGURED_SECRET_ACCESS_KEY;
		this.awsBucketPrefix = (this.prefix ? this.prefix + '/' : '') + (this.recordId ? this.recordId + '/' : '');
		if (this.componentConfigured) {
			loadScript(this, AWS_S3_SDK)
				.then(() => {
					AWS.config = new AWS.Config({
						accessKeyId: this.awsAccessKeyId,
						secretAccessKey: this.awsSecretAccessKey,
						region: this.awsRegion
					});
					this.s3 = new AWS.S3({
						params: {
							Bucket: this.awsBucketName
						}
					});
					this.getFiles();
				})
				.catch((error) => {
					console.error(`awsS3Files: Could not load static resource "${AWS_S3_SDK}": ${JSON.stringify(error)}`);
				});
		}
	}

	getFiles() {
		this.spinnerVisible = true;
		this.fileList = [];
		try {
			this.s3.listObjectsV2(
				{
					Bucket: this.awsBucketName,
					Prefix: this.awsBucketPrefix
				},
				(error, data) => {
					if (error) {
						this.dispatchEvent(
							new ShowToastEvent({
								title: 'Could not get file list',
								message: error.message,
								variant: 'error',
								mode: 'sticky'
							})
						);
					} else if (data) {
						data.Contents.forEach((file) => {
							const fileName = file.Key.replace(this.awsBucketPrefix, '');
							const audioFile = isAudioFile(fileName);
							const videoFile = isVideoFile(fileName);
							this.fileList.push({
								selected: false,
								name: fileName,
								key: file.Key,
								fileIsTranscribable: audioFile || videoFile,
								audioFile: audioFile,
								videoFile: videoFile,
								viewIcon: videoFile ? 'utility:video' : audioFile ? 'utility:volume_high' : null,
								icon: getIconName(fileName),
								link: this.s3.getSignedUrl('getObject', {
									Bucket: this.awsBucketName,
									Key: file.Key,
									Expires: LINK_EXPIRATION_SECS
								}),
								lastModifiedDate: file.LastModified,
								size: humanReadableSize(file.Size)
							});
						});
					}
				}
			);
		} catch (error) {
			this.dispatchEvent(
				new ShowToastEvent({
					title: `JavaScript ${error.name} occurred retrieving the file list`,
					message: error.message + (error.cause ? ' caused by ' + error.cause : ''),
					variant: 'error',
					mode: 'sticky'
				})
			);
		} finally {
			this.spinnerVisible = false;
		}
	}

	handleFilesChange(event) {
		this.uploadInProgress = true;
		this.uploadModalVisible = true;
		this.uploadProgressList = [];
		[...event.target.files].forEach((file) => {
			if (file.name.length > MAX_FILE_NAME_LENGTH) {
				this.dispatchEvent(
					new ShowToastEvent({
						message: `File "${file.name}" name length (${file.name.length}) exceeds the maximum length of ${MAX_FILE_NAME_LENGTH} characters and will not be uploaded.`,
						variant: 'error',
						mode: 'sticky'
					})
				);
			} else {
				this.uploadProgressList.push({
					name: file.name,
					key: `${this.awsBucketPrefix}${file.name}`,
					fileType: file.type,
					iconName: getIconName(file.name),
					statusIcon: 'utility:threedots',
					statusIconVariant: null,
					progress: 0,
					loaded: '',
					total: '',
					finished: false
				});
				let uploadRequest = new AWS.S3.ManagedUpload({
					params: {
						Bucket: this.awsBucketName,
						Key: `${this.awsBucketPrefix}${file.name}`,
						Body: file
					}
				});
				uploadRequest.on('httpUploadProgress', (progress) => {
					let item = this.uploadProgressList.find((elem) => elem.key === progress.key);
					item.progress = Math.round((progress.loaded * 100) / progress.total);
					item.loaded = humanReadableSize(progress.loaded);
					item.total = humanReadableSize(progress.total);
				});
				uploadRequest
					.promise()
					.then((result) => {
						let item = this.uploadProgressList.find((elem) => elem.key === result.Key);
						item.finished = true;
						item.statusIcon = 'utility:success';
						item.statusIconVariant = 'success';
					})
					.catch((error) => {
						let item = this.uploadProgressList.find((elem) => elem.name === file.name);
						item.finished = true;
						item.statusIcon = 'utility:error';
						item.statusIconVariant = 'error';
						this.dispatchEvent(
							new ShowToastEvent({
								title: `Error uploading file "${file.name}"`,
								message: error.message,
								variant: 'error',
								mode: 'sticky'
							})
						);
					});
			}
		});
	}

	handleModalDoneButton(event) {
		this.uploadModalVisible = false;
		this.getFiles();
	}

	handleModalCloseButton(event) {
		this.dispatchEvent(
			new ShowToastEvent({
				message: 'Remaining uploads cancelled.',
				variant: 'info'
			})
		);
		this.handleModalDoneButton(event);
	}

	handleDeleteButton(event) {
		let deleteList = [];
		this.fileList.forEach((file) => {
			if (file.selected) deleteList.push({ Key: file.key });
		});
		this.s3.deleteObjects(
			{
				Bucket: this.awsBucketName,
				Delete: {
					Objects: deleteList
				}
			},
			(error, data) => {
				if (error) {
					this.dispatchEvent(
						new ShowToastEvent({
							title: `Could not delete files`,
							message: error.message,
							variant: 'error',
							mode: 'sticky'
						})
					);
					this.getFiles();
				} else if (data) {
					this.dispatchEvent(
						new ShowToastEvent({
							message: `Files deleted.`,
							variant: 'success'
						})
					);
					this.getFiles();
				}
			}
		);
	}

	handleFileSelected(event) {
		this.fileList.find((file) => file.key === event.target.getAttribute('data-key')).selected = event.target.checked;
	}

	handleSelectAll(event) {
		this.fileList.forEach((file) => {
			file.selected = event.target.checked;
		});
	}

	handleDisplayTranscription(event) {
		let file = this.fileList.find((file) => file.key === event.target.getAttribute('data-key'));
	}

	handleViewFile(event) {
		let file = this.fileList.find((file) => file.key === event.target.getAttribute('data-key'));
		this.fileBeingViewed = file.link;
		this.fileNameBeingViewed = file.name;
		this.fileBeingViewedIsVideo = file.videoFile;
		this.fileBeingViewedIsAudio = file.audioFile;
		this.fileBeingViewedIcon = file.videoFile ? 'utility:video' : 'utility:volume_high';
		this.viewModalVisible = true;
	}

	handleViewModalDoneButton(event) {
		this.fileBeingViewed = null;
		this.fileNameBeingViewed = '';
		this.viewModalVisible = false;
	}
}
