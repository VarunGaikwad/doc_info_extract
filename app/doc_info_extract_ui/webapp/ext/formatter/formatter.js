// webapp/util/formatter.js
sap.ui.define([], function () {
  "use strict";
  return {
    onFormatDateTime: function (value) {
      if (value) {
        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: "dd-MMM-yyyy HH:mm:ss",
        });
        return oDateFormat.format(new Date(value));
      }
      return value || "";
    },

    onFormatSchema: function (value) {
      if (!value) return "";
      const schema = {
        businessCard: "Business Card",
        invoice: "Invoice",
        paymentAdvice: "Payment Advice",
        purchaseOrder: "Purchase Order",
      };
      return schema[value];
    },
  };
});
