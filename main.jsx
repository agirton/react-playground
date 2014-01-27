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

    var CommentBubble = React.createClass({
        render: function(){
            return(
                    <li className="comment">
                        <p>{this.props.comment.get('message')}</p>
                    </li>
            )
        }
    });

    var CommentForm = React.createClass({
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
                <form onSubmit={this.handleSubmit}>
                    <input
                        autoFocus = 'autofocus'
                        ref = 'commentForm'
                        type = 'input'
                        className = 'comment__form'
                        placeholder = 'Text Message'
                    />
                </form>
            )
        }
    });

    var CommentApp = React.createClass({
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
                    <CommentBubble
                        key = {Math.random()}
                        comment = {comment}
                    />
                );
            }),
            commentForm = <CommentForm comments = {this.props.comments} />;

            return (
                <div>
                    <ul className="comments">
                        <TransitionGroup className='bubble' transitionName='bubble' transitionOnMount={true}>
                            {comments}
                        </TransitionGroup>
                    </ul>
                    {commentForm}
                </div>
            );
        }
    });

    React.renderComponent(
        <CommentApp comments={new Comments()}  />,
        document.getElementById('app')
    );
}());
