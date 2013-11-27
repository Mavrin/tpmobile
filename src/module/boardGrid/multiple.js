basis.require('basis.data');

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
// Multiple
//

var SUBTRACTDATASET_OPA_HANDLER = {
  itemsChanged: function(dataset, delta){
    var members = this.members_;
    var op_b_items = this.op_b && this.op_b.itemCount ? this.op_b.getItems() : null;
    var inserted = [];
    var deleted = [];
    var array;

    if (array = delta.inserted)
      for (var i = 0, item; item = array[i]; i++)
      {
        var map = this.map_[item.basisObjectId] = {};
        if (op_b_items)
        {
          for (var j = 0, op_b_item; op_b_item = op_b_items[j]; j++)
          {
            var newMember = this.map(item, op_b_item);
            if (newMember && newMember instanceof basis.data.Object)
            {
              var memberInfo = members[newMember.basisObjectId];

              if (!memberInfo)
                memberInfo = members[newMember.basisObjectId] = {
                  object: newMember,
                  product: []
                };

              map[op_b_item.basisObjectId] = memberInfo;
              memberInfo.product.push([item, op_b_item]);
              inserted.push(newMember);
            }
          }
        }
      }

    if (array = delta.deleted)
      for (var i = 0, item; item = array[i]; i++)
      {
        var map = this.map_[item.basisObjectId];
        if (op_b_items)
        {
          for (var j = 0, op_b_item; op_b_item = op_b_items[j]; j++)
          {
            var memberInfo = map[op_b_item.basisObjectId];

            if (memberInfo)
            {
              for (var k = 0; k < memberInfo.product.length; k++)
                if (memberInfo.product[k][0] === item && memberInfo.product[k][1] === op_b_item)
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
    this.setOperands(null, this.op_b);
  }
};

var SUBTRACTDATASET_OPB_HANDLER = {
  itemsChanged: function(dataset, delta){
    if (!this.op_a || !this.op_a.itemCount)
      return;

    var members = this.members_;
    var inserted = [];
    var deleted = [];
    var array;

    if (array = delta.inserted)
      for (var i = 0, item, op_a_items = this.op_a.getItems(); item = array[i]; i++)
      {
        for (var j = 0, op_a_item; op_a_item = op_a_items[j]; j++)
        {
          var map = this.map_[op_a_item.basisObjectId];
          var newMember = this.map(op_a_item, item);
          if (newMember && newMember instanceof basis.data.Object)
          {
            var memberInfo = members[newMember.basisObjectId];

            if (!memberInfo)
              memberInfo = members[newMember.basisObjectId] = {
                object: newMember,
                product: []
              };

            map[item.basisObjectId] = memberInfo;
            memberInfo.product.push([op_a_item, item]);
            inserted.push(newMember);
          }
        }
      }

    if (array = delta.deleted)
      for (var i = 0, item, op_a_items = this.op_a.getItems(); item = array[i]; i++)
      {
        for (var j = 0, op_a_item; op_a_item = op_a_items[j]; j++)
        {
          var map = this.map_[op_a_item.basisObjectId];
          var memberInfo = map[item.basisObjectId];

          if (memberInfo)
          {
            for (var k = 0; k < memberInfo.product.length; k++)
              if (memberInfo.product[k][0] === op_a_item && memberInfo.product[k][1] === item)
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
    this.setOperands(this.op_a, null);
  }
};


/**
* @class
*/
var Multiple = AbstractDataset.subclass({
  className: 'Multiple',

 /**
  * @type {basis.data.AbstractDataset}
  */ 
  op_a: null,

 /**
  * @type {basis.data.AbstractDataset}
  */
  op_b: null,

  map: basis.fn.$undef,

 /**
  * @inheritDoc
  */
  listen: {
    op_a: SUBTRACTDATASET_OPA_HANDLER,
    op_b: SUBTRACTDATASET_OPB_HANDLER
  },

 /**
  * @constructor
  */
  init: function(){
    // inherit
    AbstractDataset.prototype.init.call(this);

    // init part
    var op_a = this.op_a;
    var op_b = this.op_b;

    this.op_a = null;
    this.op_b = null;
    this.map_ = {};

    if (op_a || op_b)
      this.setOperands(op_a, op_b);
  },

 /**
  * Set new op_a & op_b.
  * @param {basis.data.AbstractDataset=} op_a
  * @param {basis.data.AbstractDataset=} op_b
  * @return {object|boolean} Delta if changes happend
  */
  setOperands: function(op_a, op_b){
    var delta;
    var operandsChanged = false;

    if (op_a instanceof AbstractDataset == false)
      op_a = null;

    if (op_b instanceof AbstractDataset == false)
      op_b = null;

    var old_op_a = this.op_a;
    var old_op_b = this.op_b;

    // set new op_a if changed
    if (old_op_a !== op_a)
    {
      operandsChanged = true;
      this.op_a = op_a;

      var listenHandler = this.listen.op_a;
      if (listenHandler)
      {
        if (old_op_a)
          old_op_a.removeHandler(listenHandler, this);

        if (op_a)
          op_a.addHandler(listenHandler, this);
      }

      //this.emit_op_aChanged(old_op_a);
    }

    // set new op_b if changed
    if (old_op_b !== op_b)
    {
      operandsChanged = true;
      this.op_b = op_b;

      var listenHandler = this.listen.op_b;
      if (listenHandler)
      {
        if (old_op_b)
          old_op_b.removeHandler(listenHandler, this);

        if (op_b)
          op_b.addHandler(listenHandler, this);
      }

      //this.emit_op_bChanged(old_op_b);
    }

    if (!operandsChanged)
      return false;

    // apply changes
    if (!op_a || !op_b)
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

      var aItems = this.op_a.getItems();
      var bItems = this.op_b.getItems();

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
  * @param {basis.data.AbstractDataset} op_a
  * @return {Object} Delta if changes happend
  */
  setA: function(op_a){
    return this.setOperands(op_a, this.op_b);
  },

 /**
  * @param {basis.data.AbstractDataset} op_b
  * @return {Object} Delta if changes happend
  */
  setB: function(op_b){
    return this.setOperands(this.op_a, op_b);
  },

 /**
  * @inheritDoc
  */
  clear: function(){
    this.setOperands();
  }
});

module.exports = Multiple;
