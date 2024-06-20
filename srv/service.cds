service DocumentExtraction {

    function GetAllJobs()                                                                       returns array of {
        status : String;
        id : UUID;
        fileName : String;
        documentType : String;
        created : DateTime;
        finished : DateTime;
        clientId : String;
    };


    function GetSepecificJobs(id : String)                                                      returns {
        status : String;
        id : String;
        fileName : String;
        documentType : String;
        created : DateTime;
        finished : DateTime;
        clientId : String;
        languageCodes : array of String;
        pageCount : Integer;
        extraction : {
            headerFields : array of {
                name : String;
                value : String;
            };
            lineItems : array of {
                name : String;
                value : String;
            }
        }
    };

    action   UploadFile(name : String, file : LargeBinary, contentType : String, type : String) returns {
        id : String;
        processedTime : Timestamp;
        status : String;
    };

    function GetExtractionInfo(id : UUID)                                                       returns String;

    function GetDocumentService(path : String)                                                  returns array of {
        objectId : String;
        name : String;
        lastModifiedBy : String;
        objectTypeId : String;
        lastModificationDate : Integer;
        createdBy : String;
        baseTypeId : String;
        creationDate : Integer;
        changeToken : String;
    };

    function DownloadDocument(objectId : String)                                                returns LargeBinary;


}
