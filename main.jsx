/**
 * @jsx React.DOM
 */
;(function (React) {
    'use strict';

    var TransitionGroup = React.addons.TransitionGroup;

    var Utilities = {
        uuid: function(){
            // generate a random GUID http://stackoverflow.com/a/2117523
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },
        store: function(namespace, data){
            var store;

            if(data)
                return localStorage.setItem(namespace, JSON.stringify(data));

            store = localStorage[namespace];
            return (store && JSON.parse(store)) || [];

        }
    };

    function CommentModel(key){
        this.key = key;
        this.comments = Utilities.store(key);
        this.onChanges = [];
        this.message = null;
        this.timeStamp = null;
    }

    CommentModel.prototype.inform = function(){
        Utilities.store(this.key, this.comments);
        this.onChanges.forEach(function(cb){
            cb();
        });
    };

    CommentModel.prototype.subscribe = function(item){
        this.onChanges.push(item);
    };

    CommentModel.prototype.create = function(message){
        this.comments = this.comments.concat({
            id: Utilities.uuid(),
            message: message.message,
            timeStamp: message.timeStamp
        });

        this.inform();
    };

    var CommentBubble = React.createClass({
        render: function(){

            return(
                <li className={React.addons.classSet({
                    comment: 'comment'
                })}>
                    <p>{this.props.comment.message}</p>
                </li>
            );
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
                message: msg,
                timeStamp: new Date().getTime()
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
            );
        }
    });

    var CommentApp = React.createClass({
        componentDidMount: function(){
            var comments = this.getDOMNode().childNodes[0];

            comments.scrollTop = comments.scrollHeight;
        },
        render: function(){
            var comments = this.props.model.comments.map(function(comment){
                return (
                    <CommentBubble
                        key = {comment.id}
                        comment = {comment}
                    />
                );
            }),
            commentForm = <CommentForm comments = {this.props.model} />;

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

    var model = new CommentModel('react-comments');

    function render(){
        React.renderComponent(
            <CommentApp model={model}  />,
            document.getElementById('app')
        );
    }

    model.subscribe(render);
    render();
}(React));
