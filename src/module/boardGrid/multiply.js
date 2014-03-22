basis.require('basis.data');
var Q = basis.require('lib.q.q');

var namespace = this.path;
var AbstractDataset = basis.data.AbstractDataset;

/**
 * Returns delta object
 * @param {Array.<basis.data.Object>} inserted
 * @param {Array.<basis.data.Object>} deleted
 * @return {object}
 */
function isExistDelta(delta) {
    return delta.inserted || delta.deleted;
}
function getDelta(inserted, deleted) {
    var delta = {};

    if (inserted && inserted.length) {
        delta.inserted = inserted;
    }


    if (deleted && deleted.length) {
        delta.deleted = deleted;
    }

    return delta;
}


/**
 * @class
 */
var Multiply = AbstractDataset.subclass({
    className: namespace + '.Multiply',

    /**
     * @type {basis.data.AbstractDataset}
     */
    cols: null,
    colsIsEmpty:false,
    /**
     * @type {basis.data.AbstractDataset}
     */
    rows: null,
    rowsIsEmpty:false,

    map: basis.fn.$undef,

    emmitNoEmptyChange: function (inserted, deleted) {
        var newDelta = getDelta(inserted, deleted);
        if (isExistDelta(newDelta)) {
            this.emit_itemsChanged(newDelta);
        }
    },
    /**
     * @constructor
     */
    init: function () {
        // inherit
        AbstractDataset.prototype.init.call(this);
        this.setOperands(this.cols, this.rows);
    },
    getAxisData: function (axis,empty, title) {
        var deferred = Q.defer();
        if(empty) {
            deferred.resolve({inserted:[{data:{id:''}}]});
        } else if(axis) {
            axis.addHandler({
                itemsChanged: function (dataset, delta) {
                    deferred.resolve(delta);
                }
            });
        }
        return deferred.promise;
    },
    /**
     * Set new cols & rows.
     * @param {basis.data.AbstractDataset} cols
     * @param {basis.data.AbstractDataset} rows
     * @return {object|boolean} Delta if changes happend
     */
    setOperands: function (cols, rows) {

        Q.all([
            this.getAxisData(cols, this.colsIsEmpty,'x'),
            this.getAxisData(rows, this.rowsIsEmpty,'y')
        ])
            .spread(function (deltaCols, deltaRows) {
                this.emmitNoEmptyChange(deltaCols.inserted.map(function (item) {
                    return this.map(item, deltaRows.inserted[0]);
                }, this));
            }.bind(this));
    },
    /**
     * @inheritDoc
     */
    clear: function () {
        this.setOperands();
    }
});

module.exports = Multiply;
