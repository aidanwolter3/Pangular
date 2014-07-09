angular.module('pang', []).
service('PangObject', function() {
    this.new = function(className) {
        var pangObject = {};
        pangObject.className = className;

        //verify that the parse file is included
        if(typeof Parse == 'undefined') {
            console.log('Error: Pang needs the Parse SDK to be included!');
            return;
        }

        //verify that JQuery is included
        if(typeof $ == 'undefined') {
          console.log('Error: Pang needs JQuery to be included!');
          return;
        }

        pangObject.initialize = function() {
            var pangObject = this;
            pangObject.data = [];
            pangObject.parseObjects = [];


            var parseObject = Parse.Object.extend(this.className);
            var query = new Parse.Query(parseObject);

            //set up the promise
            var promise = {};
            var successFtn;
            var errorFtn;
            promise.then = function(s, e) {
                successFtn = s;
                errorFtn = e;
            }

            //get all the objects from parse
            query.find({
                success: function(objects) {
                    for(var index in objects) {
                        object = objects[index];
                        dataObject = $.extend({parseObjectId: object.id}, object.attributes);
                        pangObject.parseObjects.push(object);
                        pangObject.data.push(dataObject);
                    }
                    if(successFtn) {
                        successFtn();
                    }
                },
                error: function(error) {
                    console.log('Pang encountered an error while fetching data from Parse!');
                    if(errorFtn) {
                        errorFtn();
                    }
                }
            });

            return promise;
        }

        pangObject.add = function(newData) {
            var pangObject = this;
            var parseObject = Parse.Object.extend(this.className);
            var newParseObject = new parseObject;

            //set up the promise
            var promise = {};
            var successFtn;
            var errorFtn;
            promise.then = function(s, e) {
                successFtn = s;
                errorFtn = e;
            }

            //save the new data
            newParseObject.save(newData, {
                success: function(object) {
                    pangObject.data.push($.extend({parseObjectId: object.id}, object.attributes));
                    pangObject.parseObjects.push(object);
                    if(successFtn) {
                        successFtn(object.id);
                    }
                },
                error: function(error) {
                    if(errorFtn) {
                        errorFtn();
                    }
                }
            });

            return promise;
        }

        pangObject.delete = function(object) {
            var parseObjectId = object.parseObjectId;
            var pangObject = this;

            //find the parseObject
            var parseObject;
            var parseObjectIndex;
            for(var index in pangObject.parseObjects) {
                var object = pangObject.parseObjects[index];
                if(object.id == parseObjectId) {
                    parseObjectIndex = index;
                    parseObject = object;
                    break;
                }
            }

            //set up the promise
            var promise = {};
            var successFtn;
            var errorFtn;
            promise.then = function(s, e) {
                successFtn = s;
                errorFtn = e;
            }

            //if the parseObject could not be found
            if(!parseObject) {
                if(errorFtn) {
                    errorFtn();
                }
                return;
            }

            //destroy the data
            parseObject.destroy({
                success: function() {
                for(var index in pangObject.data) {
                    var object = pangObject.data[index];
                    if(object.parseObjectId == parseObjectId) {
                        pangObject.data.splice(index, 1);
                    }
                }
                pangObject.parseObjects.splice(parseObjectIndex, 1);
                if(successFtn) {
                    successFtn();
                }

                },
                error: function() {
                    if(errorFtn) {
                        errorFtn();
                    }
                }
            })

            return promise;
        }

        pangObject.update = function(object) {
            var parseObjectId = object.parseObjectId;
            var pangObject = this;

            //find the parseObject
            var parseObject;
            var parseObjectIndex;
            for(var index in pangObject.parseObjects) {
                var object2 = pangObject.parseObjects[index];
                if(object2.id == parseObjectId) {
                    parseObjectIndex = index;
                    parseObject = object2;
                    break;
                }
            }

            //set up the promise
            var promise = {};
            var successFtn;
            var errorFtn;
            promise.then = function(s, e) {
                successFtn = s;
                errorFtn = e;
            }

            //if the parseObject could not be found
            if(!parseObject) {
                if(errorFtn) {
                    errorFtn();
                }
                return;
            }

            //update the data
            for(var key in object) {

                //only update the keys which can be found in the attributes
                if(parseObject.attributes[key]) {
                    parseObject.set(key, object[key]);
                }
            }

            //save the updates
            parseObject.save(null, {
                success: function() {
                if(successFtn) {
                    successFtn();
                }

                },
                error: function() {
                    if(errorFtn) {
                        errorFtn();
                    }
                }
            });

            return promise;
        }

        return pangObject;
    }
});
