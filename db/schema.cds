namespace doc;

// using {cuid} from '@sap/cds/common';

entity Jobs {
    key id            : UUID;
        status        : String;
        processedTime : Timestamp;
        headerField   : Composition of many HeaderFields;
        lineItems     : Composition of many LineItems;
        file          : LargeBinary;
}

entity HeaderFields {
    name        : String;
    category    : String;
    value       : String;
    rawValue    : String;
    type        : String;
    page        : Integer;
    confidence  : Double;
    coordinates : Composition of one Coordinates;
    job         : Association to Jobs;
    model       : String;
    label       : String;
    description : String;
}

entity LineItems {
    name        : String;
    category    : String;
    value       : String;
    rawValue    : String;
    type        : String;
    page        : Integer;
    confidence  : Double;
    coordinates : Composition of one Coordinates;
    job         : Association to Jobs;
    model       : String;
    label       : String;
    description : String;
}

entity Coordinates {
    x           : Double;
    y           : Double;
    w           : Double;
    h           : Double;
    headerField : Association to HeaderFields
}
