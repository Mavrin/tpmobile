basis.require('basis.ui');

var BaseCard = basis.ui.Node.subclass({
    className: 'BaseCard',
    template: resource('./template/card/base.tmpl'),
    action: {
      openView:function() {
          app.state.isOpenView.set(!app.state.isOpenView.value);
          app.state.currentViewData.setDelegate(this.delegate);
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
