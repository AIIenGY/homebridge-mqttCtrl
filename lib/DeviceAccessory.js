'use strict';

var Service, Characteristic;

module.exports = function (service, characteristic) {
  Service = service;
  Characteristic = characteristic;

  return DeviceAccessory;
};

function DeviceAccessory(platform, accessory) {
    this.status = false;
    this.platform = platform;
    this.accessory = accessory;
    this.log = platform.log;
    this.context = accessory.context;
    this.mqttPub = platform.mqttPub;
}

DeviceAccessory.prototype.getStatus = function(callback) {
    var self = this;

    if (this.accessory.reachable === true) {
        this.log("DeviceAccessory(" + this.context.id + ") getStatus" );
        var reqStatusMsg = {
            gwID: this.context["gwID"],
            msg: '{"message":"request status","device":{"address":"' + this.context.id + '"}}'
        };
        this.mqttPub(this.platform, reqStatusMsg);
        
        callback(null, self.status);
    } else {
        callback ("no_response");
    }
}

DeviceAccessory.prototype.setStatus = function(status, callback, context) {
    this.log("DeviceAccessory(" + this.context.id + ") setStatus:" + status );

    if(context !== 'fromSetValue') {
        var st = status?"On":"Off";
        var mqttMsg = {
            gwID : this.context["gwID"],
            msg: '{"message":"set status","device":{"address":"' + this.context.id + '","status":"' + st + '"}}'
        };

        this.mqttPub(this.platform, mqttMsg);
    }
    callback();
}

DeviceAccessory.prototype.processMQTT = function(json) {
    var self = this;
    var switchService = this.accessory.getService(Service.Switch);

    this.log("DeviceAccessory processMQTT id:" + json.device.address);

    if(this.context.id == json.device.address){
        if((json.message == "status changed")
            || (json.message === "device properties changed")){
                    
            if(json.device.status === "On"){
                this.status = true;
            }else{
                this.status = false;
            }

            switchService.getCharacteristic(Characteristic.On)
                .setValue(self.status, undefined, 'fromSetValue');
        }else if (json.message == "device add") {
            this.accessory.updateReachability(true);
        } else if (json.message == "device remove") {
            this.accessory.updateReachability(false);
        }
    }
}
