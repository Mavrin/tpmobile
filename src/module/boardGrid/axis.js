basis.require('basis.ui.pageslider');
var Q = basis.require('lib.q.q');
var PageSlider = basis.ui.pageslider.PageSlider;

var Axis = PageSlider.subclass({
  autoDelegate: true,
  active: true,
  binding:{
    hide:['update',function(node){
      if(node.data[node.axisKey] && node.data[node.axisKey].id) {
        return false;
      } else {
        return true;
      }
    }]
  },
  handler: {
    update: function(sender, delta){
      if (this.dataSource)
      {
        this.dataSource.setSource(app.type.AxisItem.byBoard(this.target, this.axisKey + 'axis'));
        if (this.axisKey in delta)
          this.dataSource.setActive(!!this.data[this.axisKey]);
      }
    }
  },
  listen: {
    selection: {
      itemsChanged: function (s, data) {
        if(data.inserted && data.inserted[0].data) {
          if(this.data.x && this.data.x.id) {
            lastY.update(data.inserted[0].data);
          } else {
            var dataSource = app.type.Cell({
              boardId: this.data.key,
              x: data.inserted[0].data.id,
              y:null
            });
            cell.setDelegate(dataSource);
            dataSource.setActive(true);
          }

        }
      }
    }
  },
  sorting: function(item){
    return item.data.orderingValue || item.basisObjectId;
  },
  childClass: {
    binding: {
      name: 'data:'
    }
  }
});
module.exports = {
  Axis: Axis
};