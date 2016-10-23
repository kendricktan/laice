/**
 * Created by kendricktan on 22/10/16.
 */
var React = require("react");
var ReactDOM = require("react-dom");

/* Inner story main app */
var InnerStoryApp = React.createClass({
    getInitialState: function(){
        return {
            attributeList: [],
        }
    },

    componentDidMount: function () {
        this.serverRequest = $.get("/api" + URL_PATH + "attributes/", function (attributes) {
            this.setState({attributeList: attributes})
        }.bind(this));
    },

    handleAttributeSubmit: function(attr){
        this.setState({attributeList: this.state.attributeList.concat([attr])});
    },

    handleAttributeDelete: function(attributeName){
        var newAttributeList = this.state.attributeList.filter(function (a) {
            return a.attribute != attributeName;
        });
        this.setState({attributeList: newAttributeList});
    },

    render: function () {
        return (
            <div>
                <div className="well">
                    <InnerStoryHeader/>
                </div>

                <br/>

                <div className="well">
                    <h2>Attributes</h2>
                    <AttributeApp
                        attributeList={this.state.attributeList}
                        onAttributeSubmit={this.handleAttributeSubmit}
                        onAttributeDelete={this.handleAttributeDelete}
                    />
                </div>

                <br/>
                <hr/>
                <br/>

                <div className="well">
                    <h2>Manual query</h2>
                    <ManualQuery/>
                </div>

                <br/>
                <hr/>
                <br/>

                <div className="pull-right btn-group">
                    <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false">
                        View: unconfigured <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu">
                        <li><a href="#">View: unconfigured</a></li>
                        <li><a href="#">View: configured</a></li>
                        <li><a href="#">View: all</a></li>
                    </ul>
                </div>

                <br/>
                <br/>
                <br/>

                <QueryApp attributeList={this.state.attributeList}/>
            </div>
        )
    }
});

/* Inner story Header */
var InnerStoryHeader = React.createClass({
    onDeleteStory: function () {
        $.ajax({
            url: "/api" + URL_PATH,
            type: 'DELETE',
            success: function (response) {
                window.location.replace(DOMAIN + STORY_URL);
            }.bind(this),
            error: function (response) {
                console.log(response);
            }
        });
    },

    render: function () {
        return (
            <h3>
                <button type="button" className="pull-right btn btn-danger" data-toggle="modal"
                        data-target="#delete-story-modal">
                    Delete Story
                </button>
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
            </h3>
        )
    }
});

/* Attributes */
var AttributeApp = React.createClass({
    getInitialState: function () {
        return {
            labelText: ""
        };
    },

    handleAttributeSubmit: function (attr) {
        this.setState({labelText: ""});
        this.props.onAttributeSubmit(attr);
    },

    handleAttributeRemove: function (attributeName) {
        this.props.onAttributeDelete(attributeName);
    },

    handleAttributeDuplicate: function () {
        this.setState({labelText: "Attribute name already exists!"});
    },

    render: function () {
        return (
            <div>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Attribute</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <AttributeList attributeList={this.props.attributeList}
                                   onAttributeRemove={this.handleAttributeRemove}/>
                </table>
                <hr/>
                <p><span className="label label-warning">{this.state.labelText}</span></p>
                <NewAttribute onAttributeDuplicate={this.handleAttributeDuplicate}
                              onAttributeSubmit={this.handleAttributeSubmit}/>
            </div>
        );
    }
});

var AttributeList = React.createClass({
    handleAttributeRemove: function (attributeName) {
        $.ajax({
            url: "/api" + URL_PATH + "attributes/" + attributeName,
            type: 'DELETE',
            success: function (response) {
                this.props.onAttributeRemove(attributeName);
            }.bind(this),
            error: function (response) {
                console.log(response);
            }
        });
    },

    render: function () {
        var attributes = [];
        this.props.attributeList.map(function (attribute) {
            attributes.push(<Attribute attributeName={attribute.attribute}
                                       onAttributeDelete={this.handleAttributeRemove}/>);
        }.bind(this));
        return (
            <tbody>
            { attributes }
            </tbody>
        );
    }
});

var Attribute = React.createClass({
    handleAttributeRemove: function (attributeName) {
        this.props.onAttributeDelete(this.props.attributeName);
    },

    render: function () {
        return (
            <tr>
                <td>{ this.props.attributeName }</td>
                <td>
                    <button type="button" className="btn btn-danger"
                            onClick={this.handleAttributeRemove}>
                        Delete
                    </button>
                </td>
            </tr>
        );
    }
});

var NewAttribute = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();

        $.ajax({
            url: "/api" + URL_PATH + "attributes/",
            type: "POST",
            data: {
                attribute: this.state.attribute
            },
            success: function (response) {
                this.props.onAttributeSubmit(response);
                this.refs.attributeInput.value = "";
            }.bind(this),
            error: function (response) {
                this.props.onAttributeDuplicate();
            }.bind(this)
        });
    },

    getInitialState: function () {
        return {
            attribute: ""
        };
    },

    render: function () {
        return (
            <form onSubmit={this.handleSubmit}>
                <input ref="attributeInput" name="attribute" type="text" className="form-control"
                       placeholder="Story name (whitespaces will be trimed, special characters will be replaced with '-')"
                       onChange={(e)=>this.setState({attribute: e.target.value})}/><br/>
                <button id="add-story-btn" type="submit" className="btn btn-block btn-default btn-success">Add</button>
            </form>
        );
    }
});

/* Manual query */
var ManualQuery = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();

        $.ajax({
            url: "/api" + URL_PATH + "queries/",
            type: "POST",
            data: {
                querystring: this.state.querystring
            },
            success: function (response) {
                this.refs.querystringInput.value = "";
            }.bind(this),
            error: function (response) {
                this.props.onAttributeDuplicate();
            }.bind(this)
        });
    },

    render: function () {
        return (
            <form onSubmit={this.handleSubmit}>
                <p>
                    <input ref="querystringInput" type="text" placeholder="'Turn the temperature down by 2 degrees'"
                           className="form-control"
                           onChange={(e)=>this.setState({querystring: e.target.value})}
                    />
                </p>
                <button type="submit" className="btn btn-block btn-default btn-primary">Query</button>
            </form>
        );
    }
});

/* View queries */
var QueryApp = React.createClass({
    getInitialState: function () {
        return {
            queryList: [
                // querystring
                // configured
                // parsed_ner <- NER = named entity recognizer
            ],
            nextURL: "",
        }
    },

    handleQueryListRemove: function (queryId) {
        $.ajax({
            url: "/api" + URL_PATH + "queries/" + queryId,
            type: 'DELETE',
            success: function (response) {
                var newQueryList = this.state.queryList.filter(function (a) {
                    return a.id != queryId;
                });
                this.setState({queryList: newQueryList});

            }.bind(this),
            error: function (response) {
                console.log(response);
            }
        });
    },

    componentDidMount: function () {
        this.serverRequest = $.get("/api" + URL_PATH + "queries/", function (response) {
            this.setState({
                queryList: response.results,
                nextURL: response.next
            })
        }.bind(this));
    },

    render: function () {
        return (
            <div>
                <QueryList
                    handleQueryListRemove={this.handleQueryListRemove}
                    queryList={this.state.queryList}
                    attributeList={this.props.attributeList}
                />
            </div>
        );
    }
});

var QueryList = React.createClass({
    onQueryListDelete: function (queryId) {
        this.props.handleQueryListRemove(queryId);
    },

    render: function () {
        var queries = [];
        this.props.queryList.map(function (query) {
            var gylClass = query.configured ? "glyphicon glyphicon-ok" : "glyphicon glyphicon-remove";
            var nerDict = query.parsed_ner ? query.parsed_ner : {};
            queries.push(
                <div className="well">
                    <h4>
                        <button onClick={()=>this.onQueryListDelete(query.id)} type="submit"
                                className="pull-right btn btn-default btn-danger">Delete
                        </button>
                        <span className={gylClass}></span>&nbsp; {query.querystring}</h4>

                    <hr/>

                    <table className="table">
                        <thead>
                        <tr>
                            <th>Text</th>
                            <th>Attribute</th>
                            <th>Action</th>
                        </tr>
                        </thead>


                        <QueryNERList attributeList={this.props.attributeList} nerDict={nerDict} queryId={query.id}/>

                    </table>
                </div>
            );
        }.bind(this));
        return (
            <div>
                {queries}
            </div>
        )
    }
});

// Query NER List
var QueryNERList = React.createClass({
    getInitialState: function () {
        return {
            nerDict: this.props.nerDict
        }
    },

    onNERDelete: function (NERText) {
        // Only way to get the key to the hashmap/json
        // to be obtained from variable name
        var ner = {};
        ner[NERText] = true;

        $.ajax({
            url: "/api" + URL_PATH + "queries/" + this.props.queryId + '/ner/',
            type: 'DELETE',
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                ner
            }),
            success: function (response) {
                var newNerDict = this.state.nerDict;
                delete newNerDict[NERText];
                this.setState({nerDict: newNerDict});
            }.bind(this),
            error: function (response) {
                console.log(response);
            }
        });
    },

    onNERCreate: function (targetText, targetAttribute) {
        var ner = {};
        ner[targetText] = targetAttribute;

        $.ajax({
            url: "/api" + URL_PATH + "queries/" + this.props.queryId + '/ner/',
            type: 'POST',
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                ner
            }),
            success: function (response) {
                var newNerDict = this.state.nerDict;
                newNerDict[targetText] = targetAttribute;
                this.setState({newDict: newNerDict});
            }.bind(this),
            error: function (response) {
                console.log(response);
            }
        })
    },

    render: function () {
        var ners = [];
        for (var key in this.state.nerDict) {
            // Key is the text
            // dict[key] contains the attribute
            // this is so that key cannot be duplicated
            if (this.state.nerDict.hasOwnProperty(key)) {
                var tAttr = this.state.nerDict[key];
                ners.push(
                    <QueryNER onNERDelete={this.onNERDelete} targetText={key} targetAttribute={tAttr}/>
                )
            }
        }
        return (
            <tbody>
            {ners}
            <QueryNewNER onNERCreate={this.onNERCreate} attributeList={this.props.attributeList}/>
            </tbody>
        )
    }
});

// Query Name Entity Recognizer
var QueryNER = React.createClass({
    onNERRemove: function (NERText) {
        this.props.onNERDelete(NERText);
    },

    render: function () {
        return (
            <tr>
                <td scope="row">{ this.props.targetText }</td>
                <td>{ this.props.targetAttribute }</td>
                <td>
                    <button type="button" className="btn btn-danger"
                            onClick={(e)=>this.onNERRemove(this.props.targetText)}>
                        Delete
                    </button>
                </td>
            </tr>
        )
    }
});

// New NER
var QueryNewNER = React.createClass({
    getInitialState(){
        return {
            targetAttribute: "",
            targetText: ""
        }
    },

    onNERSelectAttribute: function (val) {
        this.setState({targetAttribute: val});
    },

    onNERSubmit: function () {
        this.props.onNERCreate(this.state.targetText, this.state.targetAttribute);
    },

    render: function () {
        return (
            <tr>
                <th>
                    <input type="text" className="form-control" placeholder="text"
                           onChange={(e)=>this.setState({targetText: e.target.value})}
                           ref="targetTextInput"/>
                </th>
                <th>
                    <QueryAttributeSelect handleNERSelectAttribute={this.onNERSelectAttribute}
                                          attributeList={this.props.attributeList}/>
                </th>
                <th>
                    <button type="button" className="btn btn-success"
                            onClick={this.onNERSubmit}>Add
                    </button>
                </th>
            </tr>
        )
    }
});

// Select combo-box for queries
var QueryAttributeSelect = React.createClass({
    onSelectChange: function (val) {
        this.props.handleNERSelectAttribute(val);
    },

    render: function () {
        return (
            <select onChange={(e)=>this.onSelectChange(e.target.value)} className="form-control">
                <option selected disabled>...</option>
                {
                    this.props.attributeList.map(function (attribute) {
                        return (<option value={attribute.attribute}>{attribute.attribute}</option>)
                    }.bind(this))
                }
            </select>
        )
    }
});

ReactDOM.render(
    <InnerStoryApp/>, document.getElementById('div-inner-story-content')
);