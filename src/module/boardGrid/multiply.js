basis.require('basis.data');

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
function getDelta(inserted, deleted){
  var delta = {};
  var result;

    if (inserted && inserted.length) {
        delta.inserted = inserted;
    }


    if (deleted && deleted.length) {
        delta.deleted = deleted;
    }

    return delta;
}

function updateInserted(insertItems, members, items) {
    var changed = [];
    if (insertItems) {
        for (var i = 0, item, colsItems = items.getItems(); item = insertItems[i]; i++)
        {
            for (var j = 0, colsItem; colsItem = colsItems[j]; j++)
            {
                var map = this.map_[colsItem.basisObjectId] || {};
                var newMember = this.map(colsItem, item);
                if (newMember && newMember instanceof basis.data.Object) {
                    var memberInfo = members[newMember.basisObjectId];

                    if (!memberInfo)
                        memberInfo = members[newMember.basisObjectId] = {
                            object: newMember,
                            product: []
                        };

                    map[item.basisObjectId] = memberInfo;
                    memberInfo.product.push([colsItem, item]);
                    changed.push(newMember);
                }
            }
        }
    }
    return changed;
}

function updateDeleted(deletedItems, members, items) {
    var changed = [];
    if (deletedItems) {
        for (var i = 0, item, colsItems = items.getItems(); item = deletedItems[i]; i++) {
            for (var j = 0, colsItem; colsItem = colsItems[j]; j++) {
                var map = this.map_[colsItem.basisObjectId];
                var memberInfo = map[item.basisObjectId] || {};

                if (memberInfo && memberInfo instanceof basis.data.Object) {
                    for (var k = 0; k < memberInfo.product.length; k++)
                        if (memberInfo.product[k][0] === colsItem && memberInfo.product[k][1] === item) {
                            memberInfo.product.splice(k, 1);
                            break;
                        }

                    if (!memberInfo.product.length) {
                        delete members[memberInfo.object.basisObjectId];
                        changed.push(memberInfo.object);
                    }
                }
            }
        }
    }
    return changed

}

//
// Multiply dataset
//

var MULTIPLY_COLS_HANDLER = {
    itemsChanged: function (dataset, delta) {
        if (!this.rows)
            return;
        var inserted = updateInserted.bind(this)(delta.inserted, this.members_, this.rows);
        var deleted = updateDeleted.bind(this)(delta.deleted, this.members_, this.rows);

        this.emmitNoEmptyChange(inserted, deleted);

  },
  destroy: function(){
    this.setOperands(null, this.rows);
  }
};


var MULTIPLY_ROWS_HANDLER = {
  itemsChanged: function(dataset, delta){
      if (!this.cols)
      return;
      var inserted = updateInserted.bind(this)(delta.inserted, this.members_, this.cols);
      var deleted = updateDeleted.bind(this)(delta.deleted, this.members_, this.cols);
      this.emmitNoEmptyChange(inserted, deleted);
  },
  destroy: function(){
    this.setOperands(this.cols, null);
  }
};


/**
* @class
*/
var Multiply = AbstractDataset.subclass({
  className: namespace + '.Multiply',

 /**
  * @type {basis.data.AbstractDataset}
  */
  cols: null,

 /**
  * @type {basis.data.AbstractDataset}
  */
  rows: null,

  map: basis.fn.$undef,

 /**
  * @inheritDoc
  */
  listen: {
    cols: MULTIPLY_COLS_HANDLER,
    rows: MULTIPLY_ROWS_HANDLER
  },
    emmitNoEmptyChange: function (inserted, deleted) {
        var newDelta = getDelta(inserted, deleted);
        if (isExistDelta(newDelta)) {
            this.emit_itemsChanged(newDelta);
        }
    },
 /**
  * @constructor
  */
  init: function(){
    // inherit
    AbstractDataset.prototype.init.call(this);

    // init part
    var cols = this.cols;
    var rows = this.rows;

    this.cols = null;
    this.rows = null;
    this.map_ = {};
    if (cols || rows)
      this.setOperands(cols, rows);
  },

 /**
  * Set new cols & rows.
  * @param {basis.data.AbstractDataset=} cols
  * @param {basis.data.AbstractDataset=} rows
  * @return {object|boolean} Delta if changes happend
  */
  setOperands: function(cols, rows){
    var delta;
    var operandsChanged = false;

    if (cols instanceof AbstractDataset == false)
      cols = null;

    if (rows instanceof AbstractDataset == false)
      rows = null;

    var oldCols = this.cols;
    var oldRows = this.rows;

    // set new cols if changed
    if (oldCols !== cols)
    {
      operandsChanged = true;
      this.cols = cols;

      var listenHandler = this.listen.cols;
      if (listenHandler)
      {
        if (oldCols)
          oldCols.removeHandler(listenHandler, this);

        if (cols)
          cols.addHandler(listenHandler, this);
      }

      //this.emit_colsChanged(oldCols);
    }

    // set new rows if changed
    if (oldRows !== rows)
    {
      operandsChanged = true;
      this.rows = rows;

      var listenHandler = this.listen.rows;
      if (listenHandler)
      {
        if (oldRows)
          oldRows.removeHandler(listenHandler, this);

        if (rows)
          rows.addHandler(listenHandler, this);
      }

      //this.emit_rowsChanged(oldRows);
    }

    if (!operandsChanged)
      return false;

    // apply changes
    if (!cols || !rows)
    {
      if (this.itemCount)
        this.emit_itemsChanged(delta = {
          deleted: this.getItems()
        });
    }
    else
    {
      // TODO: calculate correct delta when dataset is not empty before arguments changed
      var deleted = [];
      var inserted = [];
      var members = this.members_;

      var aItems = this.cols.getItems();
      var bItems = this.rows.getItems();

      for (var i = 0, itemA; itemA = aItems[i]; i++)
      {
        var map = this.map_[itemA.basisObjectId] || (this.map_[itemA.basisObjectId] = {});
        for (var j = 0, itemB; itemB = bItems[j]; j++)
        {
          var newMember = this.map(itemA, itemB);
          if (newMember && newMember instanceof basis.data.Object)
          {
            var memberInfo = members[newMember.basisObjectId];

            if (!memberInfo)
              memberInfo = members[newMember.basisObjectId] = {
                object: newMember,
                product: []
              };

            map[itemB.basisObjectId] = memberInfo;
            memberInfo.product.push([itemA, itemB]);
            inserted.push(newMember);
          }
        }
      }


        this.emmitNoEmptyChange(inserted, deleted);
    }

    return delta;
  },

 /**
  * @param {basis.data.AbstractDataset} cols
  * @return {Object} Delta if changes happend
  */
  setCols: function(cols){
    return this.setOperands(cols, this.rows);
  },

 /**
  * @param {basis.data.AbstractDataset} rows
  * @return {Object} Delta if changes happend
  */
  setRows: function(rows){
    return this.setOperands(this.cols, rows);
  },

 /**
  * @inheritDoc
  */
  clear: function(){
    this.setOperands();
  }
});

module.exports = Multiply;
