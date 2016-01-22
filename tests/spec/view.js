module.exports = {
    init: function () {
        var Folder = basis.require('/src/app/type/view');
        var Node = basis.require('basis.ui').Node;
    },
    name: 'View service',
    test: [
        {
            name: 'context should return data',
            timeout: 3000,
            test: function (done) {

                Folder.all.debug_emit = function () {
                    console.log(arguments)
                }
                new Node({
                    active: true,
                    dataSource:Folder.all
                });

                Folder.all.addHandler({
                    itemsChanged: function (data) {
                        console.log(data)
                        done();
                    }
                })


            }
        }
    ]
};