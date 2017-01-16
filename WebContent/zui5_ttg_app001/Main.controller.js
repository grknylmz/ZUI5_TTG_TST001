sap.ui.controller("zui5_ttg_app001.Main", {







/**







* Called when a controller is instantiated and its View controls (if available) are already created.







* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.







* @memberOf zui5_ttg_app001.Main







*/







  onInit: function() {







    this.model = new sap.ui.model.json.JSONModel();







    this.model.setData({







      messageNumber : "0"







    });







    this.getView().setModel(this.model, "number");







    var that = this;







    oMainController = that;







    oGlobalBusyDialog = new sap.m.BusyDialog({ text : "Lütfen bekleyiniz" });







    /** ---------------------------------------------------------------------------------------







     *  register event bus - !!! DO NOT CHANGE !!!







     *-------------------------------------------------------------------------------------- */ 







    if (!bInitialized) {







      var launchpadApp = sap.ui.getCore().byId("launchpadApp");







      this.oEventBus = sap.ui.getCore().getEventBus();







      this.oEventBus.subscribe("nav", "to", this.navTo, this);







      this.oEventBus.subscribe("nav", "back", this.navBack, this);







      this.oEventBus.subscribe("app", "mode", function(sChannelId, sEventId, oData){







        launchpadApp.setMode(oData.mode);







      }, this);







      jQuery.sap.require("jquery.sap.history");







      jQuery.sap.history({







        routes  : [







                   {







                     path   : "page",







                     handler  : function(params, navType){







                       if (!params || !params.id) {







                         jQuery.sap.log.error("Invalid parameter" + params);







                       }







                       else {







                         that.oEventBus.publish("nav", "to", {







                           viewId : params.id,







                           navType  : navType







                         })







                       }







                     }







                   }







                   ],







         defaultHandler : function(navType){







           that.oEventBus.publish("nav", "to", {







             viewId : "zui5_ttg_app001.Main",







             navType  : navType







           }) 







         }







      });







      $('head').append(







          $('<style/>', {







            id: 'styleObjectListAttribute',







            html: '.sapMObjLAttrDiv {width: 20% !important}'







          }));







    }







    /** ---------------------------------------------------------------------------------------







     *  register event bus - END







     *-------------------------------------------------------------------------------------- */ 







    // get initial user credentials







    var oBusyDialog = new sap.m.BusyDialog({ text : "Lütfen bekleyiniz" });







    var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);







    var mParameters = { async     : false,







              filters       : null,







              urlParameters   : null,







              success     : function(oData) {







                        if (oData.results.length <= 0 || oData.results[0].dependentDealersSet.results.length <= 0) {







                          noAuth = true;







                          return;







                        }







                        sLoginUser = oData.results[0].UserId;                                               







                        var sUserDescription = oData.results[0].UserId  + " - " +







                                     oData.results[0].Name  + " "   +







                                       oData.results[0].Surname;







//                                       + " / " +







//                                       oData.results[0].PositionType;







                        // added by CKAYMAZ on 19.10.2016







                        sDealerIDType = oData.results[0].Isofis;







                        that.getView().byId("launchpadUserDescription").setText(sUserDescription);







                        if (oData.results[0].Isactive != "X" || oData.results.length <= 0) {







                          var oMessageData = {







                              TYPE:"E", MESSAGE: oData.results[0].DealerId +







                              " Kodlu bayi aktif değil!"







                              };







                          that.showMessage(oMessageData);







                          return;







                        }







                        that.getView().byId("comboBoxBranch").removeAllItems();







                        for (var i = 0; i < oData.results[0].dependentDealersSet.results.length; i++) {







                          that.getView().byId("comboBoxBranch").addItem(new sap.ui.core.Item({







                            key : oData.results[0].dependentDealersSet.results[i].DealerId,







                            text: oData.results[0].dependentDealersSet.results[i].DealerId + " - " + oData.results[0].dependentDealersSet.results[i].Dealer







                          }));







                        }







                        sDealerID = oData.results[0].DealerId;







                        if (sap.ui.Device.system.phone)







                          that.getView().byId("comboBoxBranch").setWidth("200px");







                        that.getView().byId("comboBoxBranch").setSelectedKey(sDealerID);







                        that.getView().byId("comboBoxBranch").setTooltip(oData.results[0].Dealer);







                        var aUserTileSet = oData.results[0].userMenuSet.results;







                        that.setlaunchpadLayout(that.getView(), aUserTileSet);                        







                        oBusyDialog.close();







                        },







              error     : function() {







                        var oMessageData = { TYPE:"E", MESSAGE:"Bağlantı hatası!"};







                        that.showMessage(oMessageData);







                      }







            };







    oModel.read("/userInfoSet?$expand=userMenuSet,dependentDealersSet", mParameters);







    







    mParameters = {







    		async     		: true,







            filters       	: null,







            urlParameters   : null,







            success     	: function(oData) {







            	dealerAuthType = oData.Return;







            },







            error     		: function() {}







    };







    







    sReadString = "/checkDealerAuthSet('" + sDealerID + "')";







    oModel.read(sReadString, mParameters);







    







//    that.getView().setModel(oModel);







    oUserCreditsModel = oModel;







    // set main screen logo







    if (jQuery.device.is.phone)







      that.getView().byId("idMainLogo").setSrc("img/logo_sphere_s.png");







    // maintain CSS for forms







    if (!bInitialized) {







      if (!sap.ui.Device.system.phone || (sap.ui.Device.system.phone && sap.ui.Device.orientation.landscape)) {







        $('head').append(







          $('<style/>', {







            id: 'styleLandscape',







            html: '.sapUiRFLRow > .sapUiRFLContainer:first-child > .sapUiRFLContainerContent.sapUiRFLPaddingClass:first-child {padding-top: 1rem }'







          }));







      }







      $( window ).on( "orientationchange", function( event ) {







        if(event.orientation == "portrait"){  







          $('#styleLandscape').remove();







        } else {







          $('head').append(







            $('<style/>', {







              id: 'styleLandscape',







              html: '.sapUiRFLRow > .sapUiRFLContainer:first-child > .sapUiRFLContainerContent.sapUiRFLPaddingClass:first-child {padding-top: 1rem }'







            }));







        }







      });







      /* if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {







        $('head').append(







            $('<style/>', {







              id: 'styleTileFont',







              html: '.sapMStdTileTitle { font-size: 0.55rem !important; }'







            }));







      } */







      that.getView().addEventDelegate({







        onBeforeShow : jQuery.proxy(function(evt) {







          that.onBeforeShow(evt);







        }, that) });







    };







//    that.setTimer();







    that.setMessageNumber();







    bInitialized = true;







  },







  onBeforeShow  : function() {







    this.getView().byId("comboBoxBranch").setSelectedKey(sDealerID);







  },







/**







* Event handler for branch selection







* @memberOf zui5_ttg_app001.Main







*/







  onBranchSelection : function(oEvent) {







    sDealerID = oEvent.getSource().getSelectedKey();







    oEvent.getSource().setTooltip(oEvent.getSource().getSelectedItem().getText());







    var oView = oEvent.getSource().oParent.oParent.oParent.oParent.oParent;







    var oBusyDialog = new sap.m.BusyDialog({ text : "Lütfen bekleyiniz" });







    var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", false);







    var oFilter = [ new sap.ui.model.Filter("dealerID", sap.ui.model.FilterOperator.EQ, oEvent.getSource().getSelectedKey()) ];







    var sReadString = "";







    var mParameters = { async     : true,







              filters       : oFilter,







              urlParameters   : null,







              success     : function(oData) {







                        var aUserTileSet = oData.results;







                        oView.getController().setlaunchpadLayout(oView, aUserTileSet);







                        oBusyDialog.close();







                          },







              error     : function() {







                        oBusyDialog.close();







                        var oMessageData = { TYPE:"E", MESSAGE:"Bağlantı hatası!"};







                          }







              };







    oBusyDialog.open();







    oModel.read("/userMenuSet", mParameters); 







    oView.getController().setMessageNumber();







    







    mParameters = {







    		async     		: true,







            filters       	: null,







            urlParameters   : null,







            success     	: function(oData) {







            	dealerAuthType = oData.Return;







            },







            error     		: function() {}







    };







    







    sReadString = "/checkDealerAuth(" + sDealerID + "')";







    oModel.read(sReadString, mParameters);







  },







/**







* Set launch pad layout according to authorization







* @memberOf zui5_ttg_app001.Main







*/







  setlaunchpadLayout  : function(oView, aTileSet) {







   var bTitleS = false,







      bTitleR = false,







      bTitleT = false,







      oTile;







    if (aTileSet.length <= 0) return;







//    destroy tiles







    oView.byId("launchpadContainer1").removeAllTiles();







    oView.byId("launchpadContainer2").removeAllTiles();







    oView.byId("launchpadContainer3").removeAllTiles();







//    add tiles







    for (var i = 0; i < aTileSet.length; i++) {







        if (aTileSet[i].Menuid.indexOf("S") != -1){







        	oTile = oView.byId(aTileSet[i].Menuid);







        	oView.byId("launchpadContainer1").addTile(oTile);







        }







        else if (aTileSet[i].Menuid.indexOf("R") != -1){







        	oTile = oView.byId(aTileSet[i].Menuid);







        	oView.byId("launchpadContainer2").addTile(oTile);







        }







        else if (aTileSet[i].Menuid.indexOf("T") != -1){







        	oTile = oView.byId(aTileSet[i].Menuid);







        	oView.byId("launchpadContainer3").addTile(oTile);







        }        	







        if (aTileSet[i].Menuid.indexOf("S") != -1) bTitleS = true;







        if (aTileSet[i].Menuid.indexOf("R") != -1) bTitleR = true;







        if (aTileSet[i].Menuid.indexOf("T") != -1) bTitleT = true;







      }







/*    // set all tiles invisible







    oView.byId("S01").setVisible(false); oView.byId("S02").setVisible(false); oView.byId("S03").setVisible(false);







    oView.byId("R01").setVisible(false); oView.byId("R02").setVisible(false); oView.byId("R03").setVisible(false);







    oView.byId("R04").setVisible(false); oView.byId("T01").setVisible(false); oView.byId("T02").setVisible(false);







    //CKAYMAZ on 31.10.2016







    oView.byId("T03").setVisible(false);







    // set tiles visible







    for (var i = 0; i < aTileSet.length; i++) {







      oView.byId(aTileSet[i].Menuid).setVisible(true);







      if (aTileSet[i].Menuid.indexOf("S") != -1) bTitleS = true;







      if (aTileSet[i].Menuid.indexOf("R") != -1) bTitleR = true;







      if (aTileSet[i].Menuid.indexOf("T") != -1) bTitleT = true;







    }







 */







    // set titles visible







//    oView.byId("lpGroupHeaderS").setVisible(bTitleS);







//    oView.byId("lpGroupHeaderR").setVisible(bTitleR);







//    oView.byId("lpGroupHeaderT").setVisible(bTitleT);







  },







/**







* Navigation !!! DO NOT CHANGE !!!







* @memberOf zui5_ttg_app001.Main







*/







  navTo : function(sChannelId, sEventId, oData) {







    var that = this;







    var launchpadApp = sap.ui.getCore().byId("launchpadApp"),







      sViewName    = oData.viewName,







      sViewId    = oData.viewId,







      oDataObject  = oData.data,







      sNavType   = oData.navType,







      prodListSelect,







      bMaster,







      oView;







    if (sViewName == "zui5_ttg_app001.Main");







      this.setMessageNumber();







    sap.ui.core.BusyIndicator.show(0);







    // get product split app







    if (sap.ui.getCore().byId("Product") != undefined)







      productApp   = sap.ui.getCore().byId("Product").byId("ProductSplitApp");







    // check if from product list selection







    if (oData.data != undefined)







      prodListSelect = oData.data.prodListSelect ? true : false;







    else







      prodListSelect = false;







    if (!sViewId)







      sViewId = sViewName;







    // back navigation







    if (sNavType === jQuery.sap.history.NavType.Back) {







      if (prodListSelect) {







        var bMaster = (sViewId.indexOf("zui5_ttg_app001.") !== -1);







        if (bMaster) productApp.backMaster();







      }







      else







        launchpadApp.back();







    }







    // forward navigation







    else { 







      if (prodListSelect) {







        bMaster = (sViewId.indexOf("zui5_ttg_app001.") !== -1);







        if (!sap.ui.getCore().byId(sViewId)) {







          oView = sap.ui.xmlview(sViewId, sViewName);







          (bMaster) ? productApp.addMasterPage(oView) : productApp.addDetailPage(oView);







        }







        (bMaster) ? productApp.toMaster(sViewId, oDataObject) : productApp.toDetail(sViewId, oDataObject);







      }







      else {







        if (!sap.ui.getCore().byId(sViewId)) {







          oView = sap.ui.xmlview(sViewId, sViewName);







          launchpadApp.addPage(oView);







        }







        launchpadApp.to(sViewId, oDataObject);







      }







    }







    if (!sNavType && (bMaster || jQuery.device.is.phone)) {







      jQuery.sap.history.addHistory("page", {id: sViewId}, false);







    }







    sap.ui.core.BusyIndicator.hide();







  },







/**







* Back navigation !!! DO NOT CHANGE !!!







* @memberOf zui5_ttg_app001.Main







*/







  navBack : function(sChannelId, sEventId, oData) {







    jQuery.sap.history.back();







  },







/**







* Tile navigation







* @memberOf zui5_ttg_app001.Main







*/







  toSale  : function() {







    sap.ui.getCore().getEventBus().publish(







        "nav", 







        "to", {







          viewName: "zui5_ttg_app001.Sale",







          viewId: "Sale",







          data: {







             saleType: "S"







          }







      });







  },







  toHizmet  : function() {







    sap.ui.getCore().getEventBus().publish(







        "nav", 







        "to", {







          viewName: "zui5_ttg_app001.Sale",







          viewId: "Sale",







          data: {







             saleType: "H"







          }







      });







  },







  toPendingSales  : function() {







    sap.ui.getCore().getEventBus().publish(







        "nav", 







        "to", {







          viewName: "zui5_ttg_app001.PendingSales",







          viewId: "PendingSales"







      });







  },







  toSaleReport  : function() {







    sap.ui.getCore().getEventBus().publish(







        "nav", 







        "to", {







          viewName: "zui5_ttg_app001.SaleReport",







          viewId: "SaleReport"







      });







  },







  toProduct : function() {







    this.initializeProduct();







    sap.ui.getCore().getEventBus().publish(







        "nav", 







        "to", {







         viewName: "zui5_ttg_app001.Product",







         viewId: "Product"







      });







  },







  toMyRequests  : function() {







    sap.ui.getCore().getEventBus().publish(







        "nav", 







        "to", {







         viewName: "zui5_ttg_app001.Requests",







         viewId: "Requests"







      });







  },







  toMyMessages  : function() {







    sap.ui.getCore().getEventBus().publish(







        "nav", 







        "to", {







         viewName: "zui5_ttg_app001.Messages",







         viewId: "Messages"







      });







  },







  toPublishMessage  : function() {







    sap.ui.getCore().getEventBus().publish(







        "nav", 







        "to", {







         viewName: "zui5_ttg_app001.PublishMessage",







         viewId: "PublishMessage"







      });







  },







  toBatchPrice  : function() {







    sap.ui.getCore().getEventBus().publish(







        "nav", 







        "to", {







         viewName: "zui5_ttg_app001.BatchPrice",







         viewId: "BatchPrice"







      });







  },







  toBatchProduct  : function() {







    sap.ui.getCore().getEventBus().publish(







        "nav", 







        "to", {







         viewName: "zui5_ttg_app001.BatchProduct",







         viewId: "BatchProduct"







      });







  },







  logout  : function(oEvent) {







    var that = this;







    var sViewId;







    if (oEvent != undefined && oEvent.sId == "press")







      sViewId = "Logoff";







    else







      sViewId = "NotFound";







    console.log(sViewId);







    sap.ui.getCore().getEventBus().publish(







          "nav", 







          "to", {







           viewName: "zui5_ttg_app001." + sViewId,







           viewId: sViewId







        });







    var oBusyDialog = new sap.m.BusyDialog({ text : "Lütfen bekleyiniz" });







    oBusyDialog.open();







     $.ajax({  







             type: "POST",







             url: "/sap/public/bc/icf/logoff",  //Clear SSO cookies: SAP Provided service to do that  







          }).done(function(data){ 







                    // clear cookies







                    that.delete_cookie("MYSAPSSO2");







                    that.delete_cookie("saplb_*");







                    that.delete_cookie("JSESSIONID");







                    that.delete_cookie("JSESSIONMARKID");







                    that.delete_cookie("OAM_ID");







                    that.delete_cookie("OAMAuthCookie_turktelekom");







                    that.delete_cookie("sap-usercontext");







                    that.delete_cookie("SAP_SESSIONID_GGD_100");







                    oBusyDialog.close();







                    // clear the authentication header stored in the browser  







                              if (!document.execCommand("ClearAuthenticationCache")) {  







                                   // for other browsers  







                                   $.ajax({  







                                                 type: "GET",  







                                                 url: "/sap/opu/odata/SOME/SERVICE/", //any URL to a Gateway service  







                                                 username: 'dummy', //dummy credentials: when request fails, will clear the authentication header  







                                                 password: 'dummy',  







                                                 statusCode: { 401: function() {  







                                                     //This empty handler function will prevent authentication pop-up in chrome/firefox







                                                 } },  







                                                 error: function() {  







                                                 }  







                                  });  







                              }  







          });







  },







  delete_cookie : function(name) {







    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';







  },







  setTimer  : function(){







    console.log("timer object created");







    oSwitcher = setInterval(this.setMessageNumber, 60000);







  },







  setMessageNumber  : function() {







    var oFilter = [ new sap.ui.model.Filter("DealerId", sap.ui.model.FilterOperator.EQ, sDealerID),







                    new sap.ui.model.Filter("Isread",   sap.ui.model.FilterOperator.EQ, "") ];







    var mParameters = { async     : true,







              filters       : oFilter,







              urlParameters   : null,







              success     : function(oData) {







                oMainController.model.setProperty("/messageNumber", oData.results.length.toString());







              },







              error     : function() {







              }







        };







    var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZGW_AKILLI_KASA_SRV_01/", true);







    oModel.read("/messageListSet", mParameters);







  },







  initializeProduct : function() {







    if (!sap.ui.getCore().byId("Product")) return;







    var productApp = sap.ui.getCore().byId("Product").byId("ProductSplitApp");







    var master = productApp.getMasterPages()[0];







    master.byId("prodSearchField").setValue("");







    master.byId("productList").removeAllItems();







    productApp.backToTopDetail();







  },







  showMessage : function(data) {







    jQuery.sap.require("sap.m.MessageBox");







    var oIcon, sTitle;







    switch (data.TYPE) {







    case "S": oIcon = sap.m.MessageBox.Icon.SUCCESS;   break;







    case "I": oIcon = sap.m.MessageBox.Icon.INFORMATION; break;







    case "E": oIcon = sap.m.MessageBox.Icon.ERROR;     break;







    case "W": oIcon = sap.m.MessageBox.Icon.WARNING;   break;







    default: break;







    }







      sap.m.MessageBox.show( data.MESSAGE, { icon   : oIcon,







                           title  : sTitle,







                                   actions  : [sap.m.MessageBox.Action.OK],







                             });







  },







/**







* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered







* (NOT before the first rendering! onInit() is used for that one!).







* @memberOf zui5_ttg_app001.Main







*/







//  onBeforeRendering: function() {







//







//  },







/**







* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.







* This hook is the same one that SAPUI5 controls get after being rendered.







* @memberOf zui5_ttg_app001.Main







*/







  onAfterRendering: function() {







//    this.getView().byId("comboBoxBranch").setSelectedKey(sDealerID);







    if (noAuth) this.logout();







  },







/**







* Called when the Controller is destroyed. Use this one to free resources and finalize activities.







* @memberOf zui5_ttg_app001.Main







*/







//  onExit: function() {







//







//  }







});