//  Test class for the AWS S3 File Upload LWC.
//
//  Copyright (c) 2022, salesforce.com, inc.
//  All rights reserved.
//  SPDX-License-Identifier: BSD-3-Clause
//  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
//
//  Contact: john.meyer@salesforce.com

@isTest(isParallel=true)
private class AWS_S3_TestClass  {

    private static final String FILE_NAME = 'Test File';
    private static final String LAST_NAME = 'Sautter';

    @testSetup
    private static void setup () {
        Contact testContact = new Contact (FirstName = 'John', LastName = LAST_NAME);
        insert testContact;
        insert new AWS_File__c (
            Name = FILE_NAME,
            Related_Object_ID__c = testContact.Id,
            Size__c = 10000,
            File_Timestamp__c = DateTime.now()
        );
        insert new S3Settings__c (
            awsAccessKeyId__c = 'Test123',
            bucketName__c = 'salesforce-test',
            bucketRegion__c = 'us-east-1',
            secretAccessKey__c = 'verysecretkey'
        );
    }
 
    @isTest
    private static void testFileList () {
        System.Test.startTest();
        Id recordId = [SELECT Id FROM Contact WHERE LastName = :LAST_NAME].Id;
        System.assertNotEquals(0, AWS_S3_Controller.queryAWSFiles(recordId).size());
        System.Test.stopTest();
    }

    @isTest
    private static void testCreateNewRecord () {
        System.Test.startTest();
        try {
            Id recordId = [SELECT Id FROM Contact WHERE LastName = :LAST_NAME].Id;
            AWS_File__c file = AWS_S3_Controller.createFileRecord(recordId, 'New File', 100, String.valueOf(DateTime.now().getTime()));
            System.assertNotEquals(null, file);
        } catch (Exception e) {
            System.assert(false);
        }
        System.Test.stopTest();
    }

    @isTest
    private static void testUpdateOldRecord () {
        System.Test.startTest();
        try {
            Id recordId = [SELECT Id FROM Contact WHERE LastName = :LAST_NAME].Id;
            AWS_File__c file = AWS_S3_Controller.createFileRecord(recordId, FILE_NAME, 200, String.valueOf(DateTime.now().getTime()));
            System.assertNotEquals(null, file);
        } catch (Exception e) {
            System.assert(false);
        }
        System.Test.stopTest();
    }

    @isTest
    private static void testSignedUrl () {

        System.Test.startTest();
		System.Test.setMock(HttpCalloutMock.class, new AWS_S3_TestHttpMock());
        Id recordId = [SELECT Id FROM Contact WHERE LastName = :LAST_NAME].Id;
        AWS_S3_Controller.deleteS3FileFromTrigger(recordId, FILE_NAME);
        System.Test.stopTest();
    }

}