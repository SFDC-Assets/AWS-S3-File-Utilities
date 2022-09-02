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
const jsonTranscript = {"jobName":"Call-Center-Webinar-with-Talk-Track","accountId":"951163254771","results":{"transcripts":[{"transcript":"here. We can see both the experience cloud site on the desktop, side by side with the mobile publisher app, the mobile publisher app in the desktop. Both have deep rich experiences using content management, the ability to complete the submission of a complaint to schedule an appointment. And also you have unauthenticated versus authenticated users. An authenticated user could manage things such as the profile or other information. Jennifer is going to launch the embedded menu here for service. She can call in from that menu, she could do text messaging or facebook messenger. She's gonna go ahead and launch a boat here. But for our purposes we're gonna make sure that we can see everything on a larger screen on the desktop. So jennifer launches the same bot. She can fill in her information and this can be completely configurable to capture all kinds of information. Now jennifer is going to go ahead and start her conversation with paul the bot. Now paul can recognize who jennifer is and provide contextual information. He provides a general menu for jennifer. She can select information such as status in my cases and paul can bring back her cases, jennifer can also at any time jump into transfer to an agent or any other items in the hamburger menu. In our situation, jennifer is gonna transfer over to an agent to discuss more about our case. Now let's flip over to the agent view with our agent. Mark. Now Mark has Omni channel open in an omni channel, he has items such as a phone call available to him, a case that's been routed to him or in this case jennifer's chat. Mark can go ahead and select jennifer's to chat and he pops right to it. He can see all the context of what's happened with paul the bot before jennifer was transferred over. He can also see jennifer typing in and get a quick heads up about what she's going to be asking for relevantly. We can also see the case details of the case that jennifer selected and paul the body has already been attached to the case. Mark doesn't have to fumble around. He also has access to items such as quick text to help in his chat and also recommendations that can be popped up based on what's going on the chat or other information on the case or on the contact. He can also schedule an appointment through a flow. Mark has access to knowledge. So we can go ahead and search the knowledge article based in salesforce and if he can't find what he needs. He can do an advanced search as well. His details on the chat including where it started from. You can also see past chats and he has access to other phones that have been given to him. Now Mark can go over to jennifer's contact details and see her interaction history and other information including details about her. Mark's gonna jump into a previous phone call that jennifer had. Now Mark's gonna make this jump out on the bigger screen which you can do with any tab in salesforce. Mark can go ahead and see the transcription of the phone call that jennifer had recently so he can get all the details about what occurred. He doesn't have to poke around looking for notes or anything like that. He could also go listen to the call recording that's been also associated to the interaction history. He can also see any notes on the call recording if he chooses to, even while playing it. He could also add notes of his own. Really helpful for mark to get that 360° view of everything about Jennifer and her interactions. He also has access to knowledge as well and another flow. And in this flow you can see it can be rich context. It doesn't just have to be a form so mark can have information at his fingertips to make it easy to visualize what he needs to do jumping back to the chat. Mark can wrap up with jennifer, he can ask for information that she needs to provide or he could close the case out whatever is needed to help jennifer get her case resolved. Now we're gonna move over to the next viewpoint which is Mark supervisor in this view, Mark supervisors can see everything in an analytical view, really rich data presented to them both data inside and outside of salesforce. Now our supervisor can slice and dice that data could drill into it more to get more details about what's going on. There are also out of the box analytics for service called voice that show average handle time, call volume or other relevant information to call centers here we see on the supervisor and the supervisor we have the ability to see all our agents and what they're working on. We also have the ability to change their cues or their skills at any time, no more relying on I. T. What's better is we can drill into agents such as Mark to see what he's been working on. We could actually go to his calendar view and check out what he was working on yesterday. Really gives us an understanding of what we need to do for scheduling. We also have additional reports. We have reports on knowledge out of the box, what articles are being helpful both for self service and the agents. What's going on in Omni channel, what cases are being routed, average handle and response time. And we also have dashboards for agents that they can understand how they're doing and get feedback from coaches"}],"items":[{"start_time":"0.76","end_time":"1.25","alternatives":[{"confidence":"1.0","content":"here"}],"type":"pronunciation"},{"alternatives":[{"confidence":"0.0","content":"."}],"type":"punctuation"},{"start_time":"1.25","end_time":"1.38","alternatives":[{"confidence":"1.0","content":"We"}],"type":"pronunciation"},{"start_time":"1.38","end_time":"1.55","alternatives":[{"confidence":"1.0","content":"can"}],"type":"pronunciation"},{"start_time":"1.55","end_time":"2.21","alternatives":[{"confidence":"1.0","content":"see"}],"type":"pronunciation"},{"start_time":"2.22","end_time":"2.55","alternatives":[{"confidence":"1.0","content":"both"}],"type":"pronunciation"},{"start_time":"2.55","end_time":"2.67","alternatives":[{"confidence":"1.0","content":"the"}],"type":"pronunciation"},{"start_time":"2.67","end_time":"3.31","alternatives":[{"confidence":"0.9957","content":"experience"}],"type":"pronunciation"},{"start_time":"3.31","end_time":"3.57","alternatives":[{"confidence":"0.9854","content":"cloud"}],"type":"pronunciation"},{"start_time":"3.57","end_time":"3.9","alternatives":[{"confidence":"0.8173","content":"site"}],"type":"pronunciation"},{"start_time":"3.9","end_time":"4.02","alternatives":[{"confidence":"1.0","content":"on"}],"type":"pronunciation"},{"start_time":"4.02","end_time":"4.13","alternatives":[{"confidence":"1.0","content":"the"}],"type":"pronunciation"},{"start_time":"4.13","end_time":"5.43","alternatives":[{"confidence":"0.9995","content":"desktop"}],"type":"pronunciation"},{"alternatives":[{"confidence":"0.0","content":","}],"type":"punctuation"},{"start_time":"5.53","end_time":"5.83","alternatives":[{"confidence":"1.0","content":"side"}],"type":"pronunciation"},{"start_time":"5.83","end_time":"5.96","alternatives":[{"confidence":"1.0","content":"by"}],"type":"pronunciation"},{"start_time":"5.96","end_time":"6.54","alternatives":[{"confidence":"1.0","content":"side"}],"type":"pronunciation"},{"start_time":"6.55","end_time":"6.71","alternatives":[{"confidence":"0.683","content":"with"}],"type":"pronunciation"},{"start_time":"6.72","end_time":"6.83","alternatives":[{"confidence":"0.9992","content":"the"}],"type":"pronunciation"},{"start_time":"6.83","end_time":"7.13","alternatives":[{"confidence":"0.9953","content":"mobile"}],"type":"pronunciation"},{"start_time":"7.13","end_time":"7.65","alternatives":[{"confidence":"1.0","content":"publisher"}],"type":"pronunciation"},{"start_time":"7.65","end_time":"8.91","alternatives":[{"confidence":"0.9083","content":"app"}],"type":"pronunciation"},{"alternatives":[{"confidence":"0.0","content":","}],"type":"punctuation"},{"start_time":"9.52","end_time":"9.65","alternatives":[{"confidence":"0.9996","content":"the"}],"type":"pronunciation"},{"start_time":"9.65","end_time":"9.91","alternatives":[{"confidence":"0.9929","content":"mobile"}],"type":"pronunciation"},{"start_time":"9.91","end_time":"10.37","alternatives":[{"confidence":"1.0","content":"publisher"}],"type":"pronunciation"},{"start_time":"10.37","end_time":"10.84","alternatives":[{"confidence":"0.9466","content":"app"}],"type":"pronunciation"},{"start_time":"10.85","end_time":"10.97","alternatives":[{"confidence":"0.9258","content":"in"}],"type":"pronunciation"},{"start_time":"10.97","end_time":"11.05","alternatives":[{"confidence":"1.0","content":"the"}],"type":"pronunciation"},{"start_time":"11.05","end_time":"11.7","alternatives":[{"confidence":"0.9964","content":"desktop"}],"type":"pronunciation"},{"alternatives":[{"confidence":"0.0","content":"."}],"type":"punctuation"},{"start_time":"11.71","end_time":"12.01","alternatives":[{"confidence":"1.0","content":"Both"}],"type":"pronunciation"},{"start_time":"12.01","end_time":"12.49","alternatives":[{"confidence":"1.0","content":"have"}],"type":"pronunciation"},{"start_time":"12.94","end_time":"13.39","alternatives":[{"confidence":"1.0","content":"deep"}],"type":"pronunciation"},{"start_time":"13.4","end_time":"13.7","alternatives":[{"confidence":"1.0","content":"rich"}],"type":"pronunciation"},{"start_time":"13.7","end_time":"14.46","alternatives":[{"confidence":"0.9977","content":"experiences"}],"type":"pronunciation"},{"start_time":"14.46","end_time":"14.79","alternatives":[{"confidence":"1.0","content":"using"}],"type":"pronunciation"},{"start_time":"14.79","end_time":"15.23","alternatives":[{"confidence":"1.0","content":"content"}],"type":"pronunciation"},{"start_time":"15.23","end_time":"15.78","alternatives":[{"confidence":"1.0","content":"management"}],"type":"pronunciation"},{"alternatives":[{"confidence":"0.0","content":","}],"type":"punctuation"},{"start_time":"16.06","end_time":"16.19","alternatives":[{"confidence":"1.0","content":"the"}],"type":"pronunciation"},{"start_time":"16.19","end_time":"16.91","alternatives":[{"confidence":"1.0","content":"ability"}],"type":"pronunciation"},{"start_time":"16.92","end_time":"17.23","alternatives":[{"confidence":"1.0","content":"to"}],"type":"pronunciation"},{"start_time":"17.23","end_time":"18.04","alternatives":[{"confidence":"1.0","content":"complete"}],"type":"pronunciation"},{"start_time":"18.37","end_time":"18.51","alternatives":[{"confidence":"1.0","content":"the"}],"type":"pronunciation"},{"start_time":"18.51","end_time":"18.98","alternatives":[{"confidence":"1.0","content":"submission"}],"type":"pronunciation"},{"start_time":"18.98","end_time":"19.08","alternatives":[{"confidence":"1.0","content":"of"}],"type":"pronunciation"},{"start_time":"19.08","end_time":"19.14","alternatives":[{"confidence":"1.0","content":"a"}],"type":"pronunciation"},{"start_time":"19.14","end_time":"19.87","alternatives":[{"confidence":"1.0","content":"complaint"}],"type":"pronunciation"},{"start_time":"20.24","end_time":"20.41","alternatives":[{"confidence":"0.9991","content":"to"}],"type":"pronunciation"},{"start_time":"20.41","end_time":"20.86","alternatives":[{"confidence":"1.0","content":"schedule"}],"type":"pronunciation"},{"start_time":"20.86","end_time":"20.93","alternatives":[{"confidence":"1.0","content":"an"}],"type":"pronunciation"},{"start_time":"20.93","end_time":"21.65","alternatives":[{"confidence":"1.0","content":"appointment"}],"type":"pronunciation"},{"alternatives":[{"confidence":"0.0","content":"."}],"type":"punctuation"},{"start_time":"22.06","end_time":"22.86","alternatives":[{"confidence":"1.0","content":"And"}],"type":"pronunciation"},{"start_time":"22.87","end_time":"23.77","alternatives":[{"confidence":"1.0","content":"also"}],"type":"pronunciation"},{"start_time":"23.78","end_time":"23.96","alternatives":[{"confidence":"1.0","content":"you"}],"type":"pronunciation"},{"start_time":"23.96","end_time":"24.13","alternatives":[{"confidence":"1.0","content":"have"}],"type":"pronunciation"},{"start_time":"24.13","end_time":"25.11","alternatives":[{"confidence":"1.0","content":"unauthenticated"}],"type":"pronunciation"},{"start_time":"25.12","end_time":"25.5","alternatives":[{"confidence":"0.7417","content":"versus"}],"type":"pronunciation"},{"start_time":"25.5","end_time":"26.21","alternatives":[{"confidence":"1.0","content":"authenticated"}],"type":"pronunciation"},{"start_time":"26.21","end_time":"26.81","alternatives":[{"confidence":"0.9888","content":"users"}],"type":"pronunciation"},{"alternatives":[{"confidence":"0.0","content":"."}],"type":"punctuation"},{"start_time":"27.33","end_time":"27.52","alternatives":[{"confidence":"0.9871","content":"An"}],"type":"pronunciation"},{"start_time":"27.52","end_time":"28.17","alternatives":[{"confidence":"0.9995","content":"authenticated"}],"type":"pronunciation"},{"start_time":"28.17","end_time":"28.5","alternatives":[{"confidence":"1.0","content":"user"}],"type":"pronunciation"},{"start_time":"28.5","end_time":"28.68","alternatives":[{"confidence":"0.8705","content":"could"}],"type":"pronunciation"},{"start_time":"28.68","end_time":"28.96","alternatives":[{"confidence":"1.0","content":"manage"}],"type":"pronunciation"},{"start_time":"28.96","end_time":"29.17","alternatives":[{"confidence":"0.9998","content":"things"}],"type":"pronunciation"},{"start_time":"29.17","end_time":"29.38","alternatives":[{"confidence":"1.0","content":"such"}],"type":"pronunciation"},{"start_time":"29.38","end_time":"29.5","alternatives":[{"confidence":"1.0","content":"as"}],"type":"pronunciation"},{"start_time":"29.5","end_time":"29.64","alternatives":[{"confidence":"0.6244","content":"the"}],"type":"pronunciation"},{"start_time":"29.64","end_time":"30.3","alternatives":[{"confidence":"0.9994","content":"profile"}],"type":"pronunciation"},{"start_time":"30.31","end_time":"30.45","alternatives":[{"confidence":"0.9977","content":"or"}],"type":"pronunciation"},{"start_time":"30.45","end_time":"30.63","alternatives":[{"confidence":"1.0","content":"other"}],"type":"pronunciation"},{"start_time":"30.63","end_time":"31.32","alternatives":[{"confidence":"1.0","content":"information"}],"type":"pronunciation"},{"alternatives":[{"confidence":"0.0","content":"."}],"type":"punctuation"},{"start_time":"32.15","end_time":"32.68","alternatives":[{"confidence":"0.9119","content":"Jennifer"}],"type":"pronunciation"},{"start_time":"32.68","end_time":"32.76","alternatives":[{"confidence":"0.9689","content":"is"}],"type":"pronunciation"},{"start_time":"32.76","end_time":"32.89","alternatives":[{"confidence":"0.5812","content":"going"}],"type":"pronunciation"},{"start_time":"32.89","end_time":"32.96","alternatives":[{"confidence":"0.5812","content":"to"}],"type":"pronunciation"},{"start_time":"32.96","end_time":"33.44","alternatives":[{"confidence":"1.0","content":"launch"}],"type":"pronunciation"},{"start_time":"33.44","end_time":"33.76","alternatives":[{"confidence":"1.0","content":"the"}],"type":"pronunciation"},{"start_time":"33.76","end_time":"34.18","alternatives":[{"confidence":"1.0","content":"embedded"}],"type":"pronunciation"},{"start_time":"34.18","end_time":"34.56","alternatives":[{"confidence":"0.9986","content":"menu"}],"type":"pronunciation"},{"start_time":"34.56","end_time":"34.93","alternatives":[{"confidence":"0.9974","content":"here"}],"type":"pronunciation"},{"start_time":"34.94","end_time":"35.34","alternatives":[{"confidence":"1.0","content":"for"}],"type":"pronunciation"},{"start_time":"35.34","end_time":"35.91","alternatives":[{"confidence":"1.0","content":"service"}],"type":"pronunciation"},{"alternatives":[{"confidence":"0.0","content":"."}],"type":"punctuation"},{"start_time":"35.92","end_time":"36.3","alternatives":[{"confidence":"0.9997","content":"She"}],"type":"pronunciation"},{"start_time":"36.3","end_time":"36.44","alternatives":[{"confidence":"0.9996","content":"can"}],"type":"pronunciation"},{"start_time":"36.44","end_time":"36.81","alternatives":[{"confidence":"0.9918","content":"call"}],"type":"pronunciation"},{"start_time":"36.81","end_time":"36.91","alternatives":[{"confidence":"0.9875","content":"in"}],"type":"pronunciation"},{"start_time":"36.91","end_time":"37.06","alternatives":[{"confidence":"1.0","content":"from"}],"type":"pronunciation"},{"start_time":"37.06","end_time":"37.22","alternatives":[{"confidence":"1.0","content":"that"}],"type":"pronunciation"}]},"status":"COMPLETED"};

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

	// Nikhil added code
	clickedButtonIndex;
	clickedButtonTime;

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
	fileBeingViewedUrl = null;
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
		const file = this.fileList.find((file) => file.key === event.target.getAttribute('data-key'));
	}

	handleViewFile(event) {
		const file = this.fileList.find((file) => file.key === event.target.getAttribute('data-key'));
		this.fileBeingViewedUrl = file.link;
		this.fileNameBeingViewed = file.name;
		this.fileBeingViewedIsVideo = file.videoFile;
		this.fileBeingViewedIsAudio = file.audioFile;
		this.fileBeingViewedIcon = file.viewIcon;
		this.viewModalVisible = true;
		this.fileTranscript = file.transcript;
		this.fileKey = file.key;
		var words = [];
		var startTimes = [];
		// console.log("boutta print");
		// console.log(this.fileTranscript);
		// console.log('shoulda print');

		// const items = (JSON.parse(this.fileTranscript)).results.items;
		// const items = this.fileTranscript.results.items;

		// hardcoded items
		const items = jsonTranscript.results.items;

		for (var i = 0; i < items.length; i++) {
			words.push(items[i].alternatives[0].content);
			startTimes.push(items[i].start_time);
		}
		this.fileTranscriptWords = words;
		this.fileTranscriptStartTimes = startTimes;

		// /*
		// iterate through each item

		// add items[i].alternatives[0].content to words
		// add items[i].start_time to startTimes


		// */
		// this.fileTranscript = jsonTranscript.results.transcripts[0].transcript;

		console.log(file.fileTranscript);
	}

	handleViewModalDoneButton(event) {
		this.fileBeingViewedUrl = null;
		this.fileNameBeingViewed = '';
		this.fileBeingViewedIsVideo = false;
		this.fileBeingViewedIsAudio = false;
		this.fileBeingViewedIcon = null;
		this.viewModalVisible = false;
	}

	handleWordClick(event) {
		this.clickedButtonIndex = event.target.getAttribute('data-index');
		const file = this.fileList.find((file) => file.key === event.target.getAttribute('data-key'));
		this.clickedButtonTime = this.fileTranscriptStartTimes[this.clickedButtonIndex];
		if (this.fileBeingViewedIsVideo){
			this.template.querySelector('video').play();
			this.template.querySelector('video').pause();
			this.template.querySelector('video').currentTime = this.clickedButtonTime;
			this.template.querySelector('video').play();
		}
		else if (this.fileBeingViewedIsAudio){
			this.template.querySelector('audio').play();
			this.template.querySelector('audio').pause();
			this.template.querySelector('audio').currentTime = this.clickedButtonTime;
			this.template.querySelector('audio').play();
		}
	}

}
