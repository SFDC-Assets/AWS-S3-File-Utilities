trigger AWS_S3_DeleteTrigger on AWS_File__c (before delete) {
    for (AWS_File__c file: Trigger.old) {
        AWS_S3_Controller.deleteS3FileFromTrigger(file.Related_Object_ID__c, file.Name);
    }
}