'use strict';

var Service, Characteristic;

module.exports = function (service, characteristic) {
  Service = service;
  Characteristic = characteristic;

  return SensorAccessory;
};

function SensorAccessory(platform, accessory) {
    this.temperature = 26;
    this.humidity = 50;
    this.pm2_5 = 0;

    this.batteryLevel = 100;
    this.chargingState = Characteristic.ChargingState.NOT_CHARGING;
    this.statusLowBattery = Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;

    this.accessory = accessory;
    this.log = platform.log;
    this.context = accessory.context;
}

SensorAccessory.prototype.getTemp = function(callback) {
    var self = this;

    if (this.accessory.reachable === true) {
        this.log("SensorAccessory(" + this.context.id + ") getTemp " + this.temperature);
        //temperatureService.setCharacteristic(Characteristic.CurrentTemperature, this.temperature);
        callback(null, this.temperature);
    } else {
        callback ("no_response");
    }
}

SensorAccessory.prototype.getHumidity = function(callback) {
    var self = this;

    if (this.accessory.reachable === true) {
        this.log("SensorAccessory(" + this.context.id + ") getHumidity " + this.humidity);
        callback(null, this.humidity);
    } else {
        callback ("no_response");
    }
}

SensorAccessory.prototype.getAirQuality = function(callback) {
    var self = this;

    if (this.accessory.reachable === true) {
      this.log("SensorAccessory(" + this.context.id + ") getAirQuality " + IdxParse(self.pm2_5));

      callback(null, IdxParse(self.pm2_5));
    } else {
        callback ("no_response");
    }
}

SensorAccessory.prototype.getPM2_5 = function(callback) {
    var self = this;

    if (this.accessory.reachable === true) {
        this.log("SensorAccessory(" + this.context.id + ") getPM2_5 " + this.pm2_5);
        callback(null, this.pm2_5);
    } else {
        callback ("no_response");
    }
}

SensorAccessory.prototype.getBatteryLevel = function(callback) {
    var self = this;

    if (this.accessory.reachable === true) {
        this.log("SensorAccessory(" + this.context.id + ") getBatteryLevel " + this.batteryLevel);
        callback(null, this.batteryLevel);
    } else {
        callback ("no_response");
    }
}

SensorAccessory.prototype.getChargingState = function(callback) {
    var self = this;

    if (this.accessory.reachable === true) {
        this.log("SensorAccessory(" + this.context.id + ") getChargingState " + this.chargingState);
        callback(null, this.chargingState);
    } else {
        callback ("no_response");
    }
}

SensorAccessory.prototype.getStatusLowBattery = function(callback) {
    var self = this;

    if (this.accessory.reachable === true) {
        this.log("SensorAccessory(" + this.context.id + ") getStatusLowBattery " + this.statusLowBattery);
        callback(null, this.statusLowBattery);
    } else {
        callback ("no_response");
    }
}

SensorAccessory.prototype.processMQTT = function(json) {
    var self = this;
    var temperatureService = this.accessory.getService(Service.TemperatureSensor);
    var humidityService = this.accessory.getService(Service.HumiditySensor);
    var airQualityService = this.accessory.getService(Service.AirQualitySensor);
    var batteryService = this.accessory.getService(Service.BatteryService);

    //this.log("SensorAccessory processMQTT:" + json);

    if(this.context.id == json.device.address){
        if((json.message == "status changed")
            || (json.message === "device properties changed")){
            this.temperature = parseFloat(json.device.properties.temperature);
            temperatureService.setCharacteristic(Characteristic.CurrentTemperature, self.temperature);

            this.humidity = parseFloat(json.device.properties.humidity);
            humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, self.humidity);

            this.pm2_5 = parseInt(json.device.properties.PM2_5);
            airQualityService.setCharacteristic(Characteristic.PM2_5Density, self.pm2_5);
            airQualityService.setCharacteristic(Characteristic.AirQuality, IdxParse(self.pm2_5));

            this.batteryLevel = parseInt(json.device.properties.batteryPercent);
            batteryService.setCharacteristic(Characteristic.BatteryLevel, self.batteryLevel);
            if(this.batteryLevel < 20){
                this.statusLowBattery = Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                batteryService.setCharacteristic(Characteristic.BatteryLevel, self.statusLowBattery);
            }else{
                this.statusLowBattery = Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
                batteryService.setCharacteristic(Characteristic.BatteryLevel, self.statusLowBattery);
            }
        }else if (json.message == "device add") {
            this.accessory.updateReachability(true);
        } else if (json.message == "device remove") {
            this.accessory.updateReachability(false);
        }
    }
}

var IdxParse = function(pm2_5) {
    var qualityIdx = Characteristic.AirQuality.UNKNOWN;

    if( 0 <= pm2_5 && pm2_5 <= 12 ){
        qualityIdx = Characteristic.AirQuality.EXCELLENT;
    }else if( 13 <= pm2_5 && pm2_5 <= 35 ){
        qualityIdx = Characteristic.AirQuality.GOOD;
    }else if( 36 <= pm2_5 && pm2_5 <= 55 ){
        qualityIdx = Characteristic.AirQuality.FAIR;
    }else if( 56 <= pm2_5 && pm2_5 <= 155 ){
        qualityIdx = Characteristic.AirQuality.INFERIOR;
    }else if( 151 <= pm2_5 ){
        qualityIdx = Characteristic.AirQuality.POOR;
    }else{
        qualityIdx = Characteristic.AirQuality.UNKNOWN;
    }

    return qualityIdx;
}