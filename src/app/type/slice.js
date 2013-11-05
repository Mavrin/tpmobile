basis.require('basis.entity');
basis.require('basis.net.action');
basis.require('basis.data.dataset');


var Slice =  {}

Slice.SliceMethod = basis.data.Object.subclass({
    /*isSyncRequired: function(){
        return this.state == basis.data.STATE.UNDEFINED;
    },*/
    syncAction: basis.net.action.create({
        method:'post',
        contentType: 'application/json',
        request: function() {
            return {
                url: 'slice/v1/matrix/' + this.method + '/',
                postBody:JSON.stringify(this.sliceConfig)
            };
        },
        success: function(data){
            this.update(data); //пока так
        }
    })
});

/*Slice.y = Slice.SliceMethod.subclass({method:'yaxis'}); 
Slice.x = Slice.SliceMethod.subclass({method:'xaxis'});*/
Slice.y = basis.data.Object.subclass({
    syncAction: basis.net.action.create({
        method:'post',
        contentType: 'application/json',
        request: function() {
            return {
                url: 'slice/v1/matrix/yaxis/',
                postBody:JSON.stringify(this.sliceConfig)
            };
        },
        success: function(data){
            this.update(data); //пока так
        }
    })
});

Slice.x = basis.data.Object.subclass({
    syncAction: basis.net.action.create({
        method:'post',
        contentType: 'application/json',
        request: function() {
            return {
                url: 'slice/v1/matrix/xaxis/',
                postBody: JSON.stringify({
                    base64: true,
                    definition: {
                        cells: this.sliceConfig.definition.cells,
                        global: this.sliceConfig.definition.global,
                        x: this.sliceConfig.definition.x
                    },
                    take: 3
                })
            };
        },
        success: function(data){
            this.update(data); //пока так
        }
    })
});

Slice.cells = basis.data.Object.subclass({
    syncAction: basis.net.action.create({
        method:'post',
        contentType: 'application/json',
        request: function() {
            return {
                url: 'slice/v1/matrix/cells/',
                postBody:JSON.stringify(this.sliceConfig)
            };
        },
        success: function(data){
            this.update(data); //пока так
        }
    })
});


module.exports = Slice;