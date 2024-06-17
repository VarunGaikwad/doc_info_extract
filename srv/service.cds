using {doc} from '../db/schema';


service DocumentExtraction {
    entity Jobs as projection on doc.Jobs;

    action UploadFile(name : String, file : LargeBinary, contentType : String, type : String) returns {
        id : String;
        processedTime : Timestamp;
        status : String;
    };
}
