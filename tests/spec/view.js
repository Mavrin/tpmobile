module.exports = {
    init: function () {
        var View = basis.require('/src/app/type/view').View;
        var Node = basis.require('basis.ui').Node;
    },
    name: 'View service',
    test: [
        {
            name: 'view should return only board yet',
            timeout: 3000,
            test: function (done) {
                new Node({
                    active: true,
                    dataSource: View.all
                });

                View.all.addHandler({
                    itemsChanged: function () {
                        assert(View.all.getItems().length, 2);
                        console.log(View.all.getItems());
                        console.count('test')
                        done();
                    }
                })


            }
        }
    ]
};