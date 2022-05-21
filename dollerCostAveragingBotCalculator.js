	
class DCA_BotCalculator {

  // Private Feilds

  #coinName;
  #baseOrderBuyingPrice;
  #maxVolumeAvailable;
  #volumeStepScale;
  #priceDeviationToPlaceOrder;
  #priceDeviationStepScale;
  #maxOrderCount;
  #maxSafetyOrderCount;
  #percentageVolumeBoughtList;
  #totalPercentageVolumeBoughtList;
  #maxPercentageVolumeBought;
  #volumeBoughtList;
  #totalVolumeBoughtList;
  #totalPercentageDeviationFromBaseOrderPriceList;
  #maxPercentageDeviationFromBaseOrderPrice;
  #buyingPriceList;
  #averageBuyingPriceList;

  #decimalPrecision;
  
  // constructor

  constructor(coinName, baseOrderBuyingPrice, maxVolumeAvailable, volumeStepScale,
	priceDeviationToPlaceOrder, priceDeviationStepScale, decimalPrecision) {

	// Inputs
	this.#coinName = (typeof baseOrderBuyingPrice !== 'undefined') ? coinName : "Coin";
	this.#baseOrderBuyingPrice = (typeof baseOrderBuyingPrice !== 'undefined') ? baseOrderBuyingPrice : 1;

	this.#maxVolumeAvailable = (typeof maxVolumeAvailable !== 'undefined') ? maxVolumeAvailable : 100;
	this.#volumeStepScale = (typeof volumeStepScale !== 'undefined') ? volumeStepScale : 1;

	this.#priceDeviationToPlaceOrder = (typeof priceDeviationToPlaceOrder !== 'undefined') ? priceDeviationToPlaceOrder : 1;
	this.#priceDeviationStepScale = (typeof priceDeviationStepScale !== 'undefined') ? priceDeviationStepScale : 1;

	this.#decimalPrecision = (typeof decimalPrecision !== 'undefined') ? decimalPrecision : 8;

	// Outputs
	this.#maxOrderCount = this.#calculateMaxOrderCount();
	this.#maxSafetyOrderCount = this.#calculateMaxSafetyOrderCount();

	this.#percentageVolumeBoughtList = this.#calculatePercentageVolumeBoughtList();
	this.#totalPercentageVolumeBoughtList = this.#calculateTotalPercentageVolumeBoughtList();
	this.#maxPercentageVolumeBought = this.#calculateMaxPercentageVolumeBought();

	this.#volumeBoughtList = this.#calculateVolumeBoughtList();
	this.#totalVolumeBoughtList = this.#calculateTotalVolumeBoughtList();

	this.#totalPercentageDeviationFromBaseOrderPriceList = this.#calculateTotalPercentageDeviationFromBaseOrderPriceList();
	this.#maxPercentageDeviationFromBaseOrderPrice = this.#calculateMaxPercentageDeviationFromBaseOrderPrice();

	this.#buyingPriceList = this.#calculateBuyingPriceList();
	this.#averageBuyingPriceList = this.#calculateAverageBuyingPriceList();
  }

  /* ========================= Private Core Instance Methods ========================= */

  #calculateMaxOrderCount() {
	let tempTotalPercentageVolumeBought = 0;
	let tempTotalPercentageDeviationFromBaseOrderPrice = 0;
	let orderCount = 0;
	while (tempTotalPercentageVolumeBought <= 100 && tempTotalPercentageDeviationFromBaseOrderPrice <= 100) {
	  tempTotalPercentageVolumeBought = tempTotalPercentageVolumeBought + this.getVolumeStepScale() ** orderCount;
	  tempTotalPercentageVolumeBought = parseFloat(tempTotalPercentageVolumeBought.toPrecision(this.getDecimalPrecision()));
	  if (orderCount === 0)
		tempTotalPercentageDeviationFromBaseOrderPrice = 0;
	  else
		tempTotalPercentageDeviationFromBaseOrderPrice = tempTotalPercentageDeviationFromBaseOrderPrice +
		this.getPriceDeviationToPlaceOrder() * this.getPriceDeviationStepScale() ** (orderCount - 1);
	  tempTotalPercentageDeviationFromBaseOrderPrice = parseFloat(tempTotalPercentageDeviationFromBaseOrderPrice.toPrecision(this.getDecimalPrecision()));
	  orderCount++;
	}
	orderCount--;
	return orderCount;
  }

  #calculateMaxSafetyOrderCount() {
	return this.#maxOrderCount - 1;
  }
  /* ========================= Converts Values in a list upto a given precision ========================= */

  #convertFloatingListToPrecision(floatingList, precisionDigits) {
	for (let i = 0; i < floatingList.length; i++)
	  floatingList[i] = parseFloat(floatingList[i].toFixed(precisionDigits));
	return floatingList;
  }

  /*=================================================================*/

  #calculatePercentageVolumeBoughtList() {
	let tempPercentageVolumeBoughtList = [];
	for (let i = 0; i < this.getMaxOrderCount(); i++)
	  tempPercentageVolumeBoughtList.push(this.getVolumeStepScale() ** i);
	tempPercentageVolumeBoughtList = this.#convertFloatingListToPrecision(tempPercentageVolumeBoughtList, this.getDecimalPrecision());
	return tempPercentageVolumeBoughtList;
  }

  #calculateTotalPercentageVolumeBoughtList() {
	let tempTotalPercentageVolumeBoughtList = [];
	let tempTotalPercentageVolumeBought = 0;
	for (let i = 0; i < this.getMaxOrderCount(); i++) {
	  tempTotalPercentageVolumeBought = tempTotalPercentageVolumeBought + this.getPercentageVolumeBoughtList()[i];
	  tempTotalPercentageVolumeBoughtList.push(tempTotalPercentageVolumeBought);
	}
	tempTotalPercentageVolumeBoughtList = this.#convertFloatingListToPrecision(tempTotalPercentageVolumeBoughtList, this.getDecimalPrecision());
	return tempTotalPercentageVolumeBoughtList;
  }

  #calculateMaxPercentageVolumeBought() {
	return this.#totalPercentageVolumeBoughtList[this.getMaxOrderCount() - 1];
  }

  /*=================================================================*/

  #calculateVolumeBoughtList() {
	let tempVolumeBoughtList = [];
	for (let i = 0; i < this.getMaxOrderCount(); i++)
	  tempVolumeBoughtList.push(this.getMaxVolumeAvailable() * this.getPercentageVolumeBoughtList()[i] * 0.01);
	tempVolumeBoughtList = this.#convertFloatingListToPrecision(tempVolumeBoughtList, this.getDecimalPrecision());
	return tempVolumeBoughtList;
  }

  #calculateTotalVolumeBoughtList() {
	let totalVolumeBoughtList = [];
	for (let i = 0; i < this.getMaxOrderCount(); i++)
	  totalVolumeBoughtList.push(this.getMaxVolumeAvailable() * this.getTotalPercentageVolumeBoughtList()[i] * 0.01);
	totalVolumeBoughtList = this.#convertFloatingListToPrecision(totalVolumeBoughtList, this.getDecimalPrecision());
	return totalVolumeBoughtList;
  }

  /*=================================================================*/

  #calculateTotalPercentageDeviationFromBaseOrderPriceList() {
	let tempTotalPercentageDeviationFromBaseOrderPriceList = [];
	let tempTotalPercentageDeviationFromBaseOrderPrice = 0;
	for (let i = 0; i < this.getMaxOrderCount(); i++) {
	  if (i === 0)
		tempTotalPercentageDeviationFromBaseOrderPrice = 0;
	  else
		tempTotalPercentageDeviationFromBaseOrderPrice = tempTotalPercentageDeviationFromBaseOrderPrice +
		this.getPriceDeviationToPlaceOrder() * this.getPriceDeviationStepScale() ** (i - 1);
	  tempTotalPercentageDeviationFromBaseOrderPriceList.push(tempTotalPercentageDeviationFromBaseOrderPrice);
	}
	tempTotalPercentageDeviationFromBaseOrderPriceList = this.#convertFloatingListToPrecision(tempTotalPercentageDeviationFromBaseOrderPriceList, this.getDecimalPrecision());
	return tempTotalPercentageDeviationFromBaseOrderPriceList;
  };

  #calculateMaxPercentageDeviationFromBaseOrderPrice() {
	return this.#totalPercentageDeviationFromBaseOrderPriceList[this.getMaxOrderCount() - 1];
  }

  /*=================================================================*/

  #calculateBuyingPriceList() {
	let tempBuyingPriceList = [];

	for (let i = 0; i < this.getMaxOrderCount(); i++)
	  tempBuyingPriceList.push(this.getbaseOrderBuyingPrice() - this.getbaseOrderBuyingPrice() *
		this.getTotalPercentageDeviationFromBaseOrderPriceList()[i] * 0.01);


	tempBuyingPriceList = tempBuyingPriceList.map(function(element) {
	  if (element !== 0)
		return (element - element * 0.00075);
	  else
		return element;
	});

	tempBuyingPriceList = this.#convertFloatingListToPrecision(tempBuyingPriceList, this.getDecimalPrecision());
	return tempBuyingPriceList;
  }

  /*=================================================================*/

  #calculateAverageBuyingPriceList() {
	let tempAverageBuyingPriceList = [];
	let tempAvg = 0;

	for (let i = 0; i < this.getMaxOrderCount(); i++) {
	  tempAvg = tempAvg + this.getBuyingPriceList()[i] * this.getPercentageVolumeBoughtList()[i];
	  tempAverageBuyingPriceList.push(tempAvg / this.getTotalPercentageVolumeBoughtList()[i]);
	}
	tempAverageBuyingPriceList = this.#convertFloatingListToPrecision(tempAverageBuyingPriceList, this.getDecimalPrecision());
	return tempAverageBuyingPriceList
  }

  /* ========================= GET Methods ========================= */

  // Input GET Methods

  getCoinName() {
	return this.#coinName;
  }

  getbaseOrderBuyingPrice() {
	return this.#baseOrderBuyingPrice;
  }

  getMaxVolumeAvailable() {
	return this.#maxVolumeAvailable;
  }

  getVolumeStepScale() {
	return this.#volumeStepScale;
  }

  getPriceDeviationToPlaceOrder() {
	return this.#priceDeviationToPlaceOrder;
  }

  getPriceDeviationStepScale() {
	return this.#priceDeviationStepScale;
  }

  getDecimalPrecision() {
	return this.#decimalPrecision;
  }

  // Output GET Methods

  getMaxOrderCount() {
	return this.#maxOrderCount;
  }

  getMaxSafetyOrderCount() {
	return this.#maxSafetyOrderCount;
  }

  getPercentageVolumeBoughtList() {
	return this.#percentageVolumeBoughtList;
  }

  getTotalPercentageVolumeBoughtList() {
	return this.#totalPercentageVolumeBoughtList;
  }

  getMaxPercentageVolumeBought() {
	return this.#maxPercentageVolumeBought;
  }

  getVolumeBoughtList() {
	return this.#volumeBoughtList;
  }

  getTotalVolumeBoughtList() {
	return this.#totalVolumeBoughtList;
  }

  getTotalPercentageDeviationFromBaseOrderPriceList() {
	return this.#totalPercentageDeviationFromBaseOrderPriceList;
  }

  getMaxPercentageDeviationFromBaseOrderPrice() {
	return this.#maxPercentageDeviationFromBaseOrderPrice;
  }

  getBuyingPriceList() {
	return this.#buyingPriceList;
  }

  getAverageBuyingPriceList() {
	return this.#averageBuyingPriceList;
  }

  getAllInputBotParams() {
	document.getElementById("input001").innerHTML = this.getCoinName();
	document.getElementById("input002").innerHTML = this.getbaseOrderBuyingPrice();
	document.getElementById("input003").innerHTML = this.getMaxVolumeAvailable();
	document.getElementById("input004").innerHTML = this.getVolumeStepScale();
	document.getElementById("input005").innerHTML = this.getPriceDeviationToPlaceOrder();
	document.getElementById("input006").innerHTML = this.getPriceDeviationStepScale();
	document.getElementById("input007").innerHTML = this.getDecimalPrecision();
  }

  getAllOutputBotParams() {
	document.getElementById("output001").innerHTML = this.getMaxOrderCount();
	document.getElementById("output002").innerHTML = this.getMaxSafetyOrderCount();
	document.getElementById('output003').innerHTML = JSON.stringify(this.getPercentageVolumeBoughtList(), null, "&nbsp");
	document.getElementById('output004').innerHTML = JSON.stringify(this.getTotalPercentageVolumeBoughtList(), null, "&nbsp");
	document.getElementById("output005").innerHTML = this.getMaxPercentageVolumeBought();
	document.getElementById('output006').innerHTML = JSON.stringify(this.getVolumeBoughtList(), null, "&nbsp");
	document.getElementById('output007').innerHTML = JSON.stringify(this.getTotalVolumeBoughtList(), null, "&nbsp");
	document.getElementById('output008').innerHTML = JSON.stringify(this.getTotalPercentageDeviationFromBaseOrderPriceList(), null, "&nbsp");
	document.getElementById('output009').innerHTML = this.getMaxPercentageDeviationFromBaseOrderPrice();
	document.getElementById('output010').innerHTML = JSON.stringify(this.getBuyingPriceList(), null, "&nbsp");
	document.getElementById('output011').innerHTML = JSON.stringify(this.getAverageBuyingPriceList(), null, "&nbsp");
  }

  getAllBotParams() {
	this.getAllInputBotParams();
	this.getAllOutputBotParams();
	}
}

/* ========================= Creating Instance of DCA_BotCalculator class ========================= */

function calculate(){
	var coinName = document.getElementById("input001").value;
	var baseOrderBuyingPrice = document.getElementById("input002").value;
	var maxVolumeAvailable = document.getElementById("input003").value;
	var volumeStepScale = document.getElementById("input004").value;
	var priceDeviationToPlaceOrder = document.getElementById("input005").value;
	var priceDeviationStepScale = document.getElementById("input006").value;
	var decimalPrecision = document.getElementById("input007").value;
	let x = new DCA_BotCalculator(coinName, baseOrderBuyingPrice, maxVolumeAvailable, volumeStepScale,
		priceDeviationToPlaceOrder, priceDeviationStepScale, decimalPrecision);
	x.getAllBotParams();
	document.getElementById("op").style.display = "";
}