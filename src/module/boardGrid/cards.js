var Node = require('basis.ui').Node;
var appState = require('app.state');
var BaseCard = Node.subclass({
    className: 'BaseCard',
    template: resource('./template/card/base.tmpl'),
    action: {
      openView:function() {
          appState.isOpenView.set(!appState.isOpenView.value);
          appState.currentViewData.setDelegate(this.delegate);
      }
    },
    binding: {
        id: 'data:',
        name: 'data:',
        type: 'data:'
    }
});

var UserStory = BaseCard.subclass({
    className: 'UserStory',
    template: resource('./template/card/userStory.tmpl')
});

var Task = BaseCard.subclass({
    className: 'Task',
    template: resource('./template/card/task.tmpl')
});

module.exports = {
    BaseCard: BaseCard,
    UserStory: UserStory,
    Task: Task
};
