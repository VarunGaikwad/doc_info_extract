sap.ui.define(
    [
        'sap/fe/core/PageController'
    ],
    function (PageController) {
        'use strict';

        return PageController.extend('docinfoextractui.ext.main.Main', {
            onInit: function () { },

            onUploadPress: function () {
                console.log(1)
            }
        });
    }
);
