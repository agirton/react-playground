/**
 * @jsx React.DOM
 */
;(function () {
    'use strict';

    // An example generic Mixin that you can add to any component that should react
    // to changes in a Backbone component. The use cases we've identified thus far
    // are for Collections -- since they trigger a change event whenever any of
    // their constituent items are changed there's no need to reconcile for regular
    // models. One caveat: this relies on getBackboneModels() to always return the
    // same model instances throughout the lifecycle of the component. If you're
    // using this mixin correctly (it should be near the top of your component
    // hierarchy) this should not be an issue.
    var BackboneMixin = {
      componentDidMount: function() {
        // Whenever there may be a change in the Backbone data, trigger a reconcile.
        this.getBackboneModels().forEach(function(model) {
          model.on('add change remove', this.forceUpdate.bind(this, null), this);
        }, this);
      },

      componentWillUnmount: function() {
        // Ensure that we clean up any dangling references when the component is
        // destroyed.
        this.getBackboneModels().forEach(function(model) {
          model.off(null, null, this);
        }, this);
      }
    };

    var TransitionGroup = React.addons.TransitionGroup;

    var Comment = Backbone.Model.extend({
        defaults: {
            message: ''
        }
    });

    var Comments = Backbone.Collection.extend({
        model: Comment,
        localStorage: new Store('react-tests')
    });

    var CommentBubble = React.createClass({displayName: 'CommentBubble',
        render: function(){
            return(
                    React.DOM.li( {className:"comment"}, 
                        React.DOM.p(null, this.props.comment.get('message'))
                    )
            )
        }
    });

    var CommentForm = React.createClass({displayName: 'CommentForm',
        handleSubmit: function(e){
            e.preventDefault();
            var val = this.refs.commentForm.getDOMNode().value.trim();

            if(val){
                this.save(val);
            }
        },
        save: function(msg){
            this.props.comments.create({
                message: msg
            });

            this.refs.commentForm.getDOMNode().value = '';
        },
        render: function(){
            return (
                React.DOM.form( {onSubmit:this.handleSubmit}, 
                    React.DOM.input(
                        {autoFocus:  "autofocus",
                        ref:  "commentForm",
                        type:  "input",
                        className:  "comment__form",
                        placeholder:  "Text Message"}
                    )
                )
            )
        }
    });

    var CommentApp = React.createClass({displayName: 'CommentApp',
        mixins: [BackboneMixin],
        componentDidMount: function(){
            var comments = this.getDOMNode().childNodes[0];

            this.props.comments.fetch();
            comments.scrollTop = comments.scrollHeight;
        },
        getBackboneModels: function(){
            return [this.props.comments];
        },
        render: function(){
            var comments = this.props.comments.map(function(comment){
                return (
                    CommentBubble(
                        {key:  Math.random(),
                        comment:  comment}
                    )
                );
            }),
            commentForm = CommentForm( {comments:  this.props.comments} );

            return (
                React.DOM.div(null, 
                    React.DOM.ul( {className:"comments"}, 
                        TransitionGroup( {className:"bubble", transitionName:"bubble", transitionOnMount:true}, 
                            comments
                        )
                    ),
                    commentForm
                )
            );
        }
    });

    React.renderComponent(
        CommentApp( {comments:new Comments()}  ),
        document.getElementById('app')
    );
}());
