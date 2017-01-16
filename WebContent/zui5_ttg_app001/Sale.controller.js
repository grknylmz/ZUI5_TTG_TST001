jQuery.sap.require("sap.ui.core.format.NumberFormat");

var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({

	minFractionDigits: 2,

	maxFractionDigits: 2,

	groupingEnabled: false,

	decimalSeparator: ","

});

var oNumberFormatTotal = sap.ui.core.format.NumberFormat.getFloatInstance({

	minFractionDigits: 2,

	maxFractionDigits: 2,

	groupingEnabled: true,

	groupingSeparator: ".",

	decimalSeparator: ","

});

var oCityList = new sap.m.List();

var oCitypartList = new sap.m.List();

var aMtartFound = [];

var aKdvFound = [];

var aKdvList = [];

var aMtartList = [];

//yocoskun sprint5------
var aTaxm1List = [];
var aDataList = [];

var isVanilla;

var isTemlikli;

var aPo;

var sSelectedCityCode;

var sSelectedCityPartCode;

sap.ui.controller("zui5_ttg_app001.Sale", {

	navBack: function() {

		sap.ui.getCore().getEventBus().publish(

			"nav",

			"to", {

				viewName: "zui5_ttg_app001.Main",

				viewId: "Main"

			});

	},

	navigationBack: function() {

		sap.ui.getCore().getEventBus().publish("nav", "back");

	},

	/**































































































































* Called when a controller is instantiated and its View controls (if available) are already created.































































































































* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	onInit: function() {

		console.log("onInit");

		var that = this;

		var oModelCity = new sap.ui.model.json.JSONModel();

		oModelCity.loadData("json/citycode.json", "", false);

		//    oModelCity.setDefaultBindingMode("OneWay");

		//    oCityList.setModel(oModelCity);

		//    that.getView().byId("saleGeneralCity").setModel(oModelCity);

		//    that.getView().byId("saleGeneralCity").bindAggregation("items", "/", new sap.ui.core.Item({

		//      key  : "{code}",

		//        text : "{text}"

		//    }));

		that.getView().byId("saleGeneralCityLive").setModel(oModelCity);

		that.getView().byId("saleGeneralCityLive").bindAggregation("suggestionItems", "/", new sap.ui.core.Item({

			key: "{code}",

			text: "{text}"

		}));

		that.getView().byId("saleGeneralCityLive").setFilterFunction(jQuery.proxy(function(sTerm, oItem) {

			sSelectedCityCode = "";

			sSelectedCityPartCode = "";

			that.getView().byId("saleGeneralCityPartLive").removeAllSuggestionItems();

			that.getView().byId("saleGeneralCityPartLive").setValue("");

			if (sTerm == ' ' || sTerm == '') {

				sTerm = '';

				return oItem.getText().match(new RegExp(sTerm, "g"));

			} else {

				sTerm = sTerm.replace("i", "İ");

				sTerm = sTerm.replace("ı", "I");

				sTerm = "^" + sTerm;

				return oItem.getText().match(new RegExp(sTerm, "i"));

			}

		}), this);

		that.getView().byId("saleGeneralCityPartLive").setFilterFunction(function(sTerm, oItem) {

			//      sSelectedCityCode = "";

			sSelectedCityPartCode = "";

			if (sTerm == ' ' || sTerm == '') {

				sTerm = '';

				return oItem.getText().match(new RegExp(sTerm, "g"));

			} else {

				sTerm = sTerm.replace("i", "İ");

				sTerm = sTerm.replace("ı", "I");

				sTerm = "^" + sTerm;

				return oItem.getText().match(new RegExp(sTerm, "i"));

			}

		});

		//    oCityList.bindAggregation("items", "/", new sap.m.StandardListItem({

		//      title   : "{text}",

		//      description : "{code}",

		//            type    : sap.m.ListType.Active,

		//            press   : that.cityListPress

		//    }));

		var sStepId = this.getView().getId() + "--saleStep1";

		this.getView().byId(sStepId).setEnabled(true);

		this.getView().byId("saleRoadMap").setSelectedStep(sStepId);

		if (jQuery.device.is.phone)

			that.getView().byId("dummyPanel").setVisible(true);

		else

			that.getView().byId("dummyPanel").setVisible(false);

		//      that.getView().byId("dummyPanel").setVisible(true);

		// register before show event

		this.getView().addEventDelegate({

			onBeforeShow: jQuery.proxy(function(evt) {

				this.onBeforeShow(evt);

			}, this)

		});

	},

	addZero: function(i) {

		if (i < 10) {

			i = "0" + i;

		}

		return i;

	},

	setCitypartItems: function(sCity) {

		var oView = this.getView();

		var that = this;

		oView.byId("saleGeneralCitypart").removeAllItems();

		oView.byId("saleGeneralCitypart").setValue("");

		if (sCity == "00" || sCity == "") return;

		var oBusyDialog = new sap.m.BusyDialog({

			text: "Lütfen bekleyiniz"

		});

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		var oFilter = [new sap.ui.model.Filter("CityCode", sap.ui.model.FilterOperator.EQ, sCity)];

		var mParameters = {

			async: true,

			filters: oFilter,

			urlParameters: null,

			success: function(oData) {

				oView.byId("saleGeneralCitypart").addItem(new sap.ui.core.Item({

					key: "dummy",

					text: ""

				}));

				for (var i = 0; i < oData.results.length; i++) {

					oView.byId("saleGeneralCitypart").addItem(new sap.ui.core.Item({

						key: oData.results[i].CityCode,

						text: oData.results[i].CityName

					}));

				}

				oBusyDialog.close();

			},

			error: function() {

				oBusyDialog.close();

				var oMessageData = {

					TYPE: "E",

					MESSAGE: "Bağlantı hatası!"

				};

				oView.getController().showMessage(oMessageData);

			}

		};

		oBusyDialog.open();

		oModel.read("/distinctSet", mParameters);

	},

	/**































































































































* Before show event































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	onBeforeShow: function(oEvent) {

		console.log("onBeforeShow");

		var that = this;

		sSaleType = oEvent.data.saleType;

		var fBfiyat = 0.00;

		var fPrice = 0.00;

		var iQuan = 0;

		var hIndex = 0;

		var oItem;

		// initialize view data

		this.initialize(sSaleType);

		if (oEvent.data.editSaleId == undefined) {

			sVbeln = "";

			//      that.saleInfoValidation();

			return;

		}

		sVbeln = oEvent.data.editSaleId;

		console.log("oDataPending", oDataPending);

		// set selected sale info

		for (var i = 0; i < oDataPending.results.length; i++) {

			if (oDataPending.results[i].Vbeln == oEvent.data.editSaleId) {

				hIndex = i;

				for (var j = 0; j < oDataPending.results[i].bekSatisToItem.results.length; j++) {

					// save KDV types

					aKdvList.push(oDataPending.results[i].bekSatisToItem.results[j].Kdv);

					aMtartList.push(oDataPending.results[i].bekSatisToItem.results[j].Mtart);

					fPrice = parseFloat(oDataPending.results[i].bekSatisToItem.results[j].Netwr) +

					parseFloat(oDataPending.results[i].bekSatisToItem.results[j].Mwsbp);

					fBfiyat = parseFloat(oDataPending.results[i].bekSatisToItem.results[j].Bfiyat);

					iQuan = parseInt(oDataPending.results[i].bekSatisToItem.results[j].Kwmeng);

					oItem = new sap.m.ObjectListItem({

						intro: oDataPending.results[i].bekSatisToItem.results[j].Posnr,

						type: "Active",

						icon: "sap-icon://product",

						title: oDataPending.results[i].bekSatisToItem.results[j].Arktx,

						number: "Fiyat: " + oNumberFormat.format(fPrice).toString() + " TL",

						numberUnit: "Miktar: " + iQuan.toString(),

						markFlagged: oDataPending.results[i].bekSatisToItem.results[j].IsVanilla == "X" ? true : false,

						showMarkers: false,

						press: that.onProdListPress,

						firstStatus: new sap.m.ObjectStatus({

							text: "Birim Fiyat: " + oNumberFormat.format(fBfiyat).toString() + " TL"

						}),

						attributes: [































































































































                         new sap.m.ObjectAttribute({

								text: "Stok Kodu: " + oDataPending.results[i].bekSatisToItem.results[j].Matnr

							})































































































































                        ]

					});

					if (oDataPending.results[i].bekSatisToItem.results[j].Serino.length > 1)

						oItem.addAttribute(new sap.m.ObjectAttribute({

						text: "Seri No: " + oDataPending.results[i].bekSatisToItem.results[j].Serino

					}));

					if (oDataPending.results[i].bekSatisToItem.results[j].Mvgr1 == "X")

						if (oDataPending.results[i].bekSatisToItem.results[j].Message)

							oItem.setSecondStatus(new sap.m.ObjectStatus({

							text: oDataPending.results[i].bekSatisToItem.results[j].Message + " - Peşin(Nakit/KK)",

							state: sap.ui.core.ValueState.Success

						}));

						else

							oItem.setSecondStatus(new sap.m.ObjectStatus({

							text: "Peşin(Nakit/KK)",

							state: sap.ui.core.ValueState.Success

						}));

					else if (oDataPending.results[i].bekSatisToItem.results[j].IsVanilla == "X") {

						if (oDataPending.results[i].bekSatisToItem.results[j].Message) {

							oItem.setSecondStatus(new sap.m.ObjectStatus({

								text: oDataPending.results[i].bekSatisToItem.results[j].Message + " - Kampanyalı/Temlikli Satış)",

								state: sap.ui.core.ValueState.Success

							}));

						} else {

							oItem.setSecondStatus(new sap.m.ObjectStatus({

								text: "Kampanyalı/Temlikli Satış)",

								state: sap.ui.core.ValueState.Success

							}));

						}

					}

					that.getView().byId("saleProdList").addItem(oItem);

				}

			}

		}

		if (oDataPending.results[hIndex].Mtipi == "0006")

			this.getView().byId("generalSaleCustomerType").setSelectedIndex(0);

		else // "0005"

			this.getView().byId("generalSaleCustomerType").setSelectedIndex(1);

		if (oDataPending.results[hIndex].Abrvw == "2")

			this.getView().byId("generalSaleOutputType").setSelectedIndex(0);

		else // "1"

			this.getView().byId("generalSaleOutputType").setSelectedIndex(1);

		if (oDataPending.results[hIndex].Zterm == "0001")

			this.getView().byId("generalSalePaymentType").setSelectedIndex(0);

		else // "0003"

			this.getView().byId("generalSalePaymentType").setSelectedIndex(1);

		this.getView().byId("generalSaleCustomerType").fireSelect();

		this.getView().byId("generalSaleOutputType").fireSelect();

		//CK

		if (oDataPending.results[hIndex].Firma == "1")

			this.getView().byId("saleFirma").setSelectedIndex(1);

		else if (oDataPending.results[hIndex].Firma == "2")

			this.getView().byId("saleFirma").setSelectedIndex(2);

		else if (oDataPending.results[hIndex].Firma == "3")

			this.getView().byId("saleFirma").setSelectedIndex(3);

		else

			this.getView().byId("saleFirma").setSelectedIndex(0);

		console.log("oDataPending-index", oDataPending.results[hIndex]);

		//    if (oDataPending.results[hIndex].Il.length > 0) {

		//      var aTokens = [new sap.m.Token({ key: oDataPending.results[hIndex].Il, text: oDataPending.results[hIndex].IlTanimi })];

		//      this.getView().byId("saleGeneralCity").setTokens(aTokens);

		//    }

		//

		//    if (oDataPending.results[hIndex].Ilce.length > 0) {

		//      var aTokens = [new sap.m.Token({ key: oDataPending.results[hIndex].Ilce, text: oDataPending.results[hIndex].IlceTanimi })];

		//      this.getView().byId("saleGeneralCitypart").setTokens(aTokens);

		//    }

		//    this.getView().byId("saleGeneralCity").setSelectedKey(oDataPending.results[hIndex].Il);

		//    this.setCitypartItems(oDataPending.results[hIndex].Il);

		//    this.getView().byId("saleGeneralCitypart").setSelectedKey(oDataPending.results[hIndex].Ilce);

		sSelectedCityCode = oDataPending.results[hIndex].Il;

		this.getView().byId("saleGeneralCityLive").setValue(oDataPending.results[hIndex].IlTanimi);

		sSelectedCityPartCode = oDataPending.results[hIndex].Ilce;

		this.getView().byId("saleGeneralCityPartLive").setValue(oDataPending.results[hIndex].IlceTanimi);

		this.fillCityPartSuggestionItems(oDataPending.results[hIndex].Il);

		this.getView().byId("saleGeneralRepresentative").setSelectedKey(oDataPending.results[hIndex].VsnmrV);

		this.getView().byId("saleGeneralCustName").setValue(oDataPending.results[hIndex].Name1);

		this.getView().byId("saleGeneralTCKN").setValue(oDataPending.results[hIndex].Name4);

		this.getView().byId("saleGeneralTaxCenter").setValue(oDataPending.results[hIndex].Name3);

		this.getView().byId("saleGeneralAddress").setValue(oDataPending.results[hIndex].Adres);

		this.getView().byId("salePo").setValue(oDataPending.results[hIndex].Ebeln); // Agile Sprint3

		var sTotalPrice = "Genel Toplam: " + oNumberFormatTotal.format(that.getTotalPrice()).toString() + " TL";

		sap.ui.getCore().byId("saleFooterTotalPrice").setText(sTotalPrice);

		this.getView().byId("saleGeneralTotalRed").setText(sTotalPrice);

	},

	setSalesRepItems: function() {

		var oView = this.getView();

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		// set sales representative model

		var oSaleRep = oView.byId("saleGeneralRepresentative");

		var oFilter = [new sap.ui.model.Filter("DealerId", sap.ui.model.FilterOperator.EQ, sDealerID)];

		var mParameters = {

			async: false,

			filters: oFilter,

			urlParameters: null,

			success: function(oData) {

				oSaleRep.removeAllItems();

				if (oData.results.length <= 0) {

					oBusyDialog.close();

					var oMessageData = {

						TYPE: "E",

						MESSAGE: "Satış temsilcisi bulunamadı!"

					};

					oView.getController().showMessage(oMessageData);

				}

				oSaleRep.addItem(new sap.ui.core.Item({

					key: "",

					text: ""

				}));

				for (var i = 0; i < oData.results.length; i++) {

					oSaleRep.addItem(new sap.ui.core.Item({

						key: oData.results[i].Bname,

						text: oData.results[i].NameFirst + " " + oData.results[i].NameLast

					}));

				}

			},

			error: function() {

				var oMessageData = {

					TYPE: "E",

					MESSAGE: "Bağlantı hatası!"

				};

				oView.getController().showMessage(oMessageData);

			}

		};

		oModel.read("/salesRepSet", mParameters);

	},

	initialize: function(saleType) {

		console.log("initialize");

		var that = this;

		isVanilla = false;

		aMtartFound = [];

		aKdvFound = [];

		aMtartList = [];

		//yocoskun sprint5
		aTaxm1List = [];

		aKdvList = [];

		//added by CKAYMAZ on 18.10.2016    

		//   this.getView().byId("saleFirma").setValue("");

		this.getView().byId("saleFirma").setSelectedIndex(0);

		if (sDealerIDType == "X") {

			that.getView().byId("saleFirma").setVisible(true);

		} else {

			that.getView().byId("saleFirma").setVisible(false);

		}

		if (saleType == "H") {

			that.getView().byId("saleViewTitle").setText("Hizmet Faturası");

			that.getView().byId("generalSaleOutputType-02").setEnabled(false);

			that.getView().byId("generalSalePaymentType-02").setEnabled(false);

			that.getView().byId("saleGeneralRepresentative").setVisible(false);

			this.getView().byId("generalSaleCustomerType").setSelectedIndex(1);

			this.getView().byId("generalCompanyType").setSelectedIndex(3); // Agile Sprint3

			this.getView().byId("generalCompanyType").setVisible(true); // Agile Sprint3

			this.getView().byId("salePo").setVisible(true);

		} else {

			that.getView().byId("saleViewTitle").setText("Satış");

			that.getView().byId("generalSaleOutputType-02").setEnabled(true);

			that.getView().byId("generalSalePaymentType-02").setEnabled(true);

			that.getView().byId("saleGeneralRepresentative").setVisible(true);

			this.getView().byId("generalSaleCustomerType").setSelectedIndex(0);

			this.getView().byId("generalCompanyType").setVisible(true); // Agile Sprint3

			that.getView().byId("salePo").setVisible(false);

		};

		this.getView().byId("inputProdSearch").setValue("");

		this.getView().byId("saleProdList").removeAllItems();

		this.getView().byId("saleGeneralCustName").setValue("");

		this.getView().byId("saleGeneralTCKN").setValue("");

		this.getView().byId("saleGeneralTaxCenter").setValue("");

		if (dealerAuthType == "B") {

			this.getView().byId("saleGeneralMail").setVisible(false);

			this.getView().byId("saleGeneralMail").setPlaceholder("");

		} else {

			this.getView().byId("saleGeneralMail").setEditable(true);

			this.getView().byId("saleGeneralMail").setPlaceholder("E-fatura emaili göndermek için doldurunuz");

		}

		this.getView().byId("saleGeneralCityLive").setValue("");

		sSelectedCityCode = "";

		this.getView().byId("salePo").setValue(""); // Agile Sprint3 

		//    this.getView().byId("saleGeneralCityLive").removeAllSuggestionItems();

		this.getView().byId("saleGeneralCityPartLive").setValue("");

		sSelectedCityPartCode = "";

		//    this.getView().byId("saleGeneralCityPartLive").removeAllSuggestionItems();

		//    this.getView().byId("saleGeneralCity").setSelectedKey("");

		//    this.getView().byId("saleGeneralCity").removeAllTokens();

		//    this.getView().byId("saleGeneralCitypart").setValue("");

		//    this.getView().byId("saleGeneralCitypart").removeAllTokens();

		//    this.getView().byId("saleGeneralCitypart").removeAllItems();

		this.getView().byId("saleGeneralAddress").setValue("");

		this.getView().byId("generalSaleOutputType").setSelectedIndex(0);

		this.getView().byId("generalSalePaymentType").setSelectedIndex(0);

		this.getView().byId("saleGeneralRepresentative").setSelectedKey("");

		this.getView().byId("saleGeneralRepresentative").setValue("");

		this.getView().byId("generalSaleCustomerType").fireSelect();

		this.getView().byId("generalSaleOutputType").fireSelect();

		var sStepId1 = this.getView().getId() + "--saleStep1";

		var sStepId2 = this.getView().getId() + "--saleStep2";

		var sPageId1 = this.getView().getId() + "--salePage1";

		this.getView().byId(sStepId1).setEnabled(true);

		this.getView().byId(sStepId2).setEnabled(false);

		this.getView().byId("saleRoadMap").setSelectedStep(sStepId1);

		this.getView().byId("saleNavContainer").to(sPageId1);

		this.getView().byId("saleFooter").destroyContent();

		this.getView().byId("saleFooter").addContent(new sap.m.ToolbarSpacer());

		this.getView().byId("saleFooter").addContent(new sap.m.Text("saleFooterTotalPrice"));

		this.getView().byId("saleFooter").addContent(new sap.m.ToolbarSeparator());

		this.getView().byId("saleFooter").addContent(new sap.m.Button({

			text: "Geri",

			type: sap.m.ButtonType.Emphasized,

			icon: "sap-icon://slim-arrow-left",

			press: that.navigationBack

		}));

		this.getView().byId("saleFooter").addContent(new sap.m.Button({

			text: "İleri",

			type: sap.m.ButtonType.Emphasized,

			icon: "sap-icon://slim-arrow-right",

			press: that.saleRoadMapForward

		}));

		this.getView().byId("saleGeneralTotalRed").setText("Genel Toplam: 0,00 TL");

		this.setSalesRepItems();

	},

	onCityPartSelection: function(oEvent) {

	},

	onSaleRepSelection: function(oEvent) {

	},

	/**































































































































* Event handler for city selection































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	onCitySelection: function(oEvent) {

		sCityCode = oEvent.getSource().getSelectedKey();

		var oView = sap.ui.getCore().byId("Sale");

		var that = oView.getController();

		oView.byId("saleGeneralCitypart").removeAllItems();

		oView.byId("saleGeneralCitypart").setValue("");

		if (sCityCode == "00" || sCityCode == "") return;

		var oBusyDialog = new sap.m.BusyDialog({

			text: "Lütfen bekleyiniz"

		});

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		var oFilter = [new sap.ui.model.Filter("CityCode", sap.ui.model.FilterOperator.EQ, sCityCode)];

		var mParameters = {

			async: true,

			filters: oFilter,

			urlParameters: null,

			success: function(oData) {

				oView.byId("saleGeneralCitypart").addItem(new sap.ui.core.Item({

					key: "dummy",

					text: ""

				}));

				for (var i = 0; i < oData.results.length; i++) {

					oView.byId("saleGeneralCitypart").addItem(new sap.ui.core.Item({

						key: oData.results[i].CityCode,

						text: oData.results[i].CityName

					}));

				}

				oBusyDialog.close();

			},

			error: function() {

				oBusyDialog.close();

				var oMessageData = {

					TYPE: "E",

					MESSAGE: "Bağlantı hatası!"

				};

				oView.getController().showMessage(oMessageData);

			}

		};

		oBusyDialog.open();

		oModel.read("/distinctSet", mParameters);

	},

	/**































































































































* Event handler for product selection from pop up































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	onProdSelectionListPress: function(oEvent) {

		var oController = sap.ui.getCore().byId("Sale").getController();

		var oList = sap.ui.getCore().byId("Sale").byId("saleProdList");

		var oData = {};

		var sTitle,

			sNumber,

			sFirstStatusText,

			sProductID,

			sSerial,

			sVanilla,

			sKdv,

			sCheck,

			sMtart,

			sTaxm1; //yocoskun sprint5

		oData.results = [];

		sProductID = oEvent.getSource().getAttributes()[0].getText();

		sTitle = oEvent.getSource().getTitle();

		sNumber = oEvent.getSource().getNumber();

		oEvent.getSource().getMarkFlagged() ? sVanilla = "X" : sVanilla = "";

		var aNumber = sNumber.split(" ");

		var aProductID = sProductID.split(" ");

		var sKwert = aNumber[2].replace(/,/g, ".");

		for (var i = 0; i < aKdvFound.length; i++) {

			if (aKdvFound[i].Matnr == aProductID[2]) {

				sKdv = aKdvFound[i].Kdv;

				sCheck = aKdvFound[i].Check;

				break;

			}

		}

		for (var i = 0; i < aMtartFound.length; i++) {

			if (aMtartFound[i].Matnr == aProductID[2]) {

				sMtart = aMtartFound[i].Mtart;

				break;

			}

		}

		//    var oResult = { Matnr: aProductID[2], Maktx: sTitle, Kwert: oNumberFormat.parse(aNumber[2]), Sernr: "", Vanilla: sVanilla };

		var oResult = {

			Matnr: aProductID[2],

			Maktx: sTitle,

			Kwert: parseFloat(sKwert),

			Sernr: "",

			Vanilla: sVanilla,

			Kdv: sKdv,

			Check: sCheck,

			Mtart: sMtart,

			//yocoskun sprint5 Taxm1 cekılecek
			Taxm1: sTaxm1

		};

		oData.results.push(oResult);
		// yocoskun sprint5------
		aDataList = [];
		aDataList.push(oResult);

		console.log(oData);

		oController.addProduct(oData, oList, oController);

		oEvent.getSource().oParent.oParent.close();

	},

	/**































































































































* Check max unit price































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	checkSuggestedPrice: function(sMatnr, fPrice) {

		var sMessage = "";

		var oView = sap.ui.getCore().byId("Sale");

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		var oBusyDialog = new sap.m.BusyDialog({

			text: "Lütfen bekleyiniz"

		});

		var oFilter = [































































































































                   new sap.ui.model.Filter("DealerId", sap.ui.model.FilterOperator.EQ, sDealerID),































































































































                   new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, sMatnr),































































































































                   new sap.ui.model.Filter("Kbetr", sap.ui.model.FilterOperator.EQ, fPrice.toString())































































































































                  ];

		var mParameters = {

			async: false,

			filters: oFilter,

			urlParameters: null,

			success: function(oData, oResponse) {

				console.log(oData);

				if (oData.results[0].Statu != "X")

					sMessage = oData.results[0].Message;

				oBusyDialog.close();

			},

			error: function() {

				oBusyDialog.close();

				sMessage = "Fiyat kontrolü sırasında bağlantı hatası!";

			}

		};

		oBusyDialog.open();

		oModel.read("/productPriceCheckSet", mParameters);

		return sMessage;

	},

	/**































































































































* Event handler for product list item press































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	onProdListPress: function(oEvent) {

		// form to display and edit item detail

		var oFormDetail = new sap.ui.layout.form.SimpleForm({

			minWidth: 1024,

			maxContainerCols: 2,

			//      columnsL      : 2,

			//      columnsM      : 2,

			//      labelSpanL      : 6,

			//      labelSpanM      : 6,

			//      labelSpanS      : 12

		});

		var oGridDetail = new sap.ui.layout.Grid({

			defaultSpan: "L6 M6 S6"

		});

		var oView = sap.ui.getCore().byId("Sale");

		var oItem = oEvent.getSource();

		var oList = oItem.getParent();

		var aNumber = oItem.getNumber().split(" ");

		var aNumberUnit = oItem.getNumberUnit().split(" ");

		var oList = oView.byId("saleProdList");

		var aItem = oList.getItems();

		var aFirstStatus = oItem.getFirstStatus().getText().split(" ");

		var sMatnr = oItem.getAttributes()[0].getText().split(" ")[2];

		var sNumber = aNumber[1].replace(/,/g, ".");

		var bEditable = false;

		var bNakitExists = false;

		var bTemlikliExists = false;

		var bSatis;

		var sKdv;

		var sMtart;

		sSaleType == "S" ? bSatis = true : bSatis = false;

		for (var i = 0; i < aKdvFound.length; i++) {

			if (aKdvFound[i].Matnr == sMatnr && aKdvFound[i].Check == "X") {

				bEditable = true;

				break;

			}

		}

		//  nakit ya da temlikli kalem var mı

		for (var i = 0; i < aItem.length; i++) {

			if (aItem[i].getSecondStatus()) {

				if (aItem[i].getSecondStatus().getText().indexOf("Peşin(Nakit/KK)") != -1)

					bNakitExists = true;

				else

					bTemlikliExists = true;

			}

		}

		var sTitle = oItem.getTitle();

		//    var sPrice    = oNumberFormat.parse(aNumber[1]);

		var sPrice = parseFloat(sNumber);

		var sQuantity = aNumberUnit[1];

		if (sPrice <= 0.00)

			sPrice = "";

		var oInputTitle = new sap.m.Input({

			value: sTitle,

			editable: false

		});

		var oInputQuantity = new sap.m.Input({

			value: sQuantity,

			maxLength: 8,

			type: sap.m.InputType.Number,

			visible: bSatis

		});

		var oInputUnitPrice = new sap.m.Input({

			value: aFirstStatus[2],

			maxLength: 8,

			//      type    : sap.m.InputType.Number,

			visible: bSatis,

			enabled: bEditable

		});

		var oCheckboxVanilla = new sap.m.CheckBox({

			enabled: oItem.getMarkFlagged(),

			visible: bSatis

		});

		var oCheckboxKampanya = new sap.m.CheckBox({

			enabled: oItem.getMarkFlagged(),

			visible: bSatis

		});

		var oTextKampanya = new sap.m.TextArea({

			maxLength: 100,

			rows: 3,

			visible: bSatis,

			//      enabled   : oCheckboxKampanya.getSelected()

			enabled: oItem.getMarkFlagged()

		});

		var oInputPrice = new sap.m.Input({

			value: sPrice,

			maxLength: 8,

			type: sap.m.InputType.Number,

			visible: !bSatis

		});

		oCheckboxVanilla.attachSelect(function() {

			oCheckboxKampanya.setSelected(false);

			//      oTextKampanya.setValue("");

			//      oTextKampanya.setEnabled(false);

		});

		oCheckboxKampanya.attachSelect(function() {

			oCheckboxVanilla.setSelected(false);

			//      oTextKampanya.setEnabled(true);

		});

		if (!oItem.getSecondStatus()) {

			oCheckboxVanilla.setSelected(false);

			oCheckboxKampanya.setSelected(false);

		} else if (oItem.getSecondStatus().getText().indexOf("Peşin(Nakit/KK)") != -1) {

			oCheckboxVanilla.setSelected(true);

			oCheckboxKampanya.setSelected(false);

		} else {

			oCheckboxVanilla.setSelected(false);

			oCheckboxKampanya.setSelected(true);

			//      oTextKampanya.setValue(oItem.getSecondStatus().getText().split(" - Kampanyalı/Temlikli")[0]);

		}

		if (oItem.getSecondStatus()) {

			if (oItem.getSecondStatus().getText().split(" - ").length > 1)

				oTextKampanya.setValue(oItem.getSecondStatus().getText().split(" - ")[0]);

			else

				oTextKampanya.setValue("");

		}

		//    oItem.getSecondStatus()  == undefined ? oCheckboxVanilla.setSelected(false) : oCheckboxVanilla.setSelected(true);

		oItem.getAttributes()[1] == undefined ? oInputQuantity.setEnabled(true) : oInputQuantity.setEnabled(false);

		// build dialog control

		//    if (!this.oDetailDialog) {

		oFormDetail.addContent(new sap.m.Label({

			text: "Ürün",

			visible: bSatis

		}));

		oFormDetail.addContent(oInputTitle);

		oFormDetail.addContent(new sap.m.Label({

			text: "Miktar",

			visible: bSatis

		}));

		oFormDetail.addContent(oInputQuantity);

		oFormDetail.addContent(new sap.m.Label({

			text: "Birim Fiyat",

			visible: bSatis

		}));

		oFormDetail.addContent(oInputUnitPrice);

		oFormDetail.addContent(new sap.m.Label({

			text: "Fiyat",

			visible: !bSatis

		}));

		oFormDetail.addContent(oInputPrice);

		oFormDetail.addContent(new sap.m.Label({

			text: "Peşin(Nakit/KK)",

			visible: bSatis

		}));

		oFormDetail.addContent(oCheckboxVanilla);

		oFormDetail.addContent(new sap.m.Label({

			text: "Kampanyalı/Temlikli Satış",

			visible: bSatis

		}));

		oFormDetail.addContent(oCheckboxKampanya);

		oFormDetail.addContent(new sap.m.Label({

			text: "Fatura Açıklama Metni",

			visible: bSatis

		}));

		oFormDetail.addContent(oTextKampanya);

		this.oDetailDialog = new sap.m.Dialog({

			resizable: true,

			buttons: [































































































































                     new sap.m.Button({

					text: "İptal",

					icon: "sap-icon://sys-cancel",

					press: function() {

						this.oParent.close();

					}

				}),































































































































                     new sap.m.Button({

					text: "Kaydet",

					icon: "sap-icon://save",

					press: function() {

						//                         var fUnitPrice   = oNumberFormat.parse(aFirstStatus[2]);

						//                         var fUnitPrice   = oNumberFormat.parse(oInputUnitPrice.getValue());

						var sUnitPrice = oInputUnitPrice.getValue().replace(/,/g, ".");

						var fUnitPrice = parseFloat(sUnitPrice);

						//                         var fPriceNew  = oNumberFormat.parse(oInputPrice.getValue());

						var sPriceNew = oInputPrice.getValue().replace(/,/g, ".");

						var fPriceNew; //sprint5
						//yocoskun sprint5----------------------------
						for (var i = 0; i < aDataList.length; i++) {
							debugger;
							if (aDataList[i].Taxm1 === "0" && sSaleType == "H") {
								fPriceNew = parseFloat(sPriceNew) + parseFloat(sPriceNew) * 0.18;
							} else {
								fPriceNew = parseFloat(sPriceNew);
							}
						}

						var iQuantity = parseInt(oInputQuantity.getValue());

						var fPrice = parseFloat(fUnitPrice * iQuantity);

						var bVanilla = oCheckboxVanilla.getSelected();

						var bKampanya = oCheckboxKampanya.getSelected();

						// input value controls

						if (bSatis && (isNaN(iQuantity) || (!isNaN(iQuantity) && iQuantity <= 0))) {

							sap.m.MessageToast.show("Geçerli bir miktar girin!", {

								at: "center center"

							});

							return;

						}

						if (bSatis && (oInputQuantity.getValue().toString().indexOf(".") != -1 || oInputQuantity.getValue().toString().indexOf(",") != -1)) {

							sap.m.MessageToast.show("Yalnızca tamsayı miktar girin!", {

								at: "center center"

							});

							return;

						}

						if (((bNakitExists && bKampanya) || (bTemlikliExists && bVanilla)) && aItem.length > 1) {

							sap.m.MessageToast.show("Farklı satış türü seçilemez!", {

								at: "center center"

							});

							return;

						}

						/*































































































































                         if (bSatis && oInputUnitPrice.getValue().indexOf(".") != -1){































































































































                           sap.m.MessageToast.show("Nokta yerine virgül kullanın!", { at: "center center" });































































































































                           return;































































































































                         }































































































































































































































































                         if (!bSatis && oInputPrice.getValue().indexOf(".") != -1){































































































































                           sap.m.MessageToast.show("Nokta yerine virgül kullanın!", { at: "center center" });































































































































                           return;































































































































                         }































































































































                         */

						if (bSatis && (isNaN(fUnitPrice))) {

							sap.m.MessageToast.show("Geçersiz birim fiyat!", {

								at: "center center"

							});

							return;

						}

						if (!bSatis && (isNaN(fPriceNew) || (!isNaN(fPriceNew) && fPriceNew <= 0))) {

							sap.m.MessageToast.show("Geçerli bir fiyat girin!", {

								at: "center center"

							});

							return;

						}

						if (oCheckboxKampanya.getSelected() && oTextKampanya.getValue().length <= 0) {

							sap.m.MessageToast.show("Fatura açıklama metni giriniz!", {

								at: "center center"

							});

							return;

						}

						var sErrorMessage = oView.getController().checkSuggestedPrice(sMatnr, fUnitPrice);

						if (bSatis && sErrorMessage != "") {

							sap.m.MessageToast.show(sErrorMessage, {

								at: "center center"

							});

							return;

						}

						if (bSatis && oCheckboxVanilla.getEnabled()) {

							if (!oCheckboxVanilla.getSelected() && !oCheckboxKampanya.getSelected()) {

								sap.m.MessageToast.show("Satış şeklini seçiniz!", {

									at: "center center"

								});

								return;

							}

						}

						// set quantity and price

						var sNumberUnit = "Miktar: " + iQuantity.toString();

						var sFirstStatus = "Birim Fiyat: " + oNumberFormat.format(fUnitPrice).toString() + " TL";

						if (bSatis)

							var sNumber = "Fiyat: " + oNumberFormat.format(fPrice).toString() + " TL";

						else

							var sNumber = "Fiyat: " + oNumberFormat.format(fPriceNew).toString() + " TL";

						oItem.setNumberUnit(sNumberUnit);

						oItem.getFirstStatus().setText(sFirstStatus);

						oItem.setNumber(sNumber);

						// set if Vanilla device

						oItem.destroySecondStatus();

						if (bVanilla) {

							if (oTextKampanya.getValue()) {

								oItem.setSecondStatus(new sap.m.ObjectStatus({

									text: oTextKampanya.getValue() + " - Peşin(Nakit/KK)",

									state: sap.ui.core.ValueState.Success

								}));

							} else {

								oItem.setSecondStatus(new sap.m.ObjectStatus({

									text: "Peşin(Nakit/KK)",

									state: sap.ui.core.ValueState.Success

								}));

							}

						} else if (bKampanya) {

							if (oTextKampanya.getValue()) {

								oItem.setSecondStatus(new sap.m.ObjectStatus({

									text: oTextKampanya.getValue() + " - Kampanyalı/Temlikli Satış",

									state: sap.ui.core.ValueState.Success

								}));

							} else {

								oItem.setSecondStatus(new sap.m.ObjectStatus({

									text: "Kampanyalı/Temlikli Satış",

									state: sap.ui.core.ValueState.Success

								}));

							}

						}

						// close dialog

						this.oParent.close();

						// update total price

						var sTotalPrice = "Genel Toplam: " + oNumberFormatTotal.format(oView.getController().getTotalPrice()).toString() + " TL";

						sap.ui.getCore().byId("saleFooterTotalPrice").setText(sTotalPrice);

						oView.byId("saleGeneralTotalRed").setText(sTotalPrice);

						// display success message

						sap.m.MessageToast.show("Değişiklikler kaydedildi");

					}

				})































































































































                    ],

			content: [































































































































                     oFormDetail,































































































































                     oGridDetail































































































































                    ],

			customHeader: new sap.m.Bar({

				contentLeft: new sap.m.Text({

					text: "Sipariş Kalemini düzenle"

				}),

				contentRight: new sap.m.Button({

					text: "Sil",

					icon: "sap-icon://delete",

					type: sap.m.ButtonType.Reject,

					press: function() {

						oList.removeItem(oItem);

						// remove KDV type

						for (var i = 0; i < aKdvFound.length; i++) {

							if (aKdvFound[i].Check == "X" && aKdvFound[i].Matnr == sMatnr) {

								sKdv = aKdvFound[i].Kdv;

								var index = aKdvList.indexOf(sKdv);

								aKdvList.splice(index, 1);

								break;

							}

						}

						// remove mtart

						for (var i = 0; i < aMtartFound.length; i++) {

							if (aMtartFound[i].Matnr == sMatnr) {

								sMtart = aMtartFound[i].Mtart;

								var index = aMtartList.indexOf(sMtart);

								aMtartList.splice(index, 1);

								break;

							}

						}
						//yocoskun sprint5
						for (var i = 0; i < aTaxm1List.length; i++) {

							if (aTaxm1List[i].Matnr == sMatnr) {

								sTaxm1 = aTaxm1List[i].Taxm1;

								var index = aTaxm1List.indexOf(sTaxm1);

								aTaxm1List.splice(index, 1);

								break;
							}
						}

						var sTotalPrice = "Genel Toplam: " + oNumberFormatTotal.format(oView.getController().getTotalPrice()).toString() + " TL";

						//                        oView.byId("saleFooterTotalPrice").setText(sTotalPrice);

						sap.ui.getCore().byId("saleFooterTotalPrice").setText(sTotalPrice);

						oView.byId("saleGeneralTotalRed").setText(sTotalPrice);

						sap.m.MessageToast.show("Sipariş kalemi silindi")

						this.oParent.oParent.close();

					}

				})

			})

		}); //.addStyleClass("largeDialog");

		if (!sap.ui.Device.system.phone)

			this.oDetailDialog.addStyleClass("largeDialog");

		//    }

		this.oDetailDialog.open();

	},

	/**































































































































* Event handler for product search































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	searchProduct: function(oEvent) {

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		var oBusyDialog = new sap.m.BusyDialog({

			text: "Lütfen bekleyiniz"

		});

		var oView = sap.ui.getCore().byId("Sale");

		var oController = oView.getController();

		var oList = oView.byId("saleProdList");

		var float = 0.00;

		var oSearchString = oEvent.getParameters().query;

		if (sSaleType == "S" && !oSearchString) {

			return;

		}

		var oFilter = [































































































































                   new sap.ui.model.Filter("dealerID", sap.ui.model.FilterOperator.EQ, sDealerID),































































































































                   new sap.ui.model.Filter("searchString", sap.ui.model.FilterOperator.EQ, oSearchString),































































































































                   new sap.ui.model.Filter("Ztype", sap.ui.model.FilterOperator.EQ, sSaleType),































































































































                   new sap.ui.model.Filter("Source", sap.ui.model.FilterOperator.EQ, "S"),































































































































 //                   new sap.ui.model.Filter("Vanilla",   sap.ui.model.FilterOperator.EQ, oView.byId("isVanillaDevice").getSelected())































































































































                  ];

		var mParameters = {

			async: true,

			filters: oFilter,

			urlParameters: null,

			success: function(oData) {

				// error message if no product is found

				if (oData.results[0] == undefined) {

					oBusyDialog.close();

					var oMessageData = {

						TYPE: "E",

						MESSAGE: "Ürün bulunamadı!"

					};

					oController.showMessage(oMessageData);

					return;

				}

				// if more than one product found, choose from pop up

				if (oData.results.length > 1) {

					var oProdSelectionList = new sap.m.List();

					oProdSelectionList.removeAllItems();

					for (var i = 0; i < oData.results.length; i++) {

						float = parseFloat(oData.results[i].Kwert);

						oProdSelectionList.addItem(new sap.m.ObjectListItem({

							type: "Active",

							//                      icon    : "sap-icon://product",

							title: oData.results[i].Maktx,

							showMarkers: false,

							markFlagged: oData.results[i].Vanilla == "X" ? true : false,

							//                      number    : "Birim Fiyat: " + float.toFixed(2).toString() + " TL",

							number: "Birim Fiyat: " + oNumberFormat.format(float).toString() + " TL",

							press: oController.onProdSelectionListPress,

							attributes: [































































































































                                   new sap.m.ObjectAttribute({

									text: "Stok Kodu: " + oData.results[i].Matnr

								}),































































































































                                  ]

						}));

					}

					//                   save KDV values

					for (var j = 0; j < oData.results.length; j++) {

						aKdvFound.push({

							Matnr: oData.results[j].Matnr,

							Kdv: oData.results[j].Kdv,

							Check: oData.results[j].CheckKdv

						});

					}
					//yocoskun sprint5 save Taxm1-------------------------
					for (var j = 0; j < oData.results.length; j++) {
						aTaxm1List.push({
							Matnr: oData.results[j].Matnr,
							Taxm1: oData.results[j].Taxm1
						});
					}
					//                   save mtart values

					for (var j = 0; j < oData.results.length; j++) {

						aMtartFound.push({

							Matnr: oData.results[j].Matnr,

							Mtart: oData.results[j].Mtart

						});

					}

					var oSelectProdDialog = new sap.m.Dialog({

						title: "Eklemek istediğiniz ürünü seçiniz",

						rightButton: new sap.m.Button({

							text: "İptal",

							type: sap.m.ButtonType.Emphasized,

							icon: "sap-icon://decline",

							press: function() {

								this.oParent.close();

							}

						}),

						beforeOpen: function() {

							$('#styleObjectListAttribute').remove();

							$('head').append(

								$('<style/>', {

									id: 'styleObjectListAttribute',

									html: '.sapMObjLAttrDiv {width: 80% !important}'

								}));

						},

						afterClose: function() {

							$('#styleObjectListAttribute').remove();

							$('head').append(

								$('<style/>', {

									id: 'styleObjectListAttribute',

									html: '.sapMObjLAttrDiv {width: 20% !important}'

								}));

						},

						content: oProdSelectionList

					});

					oBusyDialog.close();

					oSelectProdDialog.open();

				} else if (oData.results.length == 1) {

					aKdvFound.push({

						Matnr: oData.results[0].Matnr,

						Kdv: oData.results[0].Kdv,

						Check: oData.results[0].CheckKdv

					});

					aMtartFound.push({

						Matnr: oData.results[0].Matnr,

						Mtart: oData.results[0].Mtart

					});

					oController.addProduct(oData, oList, oController);

					oBusyDialog.close();

				}

			},

			error: function() {

				oBusyDialog.close();

				var oMessageData = {

					TYPE: "E",

					MESSAGE: "Bağlantı hatası!"

				};

				oController.showMessage(oMessageData);

			}

		};

		oBusyDialog.open();

		oModel.read("/productSaleInfoSet", mParameters);

		oEvent.getSource().setValue("");

	},

	/**































































































































* Add product to list































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	addProduct: function(oData, oList, oController) {

		//item variables

		var oNewItem,

			bFlagged,

			sTitle,

			sNumber,

			sNumberUnit,

			sFirstStatusText,

			sProductID,

			sSerial,

			bTTG;

		// do not allow zero price

		if (oData.results[0].Kwert <= 0.00 && sSaleType == "S") {

			var oMessageData = {

				TYPE: "E",

				MESSAGE: oData.results[0].Matnr + " Kodlu ürün için fiyat tanımlanmamış!"

			};

			oController.showMessage(oMessageData);

			return;

		}

		// do not allow different KDV types

		for (var i = 0; i < aKdvList.length; i++) {

			if (aKdvList[i] != oData.results[0].Kdv) {

				var oMessageData = {

					TYPE: "E",

					MESSAGE: " Farklı KDV oranına sahip ürün ekleyemezsiniz!"

				};

				oController.showMessage(oMessageData);

				return;

			}

		}

		oData.results[0].Vanilla == "X" ? bFlagged = true : bFlagged = false;

		// check if same product already exists in list

		var aItem = oList.getItems();

		var bExists = false;

		var bSrExists = false;

		var bNakitExists = false;

		var bTemlikliExists = false;

		var iIndex = 0;

		var iQuantity = 0;

		var fPrice = 0.00;

		var float = 0.00;

		var sPrice = "";

		var sUnitPrice = "";

		for (var i = 0; i < aItem.length; i++) {

			//      if same stock code exists

			if (aItem[i].getAttributes()[0].getText().indexOf(oData.results[0].Matnr) !== -1) {

				bExists = true;

				iIndex = i;

			}

			//      if same serial number exists

			if (oData.results[0].Sernr.length > 1) {

				if (aItem[i].getAttributes()[1] != undefined && aItem[i].getAttributes()[1].getText().indexOf(oData.results[0].Sernr) !== -1) {

					bSrExists = true;

				}

			}

			//      nakit ya da temlikli kalem var mı

			if (aItem[i].getSecondStatus()) {

				if (aItem[i].getSecondStatus().getText().indexOf("Peşin(Nakit/KK)") != -1)

					bNakitExists = true;

				else

					bTemlikliExists = true;

			}

		}

		//    same serial error

		if (bSrExists) {

			var oMessageData = {

				TYPE: "E",

				MESSAGE: oData.results[0].Sernr + " Ürün satış listenizde mevcut!"

			};

			oController.showMessage(oMessageData);

			return;

		}

		//    increase quantity if already exists

		//    and has no serial number

		if (bExists && oData.results[0].Sernr.length <= 1 && sSaleType == "S") {

			var aNumberUnit = aItem[iIndex].getNumberUnit().split(" ");

			iQuantity = parseInt(aNumberUnit[1]);

			iQuantity++;

			sNumberUnit = "Miktar: " + iQuantity.toString();

			fPrice = oData.results[0].Kwert * iQuantity;

			//      sNumber = "Fiyat: " + fPrice.toFixed(2).toString() + " TL";

			sPrice = oNumberFormat.format(fPrice).toString().replace(/\./g, "");

			sNumber = "Fiyat: " + sPrice + " TL";

			oList.removeItem(iIndex);

			console.log("item removed");

		}

		//    else add new
		else {

			//    	check max item quantity

			bTTG = false;

			if (oData.results[0].Mtart == "Z002")

				bTTG = true;

			else {

				for (var i = 0; i < aMtartList.length; i++) {

					if (aMtartList[i] == "Z002") {

						bTTG = true;

						break;

					}

				}

			}

			if ((sSaleType == "S" && ((bTTG && aItem.length >= 4) || (!bTTG && aItem.length >= 6)))) {

				//	(sSaleType == "H" && aItem.length >= 6)) {      --yocoskun 30122016 Sprint4 

				var oMessageData = {

					TYPE: "E",

					MESSAGE: "Daha fazla kalem ekleyemezsiniz!"

				};

				oController.showMessage(oMessageData);

				return;

			}

			sNumberUnit = "Miktar: 1";

			float = parseFloat(oData.results[0].Kwert);

			//      sNumber     = "Fiyat: " + float.toFixed(2).toString() + " TL";

			sPrice = oNumberFormat.format(float).toString().replace(/\./g, "");

			sNumber = "Fiyat: " + sPrice + " TL";

		}

		//    maintain item attributes

		sTitle = oData.results[0].Maktx;

		float = parseFloat(oData.results[0].Kwert);

		//    sFirstStatusText	= "Birim Fiyat: " + float.toFixed(2).toString() + " TL";

		sUnitPrice = oNumberFormat.format(float).toString().replace(/\./g, "");

		sFirstStatusText = "Birim Fiyat: " + sUnitPrice + " TL";

		sProductID = "Stok Kodu: " + oData.results[0].Matnr;

		sSerial = "Seri No: " + oData.results[0].Sernr;

		//    create new list item object

		oNewItem = new sap.m.ObjectListItem({

			type: "Active",

			icon: "sap-icon://product",

			title: sTitle,

			number: sNumber,

			numberUnit: sNumberUnit,

			showMarkers: false,

			markFlagged: bFlagged,

			press: oController.onProdListPress,

			firstStatus: new sap.m.ObjectStatus({

				text: sFirstStatusText

			}),

			attributes: [































































































































                  	   new sap.m.ObjectAttribute({

					text: sProductID

				})































































































































                  	   ]

		});

		//    add serial number if not empty

		if (oData.results[0].Sernr.length > 1)

			oNewItem.addAttribute(new sap.m.ObjectAttribute({

			text: sSerial

		}));

		//    ask sale type for Vanilla

		if (bFlagged) {

			var sSaleTypeText = oData.results[0].Sernr ?

				oData.results[0].Sernr + " IMEI'li ürün için satış türünü seçiniz" :

				oData.results[0].Matnr + "Kodlu ürün için satış türünü seçiniz";

			//      var oFormSelection    = new sap.ui.layout.Grid({ defaultSpan: "L6 M6 S6" });

			var oFormSelection = new sap.ui.layout.form.SimpleForm();

			var oCheckboxVanilla = new sap.m.CheckBox();

			var oCheckboxKampanya = new sap.m.CheckBox();

			var oTextKampanya = new sap.m.TextArea({

				maxLength: 100,

				rows: 3,

				//        enabled   : false

			});

			oCheckboxVanilla.attachSelect(function() {

				oCheckboxKampanya.setSelected(false);

				//        oTextKampanya.setValue("");

				//        oTextKampanya.setEnabled(false);

			});

			oCheckboxKampanya.attachSelect(function() {

				oCheckboxVanilla.setSelected(false);

				//        oTextKampanya.setEnabled(true);

			});

			oFormSelection.addContent(new sap.m.Label({

				text: "Peşin(Nakit/KK)"

			}));

			oFormSelection.addContent(oCheckboxVanilla);

			oFormSelection.addContent(new sap.m.Label({

				text: "Kampanyalı/Temlikli Satış"

			}));

			oFormSelection.addContent(oCheckboxKampanya);

			oFormSelection.addContent(new sap.m.Label({

				text: "Fatura Açıklama Metni"

			}));

			oFormSelection.addContent(oTextKampanya);

			oController.oSaleTypeSelectionDialog = new sap.m.Dialog({

				title: sSaleTypeText,

				buttons: [































































































































                     new sap.m.Button({

						text: "Tamam",

						icon: "sap-icon://accept",

						press: function() {

							if (!oCheckboxVanilla.getSelected() && !oCheckboxKampanya.getSelected()) {

								sap.m.MessageToast.show("Satış türünü seçiniz!", {

									at: "center center"

								});

								return;

							}

							if (oCheckboxKampanya.getSelected() && oTextKampanya.getValue().length <= 0) {

								sap.m.MessageToast.show("Fatura açıklama metni giriniz!", {

									at: "center center"

								});

								return;

							}

							if ((oCheckboxVanilla.getSelected() && bTemlikliExists) ||

								(oCheckboxKampanya.getSelected() && bNakitExists)) {

								sap.m.MessageToast.show("Farklı satış türü seçilemez!", {

									at: "center center"

								});

								return;

							}

							if (oCheckboxVanilla.getSelected()) {

								if (oTextKampanya.getValue()) {

									oNewItem.setSecondStatus(new sap.m.ObjectStatus({

										text: oTextKampanya.getValue() + " - Peşin(Nakit/KK)",

										state: sap.ui.core.ValueState.Success

									}));

								} else {

									oNewItem.setSecondStatus(new sap.m.ObjectStatus({

										text: "Peşin(Nakit/KK)",

										state: sap.ui.core.ValueState.Success

									}));

								}

							} else {

								if (oTextKampanya.getValue()) {

									oNewItem.setSecondStatus(new sap.m.ObjectStatus({

										text: oTextKampanya.getValue() + " - Kampanyalı/Temlikli Satış",

										state: sap.ui.core.ValueState.Success

									}));

								} else {

									oNewItem.setSecondStatus(new sap.m.ObjectStatus({

										text: "Kampanyalı/Temlikli Satış",

										state: sap.ui.core.ValueState.Success

									}));

								}

							}

							oList.addItem(oNewItem);

							// save KDV type

							if (oData.results[0].Check == "X")

								aKdvList.push(oData.results[0].Kdv);

							// save mtart

							aMtartList.push(oData.results[0].Mtart);

							// update total price

							var sTotalPrice = "Genel Toplam: " + oNumberFormatTotal.format(oController.getTotalPrice()).toString() + " TL";

							sap.ui.getCore().byId("saleFooterTotalPrice").setText(sTotalPrice);

							oController.getView().byId("saleGeneralTotalRed").setText(sTotalPrice);

							this.oParent.close();

						}

					})































































































































                    ],

				content: [































































































































                     oFormSelection































































































































                    ]

			}).addStyleClass("largeDialog");

			oController.oSaleTypeSelectionDialog.open();

		} else {

			//      add/insert new item

			if (sSaleType == "S")

				bExists ? oList.insertItem(oNewItem, iIndex) : oList.addItem(oNewItem);

			else

			if (!bExists) oList.addItem(oNewItem);

			//      save KDV type

			if (oData.results[0].Check == "X")

				aKdvList.push(oData.results[0].Kdv);

			//      save mtart

			aMtartList.push(oData.results[0].Mtart);

			//      update total price

			var sTotalPrice = "Genel Toplam: " + oNumberFormatTotal.format(oController.getTotalPrice()).toString() + " TL";

			sap.ui.getCore().byId("saleFooterTotalPrice").setText(sTotalPrice);

			oController.getView().byId("saleGeneralTotalRed").setText(sTotalPrice);

		}

	},

	/**































































































































* Calculate total price































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	getTotalPrice: function() {

		var fPrice = 0.00;

		var aNumber = [];

		var aItem = this.getView().byId("saleProdList").getItems();

		var sPrice = "";

		var sNumber = "";

		for (var i = 0; i < aItem.length; i++) {

			aNumber = aItem[i].getNumber().split(" ");

			//      fPrice += parseFloat(aNumber[1]);

			//      fPrice += oNumberFormat.parse(aNumber[1]);

			console.log(aNumber[1]);

			if (aNumber[1].indexOf(".") != -1) {

				console.log("dot detected");

				sNumber = aNumber[1].replace(/\./g, "");

			} else

				sNumber = aNumber[1];

			console.log(sNumber);

			sPrice = sNumber.replace(/,/g, ".");

			console.log(sPrice);

			fPrice += parseFloat(sPrice);

			console.log(fPrice);

		}

		return fPrice.toFixed(2);

	},

	/**































































































































* Cash event































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	cashOrder: function(oEvent) {

		/*	  var request = '<?xml version="1.0" encoding="UTF-8"?>' +































































































































	  				'<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +































































































































	  				'<SOAP-ENV:Body>' +































































































































	  				'<m:Z_FIORI_SALES_KEY_CREATE xmlns:m="urn:sap-com:document:sap:rfc:functions"/>' +































































































































	  				'</SOAP-ENV:Body></SOAP-ENV:Envelope>';































































































































	  































































































































	  var saleKey = "";































































































































	  































































































































	  jQuery.support.cors = true;































































































































	  































































































































	  $.ajax({  































































































































          url : "http://smartcappd00.sap.tt-tim.tr:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zws_fiori_sales_key/100/zws_fiori_sales_key/zws_fiori_sales_key?sap-client=100?wsdl",































































































































          type : "POST",































































































































          headers: {































































































































        	  "Access-Control-Allow-Origin" : "*"































































































































          },































































































































          username	: "FSONMEZ",































































































































          password	: "vektora1",































































































































          data : request,































































































































          dataType: 'text',































































































































          contentType : "text/xml; charset=\"utf-8\"",  































































































































          success : function(data, textStatus, jqXHR) {































































































































        	  parser = new DOMParser();































































































































        	  xmlDoc = parser.parseFromString(data,"text/xml");































































































































        	  saleKey = xmlDoc.getElementsByTagName("sapcentraladmin:BusinessApplicationID")[0].childNodes[0].nodeValue;































































































































          },  































































































































          error: function(xhr, status)  































































































































          {  































































































































        	  console.log(xhr);































































































































        	  console.log(status);































































































































              console.log("ERROR");        































































































































          } 































































































































   }); */

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", true);

		var oBusyDialog = new sap.m.BusyDialog({

			text: "Lütfen bekleyiniz"

		});

		var oView = oEvent.getSource().oParent.oParent.oParent;

		var d = new Date();

		var oMessageData;

		if (oView.byId("generalSaleOutputType").getSelectedIndex() == 0 &&

			oView.byId("saleGeneralTCKN").getValue() == "") {

			var sMessage;

			oView.byId("generalSaleCustomerType").getSelectedIndex() == 0 ?

			sMessage = "Fatura için TCKN alanı zorunludur!" :

			sMessage = "Fatura için Vergi No alanı zorunludur!";

			var oMessageData = {

				TYPE: "E",

				MESSAGE: sMessage

			};

			oView.getController().showMessage(oMessageData);

			return;

		}

		//    check mandatory fields

		if (oView.byId("saleGeneralRepresentative").getSelectedKey() == "" && sSaleType == "S") {

			var oMessageData = {

				TYPE: "E",

				MESSAGE: "Zorunlu alanları doldurun!"

			};

			oView.getController().showMessage(oMessageData);

			return;

		}

		if (oView.byId("generalSaleOutputType").getSelectedIndex() == 0 &&

			oView.byId("generalSaleCustomerType").getSelectedIndex() == 1) {

			if (oView.byId("saleGeneralCustName").getValue() == "" ||

				oView.byId("saleGeneralTCKN").getValue() == "" ||

				oView.byId("saleGeneralTaxCenter").getValue() == "" ||

				//        oView.byId("saleGeneralCity").getTokens()         == []     ||

				//        oView.byId("saleGeneralCitypart").getTokens()         == []     ||

				oView.byId("saleGeneralAddress").getValue() == "") {

				var oMessageData = {

					TYPE: "E",

					MESSAGE: "Zorunlu alanları doldurun!"

				};

				oView.getController().showMessage(oMessageData);

				return;

			}

		}

		//    TCKN - VKN control

		if (oView.byId("generalSaleCustomerType").getSelectedIndex() == 0 &&

			(isNaN(oView.byId("saleGeneralTCKN").getValue()) ||

				(oView.byId("saleGeneralTCKN").getValue().length != 11 && oView.byId("saleGeneralTCKN").getValue().length != 0))) {

			oMessageData = {

				TYPE: "E",

				MESSAGE: "Hatalı TCKN No!"

			};

			oView.getController().showMessage(oMessageData);

			return;

		}

		if (oView.byId("generalSaleCustomerType").getSelectedIndex() == 1 && isNaN(oView.byId("saleGeneralTCKN").getValue())) {

			oMessageData = {

				TYPE: "E",

				MESSAGE: "Hatalı Vergi No!"

			};

			oView.getController().showMessage(oMessageData);

			return;

		}

		//    il ve ilçe manuel doldurulamasın

		if (oView.byId("generalSaleCustomerType").getSelectedIndex() == 0 && oView.byId("saleGeneralCityLive").getValue() && sSelectedCityCode ==

			"" ||

			oView.byId("generalSaleCustomerType").getSelectedIndex() == 0 && oView.byId("saleGeneralCityPartLive").getValue() &&

			sSelectedCityPartCode == "") {

			oMessageData = {

				TYPE: "E",

				MESSAGE: "İl ve ilçe alanına manuel giriş yapılamaz!"

			};

			oView.getController().showMessage(oMessageData);

			return;

		}

		// added by CKAYMAZ on 18.10.2016

		if (sDealerIDType == "X") {

			if (isTemlikli == true) {

				if (oView.byId("saleFirma").getSelectedIndex() == 0)

				{

					oMessageData = {

						TYPE: "E",

						MESSAGE: "Ürün Sahibi Firma Seçimi zorunludur!"

					};

					oView.getController().showMessage(oMessageData);

					return;

				}

			}

		}

		oBusyDialog.open();

		var sTitle;

		var sAbrvw;

		var sZterm;

		var sCityCode = "";

		var sCitypartCode = "";

		//    if (oView.byId("saleGeneralCity").getTokens()[0])     sCityCode   = oView.byId("saleGeneralCity").getTokens()[0].getKey();

		//    if (oView.byId("saleGeneralCitypart").getTokens()[0]) sCitypartCode = oView.byId("saleGeneralCitypart").getTokens()[0].getKey();

		//    sCityCode = oView.byId("saleGeneralCity").getSelectedKey();

		//    sCitypartCode = oView.byId("saleGeneralCitypart").getSelectedKey();

		//    sCityCode = oView.byId("saleGeneralCityLive").getSelectedSuggestionKey();

		//    sCitypartCode = oView.byId("saleGeneralCityPartLive").getSelectedSuggestionKey();

		sCityCode = sSelectedCityCode;

		sCitypartCode = sSelectedCityPartCode;

		oView.byId("generalSaleCustomerType").getSelectedIndex() == 0 ? sTitle = "0006" : sTitle = "0005";

		oView.byId("generalSaleOutputType").getSelectedIndex() == 0 ? sAbrvw = "2" : sAbrvw = "1";

		if (isTemlikli)

			sZterm = "0002";

		else {

			oView.byId("generalSalePaymentType").getSelectedIndex() == 0 ? sZterm = "0001" : sZterm = "0003";

		}

		//    Request order header

		var requestORderHeader = {};

		requestORderHeader.Vbeln = sVbeln;

		requestORderHeader.Dealer = sDealerID;

		requestORderHeader.Type = sSaleType;

		requestORderHeader.Name1 = oView.byId("saleGeneralCustName").getValue();

		requestORderHeader.Name2 = "";

		requestORderHeader.Name3 = oView.byId("saleGeneralTaxCenter").getValue();

		requestORderHeader.Name4 = oView.byId("saleGeneralTCKN").getValue();

		requestORderHeader.CityCode = sCitypartCode;

		requestORderHeader.Address = oView.byId("saleGeneralAddress").getValue();

		requestORderHeader.Regio = sCityCode;

		requestORderHeader.Abrvw = sAbrvw;

		requestORderHeader.Zterm = sZterm;

		requestORderHeader.Ebeln = oView.byId("salePo").getValue(); // Agile Sprint3 

		requestORderHeader.VsnmrV = oView.byId("saleGeneralRepresentative").getSelectedKey();

		requestORderHeader.Title = sTitle;

		// added by CKAYMAZ on 18.10.2016

		requestORderHeader.Firma = oView.byId("saleFirma").getSelectedKey();

		requestORderHeader.Mail = oView.byId("saleGeneralMail").getValue();

		//    if (requestORderHeader.Regio == "00") requestORderHeader.Regio = "";

		//    if (requestORderHeader.CityCode == "dummy") requestORderHeader.CityCode = "";

		//    Order items

		var aItem = oView.byId("saleProdList").getItems();

		var aAttribute = [];

		var aNumber = [];

		var aNumberUnit = [];

		var sMatnr = "";

		var sQuantity = "";

		var sPrice = "";

		var sSerialNo = "";

		var sVanilla = "";

		var sKampanya = "";

		var sPosnr = "";

		var sToken = "";

		var token;

		oModel.refreshSecurityToken();

		console.log(oModel.getSecurityToken());

		oModel.refreshSecurityToken();

		console.log(oModel.getSecurityToken());

		oModel.read('/orderHeaderSet',

			null,

			null,

			false,

			function(oData, oResponse) {

				token = oResponse.headers['x-csrf-token'];

			},

			function() {

				alert("Error on read process");

			}

		);

		oModel.setHeaders({

			"X-Requested-With": "XMLHttpRequest",

			"Content-Type": "application/json",

			"DataServiceVersion": "2.0",

			"Accept": "application/atom+xml,application/atomsvc+xml,application/xml",

			"X-CSRF-Token": token

		});

		sToken = oModel.getSecurityToken().toString();

		var itemData = [];

		var fTopTutar = 0.00;

		var iTopMiktar = 0;

		var sArrayNmu = "";

		for (var i = 0; i < aItem.length; i++) {

			aFirstStatus = aItem[i].getFirstStatus().getText().split(" ");

			aAttribute = aItem[i].getAttributes()[0].getText().split(" ");

			aNumberUnit = aItem[i].getNumberUnit().split(" ");

			aNumber = aItem[i].getNumber().split(" ");

			//      serial number

			if (aItem[i].getAttributes()[1] != undefined)

				sSerialNo = aItem[i].getAttributes()[1].getText().split(" ")[2];

			else

				sSerialNo = "";

			//      item price

			if (sSaleType == "H")

				sPrice = aNumber[1].replace(/,/g, ".");

			else

				sPrice = aFirstStatus[2].replace(/,/g, ".");

			//      encrypt price

			//      sEncrypt = btoa(sPrice);

			//      vanilla

			if (aItem[i].getSecondStatus() && aItem[i].getSecondStatus().getText().indexOf("Peşin(Nakit/KK)") != -1)

				sVanilla = "X";

			else

				sVanilla = "";

			//      kampanya metni

			if (aItem[i].getSecondStatus()) {

				if (aItem[i].getSecondStatus().getText().split(" - ").length > 1)

					sKampanya = aItem[i].getSecondStatus().getText().split(" - ")[0];

				else

					sKampanya = "";

			}

			//      product ID

			sMatnr = aAttribute[2];

			//      quantity

			if (sSaleType == "S")

				sQuantity = aNumberUnit[1];

			else

				sQuantity = "1";

			//      item no

			sPosnr = aItem[i].getIntro() ? aItem[i].getIntro() : "";

			itemData.push({

				Posnr: sPosnr,

				Matnr: sMatnr,

				Kwmeng: sQuantity,

				Vrkme: "",

				Sernr: sSerialNo,

				Vanilla: sVanilla,

				Message: sKampanya,

				Hiztutar: sPrice,

				Encrypt: ""

			});

			fTopTutar += parseFloat(sPrice);

			iTopMiktar += parseInt(sQuantity);

			sArrayNmu += sMatnr;

		}

		var sTopTutar = fTopTutar.toFixed(2).toString();

		var sTopMiktar = iTopMiktar.toString();

		console.log(sTopTutar);

		console.log(sTopMiktar);

		console.log(sArrayNmu);

		var sKoe = $("#hioek").val() + "#" + sDealerID + "#" +

			d.getFullYear() + oView.getController().addZero((d.getMonth() + 1)) + oView.getController().addZero(d.getDate()) + "#" +

			oView.getController().addZero(d.getHours()) + oView.getController().addZero(d.getMinutes()) + "#" +

			sTopTutar + "#" + sTopMiktar + "#" + sArrayNmu;

		var md5 = MD5(sKoe);

		console.log(sKoe);

		for (var i = 0; i < itemData.length; i++) {

			itemData[i].Encrypt = md5;

		}

		requestORderHeader.Items = itemData;

		console.log(requestORderHeader);

		//    Create order

		/*    oModel.setHeaders({































































































































                "Access-Control-Allow-Origin" : "*",































































































































                "Content-Type": "application/x-www-form-urlencoded",































































































































                "X-CSRF-Token":"Fetch"































































































































               }); */

		var oSuccessDialog;

		console.log(requestORderHeader);

		oModel.create('/orderHeaderSet',

			requestORderHeader,

			null,

			function(oData, oResponse) {

				var bSuccess;

				var sTitle;

				var sMessage;

				oData.Provisionid.length > 1 ? bSuccess = true : bSuccess = false;

				if (sSaleType == "S") {

					if (oView.byId("generalSaleOutputType").getSelectedIndex() == 0)

						sMessage = "Bilgi fişinizi ÖKC üzerinden alınız";

					else

						sMessage = "İşleme ÖKC üzerinden devam ediniz";

				} else {

					sMessage = "Hizmet fatura çıktınızı satış raporundan alabilirsiniz";

				}

				bSuccess ?

				sSucessMessage = oData.Message + "\n" + sMessage :

				sSucessMessage = oData.Message;

				bSuccess ? sTitle = "Sipariş yaratıldı" : sTitle = "Sipariş yaratılamadı!";

				var oSuccessText = new sap.m.Text({

					text: sSucessMessage

				});

				if (!oSuccessDialog) {

					oSuccessDialog = new sap.m.Dialog({

						title: sTitle,

						rightButton: new sap.m.Button({

							text: "Tamam",

							icon: "sap-icon://accept",

							press: function() {

								this.oParent.close();

								if (bSuccess)

									sap.ui.getCore().getEventBus().publish(

									"nav",

									"to", {

										viewName: "zui5_ttg_app001.Main",

										viewId: "Main"

									});

							}

						}),

						content: [oSuccessText]

					});

					oBusyDialog.close();

					oSuccessDialog.open();

				}

				/* OData.request({































































































































                   requestUri: "http://smartcappd00.sap.tt-tim.tr:8000/sap/bc/ui5_ui5/sap/orderHeaderSet/",































































































































                   method: "DELETE",































































































































                   headers:































































































































                       {































































































































                          "Content-Type": "application/atom+xml",































































































































                          "X-CSRF-Token": sToken































































































































                       }































































































































                   }); */

			},

			function() {

				oBusyDialog.close();

				var oMessageData = {

					TYPE: "E",

					MESSAGE: "Tahsilat yapılamadı!"

				};

				oView.getController().showMessage(oMessageData);

			});

	},

	/**































































































































* Road map forward navigation































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	saleRoadMapForward: function(oEvent) {

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", true);

		var oBusyDialog = new sap.m.BusyDialog({

			text: "Lütfen bekleyiniz"

		});

		var bStockOK = true;

		oBusyDialog.open();

		var oView = oEvent.getSource().oParent.oParent.oParent;

		var oController = oView.getController();

		var oFooter = oView.byId("saleFooter");

		var oRoadMap = oView.byId("saleRoadMap");

		var oNavContainer = oView.byId("saleNavContainer");

		var sStepId1 = oView.getId() + "--saleStep1";

		var sStepId2 = oView.getId() + "--saleStep2";

		var sNavPageId = oView.getId() + "--salePage2";

		var bExistsFromR = false;

		//    set total price

		var sTotalPrice = "Genel Toplam: " + oNumberFormatTotal.format(oController.getTotalPrice()).toString() + " TL";

		//    check stock

		var requestORderHeader = {};

		var stockCheckMaterialSet = [];

		var stockCheckSeriSet = [];

		var sSerial = "";

		requestORderHeader.Dealer = sDealerID;

		requestORderHeader.Uname = "B00099";

		var aItem = oView.byId("saleProdList").getItems();

		//    if no product

		if (aItem.length <= 0) {

			var oMessageData = {

				TYPE: "E",

				MESSAGE: "Devam etmek için ürün ekleyin!"

			};

			oView.getController().showMessage(oMessageData);

			oBusyDialog.close();

			return;

		}

		isVanilla = false;

		isTemlikli = false;

		for (var i = 0; i < aItem.length; i++) {

			//      cihaz satışında fiş kesilemez

			if (aItem[i].getMarkFlagged())

				isVanilla = true;

			//      temlikli cihaz var mı

			if (aItem[i].getSecondStatus() != undefined && aItem[i].getSecondStatus().getText().indexOf("Kampanyalı/Temlikli Satış") != -1)

				isTemlikli = true;

			//      stok kontrolü ilk faz için sadece vanilla için çalışıyor

			if (aItem[i].getSecondStatus() != undefined && aItem[i].getSecondStatus().getText() == "Peşin(Nakit/KK)") {

				aItem[i].getAttributes()[1] != undefined ? sSerial = aItem[i].getAttributes()[1].getText().split(" ")[2] : sSerial = "";

				stockCheckSeriSet.push({

					Sernr: sSerial

				});

				stockCheckMaterialSet.push({

					Matnr: aItem[i].getAttributes()[0].getText().split(" ")[2],

					Kwmeng: aItem[i].getNumberUnit().split(" ")[1],

					Vrkme: "",

					Vanilla: "",

					Serino: stockCheckSeriSet

				});

			}

		}

		// temlikli cihaz var ise ödeme tipi seçilemesin

		if (isTemlikli) {

			oView.byId("generalSalePaymentType").setVisible(false);

		} else {

			oView.byId("generalSalePaymentType").setVisible(true);

		}

		// total price check

		if (isVanilla || isTemlikli || oController.getTotalPrice() > 880.00) {

			oView.byId("generalSaleOutputType").setSelectedIndex(0);

			oView.byId("generalSaleOutputType-02").setEnabled(false);

		} else
		//yocoskun sprint5
        {
           if (sSaleType == "S") oView.byId("generalSaleOutputType-02").setEnabled(true); 
        }
        if(sSaleType === "H"){
		for (var i = 0; i < aDataList.length; i++) {
		    if(aDataList[i].Taxm1 === "0"){
		        oView.byId("generalCompanyType-01").setEnabled(false);
		        oView.byId("generalCompanyType-02").setEnabled(false);
		        oView.byId("generalCompanyputType-04").setEnabled(false);
	    	}
	    	else{
	    	    oView.byId("generalCompanyType-01").setEnabled(true);
		        oView.byId("generalCompanyType-02").setEnabled(true);
		        oView.byId("generalCompanyputType-04").setEnabled(true);
	    	}
		}
		}
		

		requestORderHeader.Material = stockCheckMaterialSet;

		oModel.setHeaders({

			"Access-Control-Allow-Origin": "*",

			"Content-Type": "application/x-www-form-urlencoded",

			"X-CSRF-Token": "Fetch"

		});

		var token;

		oModel.read('/stockCheckSet',

			null,

			null,

			false,

			function(oData, oResponse) {

				token = oResponse.headers['x-csrf-token'];

			},

			function() {

			});

		oModel.setHeaders({

			"X-Requested-With": "XMLHttpRequest",

			"Content-Type": "application/json",

			"DataServiceVersion": "2.0",

			"Accept": "application/atom+xml,application/atomsvc+xml,application/xml",

			"X-CSRF-Token": token

		});

		oModel.create('/stockCheckSet',

			requestORderHeader,

			null,

			function(oData, oResponse) {

				console.log(oData);

				var sMessage = "";

				if (oData.Material != undefined && oData.Material.results.length > 0) {

					for (var i = 0; i < oData.Material.results.length; i++) {

						if (oData.Material.results[i].Serino.results && oData.Material.results[i].Serino.results[0].Sernr)

							sMessage = oData.Material.results[i].Serino.results[0].Sernr + " Seri numaralı malzeme stokta yok!" + "\n";

						else

							sMessage = oData.Material.results[i].Matnr + " Kodlu malzeme stokta yok!" + "\n";

					}

					var oMessageData = {

						TYPE: "E",

						MESSAGE: sMessage

					};

					oController.showMessage(oMessageData);

					oBusyDialog.close();

					bStockOK = false;

				}

			},

			function() {

				var oMessageData = {

					TYPE: "E",

					MESSAGE: "Bağlantı hatası!"

				};

				oView.getController().showMessage(oMessageData);

				oBusyDialog.close();

				bStockOK = false;

			});

		if (!bStockOK) return;

		// set default sales representative

		if (sVbeln == "")

			oView.byId("saleGeneralRepresentative").setSelectedKey(sLoginUser);

		// set footer content

		var sSaveButtonText;

		sSaleType == "S" ? sSaveButtonText = "Tahsilatı Yap" : sSaveButtonText = "Kaydet";

		oFooter.destroyContent();

		oFooter.addContent(new sap.m.ToolbarSpacer());

		oFooter.addContent(new sap.m.Text({

			text: sTotalPrice

		}));

		oFooter.addContent(new sap.m.Button({

			text: "Geri",

			type: sap.m.ButtonType.Emphasized,

			icon: "sap-icon://slim-arrow-left",

			press: oController.saleRoadMapBack

		}));

		oFooter.addContent(new sap.m.Button({

			text: sSaveButtonText,

			type: sap.m.ButtonType.Emphasized,

			icon: "sap-icon://money-bills",

			press: oController.cashOrder

		}));

		// navigate

		oView.byId(sStepId1).setEnabled(false);

		oView.byId(sStepId2).setEnabled(true);

		oRoadMap.setSelectedStep(sStepId2);

		oNavContainer.to(sNavPageId);

		oBusyDialog.close();

	},

	/**































































































































* Print invoice































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	printInvoice: function() {

		var oView = sap.ui.getCore().byId("Sale");

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		var sReadString = "/printInvoiceSet(Vbeln='90000000')/$value";

		var oBusyDialog = new sap.m.BusyDialog({

			text: "Lütfen bekleyiniz"

		});

		var displayDialog;

		var mParameters = {

			async: true,

			filters: null,

			urlParameters: null,

			success: function(oData, oResponse) {

				var pdfURL = oResponse.requestUri;

				var html = new sap.ui.core.HTML();

				html.setContent("<iframe src=" + pdfURL + " width='700' height='700'></iframe>");

				if (!displayDialog) {

					displayDialog = new sap.m.Dialog({

						title: "Fatura önizleme",

						rightButton: new sap.m.Button({

							text: "Tamam",

							icon: "sap-icon://accept",

							press: function() {

								this.oParent.close();

							}

						}),

						content: [html]

					});

				}

				displayDialog.open();

				oBusyDialog.close();

			},

			error: function() {

				oBusyDialog.close();

				var oMessageData = {

					TYPE: "E",

					MESSAGE: "Bağlantı hatası!"

				};

				oView.getController().showMessage(oMessageData);

			}

		};

		oBusyDialog.open();

		oModel.read(sReadString, mParameters);

	},

	/**































































































































* Road map back navigation































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	saleRoadMapBack: function(oEvent) {

		var oView = oEvent.getSource().oParent.oParent.oParent;

		var oController = oView.getController();

		var oFooter = oView.byId("saleFooter");

		var oRoadMap = oView.byId("saleRoadMap");

		var oNavContainer = oView.byId("saleNavContainer");

		var sStepId1 = oView.getId() + "--saleStep1";

		var sStepId2 = oView.getId() + "--saleStep2";

		var sNavPageId = oView.getId() + "--salePage1";

		var sTotalPrice = "Genel Toplam: " + oNumberFormatTotal.format(oController.getTotalPrice()).toString() + " TL";

		oFooter.destroyContent();

		oFooter.addContent(new sap.m.ToolbarSpacer());

		oFooter.addContent(new sap.m.Text("saleFooterTotalPrice").setText(sTotalPrice));

		oFooter.addContent(new sap.m.ToolbarSeparator());

		oFooter.addContent(new sap.m.Button({

			text: "Geri",

			type: sap.m.ButtonType.Emphasized,

			icon: "sap-icon://slim-arrow-left",

			press: oController.navigationBack

		}));

		oFooter.addContent(new sap.m.Button({

			text: "İleri",

			type: sap.m.ButtonType.Emphasized,

			icon: "sap-icon://slim-arrow-right",

			press: oController.saleRoadMapForward

		}));

		oView.byId("saleGeneralTotalRed").setText(sTotalPrice);

		// navigate

		oView.byId(sStepId1).setEnabled(true);

		oView.byId(sStepId2).setEnabled(false);

		oRoadMap.setSelectedStep(sStepId1);

		oNavContainer.to(sNavPageId);

	},

	/**































































































































* Display message































































































































* @memberOf zui5_ttg_app001.Sale































































































































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































































































































* Event handler for output type selection































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	outputTypeSelected: function(oEvent) {

		var oView = sap.ui.getCore().byId("Sale");

		var that = oView.getController();

		var bEditable;

		switch (oView.byId("generalSaleOutputType").getSelectedIndex()) {

			case 1:

				bEditable = false;

				break;

			case 0:

				bEditable = true;

				break;

			default:

				break;

		}

		if (oView.byId("generalSaleCustomerType").getSelectedIndex() == 1 && oView.byId("generalSaleOutputType").getSelectedIndex() == 0) {

			oView.byId("saleLabelName").setRequired(true);

			oView.byId("saleLabelTCKN").setRequired(true);

			oView.byId("saleLabelTaxCenter").setRequired(true);

			oView.byId("saleLabelCity").setRequired(true);

			oView.byId("saleLabelCityPart").setRequired(true);

			oView.byId("saleLabelAddress").setRequired(true);

		} else {

			oView.byId("saleLabelName").setRequired(false);

			oView.byId("saleLabelTCKN").setRequired(false);

			oView.byId("saleLabelTaxCenter").setRequired(false);

			oView.byId("saleLabelCity").setRequired(false);

			oView.byId("saleLabelCityPart").setRequired(false);

			oView.byId("saleLabelAddress").setRequired(false);

		}

		if (oView.byId("generalSaleOutputType").getSelectedIndex() == 0)

			oView.byId("saleLabelTCKN").setRequired(true);

		else

			oView.byId("saleLabelTCKN").setRequired(false);

		//    that.saleInfoValidation();

	},

	/**































































































































* Event handler for customer type selection































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	customerTypeSelected: function(oEvent) {

		var oView = sap.ui.getCore().byId("Sale");

		var bEditable;

		switch (oView.byId("generalSaleCustomerType").getSelectedIndex()) {

			case 0:

				oView.byId("saleLabelName").setText("Adı Soyadı");

				oView.byId("saleLabelTCKN").setText("TCKN");

				oView.byId("saleLabelTaxCenter").setVisible(false);

				oView.byId("saleGeneralTaxCenter").setVisible(false);

				oView.byId("generalCompanyType").setVisible(false); // Agile Sprint3

				oView.byId("saleGeneralCityLive").setValue("");

				oView.byId("saleGeneralCityPartLive").setValue("");

				oView.byId("saleGeneralAddress").setValue("");

				oView.byId("saleGeneralCustName").setValue("");

				oView.byId("saleGeneralTCKN").setValue("");

				oView.byId("saleGeneralTaxCenter").setValue("");

				bEditable = false;

				break;

			case 1:

				oView.byId("saleLabelName").setText("Kurum");

				oView.byId("saleLabelTCKN").setText("Vergi No");

				oView.byId("saleLabelTaxCenter").setVisible(true);

				oView.byId("saleGeneralTaxCenter").setVisible(true);

				//oView.byId("generalCompanyType").setVisible(true); // Agile Sprint3

				bEditable = true;

				break;

			default:

				break;

		}

		if (oView.byId("generalSaleCustomerType").getSelectedIndex() == 1 && oView.byId("generalSaleOutputType").getSelectedIndex() == 0) {

			oView.byId("saleLabelName").setRequired(true);

			oView.byId("saleLabelTCKN").setRequired(true);

			oView.byId("saleLabelTaxCenter").setRequired(true);

			oView.byId("saleLabelCity").setRequired(true);

			oView.byId("saleLabelCityPart").setRequired(true);

			oView.byId("saleLabelAddress").setRequired(true);

		} else {

			oView.byId("saleLabelName").setRequired(false);

			oView.byId("saleLabelTCKN").setRequired(false);

			oView.byId("saleLabelTaxCenter").setRequired(false);

			oView.byId("saleLabelCity").setRequired(false);

			oView.byId("saleLabelCityPart").setRequired(false);

			oView.byId("saleLabelAddress").setRequired(false);

		}

		if (oView.byId("generalSaleOutputType").getSelectedIndex() == 0)

			oView.byId("saleLabelTCKN").setRequired(true);

		else

			oView.byId("saleLabelTCKN").setRequired(false);

	},

	// Agile Sprint3

	companyTypeSelected: function(oEvent) {

		var oView = sap.ui.getCore().byId("Sale");

		switch (oView.byId("generalCompanyType").getSelectedIndex()) {

			case 0:

				this.getView().byId("saleGeneralCustName").setValue("TURK TELEKOMINIKASYON A.S.");

				this.getView().byId("saleGeneralTCKN").setValue("8760052205");

				this.getView().byId("saleGeneralTaxCenter").setValue("DISKAPI VERGI DAIRESI");

				this.getView().byId("saleGeneralCityLive").setValue("ANKARA");

				this.getView().byId("saleGeneralCityPartLive").setValue("ALTINDAG");

				this.getView().byId("saleGeneralAddress").setValue("TURGUT OZAL BULVARI 06103 AYDINLIKEVLER");

				break;

			case 1:

				this.getView().byId("saleGeneralCustName").setValue("TTNET A.S.");

				this.getView().byId("saleGeneralTCKN").setValue("8590491872");

				this.getView().byId("saleGeneralTaxCenter").setValue("BOGAZICI KURUMLAR VERGI DAIRESI");

				this.getView().byId("saleGeneralCityLive").setValue("ISTANBUL");

				this.getView().byId("saleGeneralCityPartLive").setValue("ŞIŞLI");

				this.getView().byId("saleGeneralAddress").setValue("ESENTEPE MAH. SALIH TOZAN SOKAK NO:16 KARAMANCILAR İS MERKEZİ D BLOK 34394");

				break;

			case 2:

				this.getView().byId("saleGeneralCustName").setValue("AVEA ILETISIM HIZ. A.S.");

				this.getView().byId("saleGeneralTCKN").setValue("8590380323");

				this.getView().byId("saleGeneralTaxCenter").setValue("B.MUKELLEFLER VERGI DAIRESI");

				this.getView().byId("saleGeneralCityLive").setValue("ISTANBUL");

				this.getView().byId("saleGeneralCityPartLive").setValue("ŞIŞLI");

				this.getView().byId("saleGeneralAddress").setValue("ABDI IPEKCI CADDESI NO:75 MACKA");

				break;

			default:

				this.getView().byId("saleGeneralCustName").setValue("");

				this.getView().byId("saleGeneralTCKN").setValue("");

				this.getView().byId("saleGeneralTaxCenter").setValue("");

				this.getView().byId("saleGeneralCityLive").setValue("");

				this.getView().byId("saleGeneralCityPartLive").setValue("");

				this.getView().byId("saleGeneralAddress").setValue("");

				break;

		}

	},

	// Agile Sprint3

	onSwitchChange: function(oEvent) {

		var oView = sap.ui.getCore().byId("Sale");

		oView.byId("saleGeneralCustName").setEditable(oEvent.getSource().getState());

		oView.byId("saleGeneralTCKN").setEditable(oEvent.getSource().getState());

		oView.byId("saleGeneralTaxCenter").setEditable(oEvent.getSource().getState());

		//      oView.byId("saleGeneralCity").setEditable(oEvent.getSource().getState());

		//      oView.byId("saleGeneralCitypart").setEditable(oEvent.getSource().getState());

		oView.byId("saleGeneralCityLive").setEditable(oEvent.getSource().getState());

		oView.byId("saleGeneralCityPartLive").setEditable(oEvent.getSource().getState());

		oView.byId("saleGeneralAddress").setEditable(oEvent.getSource().getState());

	},

	/**































































































































* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered































































































































* (NOT before the first rendering! onInit() is used for that one!).































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	//  onBeforeRendering: function() {

	//

	//  },

	/**































































































































* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.































































































































* This hook is the same one that SAPUI5 controls get after being rendered.































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	//  onAfterRendering: function() {

	//

	//  },

	/**































































































































* Called when the Controller is destroyed. Use this one to free resources and finalize activities.































































































































* @memberOf zui5_ttg_app001.Sale































































































































*/

	//  onExit: function() {

	//

	//  }

	onCityValueHelpRequest: function() {

		oCityList.getBinding("items").filter(new sap.ui.model.Filter("text", sap.ui.model.FilterOperator.Contains, ""));

		if (!this.oSelectCityDialog) {

			this.oSelectCityDialog = new sap.m.Dialog({

				title: "İl seçiniz",

				rightButton: new sap.m.Button({

					text: "İptal",

					type: sap.m.ButtonType.Emphasized,

					icon: "sap-icon://decline",

					press: function() {

						this.oParent.close();

					}

				}),

				content: [































































































































                     new sap.m.SearchField({

						liveChange: function(oEvent) {

							var param = oEvent.getParameter("newValue");

							var oFilter = new sap.ui.model.Filter("text",

								sap.ui.model.FilterOperator.Contains,

								param);

							oCityList.getBinding("items").filter(oFilter);

						}

					}),































































































































                     oCityList































































































































                     ]

			});

		} else {

			this.oSelectCityDialog.getContent()[0].setValue("");

		}

		this.oSelectCityDialog.open();

	},

	onCitypartValueHelpRequest: function() {

		oCitypartList.getBinding("items").filter(new sap.ui.model.Filter("CityName", sap.ui.model.FilterOperator.Contains, ""));

		if (!this.oSelectCitypartDialog) {

			this.oSelectCitypartDialog = new sap.m.Dialog({

				title: "İlçe seçiniz",

				rightButton: new sap.m.Button({

					text: "İptal",

					type: sap.m.ButtonType.Emphasized,

					icon: "sap-icon://decline",

					press: function() {

						this.oParent.close();

					}

				}),

				content: [































































































































                     new sap.m.SearchField({

						liveChange: function(oEvent) {

							var param = oEvent.getParameter("newValue");

							var oFilter = new sap.ui.model.Filter("CityName",

								sap.ui.model.FilterOperator.Contains,

								param);

							oCitypartList.getBinding("items").filter(oFilter);

						}

					}),































































































































                     oCitypartList































































































































                     ]

			});

		} else {

			this.oSelectCitypartDialog.getContent()[0].setValue("");

		}

		this.oSelectCitypartDialog.open();

	},

	cityListPress: function(oEvent) {

		var oView = sap.ui.getCore().byId("Sale");

		var oToken = new sap.m.Token({

			key: oEvent.getSource().getDescription(),

			text: oEvent.getSource().getTitle()

		});

		var aTokens = [oToken];

		oView.byId("saleGeneralCity").setTokens(aTokens);

		oEvent.getSource().getParent().getParent().close();

	},

	citypartListPress: function(oEvent) {

		var oView = sap.ui.getCore().byId("Sale");

		var oToken = new sap.m.Token({

			key: oEvent.getSource().getDescription(),

			text: oEvent.getSource().getTitle()

		});

		var aTokens = [oToken];

		oView.byId("saleGeneralCitypart").setTokens(aTokens);

		oEvent.getSource().getParent().getParent().close();

	},

	cityTokenChange: function(oEvent) {

		var oView = sap.ui.getCore().byId("Sale");

		oCitypartList.removeAllItems();

		oView.byId("saleGeneralCitypart").removeAllTokens();

		if (oEvent.getSource().getTokens().length <= 0) return;

		sCityCode = oEvent.getSource().getTokens()[0].getKey();

		var oView = sap.ui.getCore().byId("Sale");

		var that = oView.getController();

		var oBusyDialog = new sap.m.BusyDialog({

			text: "Lütfen bekleyiniz"

		});

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		var oFilter = [new sap.ui.model.Filter("CityCode", sap.ui.model.FilterOperator.EQ, sCityCode)];

		var mParameters = {

			async: true,

			filters: oFilter,

			urlParameters: null,

			success: function(oData) {

				var oModel = new sap.ui.model.json.JSONModel();

				var dataObj = {

					"oData": oData

				};

				oModel.setData(dataObj);

				if (oCitypartList.getModel())

					oCitypartList.bindAggregation("items", "/oData/results", new sap.m.StandardListItem({

					title: "{CityName}",

					description: "{CityCode}",

					type: sap.m.ListType.Active,

					press: that.citypartListPress

				}));

				oCitypartList.setModel(oModel);

				oBusyDialog.close();

			},

			error: function() {

				oBusyDialog.close();

				var oMessageData = {

					TYPE: "E",

					MESSAGE: "Bağlantı hatası!"

				};

				that.showMessage(oMessageData);

			}

		};

		oBusyDialog.open();

		oModel.read("/distinctSet", mParameters);

	},

	saleInfoValidation: function() {

	},

	onMultiInputLiveChange: function(oEvent) {

		if (oEvent.getSource().getValue().length > 0) {

			oEvent.getSource().setValue("");

			sap.m.MessageToast.show("Giriş yardımı kullanarak seçin!");

		}

	},

	onSuggestCity: function(oEvent) {

		var sVal = oEvent.getParameter("suggestValue");

		var aFilters = [];

		if (sVal) {

			aFilters.push(new sap.ui.model.Filter("text", sap.ui.model.FilterOperator.StartsWith, sVal))

		}

		oEvent.getSource().getBinding("suggestionItems").filter(aFilters);

		if (oEvent.getSource().getSuggestionItems().length == 1) {

			oEvent.getSource().setValue(oEvent.getSource().getSuggestionItems()[0].getText());

		}

	},

	//  onCitySuggestionSelected  : function(oEvent) {

	//    console.log(oEvent.getSource());

	//  },

	onCitySuggestionSelected: function(oEvent) {

		var oItem = oEvent.getParameter("selectedItem");

		var sCityCode = oItem.mProperties.key;

		console.log("SelectedKey", sCityCode);

		sSelectedCityCode = sCityCode;

		var oView = sap.ui.getCore().byId("Sale");

		oView.byId("saleGeneralCityLive").setValue(oItem.mProperties.text);

		oView.byId("saleGeneralCityPartLive").removeAllSuggestionItems();

		oView.byId("saleGeneralCityPartLive").setValue("");

		if (sCityCode == "00" || sCityCode == "") return;

		var oBusyDialog = new sap.m.BusyDialog({

			text: "Lütfen bekleyiniz"

		});

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		var oFilter = [new sap.ui.model.Filter("CityCode", sap.ui.model.FilterOperator.EQ, sCityCode)];

		var mParameters = {

			async: true,

			filters: oFilter,

			urlParameters: null,

			success: function(oData) {

				for (var i = 1; i < oData.results.length; i++) {

					oView.byId("saleGeneralCityPartLive").addSuggestionItem(new sap.ui.core.Item({

						key: oData.results[i].CityCode,

						text: oData.results[i].CityName

					}));

				}

				//                        oView.byId("saleGeneralCityPartLive").setSelectedKey(oData.results[1].CityCode);

				oBusyDialog.close();

			},

			error: function() {

				oBusyDialog.close();

				var oMessageData = {

					TYPE: "E",

					MESSAGE: "Bağlantı hatası!"

				};

				oView.getController().showMessage(oMessageData);

			}

		};

		oBusyDialog.open();

		oModel.read("/distinctSet", mParameters);

	},

	fillCityPartSuggestionItems: function(sCityCode) {

		var oView = sap.ui.getCore().byId("Sale");

		oView.byId("saleGeneralCityPartLive").removeAllSuggestionItems();

		if (sCityCode == "00" || sCityCode == "") return;

		var oBusyDialog = new sap.m.BusyDialog({

			text: "Lütfen bekleyiniz"

		});

		var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);

		var oFilter = [new sap.ui.model.Filter("CityCode", sap.ui.model.FilterOperator.EQ, sCityCode)];

		var mParameters = {

			async: true,

			filters: oFilter,

			urlParameters: null,

			success: function(oData) {

				for (var i = 1; i < oData.results.length; i++) {

					oView.byId("saleGeneralCityPartLive").addSuggestionItem(new sap.ui.core.Item({

						key: oData.results[i].CityCode,

						text: oData.results[i].CityName

					}));

				}

				//                        oView.byId("saleGeneralCityPartLive").setSelectedKey(oData.results[1].CityCode);

				oBusyDialog.close();

			},

			error: function() {

				oBusyDialog.close();

				var oMessageData = {

					TYPE: "E",

					MESSAGE: "Bağlantı hatası!"

				};

				oView.getController().showMessage(oMessageData);

			}

		};

		oBusyDialog.open();

		oModel.read("/distinctSet", mParameters);

	},

	onCityPartSuggestionSelected: function(oEvent) {

		console.log("Suggestion Selected")

		var oItem = oEvent.getParameter("selectedItem");

		var sCityPartCode = oItem.mProperties.key;

		console.log("SelectedKey", sCityPartCode);

		sSelectedCityPartCode = sCityPartCode;

	}

});