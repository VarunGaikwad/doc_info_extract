const axios = require("axios"),
  { TOKEN_USERNAME, TOKEN_PASSWORD, TOKEN_BASEURL, DOCUMENT_EXTRACT_BASEURL } =
    process.env,
  schema = {
    businessCard: "7448635f-bc08-4d0e-b00c-634db0b1ac88",
    invoice: "cf8cc8a9-1eee-42d9-9a3e-507a61baac23",
    custom: "09e6c9e4-d7b0-414f-bd85-cfee6fbb2add",
    paymentAdvice: "b7fdcfac-7853-42bb-89d2-ede2ba1ce803",
    purchaseOrder: "fbab052e-6f9b-4a5f-b42f-29a8162eb1bf",
  };

let token = {
    access_token: undefined,
  },
  timeout = undefined;

require("dotenv").config();

const getDocumentExtractToken = async () => {
    if (token.access_token) return token.access_token;
    const {
      data: { access_token, expires_in },
    } = await axios.post(
      `${TOKEN_BASEURL}/oauth/token`,
      {},
      {
        params: { grant_type: "client_credentials" },
        auth: {
          username: TOKEN_USERNAME,
          password: TOKEN_PASSWORD,
        },
      }
    );
    token = { access_token };

    return access_token;
  },
  defineTimeout = () => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      token = {
        access_token: undefined,
      };
    }, 43199000);
  },
  postDocumentExtract = async (file, contentType, type = "invoice", name) => {
    const access_token = await getDocumentExtractToken(),
      payload = new FormData(),
      blob = base64ToBlob(file, contentType);

    payload.append("file", blob, name);

    payload.append(
      "options",
      JSON.stringify({
        schemaId: schema[type],
        clientId: "default",
        documentType: type,
        receivedDate: new Date().toISOString().split("T")[0],
      })
    );

    const { data } = await axios.post(
      `${DOCUMENT_EXTRACT_BASEURL}/document-information-extraction/v1/document/jobs`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },
  base64ToBlob = (base64String, contentType) => {
    const byteCharacters = atob(base64String),
      byteArrays = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteArrays);
    return new Blob([byteArray], { type: contentType });
  };

module.exports = { postDocumentExtract };
