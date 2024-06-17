sap.ui.define(["sap/fe/core/PageController"], function (PageController) {
  "use strict";
  const schema = ["businessCard", "invoice", "paymentAdvice", "purchaseOrder"];
  return PageController.extend("docinfoextractui.ext.main.Main", {
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
      });

      this.getView().setModel(model, "localModel");
    },

    onUploadPress: async function () {
      const idUploadSet = this.getView().byId("idUploadSet"),
        incompletedItem = idUploadSet.getIncompleteItems(),
        localModel = this.getView().getModel("localModel"),
        selectedIndex = localModel.getProperty("/selectedIndex"),
        oDataModel = this.getAppComponent().getModel(),
        serviceUrl = oDataModel.getServiceUrl(),
        promises = [];
      debugger;
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

      Promise.all(promises).then(function () {
        oDataModel.refresh();
        idUploadSet.removeAllIncompleteItems();
      });
    },
  });
});
