using {doc} from '../db/schema';


service DocumentExtraction {
    entity Jobs as projection on doc.Jobs;
    action UploadFile();
}
