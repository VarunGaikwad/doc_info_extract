const {
  postDocumentExtract,
  getExtractionInfo,
  getAllJobs,
  getSpecificJobs,
} = require("../libs/document_information_extraction");
const {
  getDocumentService,
  getDownloadedDocument,
} = require("../libs/document_management_service");

module.exports = function (srv) {
  srv.on("GetAllJobs", async (req, res) => {
    const response = await getAllJobs();
    return response;
  });

  srv.on("GetSepecificJobs", async (req, res) => {
    const {
        data: { id },
      } = req,
      response = await getSpecificJobs(id),
      lineItems = [];

    for (let i = 0; i < response.extraction.lineItems.length; i++) {
      lineItems.push(...response.extraction.lineItems[i]);
    }

    response.extraction.lineItems = lineItems;
    return response;
  });

  srv.on("UploadFile", async (req, res) => {
    const {
        data: { file, name, contentType, type },
      } = req,
      { status, id, processedTime } = await postDocumentExtract(
        file,
        contentType,
        type,
        name
      );

    return { status, id, processedTime };
  });

  srv.on("GetExtractionInfo", async (req, res) => {
    const {
        data: { id },
      } = req,
      response = await getExtractionInfo(id);

    return id;
  });

  srv.on("GetDocumentService", async (req, res) => {
    const {
        data: { path: base64Path },
      } = req,
      path = atob(base64Path);

    const data = await getDocumentService(path);

    return data;
  });

  srv.on("DownloadDocument", async (req, res) => {
    const {
      data: { objectId },
    } = req;

    const data = await getDownloadedDocument(objectId);

    return data;
  });
};
