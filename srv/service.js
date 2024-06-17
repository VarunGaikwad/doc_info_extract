const { postDocumentExtract } = require("../libs/common");

module.exports = function (srv) {
  const { Jobs } = srv.entities;

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
    await INSERT.into(Jobs).entries({ status, id, processedTime });
    return { status, id, processedTime };
  });
};
