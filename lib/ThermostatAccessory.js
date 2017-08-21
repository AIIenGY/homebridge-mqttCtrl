'use strict'

var Service, Characteristic;

const HOMEKIT_AC_MODE_OFF = 0;
const HOMEKIT_AC_MODE_HEAT = 1;
const HOMEKIT_AC_MODE_COOL = 2;
const HOMEKIT_AC_MODE_AUTO = 3;

const SMARTHOME_AC_MODE_HEAT = 4;
const SMARTHOME_AC_MODE_FAN = 3;
const SMARTHOME_AC_MODE_DRY = 2;
const SMARTHOME_AC_MODE_COOL = 1;
const SMARTHOME_AC_MODE_AUTO = 0;

module.exports = function (service, characteristic) {
    Service = service;
    Characteristic = characteristic;

    return ThermostatAccessory;
};


function ThermostatAccessory(platform, accessory) {
    this.status                     = true;
    this.TargetTemperature          = 26;
    this.TargetHeatingCoolingState  = 3;
    this.CurrentHeatingCoolingState = 3;
    this.CurrentTemperature         = 26;
    this.TemperatureDisplayUnits    = 0;
    //this.FanSpeed                   = 0;

    this.platform = platform;
    this.accessory = accessory;
    this.log = platform.log;
    this.context = accessory.context;
    this.mqttPub = platform.mqttPub;
}

ThermostatAccessory.prototype.getTargetHeatingCoolingState = function(callback) {
    var self = this; 

    if (this.accessory.reachable === true) {
        /* If user configure the AC by control pannel on the wall, AC will not send the status to gateway,
         * so we need to query the status each time the Home APP query the status */
        var reqStatusMsg = '{"message":"request status","device":{"address":"' + this.context.id + '"}}';
        this.mqttPub(this.platform, reqStatusMsg);

        this.log("ThermostatAccessory(" + this.context.id + ") getTargetHeatingCoolingState " + this.TargetHeatingCoolingState);
        callback(null, self.TargetHeatingCoolingState);
    } else {
        callback ("no_response");
    }
}

ThermostatAccessory.prototype.getTargetTemperature = function(callback) {
    var self = this;

    if (this.accessory.reachable === true) {
        this.log("ThermostatAccessory(" + this.context.id + ") getTargetTemperature " + this.TargetTemperature);
        callback(null, self.TargetTemperature);
    } else {
        callback ("no_response");
    }
}

ThermostatAccessory.prototype.getCurrentTemperature = function(callback) {
    var self = this;

    if (this.accessory.reachable === true) {
        this.log("ThermostatAccessory(" + this.context.id + ") getCurrentTemperature " + this.CurrentTemperature);
        callback(null, self.CurrentTemperature);
    } else {
        callback ("no_response");
    }
}

ThermostatAccessory.prototype.getTemperatureDisplayUnits = function(callback) {
    var self = this;

    if (this.accessory.reachable === true) {
        this.log("ThermostatAccessory(" + this.context.id + ") getTemperatureDisplayUnits " + this.TemperatureDisplayUnits);
        callback(null, self.TemperatureDisplayUnits);
    } else {
        callback ("no_response");
    }
}

ThermostatAccessory.prototype.getCurrentHeatingCoolingState = function(callback) {
    var self = this;

    if (this.accessory.reachable === true) {
        this.log("ThermostatAccessory(" + this.context.id + ") getCurrentHeatingCoolingState " + this.CurrentHeatingCoolingState);
        callback(null, self.CurrentHeatingCoolingState);
    } else {
        callback ("no_response");
    }
}

ThermostatAccessory.prototype.setTargetTemperature = function(TargetTemperature, callback, context) {
    this.log("ThermostatAccessory(" + this.context.id + ") setTargetTemperature:" + TargetTemperature);

    if(context !== 'fromSetValue') {
        this.TargetTemperature = TargetTemperature;
     
        var mqttMsg = '{"message":"set device properties","device":{"address":"' + this.context.id + '","properties":{"temperature":'+ this.TargetTemperature+',"mode":0,"speed":0,"direction":0,"change":"temperature"}}}';

        //call publish mqtt message from index.js
        this.mqttPub(this.platform, mqttMsg);
    }

    callback();
}


ThermostatAccessory.prototype.setTargetHeatingCoolingState = function(TargetHeatingCoolingState, callback, context) {
  this.log("ThermostatAccessory(" + this.context.id + ") setTargetHeatingCoolingState:" + TargetHeatingCoolingState );

    if(context !== 'fromSetValue') {
      this.TargetHeatingCoolingState = TargetHeatingCoolingState;
      var mqttMsg;

      switch (this.TargetHeatingCoolingState) {
        case HOMEKIT_AC_MODE_OFF:
        {
            //turn device off
            var mqttMsg = '{"message":"set status","device":{"address":"' + this.context.id + '","status":"Off"}}';
            this.mqttPub(this.platform, mqttMsg);
        }
        break;
        case HOMEKIT_AC_MODE_HEAT:
        {
            /* AC_MODE_HEAT */
            if (this.status === false) {
                var StmqttMsg = '{"message":"set status","device":{"address":"' + this.context.id + '","status":"On"}}';
                this.mqttPub(this.platform, StmqttMsg);
            }

            var mqttMsg = '{"message":"set device properties","device":{"address":"' + this.context.id + '","properties":{"temperature":26,"mode":'+SMARTHOME_AC_MODE_HEAT+',"speed":0,"direction":0,"change":"mode"}}}';
            this.mqttPub(this.platform, mqttMsg);
        }
        break;
        case HOMEKIT_AC_MODE_COOL:
        {
            /* AC_MODE_COOL  */
            if (this.status === false) {
                var StmqttMsg = '{"message":"set status","device":{"address":"' + this.context.id + '","status":"On"}}';
                this.mqttPub(this.platform, StmqttMsg);
            }

            var mqttMsg = '{"message":"set device properties","device":{"address":"' + this.context.id + '","properties":{"temperature":26,"mode":'+SMARTHOME_AC_MODE_COOL+',"speed":0,"direction":0,"change":"mode"}}}';
            this.mqttPub(this.platform, mqttMsg);
        }
        break;
        case HOMEKIT_AC_MODE_AUTO:
        {
            /* AC_MODE_AUTO  */
            if (this.status === false) {
                var StmqttMsg = '{"message":"set status","device":{"address":"' + this.context.id + '","status":"On"}}';
                this.mqttPub(this.platform, StmqttMsg);
            }

            var mqttMsg = '{"message":"set device properties","device":{"address":"' + this.context.id + '","properties":{"temperature":26,"mode":'+SMARTHOME_AC_MODE_AUTO+',"speed":0,"direction":0,"change":"mode"}}}';
            this.mqttPub(this.platform, mqttMsg);
        }
        break;
        default:
          this.log("Unkown TargetHeatingCoolingState: " + this.TargetHeatingCoolingState);
          break;
    }
  }
  
  callback();
}

ThermostatAccessory.prototype.processMQTT = function(json) {
    var self = this;
    var thermostatService = this.accessory.getService(Service.Thermostat);

    this.log("ThermostatAccessory processMQTT:" + JSON.stringify(json));

    if(this.context.id == json.device.address) {
        if((json.message == "status changed")
            || (json.message === "device properties changed")){
                
            this.CurrentTemperature = parseInt(json.device.properties.temperature);
            this.TargetTemperature = this.CurrentTemperature;
                
            if(json.device.status === "On"){
                this.status = true;

                var mode = parseInt(json.device.properties.mode);
                switch(mode){
                    case SMARTHOME_AC_MODE_AUTO:
                        this.CurrentHeatingCoolingState = HOMEKIT_AC_MODE_AUTO;
                        this.TargetHeatingCoolingState = HOMEKIT_AC_MODE_AUTO;
                        break;
                    case SMARTHOME_AC_MODE_COOL:
                        this.CurrentHeatingCoolingState = HOMEKIT_AC_MODE_HEAT;
                        this.TargetHeatingCoolingState = HOMEKIT_AC_MODE_HEAT;
                        break;
                    case SMARTHOME_AC_MODE_HEAT:
                        this.CurrentHeatingCoolingState = HOMEKIT_AC_MODE_COOL;
                        this.TargetHeatingCoolingState = HOMEKIT_AC_MODE_COOL;
                        break;
                    default:
                        this.CurrentHeatingCoolingState = HOMEKIT_AC_MODE_AUTO;
                        this.TargetHeatingCoolingState = HOMEKIT_AC_MODE_AUTO;
                        break;
                }
            }else{
                this.status = false;
                this.CurrentHeatingCoolingState = HOMEKIT_AC_MODE_OFF;
                this.TargetHeatingCoolingState = HOMEKIT_AC_MODE_OFF;
            }
            
            thermostatService.getCharacteristic(Characteristic.CurrentTemperature)
            .setValue(self.CurrentTemperature, undefined, 'fromSetValue');
            
            thermostatService.getCharacteristic(Characteristic.TargetTemperature)
            .setValue(self.TargetTemperature, undefined, 'fromSetValue');
            
            thermostatService.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
            .setValue(self.CurrentHeatingCoolingState, undefined, 'fromSetValue');
                    
            thermostatService.getCharacteristic(Characteristic.TargetHeatingCoolingState)
                    .setValue(self.TargetHeatingCoolingState, undefined, 'fromSetValue');
            
        }else if (json.message == "device add") {
            this.accessory.updateReachability(true);
        }else if (json.message == "device remove") {
            this.accessory.updateReachability(false);
        }
    }
}
