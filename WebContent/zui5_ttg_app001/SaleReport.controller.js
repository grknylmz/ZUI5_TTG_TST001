jQuery.sap.require("sap.ui.core.util.Export");

jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");

jQuery.sap.require("sap.ui.core.format.NumberFormat");

var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({

	minFractionDigits: 2,

	maxFractionDigits: 2,

	groupingEnabled: true,

	groupingSeparator: ".",

	decimalSeparator: ","

});
var lv_flag = 0;

sap.ui.controller("zui5_ttg_app001.SaleReport", {

	navBack: function() {

		sap.ui.getCore().getEventBus().publish(

			"nav",

			"to", {

				viewName: "zui5_ttg_app001.Main",

				viewId: "Main"

			});

	},

	/**



* Called when a controller is instantiated and its View controls (if available) are already created.



* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.



* @memberOf zui5_ttg_app001.SaleReport



*/

	onInit: function() {

		var that = this;

		// create search form content

		var oSearchForm = that.getView().byId("saleReportSearch1");

		oSearchForm.addContent(new sap.m.Button("saleReportToday", {

			text: "Bugünün Satışlarını Listele",

			type: sap.m.ButtonType.Emphasized,

			press: that.search

		}));

		oSearchForm.addContent(new sap.m.Label({
			text: "Satış Kayıt No"
		}));

		oSearchForm.addContent(new sap.m.Input("saleReportVbeln"));

		oSearchForm.addContent(new sap.m.Label({
			text: "Sipariş Tarihi Başlangıç"
		}));

		jQuery.device.is.phone ?

		oSearchForm.addContent(new sap.m.DateTimeInput("saleReportDateBeg", {

			type: sap.m.DateTimeInputType.Date,

			displayFormat: "dd.MM.yyyy"

		}))

		:

		oSearchForm.addContent(new sap.m.DatePicker("saleReportDateBeg", {

			valueFormat: "yyyyMMdd",

			placeholder: " "

		}));

		oSearchForm.addContent(new sap.m.Label({
			text: "Sipariş Tarihi Bitiş"
		}));

		jQuery.device.is.phone ?

		oSearchForm.addContent(new sap.m.DateTimeInput("saleReportDateEnd", {

			type: sap.m.DateTimeInputType.Date,

			displayFormat: "dd.MM.yyyy"

		}))

		:

		oSearchForm.addContent(new sap.m.DatePicker("saleReportDateEnd", {

			valueFormat: "yyyyMMdd",

			placeholder: " "

		}));

		oSearchForm.addContent(new sap.m.Label({
			text: "Seri / NMU"
		}));

		oSearchForm.addContent(new sap.m.Input("saleReportSerial"));

		oSearchForm.addContent(new sap.m.Label({
			text: "Fiş numarası"
		}));

		oSearchForm.addContent(new sap.m.Input("saleReportDocno"));

		oSearchForm.addContent(new sap.m.Label({
			text: "Adına İşlem Yapılan Satış Temsilcisi"
		}));

		oSearchForm.addContent(new sap.m.ComboBox("saleReportSaleRep"));

		oSearchForm.addContent(new sap.m.Label({
			text: "Kullanıcı"
		}));

		oSearchForm.addContent(new sap.m.ComboBox("saleReportUser"));

		// register before show event

		that.getView().addEventDelegate({

			onBeforeShow: jQuery.proxy(function(evt) {

				that.onBeforeShow(evt);

			}, that)
		});

	},

	onBeforeShow: function(oEvent) {

		var that = this;

		var oBusyDialog = new sap.m.BusyDialog({
			text: "Lütfen bekleyiniz"
		});

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		var oFilter = [new sap.ui.model.Filter("DealerId", sap.ui.model.FilterOperator.EQ, sDealerID)];

		var mParameters = {
			async: false,

			filters: oFilter,

			urlParameters: null,

			success: function(oData) {

				sap.ui.getCore().byId("saleReportSaleRep").removeAllItems();

				sap.ui.getCore().byId("saleReportUser").removeAllItems();

				for (var i = 0; i < oData.results.length; i++) {

					sap.ui.getCore().byId("saleReportSaleRep").addItem(new sap.ui.core.Item({

						key: oData.results[i].UserId,

						text: oData.results[i].NameFirst + " " + oData.results[i].NameLast

					}));

					sap.ui.getCore().byId("saleReportUser").addItem(new sap.ui.core.Item({

						key: oData.results[i].UserId,

						text: oData.results[i].NameFirst + " " + oData.results[i].NameLast

					}));

				}

			},

			error: function() {

				oBusyDialog.close();

				var oMessageData = {
					TYPE: "E",
					MESSAGE: "Satış temsilcileri bulunamadı!"
				};

				that.showMessage(oMessageData);

			}

		};

		oBusyDialog.open();

		oModel.read("/salesReportUserSet", mParameters);

		var oDefaultItem;

		var mParameters = {
			async: false,

			filters: oFilter,

			urlParameters: null,

			success: function(oData) {

				var oItem;

				that.getView().byId("saleReportBranchTable").removeAllItems();

				for (var i = 0; i < oData.results.length; i++) {

					oItem = new sap.m.ColumnListItem({

						cells: [



                                    new sap.m.Text({
								text: oData.results[i].Altkn
							}),



                                    new sap.m.Text({
								text: oData.results[i].Name1
							})



                                    ]

					});

					if (oData.results[i].Altkn == sDealerID)

						oDefaultItem = oItem;

					that.getView().byId("saleReportBranchTable").addItem(oItem);

				}

				oBusyDialog.close();

			},

			error: function() {

				oBusyDialog.close();

				var oMessageData = {
					TYPE: "E",
					MESSAGE: "Bayi bulunamadı!"
				};

				that.showMessage(oMessageData);

			}

		};

		oModel.read("/salesReportBayiSet", mParameters);

		that.clear();

		that.getView().byId("saleReportBranchTable").setSelectedItem(oDefaultItem);

		if (dealerAuthType == "B")

			that.getView().byId("buttonUBL").setVisible(true);

		else

			that.getView().byId("buttonUBL").setVisible(false);

	},

	/**



* Clear content



* @memberOf zui5_ttg_app001.SaleReport



*/

	clear: function(oEvent) {

		var oView = sap.ui.getCore().byId("SaleReport");

		// hide/show panels

		oView.byId("saleReportSearchPanel").setExpanded(true);

		oView.byId("saleReportResultPanel").setExpanded(false);

		oView.byId("saleReportTotalPanel").setExpanded(false);

		// clear panel content

		sap.ui.getCore().byId("saleReportVbeln").setValue("");

		sap.ui.getCore().byId("saleReportDateBeg").setValue("");

		sap.ui.getCore().byId("saleReportDateEnd").setValue("");

		sap.ui.getCore().byId("saleReportSerial").setValue("");

		sap.ui.getCore().byId("saleReportDocno").setValue("");

		sap.ui.getCore().byId("saleReportSaleRep").setValue("");

		sap.ui.getCore().byId("saleReportUser").setValue("");

		oView.byId("saleReportBranchTable").removeSelections();

		oView.byId("saleReportTotal").setText("");

		oView.byId("saleReportTotalCash").setText("");

		oView.byId("saleReportTotalCard").setText("");

		oView.byId("saleReportTotalTemlik").setText("");

		oView.byId("saleReportResultTable").removeAllItems();

	},

	/**



* Search summary



* @memberOf zui5_ttg_app001.SaleReport



*/

	search: function(oEvent) {

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		var oView = sap.ui.getCore().byId("SaleReport");

		var oPanelSearch = oView.byId("saleReportSearchPanel");

		var oPanelTotal = oView.byId("saleReportTotalPanel");

		var oPanelResult = oView.byId("saleReportResultPanel");

		var oBranchSelection = oView.byId("saleReportBranchTable").getSelectedItems();

		var bSummary;

		var bToday;

		var sYear;

		var sMonth;

		var sDay;

		var oDateBeg;

		var oDateEnd;

		var bWrongParameter = false;

		var that = oView.getController();

		if (!that.oBusyDialog)

			that.oBusyDialog = new sap.m.BusyDialog({
			text: "Lütfen bekleyiniz"
		});

		that.oBusyDialog.open();

		oEvent.getSource().getId().indexOf("Summary") !== -1 ? bSummary = true : bSummary = false;

		if (oEvent.getSource().getId().indexOf("Today") !== -1) {

			bToday = true;

			bSummary = true;

		}

		sReportType = bSummary ? "summary" : "detail";

		if (!bToday &&

			!sap.ui.getCore().byId("saleReportVbeln").getValue() &&

			!sap.ui.getCore().byId("saleReportDateBeg").getDateValue() &&

			!sap.ui.getCore().byId("saleReportDateEnd").getDateValue() &&

			!sap.ui.getCore().byId("saleReportSerial").getValue() &&

			!sap.ui.getCore().byId("saleReportDocno").getValue() &&

			!sap.ui.getCore().byId("saleReportSaleRep").getSelectedKey() &&

			!sap.ui.getCore().byId("saleReportUser").getSelectedKey()) {

			that.oBusyDialog.close();

			var oMessageData = {
				TYPE: "E",
				MESSAGE: "En az bir arama kriteri girin!"
			};

			that.showMessage(oMessageData);

			return;

		}

		// search

		if (bToday) {

			bIstoday = true;

			var oFilter = [



               new sap.ui.model.Filter("Istoday", sap.ui.model.FilterOperator.EQ, "X"),



               new sap.ui.model.Filter("Altkn", sap.ui.model.FilterOperator.EQ, sDealerID)



                     ];

		} else {

			bIstoday = false;

			if (sap.ui.getCore().byId("saleReportDateBeg").getDateValue() == undefined &&

				sap.ui.getCore().byId("saleReportDateEnd").getDateValue() != undefined)

				bWrongParameter = true;

			else

				bWrongParameter = false;

			if (sap.ui.getCore().byId("saleReportDateBeg").getDateValue() != undefined) {

				sYear = String(sap.ui.getCore().byId("saleReportDateBeg").getDateValue().getFullYear());

				sMonth = String(sap.ui.getCore().byId("saleReportDateBeg").getDateValue().getMonth());

				sDay = String(sap.ui.getCore().byId("saleReportDateBeg").getDateValue().getDate());

				oDateBeg = new Date(Date.UTC(sYear, sMonth, sDay, 0, 0, 0));

				console.log(oDateBeg);

			}

			if (sap.ui.getCore().byId("saleReportDateEnd").getDateValue() != undefined) {

				sYear = String(sap.ui.getCore().byId("saleReportDateEnd").getDateValue().getFullYear());

				sMonth = String(sap.ui.getCore().byId("saleReportDateEnd").getDateValue().getMonth());

				sDay = String(sap.ui.getCore().byId("saleReportDateEnd").getDateValue().getDate());

				oDateEnd = new Date(Date.UTC(sYear, sMonth, sDay, 0, 0, 0));

				console.log(oDateEnd);

			}

			var oFilter = [



                     new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().byId("saleReportVbeln").getValue()),



 //                     new sap.ui.model.Filter("Fkdat", sap.ui.model.FilterOperator.BT, sDateBeg, sDateEnd),



                     new sap.ui.model.Filter("Fkdat", sap.ui.model.FilterOperator.BT, oDateBeg, oDateEnd),



                     new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().byId("saleReportSerial").getValue()),



                     new sap.ui.model.Filter("Docno", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().byId("saleReportDocno").getValue()),



                     new sap.ui.model.Filter("VsnmrV", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().byId("saleReportSaleRep").getSelectedKey()),



                     new sap.ui.model.Filter("Ernam", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().byId("saleReportUser").getSelectedKey()),



                     ];

			if (oBranchSelection.length > 0) {

				for (var i = 0; i < oBranchSelection.length; i++) {

					oFilter.push(new sap.ui.model.Filter("Altkn", sap.ui.model.FilterOperator.EQ, oBranchSelection[i].getCells()[0].getText()));

				}

			} else

				oFilter.push(new sap.ui.model.Filter("Altkn", sap.ui.model.FilterOperator.EQ, sDealerID));

		}

		var mParameters = {
			async: false,

			filters: oFilter,

			urlParameters: null,

			success: function(oData) {

				oDataReport = oData;

				for (var i = 0; i < oData.results.length; i++) {

					var oDate = new Date(oData.results[i].Fkdat);

					oData.results[i].Fkdat = String(oDate.getDate()) + "." + String(oDate.getMonth() + 1) + "." + String(oDate.getFullYear());

					oData.results[i].Erzet = oData.results[i].Erzet.substring(2, 4) + ":" + oData.results[i].Erzet.substring(5, 7) + ":" + oData.results[
						i].Erzet.substring(8, 10);

					oData.results[i].fUnitPrice = parseFloat(oData.results[i].Toplam) / parseFloat(oData.results[i].Fkimg);

				}

				var oReportModel = new sap.ui.model.json.JSONModel();

				console.log(oReportModel);

				oReportModel.setData(oData.results);

				that.getView().byId("saleReportResultTable").setModel(oReportModel);

				that.getView().byId("saleReportTotal").setText("0,00 TL");

				that.getView().byId("saleReportTotalCash").setText("0,00 TL");

				that.getView().byId("saleReportTotalCard").setText("0,00 TL");

				that.getView().byId("saleReportTotalTemlik").setText("0,00 TL");

				if (oData.results.length > 0) {

					that.getView().byId("saleReportTotal").setText(oNumberFormat.format(parseFloat(oData.results[0].TopSatis)).toString() + " TL");

					that.getView().byId("saleReportTotalCash").setText(oNumberFormat.format(parseFloat(oData.results[0].TopNakit)).toString() + " TL");

					that.getView().byId("saleReportTotalCard").setText(oNumberFormat.format(parseFloat(oData.results[0].TopKredik)).toString() + " TL");

					that.getView().byId("saleReportTotalTemlik").setText(oNumberFormat.format(parseFloat(oData.results[0].TopTemlik)).toString() + " TL");

				}

				that.getView().byId("saleReportResultTable").removeAllItems();

				that.getView().byId("saleReportResultTable").bindAggregation("items", {

					path: "/",

					factory: function(sId) {

						return new sap.m.ColumnListItem(sId, {

							type: sap.m.ListType.Inactive,

							cells: [



                                       new sap.m.ObjectIdentifier({
									text: "{Bstkd}"
								}),



                                       new sap.m.Text({
									text: "{Vbeln}"
								}),



                                       new sap.m.Text({
									text: "{Fkdat}"
								}),



                                       new sap.m.Text({
									text: "{Erzet}"
								}),



                                       new sap.m.Text({
									text: "{Matnr}"
								}),



                                       new sap.m.Text({
									text: "{Arktx}"
								}),



                                       new sap.m.Text({
									text: "{Zseri}"
								}),



                                       new sap.m.ObjectNumber({
									number: "{Fkimg}",
									unit: "ADT"
								}),



                                       new sap.m.ObjectNumber({
									number: "{fUnitPrice}",
									unit: "TL"
								}),



                                       new sap.m.ObjectNumber({
									number: "{Toplam}",
									unit: "TL"
								}),



                                       new sap.m.Text({
									text: "{Name4}"
								}),



                                       new sap.m.Text({
									text: "{Name1}"
								}),



                                       new sap.m.Text({
									text: "{Butxt}"
								}),



                                       new sap.m.Text({
									text: "{Name1w}"
								}),



                                       new sap.m.Text({
									text: "{Ernam}"
								}),



                                       new sap.m.Text({
									text: "{Vadsoyad}"
								}),



                                       new sap.m.Text({
									text: "{Vtext}"
								}),



                                       new sap.m.Text({
									text: "{Bezei}"
								}),



                                       new sap.m.Text({
									text: "{Iktext}"
								}),



                                       new sap.m.Text({
									text: "{Altkn}"
								}),



                                       new sap.m.Text({
									text: "{BelgeTipi}"
								}),



                                       new sap.m.Text({
									text: "{OdemeTipi}"
								}),



                                       new sap.m.Text({
									text: "{VsnmrV}"
								}),



                                       new sap.m.Text({
									text: "{Posnr}"
								}),



                                       new sap.m.Text({
									text: "{Fvtext}"
								}),



                                       new sap.m.Text({
									text: "{Title}"
								}),



                                       new sap.m.Text({
									text: "{Docno}"
								}),



                                       new sap.m.Text({
									text: "{Zzmatbuno}"
								}),



                                       new sap.m.Text({
									text: "{Zzefattabi}"
								})



                                      ]

						});

					},

				});

				/* for (var i = 0; i < oData.results.length; i++) {



                          var oDate = new Date(oData.results[i].Fkdat);



                          var sDate = String(oDate.getDate()) + "." + String(oDate.getMonth() + 1) + "." + String(oDate.getFullYear());



                          var sTime = oData.results[i].Erzet.substring(2,4) + ":" + oData.results[i].Erzet.substring(5,7) + ":" + oData.results[i].Erzet.substring(8,10);



                          var fUnitPrice = parseFloat(oData.results[i].Toplam) / parseFloat(oData.results[i].Fkimg);



                          that.getView().byId("saleReportResultTable").addItem(new sap.m.ColumnListItem({



                            type    : sap.m.ListType.Inactive,



                            cells   : [



                                       new sap.m.ObjectIdentifier({ text: oData.results[i].Bstkd }),



                                       new sap.m.Text({ text: oData.results[i].Vbeln }),



                                       new sap.m.Text({ text: sDate }),



                                       new sap.m.Text({ text: sTime }),



                                       new sap.m.Text({ text: oData.results[i].Matnr }),



                                       new sap.m.Text({ text: oData.results[i].Arktx }),



                                       new sap.m.Text({ text: oData.results[i].Zseri }),



                                       new sap.m.ObjectNumber({ number: parseInt(oData.results[i].Fkimg), unit: "ADT" }),



                                       new sap.m.ObjectNumber({ number: oNumberFormat.format(fUnitPrice), unit: "TL" }),



                                       new sap.m.ObjectNumber({ number: oNumberFormat.format(parseFloat(oData.results[i].Toplam)), unit: "TL" }),



                                       new sap.m.Text({ text: oData.results[i].Name4 }),



                                       new sap.m.Text({ text: oData.results[i].Name1 }),



                                       new sap.m.Text({ text: oData.results[i].Butxt }),



                                       new sap.m.Text({ text: oData.results[i].Name1w }),



                                       new sap.m.Text({ text: oData.results[i].Ernam }),



                                       new sap.m.Text({ text: oData.results[i].Vadsoyad }),



                                       new sap.m.Text({ text: oData.results[i].Vtext }),



                                       new sap.m.Text({ text: oData.results[i].Bezei }),



                                       new sap.m.Text({ text: oData.results[i].Iktext }),



                                       new sap.m.Text({ text: oData.results[i].Altkn }),



                                       new sap.m.Text({ text: oData.results[i].BelgeTipi }),



                                       new sap.m.Text({ text: oData.results[i].OdemeTipi }),



                                       new sap.m.Text({ text: oData.results[i].VsnmrV }),



                                       new sap.m.Text({ text: oData.results[i].Posnr }),



                                       new sap.m.Text({ text: oData.results[i].Fvtext }),



                                       new sap.m.Text({ text: oData.results[i].Title }),



                                       new sap.m.Text({ text: oData.results[i].Docno }),



                                       new sap.m.Text({ text: oData.results[i].Zzmatbuno })



                                       ]



                            }));



                          } */

				// hide/show panels

				oPanelSearch.setExpanded(false);

				oPanelTotal.setExpanded(true);

				oPanelResult.setExpanded(true);

				// hide/show columns

				if (bSummary)

					oView.getController().setColumnsVisible(oEvent, false);

				else

					oView.getController().setColumnsVisible(oEvent, true);

				that.oBusyDialog.close();

			},

			error: function() {

				that.oBusyDialog.close();

				var oMessageData = {
					TYPE: "I",
					MESSAGE: "Kayıt bulunamadı!"
				};

				that.showMessage(oMessageData);

			}

		};

		if (bWrongParameter) {

			that.oBusyDialog.close();

			var oMessageData = {
				TYPE: "E",
				MESSAGE: "Hatalı tarih girişi!"
			};

			oView.getController().showMessage(oMessageData);

			return;

		}

		if (bSummary) {

			oModel.read("/salesReportOzetSet", mParameters);

		} else {

			oModel.read("/salesReportDetaySet", mParameters);

		}

	},

	/**



* Return payment



* @memberOf zui5_ttg_app001.SaleReport



*/

	paymentReturn: function(oEvent) {

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", true);

		var that = sap.ui.getCore().byId("SaleReport").getController();

		var oSelectedItem = sap.ui.getCore().byId("SaleReport").byId("saleReportResultTable").getSelectedItem();

		var bQuanEnabled = oSelectedItem.getCells()[7].getNumber() > 1 ? true : false;

		var oQuantity = new sap.m.Input({
			value: oSelectedItem.getCells()[7].getNumber(),
			enabled: bQuanEnabled
		});

		var oUnitPrice = new sap.m.Input({
			value: oSelectedItem.getCells()[8].getNumber(),
			enabled: false
		});

		var oBusyDialog = new sap.m.BusyDialog({
			text: "Lütfen bekleyiniz"
		});

		var oReturnDialog;

		var oQuantityForm = new sap.ui.layout.form.SimpleForm({

			content: [



                 new sap.m.Label({
					text: "Miktar"
				}),



                 oQuantity,



                 new sap.m.Label({
					text: "Kalem Tutarı"
				}),



                 oUnitPrice



                 ]

		});

		if (!oSelectedItem) return;

		if (!oReturnDialog) {

			oReturnDialog = new sap.m.Dialog({

				title: "Para İadesi Al",

				rightButton: new sap.m.Button({

					text: "İptal",

					type: sap.m.ButtonType.Emphasized,

					icon: "sap-icon://decline",

					press: function() {
						this.oParent.close();
					}

				}),

				leftButton: new sap.m.Button({

					text: "İade",

					type: sap.m.ButtonType.Emphasized,

					icon: "sap-icon://accept",

					press: function() {

						var iQuan = parseInt(oQuantity.getValue());

						if (iQuan == 0 || iQuan > parseInt(oSelectedItem.getCells()[7].getNumber()) || iQuan == "NaN") {

							var oMessageData = {
								TYPE: "E",
								MESSAGE: "Miktar sıfır veya satış miktarından fazla olamaz!"
							};

							that.showMessage(oMessageData);

							return;

						}

						oBusyDialog.open();

						var requestReturnHeader = {};

						requestReturnHeader.Bstkd = oSelectedItem.getCells()[0].getTitle();

						requestReturnHeader.Vbeln = oSelectedItem.getCells()[1].getText();

						requestReturnHeader.DealerId = oSelectedItem.getCells()[19].getText();

						requestReturnHeader.Abrvw = oSelectedItem.getCells()[20].getText();

						requestReturnHeader.Zterm = oSelectedItem.getCells()[21].getText();

						requestReturnHeader.VsnmrV = oSelectedItem.getCells()[22].getText();

						requestReturnHeader.Posnr = oSelectedItem.getCells()[23].getText();

						requestReturnHeader.Matnr = oSelectedItem.getCells()[4].getText();

						requestReturnHeader.Kwmeng = oQuantity.getValue();

						requestReturnHeader.Vrkme = "";

						requestReturnHeader.Sipno = "";

						requestReturnHeader.Fatno = "";

						requestReturnHeader.Message = "";

						requestReturnHeader.Statu = "";

						oModel.setHeaders({

							"Access-Control-Allow-Origin": "*",

							"Content-Type": "application/x-www-form-urlencoded",

							"X-CSRF-Token": "Fetch"

						});

						var token;

						oModel.read('/parasalIadeSet',

							null,

							null,

							false,

							function(oData, oResponse) {

								token = oResponse.headers['x-csrf-token'];

							},

							function() {

								console.log("Error on read process");

							}

						);

						oModel.setHeaders({

							"X-Requested-With": "XMLHttpRequest",

							"Content-Type": "application/json",

							"DataServiceVersion": "2.0",

							"Accept": "application/atom+xml,application/atomsvc+xml,application/xml",

							"X-CSRF-Token": token

						});

						console.log(requestReturnHeader);

						oModel.create('/parasalIadeSet',

							requestReturnHeader,

							null,

							function(oData, oResponse) {

								var messageType;

								oData.Statu == "0" ? messageType = "S" : messageType = "E";

								oMessageData = {
									TYPE: "E",
									MESSAGE: oData.Message
								};

								that.showMessage(oMessageData);

								oBusyDialog.close();

							},

							function() {

								oBusyDialog.close();

								var oMessageData = {
									TYPE: "E",
									MESSAGE: "Bağlantı hatası!"
								};

								that.showMessage(oMessageData);

							});

						this.oParent.close();

					}

				}),

				content: [oQuantityForm]

			});

		}

		oReturnDialog.open();

	},

	printDialog: function() {

		var oView = sap.ui.getCore().byId("SaleReport");

		if (oView.byId("saleReportResultTable").getSelectedItem() == undefined)

			return;

		if (oView.byId("saleReportResultTable").getSelectedItem().getBindingContext().getProperty("Zzefattabi") == "E") {

			var oMessageData = {
				TYPE: "E",
				MESSAGE: "E-Fatura müşterisi için fatura basılamaz!"
			};

			oView.getController().showMessage(oMessageData);

			return;

		}

		// added by Çiğdem Kaymaz on 22.11.2016

		if (sDealerIDType == "X") {

			if (oView.byId("saleReportResultTable").getSelectedItem().getBindingContext().getProperty("Iktext") == "TT KASA" &&

				oView.byId("saleReportResultTable").getSelectedItem().getBindingContext().getProperty("Bezei") == "Fatura")

			{

			} else

			{

				var oMessageData = {
					TYPE: "E",
					MESSAGE: "Sadece TT KASA Fatura işlemleri için fatura basılabilir!"
				};

				oView.getController().showMessage(oMessageData);

				return;

			}

		}

		// end of adding by Çiğdem Kaymaz on 22.11.2016

		var oMatbuNo = new sap.m.Input({

			//      type    : sap.m.InputType.Number,

			maxLength: 20

		});

		if (sDealerIDType == "X" || dealerAuthType == "P")

		{
            // TTOFISlerde, Payflex kullanan bayilerde Matbu no srulmayacak
			oView.getController().printInvoice(oMatbuNo.getValue());

			oMatbuNo.setValue("");

		} else {
            			var oView = sap.ui.getCore().byId("SaleReport");

			//-----yocoskun  28122016 Sprint 4
			var sVbeln = oView.byId("saleReportResultTable").getSelectedItem().getCells()[1].getText();
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);
			oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			var sReadString = "/itemNumSet(Vbeln='" + sVbeln + "')";
			var fatno;

			var mParameters = {
				async: false,
				filters: null,
				urlParameters: null,
				success: function(oData) {
					fatno = oData.ZitemNum;
				},
				error: function(error) {
					console.log("Error");
					var sMessage = $(error.response.body).find('message').first().text();
					var oMessageData = {
						TYPE: "E",
						MESSAGE: sMessage
					};
					oView.getController().showMessage(oMessageData);
				}
			};

			oModel.read(sReadString, mParameters);
			//-----------------------------------
			var oMatbuArray = [];
			var oFormMatbu = new sap.ui.layout.form.SimpleForm();

			for (var i = 1; i <= fatno; i++) {
				var num = i;
				var sNum = num.toString();

				oMatbuArray.push(window['oMatbuNo' + sNum] = new sap.m.Input({
					maxLength: 20
				}))
				oFormMatbu.addContent(new sap.m.Label({
					text: "Fatura Matbu No"
				}));
				oFormMatbu.addContent(oMatbuArray[i - 1]);

			}

			//	oFormMatbu.addContent(oMatbuNo);
            var oPrintDialog;
			if (!oPrintDialog) {
				oPrintDialog = new sap.m.Dialog({
					title: "Fatura Matbu No Giriniz",
					leftButton: new sap.m.Button({
						text: "İptal",
						icon: "sap-icon://sys-cancel",
						press: function() {
							for (i = 1; i <= oMatbuArray.length; i++) {
								oMatbuArray[i - 1].setValue("");
							}
							this.oParent.close();
						}
					}),
					rightButton: new sap.m.Button({
						text: "Tamam",
						icon: "sap-icon://accept",
						press: function() {
							this.oParent.close();
							var sMatbuNoStr;

							for (i = 1; i <= oMatbuArray.length; i++) {
								if (i === 1) {
									sMatbuNoStr = oMatbuArray[i - 1].getValue();
									oMatbuArray[i - 1].setValue("");
								} else {
									sMatbuNoStr = sMatbuNoStr + '|' + oMatbuArray[i - 1].getValue();
									oMatbuArray[i - 1].setValue("");
								}
							}
							console.log(sMatbuNoStr);
							oView.getController().printInvoice(sMatbuNoStr);
							oFormMatbu.removeAllContent();
						
						//lv_flag = lv_flag + 1;
						/*		if (lv_flag >= 1){
				                this.oPrintDialog.removeContent();
	                            }*/

							//oView.getController().printInvoice(oMatbuNo.getValue());
							//oMatbuNo.setValue("");
						}
					}),
					afterClose: function(){
					    oPrintDialog.destroy();
					},
					
					content: [oFormMatbu]
				});
           // this.oPrintDialog.destroyContent();
			}

			//-----yocoskun  28122016 Sprint 4

        
			//--------------yocoskun 30122016 Sprint4------

		}

	//	this.oPrintDialog.open();
	oPrintDialog.open();
	
	
		

	},

	/**



* Print invoice



* @memberOf zui5_ttg_app001.SaleReport



*/

	downloadUBL: function() {

		var oView = this.getView();

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		var aList = oView.byId("saleReportResultTable").getBinding("items").oList;

		var oFilter = [];

		var sKey = "";

		var sReadUrl = "";

		var mParameters = {

			async: false,

			filters: null,

			urlParameters: null,

			success: function(oData, oResponse) {

				var pdfURL = oResponse.requestUri;

				var encodeUrl = encodeURI(pdfURL);

				sap.m.URLHelper.redirect(encodeUrl, true);

			},

			error: function(error) {

				var sMessage = $(error.response.body).find('message').first().text();

				var oMessageData = {
					TYPE: "E",
					MESSAGE: sMessage
				};

				oView.getController().showMessage(oMessageData);

			}

		};

		//	  if (!oView.byId("saleReportResultTable").getSelectedItem())

		//		  return;

		//	  

		//	  sReadUrl = "/printUblSet('" +

		//	  	oView.byId("saleReportResultTable").getSelectedItem().getBindingContext().getProperty("Vbeln") +

		//	  	"')/$value";

		//	  

		//	  oModel.read(sReadUrl, mParameters);

		if (!aList) return;

		for (var i = 0; i < aList.length; i++) {

			if (i == 0)

				sKey = aList[i].Vbeln;

			else

				sKey = sKey + "-" + aList[i].Vbeln;

		}

		sReadUrl = "/printUblSet('" + sKey + "')/$value";

		oModel.read(sReadUrl, mParameters);

	},

	/**



* Print invoice



* @memberOf zui5_ttg_app001.SaleReport



*/

	printInvoice: function(sMatbuNoStr) {

		var oView = sap.ui.getCore().byId("SaleReport");

		var sVbeln = oView.byId("saleReportResultTable").getSelectedItem().getCells()[1].getText();

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);

		//begin yocoskun 30122016 Sprint4
		var arrayMatbu = sMatbuNoStr.split('|');

		var oMatbuNo = arrayMatbu[0];

		var sReadString = "/printInvoiceSet(Vbeln='" + sVbeln + "',Matbuno='" + oMatbuNo + "',MatbunoStr='" + sMatbuNoStr + "')/$value";
		//end yocoskun 30122016 Sprint4

		var oBusyDialog = new sap.m.BusyDialog({
			text: "Lütfen bekleyiniz"
		});

		var mParameters = {
			async: true,

			filters: null,

			urlParameters: null,

			success: function(oData, oResponse) {

				oBusyDialog.close();

				var pdfURL = oResponse.requestUri;

				var encodeUrl = encodeURI(pdfURL);

				sap.m.URLHelper.redirect(encodeUrl, true);

			},

			error: function(error) {

				var sMessage = $(error.response.body).find('message').first().text();

				oBusyDialog.close();

				var oMessageData = {
					TYPE: "E",
					MESSAGE: sMessage
				};

				oView.getController().showMessage(oMessageData);

			}

		};

		oBusyDialog.open();

		oModel.read(sReadString, mParameters);

	},

	/**



* Export to excel



* @memberOf zui5_ttg_app001.SaleReport



*/

	exportToExcel: function(oEvent) {

		var oModel = new sap.ui.model.json.JSONModel();

		var dataObj = {

			"oData": oDataReport

		};

		oModel.setData(dataObj);

		if (sReportType == "detail") {

			var oExport = new sap.ui.core.util.Export({

				exportType: new sap.ui.core.util.ExportTypeCSV({

					separatorChar: ";"

				}),

				models: oModel,

				rows: {

					path: "/oData/results"

				},

				columns: [{

					name: "Fatura No",

					template: {

						content: "{Vbeln}"

					}

          }, {

					name: "Fatura Tarihi",

					template: {

						content: "{FkdatText}"

					}

          }, {

					name: "Fatura Saati",

					template: {

						content: "{ErzetText}"

					}

          }, {

					name: "NMU",

					template: {

						content: "{Matnr}"

					}

          }, {

					name: "Tanım",

					template: {

						content: "{Arktx}"

					}

          }, {

					name: "Seri No",

					template: {

						content: "{Zseri}"

					}

          }, {

					name: "Miktar",

					template: {

						content: "{Fkimg}"

					}

          }, {

					name: "Birim",

					template: {

						content: "ADT"

					}

          }, {

					name: "Toplam Tutar",

					template: {

						content: "{ToplamText}"

					}

          }, {

					name: "Birim",

					template: {

						content: "TL"

					}

          }, {

					name: "Müşteri İsmi",

					template: {

						content: "{Name1}"

					}

          }, {

					name: "Bayi",

					template: {

						content: "{Name1w}"

					}

          }, {

					name: "Kullanıcı",

					template: {

						content: "{Ernam}"

					}

          }, {

					name: "Satış Temsilcisi",

					template: {

						content: "{Vadsoyad}"

					}

          }, {

					name: "Ödeme Tipi",

					template: {

						content: "{Vtext}"

					}

          }, {

					name: "Çıktı Tipi",

					template: {

						content: "{Bezei}"

					}

          }, {

					name: "İşlem Kanalı",

					template: {

						content: "{Iktext}"

					}

          }, {

					name: "Provizyon ID",

					template: {

						content: "{Bstkd}"

					}

          }, {

					name: "İşlem Tipi",

					template: {

						content: "{Fvtext}"

					}

          }, {

					name: "Müşteri Tipi",

					template: {

						content: "{Title}"

					}

          }, {

					name: "Fiş No",

					template: {

						content: "{Docno}"

					}

          }, {

					name: "Matbu No",

					template: {

						content: "{Zzmatbuno}"

					}

          }, {

					name: "Fatura Açıklama Metni",

					template: {

						content: "{Z001text}"

					}

          }]

			});

		} else {

			var oExport = new sap.ui.core.util.Export({

				exportType: new sap.ui.core.util.ExportTypeCSV({

					separatorChar: ";"

				}),

				models: oModel,

				rows: {

					path: "/oData/results"

				},

				columns: [{

					name: "Fatura No",

					template: {

						content: "{Vbeln}"

					}

                  }, {

					name: "Fatura Tarihi",

					template: {

						content: "{FkdatText}"

					}

                  }, {

					name: "Fatura Saati",

					template: {

						content: "{ErzetText}"

					}

                  }, {

					name: "Toplam Tutar",

					template: {

						content: "{ToplamText}"

					}

                  }, {

					name: "Birim",

					template: {

						content: "TL"

					}

                  }, {

					name: "Müşteri İsmi",

					template: {

						content: "{Name1}"

					}

                  }, {

					name: "Bayi",

					template: {

						content: "{Name1w}"

					}

                  }, {

					name: "Kullanıcı",

					template: {

						content: "{Ernam}"

					}

                  }, {

					name: "Satış Temsilcisi",

					template: {

						content: "{Vadsoyad}"

					}

                  }, {

					name: "Ödeme Tipi",

					template: {

						content: "{Vtext}"

					}

                  }, {

					name: "Çıktı Tipi",

					template: {

						content: "{Bezei}"

					}

                  }, {

					name: "İşlem Kanalı",

					template: {

						content: "{Iktext}"

					}

                  }, {

					name: "Provizyon ID",

					template: {

						content: "{Bstkd}"

					}

                  }, {

					name: "İşlem Tipi",

					template: {

						content: "{Fvtext}"

					}

                  }, {

					name: "Müşteri Tipi",

					template: {

						content: "{Title}"

					}

                  }, {

					name: "Fiş No",

					template: {

						content: "{Docno}"

					}

                  }, {

					name: "Matbu No",

					template: {

						content: "{Zzmatbuno}"

					}

                  }]

			});

		}

		oExport.saveFile();

		/*    var oView = sap.ui.getCore().byId("SaleReport");



    var oBranchSelection = oView.byId("saleReportBranchTable").getSelectedItems();



    var sDateBeg = "";



    var sDateEnd = "";



    var bSummary;



    var sPrefix;



    var sIstoday;



    var sYear;



    var sMonth;



    var sDay;



    oView.byId("paymentReturn").getVisible() ? bSummary = false : bSummary = true;



    var oDateBeg = oView.byId("saleReportDateBeg").getDateValue();



    var oDateEnd = oView.byId("saleReportDateEnd").getDateValue();



    if (oDateBeg != null){



      sYear  = String(oDateBeg.getFullYear());



      sMonth = String(oDateBeg.getMonth() + 1);



      sDay   = String(oDateBeg.getDate());



      if(sMonth.length == 1) sMonth = "0" + sMonth;



      if(sDay.length == 1)   sDay   = "0" + sDay;



      sDateBeg = String(sYear) + String(sMonth) + String(sDay);



    }



    if (oDateEnd != null) {



      sYear  = String(oDateEnd.getFullYear());



      sMonth = String(oDateEnd.getMonth() + 1);



      sDay   = String(oDateEnd.getDate());



      if(sMonth.length == 1) sMonth = "0" + sMonth;



      if(sDay.length == 1)   sDay   = "0" + sDay;



      sDateEnd = String(sYear) + String(sMonth) + String(sDay);



    }



    bSummary ?



        sPrefix = "/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/salesReportOzetSet?search=Vbeln=" :



        sPrefix = "/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/salesReportDetaySet?search=Vbeln="



    bIstoday ? sIstoday = "X" : sIstoday = ""; 



    var sUrl = sPrefix      + oView.byId("saleReportVbeln").getValue()      + "-" +



           "FkdatBegin="  + sDateBeg                      + "-" +



           "FkdatEnd="    + sDateEnd                      + "-" +



           "Matnr="     + oView.byId("saleReportSerial").getValue()     + "-" +



           "Docno="     + oView.byId("saleReportDocno").getValue()      + "-" +



           "VsnmrV="    + oView.byId("saleReportSaleRep").getSelectedKey()  + "-" +



           "Ernam="     + oView.byId("saleReportUser").getSelectedKey();



    if (oBranchSelection.length > 0) {



      for (var i = 0; i < oBranchSelection.length; i++) {



        sUrl = sUrl + " - " + "Altkn=" + oBranchSelection[i].getCells()[0].getText();



      }



    }



    else



      sUrl = sUrl + " - " + "Altkn=" + oBranchSelection[i].getCells()[0].getText();



    sUrl = sUrl + "-" + "Istoday=" + sIstoday + "&$format=xlsx";



    var encodeUrl = encodeURI(sUrl);



    sap.m.URLHelper.redirect(encodeUrl, true); */

	},

	/**



* Set table columns visible



* @memberOf zui5_ttg_app001.SaleReport



*/

	setColumnsVisible: function(oEvent, bVisible) {

		var oView = sap.ui.getCore().byId("SaleReport");

		var oColumn = oView.byId("saleReportResultTable").getColumns();

		oColumn[4].setVisible(bVisible);

		oColumn[5].setVisible(bVisible);

		oColumn[6].setVisible(bVisible);

		oColumn[7].setVisible(bVisible);

		oColumn[8].setVisible(bVisible);

		oColumn[24].setVisible(!bVisible);

		oColumn[28].setVisible(!bVisible);

		oView.byId("paymentReturn").setVisible(bVisible);

	},

	onDetailPress: function(oEvent) {

	},

	/**



* Display message



* @memberOf zui5_ttg_app001.SaleReport



*/

	showMessage: function(data) {

		jQuery.sap.require("sap.m.MessageBox");

		var oIcon, sTitle;

		switch (data.TYPE) {

			case "S":
				oIcon = sap.m.MessageBox.Icon.SUCCESS;
				break;

			case "I":
				oIcon = sap.m.MessageBox.Icon.INFORMATION;
				break;

			case "E":
				oIcon = sap.m.MessageBox.Icon.ERROR;
				break;

			case "W":
				oIcon = sap.m.MessageBox.Icon.WARNING;
				break;

			default:
				break;

		}

		sap.m.MessageBox.show(data.MESSAGE, {
			icon: oIcon,

			title: sTitle,

			actions: [sap.m.MessageBox.Action.OK],

		});

	},

	/**



* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered



* (NOT before the first rendering! onInit() is used for that one!).



* @memberOf zui5_ttg_app001.SaleReport



*/

	//  onBeforeRendering: function() {

	//

	//  },

	/**



* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.



* This hook is the same one that SAPUI5 controls get after being rendered.



* @memberOf zui5_ttg_app001.SaleReport



*/

	//  onAfterRendering: function() {

	//

	//  },

	/**



* Called when the Controller is destroyed. Use this one to free resources and finalize activities.



* @memberOf zui5_ttg_app001.SaleReport



*/

	//  onExit: function() {

	//

	//  }

});