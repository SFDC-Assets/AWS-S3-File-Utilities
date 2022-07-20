//  Apex test class for the AWS S3 File Upload LWC.
//
//  Copyright (c) 2022, salesforce.com, inc.
//  All rights reserved.
//  SPDX-License-Identifier: BSD-3-Clause
//  For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
//
//  Contact: john.meyer@salesforce.com

@isTest
global class AWS_S3_TestHttpMock implements HttpCalloutMock {

  global HttpResponse respond (HTTPRequest req) {
    HttpResponse res = new HttpResponse();
    res.setStatus('OK');
    res.setStatusCode(200);
    res.setBody('OK');
    return res;
  }
}