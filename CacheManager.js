var CacheManager = (function() {
    "use strict";

    var deepExtend = function(destination, source) {
        for (var property in source) {
            if (typeof source[property] === "object") {
                destination[property] = destination[property] || {};
                arguments.callee(destination[property], source[property]);
            } else {
                destination[property] = source[property];
            }
        }
        return destination;
    };

    var stringify = function (obj) {
        return JSON.stringify(obj, function (key, value) {
            var iso8061 = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;

            if(value instanceof Function || typeof(value) === 'function') {
                return value.toString();
            }
            if(value instanceof RegExp) {
                return '_ReGuEx_' + value;
            }
            if(value instanceof String || typeof(value) === 'string' && value.match(iso8061)) {
                return '_DaTeOj_' + value;
            }
            if(key === '$$hashKey') {
                return '';
            }

            return value;
        });
    };

    var parse = function (str) {
        return JSON.parse(str, function (key, value) {
            var prefix;

            if (typeof(value) !== 'string') {
                return value;
            }

            if (value.length < 8) {
                return value;
            }

            prefix = value.substring(0, 8);

            if (prefix === 'function') {
                return window.eval('(' + value + ')');
            }

            if (prefix === '_ReGuEx_') {
                return window.eval(value.slice(8));
            }

            if (prefix === '_DaTeOj_') {
                return new Date(value.slice(8));
            }

            return value;
        });
    };

    var cacheManager = function(options) {
        options = options || {};
        this.prefix = options.prefix || '__cm__';

        this.removeTrash();
    };

    cacheManager.prototype._getItem = function(name) {
        try {
            var item = sessionStorage.getItem(name);
            if(!item) {
                item = localStorage.getItem(name);
            }

            return item;
        } catch(e) {
            throw 'CacheManager : not support browser';
        }
    };

    cacheManager.prototype.getItem = function(name, deleteItem) {
        var itemName = this.prefix + name;
        var item = this._getItem(itemName);

        if(!item) {
            return null;
        } else {
            var cacheItem = parse(item);
            var lifeTime = cacheItem.lifeTime;
            var now = new Date();
            if(deleteItem) {
                this.removeItem(itemName);
            }

            if(lifeTime === null) {
                return cacheItem.data;
            } else if(lifeTime.getTime() >= now.getTime()) {
                return cacheItem.data;
            } else if(lifeTime.getTime() < now.getTime()){
                this.removeItem(itemName);
                return null;
            }
        }
    };

    cacheManager.prototype.getAll = function() {
        try {
            var sCache = sessionStorage;
            var lCache = localStorage;
            var cache = deepExtend(sCache, lCache);
            var items = [];

            for(var name in cache) {
                if(name.indexOf(this.prefix) > -1) {
                    var cacheItem = parse(cache[name]);
                    var realName = name.replace(this.prefix, '');
                    var o = {};
                    o[realName] = cacheItem.data;
                    items.push(o);
                }
            }

            return items;
        } catch(e) {
            throw 'CacheManager : not support browser';
        }
    };

    cacheManager.prototype.getAllName = function() {
        try {
            var sCache = sessionStorage;
            var lCache = localStorage;
            var cache = deepExtend(sCache, lCache);
            var items = [];

            for(var name in cache) {
                if(name.indexOf(this.prefix) > -1) {
                    var realName = name.replace(this.prefix, '');
                    items.push(realName);
                }
            }

            return items;
        } catch(e) {
            throw 'CacheManager : not support browser';
        }
    };

    cacheManager.prototype.getForce = function(name, deleteItem) {
        var itemName = this.prefix + name;
        var item = this._getItem(itemName);

        if(!item) {
            return null;
        } else {
            var cacheItem = parse(item);
            if(deleteItem) {
                this.removeItem(itemName);
            }

            return cacheItem.data;
        }
    };

    cacheManager.prototype.removeItem = function(name) {
        try {
            var itemName = name.indexOf(this.prefix) > -1 ? name : this.prefix + name;
            sessionStorage.removeItem(itemName);
            localStorage.removeItem(itemName);
        } catch(e) {
            throw 'CacheManager : not support browser';
        }
    };

    cacheManager.prototype.setItem = function(name, item, timer) {
        if(!name) {
            throw 'CacheManager : require param error';
        }

        var itemName = this.prefix + name;
        this.removeItem(itemName);

        var patchData = item;

        var cacheItem = {
            lifeTime: null,
            data: patchData
        };

        var date = new Date();

        try {
            if(typeof(timer) === 'undefined') {
                sessionStorage.setItem(itemName, stringify(cacheItem));
            } else if(typeof(timer) === 'number') {
                if(timer === 0) {
                    localStorage.setItem(itemName, stringify(cacheItem));
                } else {
                    date.setTime(date.getTime() + timer);
                    cacheItem.lifeTime = date;
                    localStorage.setItem(itemName, stringify(cacheItem));
                }
            } else if(timer instanceof Date) {
                date.setTime(timer);
                cacheItem.lifeTime = date;
                localStorage.setItem(itemName, stringify(cacheItem));
            } else {
                throw 'CacheManager : timer type error';
            }
        } catch(e) {
            throw 'CacheManager : not support browser';
        }
    };

    cacheManager.prototype.isLive = function(name) {
        var itemName = this.prefix + name;
        var item = this._getItem(itemName);

        if(!item) {
            return null;
        }

        var cacheItem = parse(item);
        var lifeTime = cacheItem.lifeTime;
        var date = new Date();

        if(lifeTime && lifeTime.getTime() <= date.getTime()) {
            return false;
        } else {
            return true;
        }
    };

    cacheManager.prototype.removeTrash = function() {
        var items = this.getAllName();

        for(var i = 0; i < items.length; i++) {
            var name = items[i];
            var item = localStorage.getItem(this.prefix + name);
            if(item && !this.isLive(name)) {
                this.removeItem(name);
            }
        }
    };

    return cacheManager;
})();
