basis.require('basis.ui');

var Card = basis.ui.Node.subclass({
    className: 'Card',
    template: resource('card.tmpl'),
    binding: {
        id: 'data:',
        name: 'data:',
        type: 'data:'
    }
});
module.exports = Card;