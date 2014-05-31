module.exports = {
  init:function() {
   var service = basis.require('/src/app/service.js');
  },
  name: 'Test suite 1',  
  test: [
    {
      name: 'context should return data',
      timeout:3000,
      test: function(done){
        // test code
        service.context.addHandler({update:function(data){          
            assert(data.data.Acid);
            done(); 
        }})
        service.context.setActive(true);      
      }
    }
  ]
};