/**
 * Created by kendricktan on 22/10/16.
 */
var React = require("react");
var ReactDOM = require("react-dom");

/* Inner story main app */
var InnerStoryApp = React.createClass({
    getInitialState: function () { 
        return {
            // Contains a list of attributes
            attributeList: [],
            queryList: [
                // querystring
                // configured
                // parsed_ner <- NER = named entity recognizer
            ],
            nextURL: "",
            prevURL: "",
            queryListViewLabel: "View: all"
        }
    },

    refreshQueries: function () {
        $.get(API_URL + "queries/", function (response) {
            this.setState({
                queryList: [],
            });

            this.setState({
                queryList: response.results,
                nextURL: response.next,
                prevURL: response.previous
            })
        }.bind(this));
    },

    handleNextPage: function () {
        $.get(this.state.nextURL, function (response) {
            this.setState({
                queryList: [],
            });

            this.setState({
                queryList: response.results,
                nextURL: response.next,
                prevURL: response.previous
            })
        }.bind(this));
    },

    handlePrevPage: function () {
        $.get(this.state.prevURL, function (response) {
            this.setState({
                queryList: [],
            });

            this.setState({
                queryList: response.results,
                nextURL: response.next,
                prevURL: response.previous
            })
        }.bind(this));
    },

    render: function () {
        var prevButton = (this.state.prevURL != null) ?
            <button onClick={this.handlePrevPage} type="button" className="btn btn-default">Previous</button> : "";

        var nextButton = (this.state.nextURL != null) ?
            <button onClick={this.handleNextPage} type="button" className="pull-right btn btn-default">
                Next</button> : "";

        return (
            <div>
                <div className="well">
                    <InnerStoryHeader/>
                </div>

                <br/>
                
                <ul className="nav nav-pills nav-justified">
                    <li className="inactive"><a href={STORY_URL + STORY_NAME}>Train</a></li>
                    <li className="active"><a href="see">See</a></li>
                </ul>
        
                <br/>

                <ManualQuery refreshQueries={this.refreshQueries} onQueryListAdd={this.handleQueryListAdd}/>
        
                <br/>
            </div>
        )
    }
});

/* Inner story Header */
var InnerStoryHeader = React.createClass({
    getInitialState: function () {
        return {
            training: false
        }
    },

    onDeleteStory: function () {
        $.ajax({
            url: API_URL,
            type: 'DELETE',
            success: function (response) {
                window.location.replace(DOMAIN + STORY_URL);
            }.bind(this),
            error: function (response) {
                console.log(response);
            }
        });
    },

    componentDidMount: function () {
        setInterval(() => {
            $.get({
                url: API_URL + "retrain/",
                success: function (response) {
                    this.setState({
                        training: response.training
                    })
                }.bind(this)
            })
        }, 10000);
    },

    handleRetrainModel: function () {
        $.post({
            url: API_URL + "retrain/",
            success: function (response) {
                this.setState({
                    training: true
                })
            }.bind(this)
        });
    },

    render: function () {
        var retrain_btn = (!this.state.training) ?
            <button type="button" onClick={this.handleRetrainModel} className="pull-right btn btn-success">Retrain
                model</button> : <button className="pull-right btn btn-warning">
            <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Training...</button>;

        return (
            <h3>
                <button type="button" className="pull-right btn btn-danger" data-toggle="modal"
                        data-target="#delete-story-modal">
                    Delete Story
                </button>
                <div className="pull-right">
                    &nbsp;
                </div>
                {retrain_btn}
                <div className="modal fade" id="delete-story-modal" tabIndex="-1" role="dialog"
                     aria-labelledby="myModalLabel">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span
                                    aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" id="myModalLabel">Delete story?</h4>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-danger" onClick={this.onDeleteStory}>Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <a href={STORY_URL}>Stories</a>
                &nbsp; &gt; &nbsp;
                <a href={STORY_URL + STORY_NAME}>{STORY_NAME}</a>
                &nbsp; &gt; &nbsp;
                <a target="_blank" href={API_URL}>api</a>
            </h3>
        )
    }
});

/* Manual query */
var ManualQuery = React.createClass({
    getInitialState: function () {
        return {
            labelText: ""
        }
    },

    handleSubmit: function (e) {
        e.preventDefault();

        if (this.state.querystring == null || this.state.querystring == "") {
            this.setState({labelText: "Querystring can\'t be null"});
            return;
        }

        this.setState({labelText: ""});

        $.ajax({
            url: API_URL + "queries/",
            type: "POST",
            data: {
                querystring: this.state.querystring
            },
            success: function (response) {
                this.entitystring = this.state.querystring;
                this.parsed_ner = response.parsed_ner;
                this.refs.querystringInput.value = "";
                this.props.refreshQueries();
            }.bind(this)
        });
    },
    
    mapAlternate: function(str, frag, fn1, fn2, thisArg) {        
        if(str) {
        var array = str.split(/(\bmoo\b)/gi);
        var fn = fn1, output = [];
        for (var i=0; i<array.length; i++){
          output[i] = fn.call(thisArg, array[i], i, array);
          // toggle between the two functions
          fn = fn === fn1 ? fn2 : fn1;
        }}
        return output;
    },
    
    strReplaceAll: function(str, search, replacement) {
        var target = str;
        return target.replace(new RegExp(search, 'gi'), replacement);
    },
    
    markText: function(str, parsed_ner) {
        if(str && parsed_ner){
            for (var item in parsed_ner)
                str = this.strReplaceAll(' ' + str + ' ', ' ' + item + ' ', ' <mark data-entity="' + parsed_ner[item] + '">' + item + '</mark> ');  
        }
        return str;
    },

    render: function () {        
        var children = this.markText(this.entitystring, this.parsed_ner);
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="well">
                    <p>
                        <p><span className="label label-warning">{this.state.labelText}</span></p>
                        <input ref="querystringInput" type="text" placeholder="Type any sentence to see it's named entity visualisation"
                               className="form-control"
                               onChange={(e)=>this.setState({querystring: e.target.value})}
                        />
                    </p>
                    <button type="submit" className="btn btn-block btn-default btn-primary">Visualise</button>
                </div>
                <br/>
                <div className="well">                
                    <h4><div dangerouslySetInnerHTML={{__html: children}} /></h4>
                </div>
            </form>
        );
    }
});

ReactDOM.render(
    <InnerStoryApp/>, document.getElementById('div-visualisation-content')
);
