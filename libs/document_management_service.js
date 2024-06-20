const {
  DOCUMENT_SERVICE_TOKEN_USERNAME,
  DOCUMENT_SERVICE_TOKEN_PASSWORD,
  DOCUMENT_SERVICE_TOKEN_BASEURL,
  DOCUMENT_SERVICE_BASEURL,
} = require("./global_env");

const axios = require("axios"),
  keys = [
    "cmis:objectId",
    "cmis:name",
    "cmis:lastModifiedBy",
    "cmis:objectTypeId",
    "cmis:lastModificationDate",
    "cmis:createdBy",
    "cmis:baseTypeId",
    "cmis:creationDate",
    "cmis:changeToken",
  ];
let timeout,
  token = {};
const getDocumentServiceToken = async () => {
    if (token.access_token) return token.access_token;
    const { data } = await axios.post(
      `${DOCUMENT_SERVICE_TOKEN_BASEURL}/oauth/token`,
      {},
      {
        params: { grant_type: "client_credentials" },
        auth: {
          username: DOCUMENT_SERVICE_TOKEN_USERNAME,
          password: DOCUMENT_SERVICE_TOKEN_PASSWORD,
        },
      }
    );
    token = data;

    defineTimeout();

    return token.access_token;
  },
  defineTimeout = () => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      token = {
        access_token: undefined,
      };
    }, 43199000);
  },
  getDocumentService = async (path) => {
    const access_token = await getDocumentServiceToken(),
      {
        data: { objects },
      } = await axios.get(
        `${DOCUMENT_SERVICE_BASEURL}/browser/4fcaeb5f-6a64-44a4-8ab9-4de4ceb92c1b/root/${path}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
    defineTimeout();

    const returnObjects = objects.map(({ object: { properties } }) => {
      const obj = {};
      keys.forEach((key) => {
        const newKey = key.replace("cmis:", "");
        obj[newKey] = properties[key]?.value || null;
      });
      return obj;
    });

    return returnObjects;
  },
  getDownloadedDocument = async (objectId) => {
    const access_token = await getDocumentServiceToken(),
      { data, headers } = await axios.get(
        `${DOCUMENT_SERVICE_BASEURL}/browser/4fcaeb5f-6a64-44a4-8ab9-4de4ceb92c1b/root?objectId=${objectId}`,
        {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      ),
      base64 = convertToBase64(data);
    defineTimeout();
    console.log(headers);
    return base64;
  },
  convertToBase64 = (arrayBuffer) => {
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString("base64");
  };

module.exports = { getDocumentService, getDownloadedDocument };
