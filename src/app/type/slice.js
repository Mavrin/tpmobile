basis.require('basis.net.action');

module.exports = {
    cells: basis.data.Object.subclass({
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
    })
};