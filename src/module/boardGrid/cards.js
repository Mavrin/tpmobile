basis.require('basis.ui');

var BaseCard = basis.ui.Node.subclass({
    className: 'BaseCard',
    template: resource('template/card/base.tmpl'),
    binding: {
        id: 'data:',
        name: 'data:',
        type: 'data:'
    }
});

var UserStory = BaseCard.subclass({
    template: resource('template/card/userStory.tmpl')
});

var Task = BaseCard.subclass({
    template: resource('template/card/task.tmpl')
});

module.exports = {
    BaseCard: BaseCard,
    UserStory: UserStory,
    Task: Task
};
