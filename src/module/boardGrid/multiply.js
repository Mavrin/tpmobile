basis.require('basis.data');

var namespace = this.path;
var AbstractDataset = basis.data.AbstractDataset;

/**
* Returns delta object
* @param {Array.<basis.data.Object>} inserted
* @param {Array.<basis.data.Object>} deleted
* @return {object|boolean}
*/
function getDelta(inserted, deleted){
  var delta = {};
  var result;

  if (inserted && inserted.length)
    result = delta.inserted = inserted;

  if (deleted && deleted.length)
    result = delta.deleted = deleted;

  if (result)
    return delta;
}

//
// Multiply dataset
//

var MULTIPLY_COLS_HANDLER = {
  itemsChanged: function(dataset, delta){
    var members = this.members_;
    var rowsItems = this.rows && this.rows.itemCount ? this.rows.getItems() : null;
    var inserted = [];
    var deleted = [];
    var array;

    if (array = delta.inserted)
      for (var i = 0, item; item = array[i]; i++)
      {
        var map = this.map_[item.basisObjectId] = {};
        if (rowsItems)
        {
          for (var j = 0, rowsItem; rowsItem = rowsItems[j]; j++)
          {
            var newMember = this.map(item, rowsItem);
            if (newMember && newMember instanceof basis.data.Object)
            {
              var memberInfo = members[newMember.basisObjectId];

              if (!memberInfo)
                memberInfo = members[newMember.basisObjectId] = {
                  object: newMember,
                  product: []
                };

              map[rowsItem.basisObjectId] = memberInfo;
              memberInfo.product.push([item, rowsItem]);
              inserted.push(newMember);
            }
          }
        }
      }

    if (array = delta.deleted)
      for (var i = 0, item; item = array[i]; i++)
      {
        var map = this.map_[item.basisObjectId];
        if (rowsItems)
        {
          for (var j = 0, rowsItem; rowsItem = rowsItems[j]; j++)
          {
            var memberInfo = map[rowsItem.basisObjectId];

            if (memberInfo)
            {
              for (var k = 0; k < memberInfo.product.length; k++)
                if (memberInfo.product[k][0] === item && memberInfo.product[k][1] === rowsItem)
                {
                  memberInfo.product.splice(k, 1);
                  break;
                }

              if (!memberInfo.product.length)
              {
                delete members[memberInfo.object.basisObjectId];
                deleted.push(memberInfo.object);
              }
            }
          }
        }
        delete this.map_[item.basisObjectId];
      }

    var newDelta = getDelta(inserted, deleted);
    if (newDelta)
      this.emit_itemsChanged(newDelta);
  },
  destroy: function(){
    this.setOperands(null, this.rows);
  }
};

var MULTIPLY_ROWS_HANDLER = {
  itemsChanged: function(dataset, delta){
    if (!this.cols || !this.cols.itemCount)
      return;

    var members = this.members_;
    var inserted = [];
    var deleted = [];
    var array;

    if (array = delta.inserted)
      for (var i = 0, item, colsItems = this.cols.getItems(); item = array[i]; i++)
      {
        for (var j = 0, colsItem; colsItem = colsItems[j]; j++)
        {
          var map = this.map_[colsItem.basisObjectId];
          var newMember = this.map(colsItem, item);
          if (newMember && newMember instanceof basis.data.Object)
          {
            var memberInfo = members[newMember.basisObjectId];

            if (!memberInfo)
              memberInfo = members[newMember.basisObjectId] = {
                object: newMember,
                product: []
              };

            map[item.basisObjectId] = memberInfo;
            memberInfo.product.push([colsItem, item]);
            inserted.push(newMember);
          }
        }
      }

    if (array = delta.deleted)
      for (var i = 0, item, colsItems = this.cols.getItems(); item = array[i]; i++)
      {
        for (var j = 0, colsItem; colsItem = colsItems[j]; j++)
        {
          var map = this.map_[colsItem.basisObjectId];
          var memberInfo = map[item.basisObjectId];

          if (memberInfo)
          {
            for (var k = 0; k < memberInfo.product.length; k++)
              if (memberInfo.product[k][0] === colsItem && memberInfo.product[k][1] === item)
              {
                memberInfo.product.splice(k, 1);
                break;
              }

            if (!memberInfo.product.length)
            {
              delete members[memberInfo.object.basisObjectId];
              deleted.push(memberInfo.object);
            }
          }
        }
      }

    var newDelta = getDelta(inserted, deleted);
    if (newDelta)
      this.emit_itemsChanged(newDelta);
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

      if (delta = getDelta(inserted, deleted))
        this.emit_itemsChanged(delta);
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
