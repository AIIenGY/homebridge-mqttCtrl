'use strict';

var Service, Characteristic;

module.exports = function (service, characteristic) {
  Service = service;
  Characteristic = characteristic;

  return SceneAccessory;
};

function SceneAccessory(platform, accessory) {
    this.platform = platform;
    this.accessory = accessory;
    this.log = platform.log;
    this.context = accessory.context;
    this.mqttPub = platform.mqttPub;
}

SceneAccessory.prototype.getStatus = function(callback) {
    this.log("SceneAccessory(" + this.context.id + ") getStatus" );
    var status = false;
    callback(null, status);
}

SceneAccessory.prototype.setStatus = function(status, callback, context) {
    this.log("SceneAccessory(" + this.context.id + ") setStatus:" + status );
    
    if(context !== 'fromSetValue') {
        var st = status?"On":"Off";
        var mqttMsg = '{"message":"scene active","id":' + this.context.id + '}';
        
        this.mqttPub(this.platform, mqttMsg);
    }
    
    callback();
}

SceneAccessory.prototype.processMQTT = function(json) {
    this.log("SceneAccessory processMQTT id:" + json.id );
    var switchService = this.accessory.getService(Service.Switch);

    if(this.context.id == json.id)
    {
        if(json.message === "scene active response"){
            if(json.code != 0){
                console.log("scene active failed, sceneid:" + this.context.id + ", info:" + json.info);
            }
            
            switchService.getCharacteristic(Characteristic.On)
                .setValue(false, undefined, 'fromSetValue');
        }
    }
}
