sap.ui.define(
  [
    "sap/fe/core/PageController",
    "../formatter/formatter",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
  ],
  function (PageController, formatter, MessageToast, Fragment) {
    "use strict";
    const schema = [
      "businessCard",
      "invoice",
      "paymentAdvice",
      "purchaseOrder",
    ];

    return PageController.extend("docinfoextractui.ext.main.Main", {
      formatter: formatter,

      onFileToBase64: function (file) {
        const { name, type } = file;
        return new Promise(function (resolve, reject) {
          const reader = new FileReader();

          reader.onload = () => {
            const base64String = reader.result.split(",")[1];
            resolve({ file: base64String, name, contentType: type });
          };

          reader.onerror = (error) => {
            reject(error);
          };

          reader.readAsDataURL(file);
        });
      },

      onInit: function () {
        const model = new sap.ui.model.json.JSONModel({
          selectedIndex: 1,
          selectedKey: "idDocumentServicePage",
          messageStripText: "",
          currentPath: "",
          busy: false,
          selectedSchema: "invoice",
          schema: [
            {
              key: "businessCard",
              text: "Business Card",
            },
            {
              key: "invoice",
              text: "Invoice",
            },
            {
              key: "paymentAdvice",
              text: "Payment Advice",
            },
            {
              key: "purchaseOrder",
              text: "Purchase Order",
            },
          ],
        });

        this.getView().setModel(model, "localModel");
      },

      onItemSelect: function () {
        const selectedKey = this.getView()
          .getModel("localModel")
          .getProperty("/selectedKey");
        this.byId("idPageContainer").to(this.getView().createId(selectedKey));
      },

      onFetchDocumentService: function () {
        const serviceUrl = this.getAppComponent().getModel().getServiceUrl(),
          localModel = this.getView().getModel("localModel"),
          currentPath = localModel.getProperty("/currentPath");

        localModel.setProperty("/busy", true);

        $.get(`${serviceUrl}GetDocumentService(path='${btoa(currentPath)}')`)
          .then(({ value }) => {
            localModel.setProperty("/GetDocumentService", value);
            localModel.setProperty("/busy", false);
          })
          .catch(console.error);
      },

      onAfterRendering: function () {
        this.onItemSelect();
        this.onFetchDocumentService(
          this.getView().getModel("localModel").getProperty("/currentPath") ||
            "/"
        );
        this.onFetchDocumentExtract();
      },

      onFetchDocumentExtract: function () {
        const serviceUrl = this.getAppComponent().getModel().getServiceUrl(),
          localModel = this.getView().getModel("localModel");

        localModel.setProperty("/busy", true);

        $.get(`${serviceUrl}GetAllJobs()`)
          .then(({ value }) => {
            localModel.setProperty("/GetAllJobs", value);
            localModel.setProperty("/busy", false);
          })
          .catch(console.error);
      },

      onUploadButtonPress: async function () {
        const idFileUploader = this.getView().byId("idFileUploader"),
          serviceUrl = this.getAppComponent().getModel().getServiceUrl(),
          localModel = this.getView().getModel("localModel"),
          selectedSchema = localModel.getProperty("/selectedSchema"),
          { files } = idFileUploader.oFileUpload,
          clearMessage = () =>
            setTimeout(
              () => localModel.setProperty("/messageStripText", ""),
              5000
            );

        if (!files.length) {
          localModel.setProperty("/messageStripText", "Please select a file");
          clearMessage();
          return;
        }

        if (!selectedSchema) {
          localModel.setProperty("/messageStripText", "Please select a schema");
          clearMessage();

          return;
        }

        const { file, name, contentType } = await this.onFileToBase64(files[0]);
        localModel.setProperty("/busy", true);
        const response = await $.ajax({
          data: JSON.stringify({
            name,
            file,
            contentType,
            type: selectedSchema,
          }),
          contentType: "application/json",
          url: `${serviceUrl}UploadFile`,
          dataType: "json",
          type: "POST",
        });
        localModel.setProperty("/busy", false);
        if (response.id) {
          idFileUploader.clear();
          sap.m.MessageToast.show("Upload Completed", {
            duration: 3000,
          });
        } else {
          sap.m.MessageToast.show("Upload Failed", {
            duration: 3000,
          });
        }
      },

      onUploadPress: async function () {
        const idUploadSet = this.getView().byId("idUploadSet"),
          incompletedItem = idUploadSet.getIncompleteItems(),
          localModel = this.getView().getModel("localModel"),
          selectedIndex = localModel.getProperty("/selectedIndex"),
          oDataModel = this.getAppComponent().getModel(),
          serviceUrl = oDataModel.getServiceUrl(),
          promises = [];

        if (!incompletedItem.length) return null;

        for (let index = 0; index < incompletedItem.length; index++) {
          const element = incompletedItem[index],
            { name, file, contentType } = await this.onFileToBase64(
              element.getFileObject()
            );
          promises.push(
            $.ajax({
              data: JSON.stringify({
                name,
                file,
                contentType,
                type: schema[selectedIndex],
              }),
              contentType: "application/json",
              url: `${serviceUrl}UploadFile`,
              dataType: "json",
              type: "POST",
            })
          );
        }

        localModel.setProperty("/busy", true);

        Promise.all(promises)
          .then(function () {
            sap.m.MessageToast.show("Upload Completed", {
              duration: 3000,
            });
            idUploadSet.removeAllIncompleteItems();
          })
          .finally(function () {
            localModel.setProperty("/busy", false);
            oDataModel.refresh();
          })
          .catch(function (error) {
            sap.m.MessageToast.show("Upload Failed", {
              duration: 3000,
            });
          });
      },

      onDocumentServiceNav: function (oEvent) {
        const { name, objectId, objectTypeId } = oEvent
            .getSource()
            .getBindingContext("localModel")
            .getObject(),
          localModel = this.getView().getModel("localModel"),
          currentPath = localModel.getProperty("/currentPath");

        if (objectTypeId === "cmis:folder") {
          localModel.setProperty("/currentPath", currentPath + "/" + name);
          this.onFetchDocumentService();
        } else {
          this.onDownloadDocument(name, objectId);
        }
      },

      onDownloadDocument: function (name, objectId) {
        const serviceUrl = this.getView().getModel().getServiceUrl();
        $.get(`${serviceUrl}DownloadDocument(objectId='${objectId}')`).then(
          ({ value }) => this.onDownloadBase64File(value, name)
        );
      },

      onDownloadBase64File: function (
        base64Data,
        fileName,
        mimeType = "application/octet-stream"
      ) {
        try {
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });

          // Create a link element
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = fileName;

          // Append the link to the body
          document.body.appendChild(link);

          // Programmatically click the link to trigger the download
          link.click();

          // Remove the link from the document
          document.body.removeChild(link);

          // Release the object URL
          URL.revokeObjectURL(link.href);
        } catch (error) {
          console.error("Error downloading file:", error);
        }
      },

      onDocumentExtractPress: async function (oEvent) {
        const id = oEvent
            .getSource()
            .getBindingContext("localModel")
            .getObject("id"),
          oDataModel = this.getAppComponent().getModel(),
          serviceUrl = oDataModel.getServiceUrl(),
          localModel = this.getView().getModel("localModel"),
          oView = this.getView();

        const response = await $.get(
          `${serviceUrl}GetSepecificJobs(id='${id}')`
        );

        localModel.setProperty("/selectedDocumentInfo", response);

        if (!this._oDocumentInfo) {
          this._oDocumentInfo = Fragment.load({
            id: oView.getId(),
            name: "docinfoextractui.ext.modal.Document",
            controller: this,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }

        this._oDocumentInfo.then(function (oDialog) {
          oDialog.open();
        });
      },

      onDocumentExtractClose: function () {
        this._oDocumentInfo.then(function (oDialog) {
          oDialog.close();
        });
      },
    });
  }
);
