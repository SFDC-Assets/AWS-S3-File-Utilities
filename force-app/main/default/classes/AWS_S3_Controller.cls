//  Apex controller for the AWS S3 File Upload LWC.
//
//  Copyright (c) 2022, salesforce.com, inc.
//  All rights reserved.
//  SPDX-License-Identifier: BSD-3-Clause
//  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
//
//  Contact: john.meyer@salesforce.com

public class AWS_S3_Controller {

    //  URI encoding method to handle issues with AWS encoding. See https://mtr-design.com/news/how-to-create-a-presigned-url-for-aws-s3-using-apex
    //
    //  The parameters represent:
    //      input: The URI to encode
    //      encodeSlash: true if '/' should be encoded, false otherwise
    
    private static String UriEncode(String input, Boolean encodeSlash) {

        String result = '';
  
        for (Integer i = 0; i < input.length(); i++) {
            String ch = input.substring(i, i + 1);
  
            if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '_' || ch == '-' || ch == '~' || ch == '.')
                result += ch;
            else if (ch == '/')
                result += encodeSlash ? '%2F' : ch;
            else {
                String hexValue = EncodingUtil.convertToHex(Blob.valueOf(ch)).toUpperCase();
                if (hexValue.length() == 2)
                    result += '%' + hexValue;
                else if (hexValue.length() == 4)
                    result += '%' + hexValue.substring(0, 2) + '%' + hexValue.substring(2);
            }
        }

        return result;
    }


    public class FileItem {
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        @AuraEnabled public String size;
        @AuraEnabled public DateTime createdDate;
        @AuraEnabled public DateTime lastModifiedDate;
        @AuraEnabled public DateTime fileTimestamp;
        @AuraEnabled public String link;
    }
      
    @AuraEnabled
    public static List<FileItem> queryAWSFiles(String parentId) {

        List<AWS_File__c> queryResult = [
            SELECT Name, CreatedDate, LastModifiedDate, File_Timestamp__c, CalculatedFileSize__c, Related_Object_ID__c
            FROM AWS_File__c
            WHERE Related_Object_ID__c = :parentId
            ORDER BY CreatedDate DESC
        ];
        List<FileItem> result = new List<FileItem>();

        for (AWS_File__c eachItem: queryResult) {
            FileItem item = new FileItem();
            item.id = eachItem.Id;
            item.name = eachItem.Name;
            item.size = eachItem.CalculatedFileSize__c;
            item.createdDate = eachItem.CreatedDate;
            item.lastModifiedDate = eachItem.LastModifiedDate;
            item.fileTimestamp = eachItem.File_Timestamp__c;
            //String fileKey = eachItem.Related_Object_ID__c + '/' + eachItem.Name;
            item.link = getSignedURL('GET', parentId, eachItem.Name, 3000);
            result.add(item);
        }

        return result;
    }

    
    @AuraEnabled
    public static String getSignedURL(String method, String recordId, String fileName, Integer expires) {

        S3Settings__c s3 = S3Settings__c.getInstance();
        String accessKey = s3.awsAccessKeyId__c;
        String secretKey = s3.secretAccessKey__c;
        String bucketName = s3.bucketName__c;
        String bucketRegion = s3.bucketRegion__c;
        String file = recordId + '/' + fileName;
        String location = 'https://' + bucketName + '.s3.' + bucketRegion + '.amazonaws.com/' + UriEncode(file, false);
          
        Datetime currentDateTime = Datetime.now();
        String dateOnly = currentDateTime.formatGmt('yyyyMMdd');
        String req =  dateOnly + '/'+ bucketRegion +'/s3/aws4_request';
        String xAmzCredentialStr = accessKey + '/' + req;
        String xAmzDate = currentDateTime.formatGmt('yyyyMMdd\'T\'HHmmss\'Z\'');
        String xAmzSignedHeaders = 'host';
        String host = bucketName + '.s3.'+ bucketRegion +'.amazonaws.com';
        String canonicalRequest =
            method + '\n' +
                '/' + UriEncode(file, false) + '\n' +
                UriEncode('X-Amz-Algorithm', true) + '=' + UriEncode('AWS4-HMAC-SHA256', true) + '&' +
                UriEncode('X-Amz-Credential', true) + '=' + UriEncode(xAmzCredentialStr, true) + '&' +
                UriEncode('X-Amz-Date', true) + '=' + UriEncode(xAmzDate, true) + '&' +
                UriEncode('X-Amz-Expires', true) + '=' + UriEncode(String.valueOf(expires), true) + '&' +
                UriEncode('X-Amz-SignedHeaders', true) + '=' + UriEncode(xAmzSignedHeaders, true) + '\n' +
                'host:'+host + '\n\n' +
                'host\n' +
                'UNSIGNED-PAYLOAD';
      
        String stringToSign =
            'AWS4-HMAC-SHA256\n'+
                xAmzDate + '\n' +
                req + '\n' +
                EncodingUtil.convertToHex(Crypto.generateDigest('SHA-256', Blob.valueOf(canonicalRequest)));
        Blob dateKey = Crypto.generateMac('hmacSHA256', Blob.valueOf(dateOnly), Blob.valueOf('AWS4' + secretKey));
        Blob dateRegionKey = Crypto.generateMac('hmacSHA256', Blob.valueOf(bucketRegion), dateKey);
        Blob dateRegionServiceKey = Crypto.generateMac('hmacSHA256', Blob.valueOf('s3'), dateRegionKey);
        Blob signingKey = Crypto.generateMac('hmacSHA256', Blob.valueOf('aws4_request'), dateRegionServiceKey);
      
        Blob signature = Crypto.generateMac('hmacSHA256', Blob.valueOf(stringToSign), signingKey);
        String signatureStr = EncodingUtil.convertToHex(signature);

        return location + '?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=' + EncodingUtil.urlEncode(xAmzCredentialStr, 'UTF-8') + '&X-Amz-Date=' + xAmzDate + '&X-Amz-Expires=' + String.valueOf(expires) +'&X-Amz-Signature=' + signatureStr + '&X-Amz-SignedHeaders=host'; 
    }

    
    @AuraEnabled
    public static AWS_File__c createFileRecord(String recordId, String fileName, Integer fileSize, String fileLastModified) {
        try {
            List<AWS_File__c> fileRecord = [SELECT Name, Size__c, File_Timestamp__c FROM AWS_File__c WHERE Related_Object_ID__c = :recordId AND Name = :fileName LIMIT 1];        
            if (!fileRecord.isEmpty()) {
                try {
                    fileRecord[0].Size__c = fileSize;
                    fileRecord[0].File_Timestamp__c = DateTime.newInstance(Long.valueOf(fileLastModified));
                    update fileRecord;
                    return fileRecord[0];
                } catch (DmlException e) {
                    throw new AuraHandledException('Could not update ' + fileName + ': ' + e.getMessage());
                }
            } else {
                try {
                    AWS_File__c record = new AWS_File__c(
                        Related_Object_ID__c = recordId,
                        Size__c = Decimal.valueOf(fileSize),
                        File_Timestamp__c = DateTime.newInstance(Long.valueOf(fileLastModified)),
                        Name = fileName
                    );
                    insert record;
                    return record;
                } catch (DmlException e) {
                    throw new AuraHandledException('Could not create and link ' + fileName + ': ' + e.getMessage());
                }
            }
        } catch (QueryException e) {
            throw new AuraHandledException('Could not check for file "' + fileName + '": ' + e.getMessage());
        }
    }

    
    @future(callout='true')
    public static void deleteS3FileFromTrigger (String recordId, String fileName) {
        deleteS3File(recordId, fileName);
    }

    @AuraEnabled
    public static void deleteS3File(String recordId, String fileName) {
        HttpRequest request = new HttpRequest();
        request.setEndpoint(getSignedURL('DELETE', recordId, fileName, 120));
        request.setMethod('DELETE');
        HttpResponse response = (new Http()).send(request);
        System.debug(response.getBody());
    }
   
  }