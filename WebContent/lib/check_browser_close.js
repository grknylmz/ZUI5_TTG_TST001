var iSession;































































































































































































































































 































































































































































































































































function wireUpEvents() {































































































































































































































































































































































































































































































































  function goodbye(e) {        































































































































































































































































        iSession = parseInt(localStorage.getItem("sessionsFiori"));































































































































































































































































        iSession--;































































































































































































































































        localStorage.setItem("sessionsFiori", iSession.toString());































































































































































































































































  }































































































































































































































































  































































































































































































































































  window.onbeforeunload=goodbye;































































































































































































































































 































































































































































































































































}































































































































































































































































 































































































































































































































































// Wire up the events as soon as the DOM tree is ready































































































































































































































































$(document).ready(function() {































































































































































































































































	wireUpEvents();































































































































































































































































  































































































































































































































































  	if(!localStorage.getItem("sessionsFiori"))































































































































































































































































  		iSession = 0;































































































































































































































































  	else































































































































































































































































  		iSession = parseInt(localStorage.getItem("sessionsFiori"));































































































































































































































































  































































































































































































































































  	iSession++;































































































































































































































































	































































































































































































































































	localStorage.setItem("sessionsFiori", iSession.toString());































































































































































































































































































































































































































































































































	if (parseInt(localStorage.getItem("sessionsFiori")) > 1) {































































































































































































































































		window.alert("Çoklu oturum açma mümkün değil!");































































































































































































































































		window.location.href = "about:blank";































































































































































































































































	}































































































































































































































































});































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































