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

    componentDidMount: function () {
        $.get("/api" + URL_PATH + "attributes/", function (attributes) {
            this.setState({attributeList: attributes})
        }.bind(this));

        this.refreshQueries();
    },

    refreshQueries: function () {
        $.get("/api" + URL_PATH + "queries/", function (response) {
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

    handleQueryListRemove: function (queryId) {
        $.ajax({
            url: "/api" + URL_PATH + "queries/" + queryId,
            type: 'DELETE',
            success: function (response) {
                this.refreshQueries();
            }.bind(this),
            error: function (response) {
                console.log(response);
            }
        });
    },

    handleQueryListAdd: function (query) {
        // Refresh the entire array
        // If we just concat one in front then it won't update the attributes
        var tempQueryList = this.state.queryList;
        this.setState({queryList: []});
        this.setState({queryList: [query].concat(tempQueryList)});
    },

    handleAttributeSubmit: function (attr) {
        this.setState({attributeList: this.state.attributeList.concat([attr])});
    },

    handleAttributeDelete: function (attributeName) {
        var newAttributeList = this.state.attributeList.filter(function (a) {
            return a.attribute != attributeName;
        });
        this.setState({attributeList: newAttributeList});
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

    handleViewAllQueryList: function (e) {
        e.preventDefault();
        this.setState({
            queryListViewLabel: "View: all",
            queryList: []

        });
        $.get("/api" + URL_PATH + "queries/", function (response) {
            this.setState({
                queryList: response.results,
                nextURL: response.next,
                prevURL: response.previous
            })
        }.bind(this));
    },

    handleViewUnconfiguredQueryList: function (e) {
        e.preventDefault();
        this.setState({
            queryListViewLabel: "View: unconfigured",
            queryList: []

        });

        $.get("/api" + URL_PATH + "queries/?unconfigured=true", function (response) {
            this.setState({
                queryList: response.results,
                nextURL: response.next,
                prevURL: response.previous
            })
        }.bind(this));
    },

    handleViewConfiguredQueryList: function (e) {
        e.preventDefault();
        this.setState({
            queryListViewLabel: "View: configured",
            queryList: []
        });

        $.get("/api" + URL_PATH + "queries/?configured=true", function (response) {
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
                    <ManualQuery refreshQueries={this.refreshQueries} onQueryListAdd={this.handleQueryListAdd}/>
                </div>

                <br/>
                <hr/>
                <br/>

                <div className="pull-right btn-group">
                    <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false">
                        {this.state.queryListViewLabel} <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu">
                        <li><a onClick={this.handleViewAllQueryList} href="#">View: all</a></li>
                        <li><a onClick={this.handleViewUnconfiguredQueryList} href="#">View: unconfigured</a></li>
                        <li><a onClick={this.handleViewConfiguredQueryList} href="#">View: configured</a></li>
                    </ul>
                </div>

                <br/>
                <br/>
                <br/>

                <QueryApp
                    attributeList={this.state.attributeList}
                    queryList={this.state.queryList}
                    onQueryListRemove={this.handleQueryListRemove}
                />

                <hr/>

                {prevButton}
                {nextButton}
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

    componentDidMount: function () {
        setInterval(() => {
            $.get({
                url: "/api" + URL_PATH + "retrain/",
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
            url: "/api" + URL_PATH + "retrain/",
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

        if (this.state.attribute == null || this.state.attribute == "") {
            this.setState({labelText: "Attribute can\'t be empty!"});
            return;
        }

        this.setState({labelText: ""});

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
            attribute: "",
            labelText: ""
        };
    },

    render: function () {
        return (
            <form onSubmit={this.handleSubmit}>
                <p><span className="label label-warning">{this.state.labelText}</span></p>
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
            url: "/api" + URL_PATH + "queries/",
            type: "POST",
            data: {
                querystring: this.state.querystring
            },
            success: function (response) {
                this.refs.querystringInput.value = "";
                this.props.refreshQueries();
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
                    <p><span className="label label-warning">{this.state.labelText}</span></p>
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
    handleQueryListRemove: function (queryId) {
        this.props.onQueryListRemove(queryId);
    },

    render: function () {
        return (
            <div>
                <QueryList
                    handleQueryListRemove={this.handleQueryListRemove}
                    queryList={this.props.queryList}
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


                        <QueryNERList querystring={query.querystring} attributeList={this.props.attributeList}
                                      nerDict={nerDict} queryId={query.id}/>

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
            <QueryNewNER querystring={this.props.querystring} onNERCreate={this.onNERCreate}
                         attributeList={this.props.attributeList}/>
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
            targetText: "",
            labelText: "",
            labelAttribute: ""
        }
    },

    onNERSelectAttribute: function (val) {
        this.setState({targetAttribute: val});
    },

    onNERSelectTargetText: function (val) {
        this.setState({targetText: val});
    },

    onNERSubmit: function () {
        if (this.state.targetText != "" && this.state.targetAttribute != "") {
            this.setState({labelText: "", labelAttribute: ""});
            this.props.onNERCreate(this.state.targetText, this.state.targetAttribute);
            return;
        }

        if (this.state.targetText == "") {
            this.setState({labelText: "Your text can\'t be null"});
        } else {
            this.setState({labelText: ""});
        }

        if (this.state.labelAttribute == "") {
            this.setState({labelAttribute: "Your attribute can\'t be null"});
        } else {
            this.setState({labelAttribute: ""});
        }
    },

    render: function () {
        return (
            <tr>
                <th>
                    <QueryTargetTextSelect
                        handleNERSelectTargetText={this.onNERSelectTargetText}
                        querystring={this.props.querystring}
                    />
                    <p><span className="label label-warning">{this.state.labelText}</span></p>
                </th>
                <th>
                    <QueryAttributeSelect handleNERSelectAttribute={this.onNERSelectAttribute}
                                          attributeList={this.props.attributeList}/>
                    <p><span className="label label-warning">{this.state.labelAttribute}</span></p>
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

// Query target text
var QueryTargetTextSelect = React.createClass({
    onSelectChange: function (val) {
        this.props.handleNERSelectTargetText(val);
    },

    render: function () {
        return (
            <select onChange={(e)=>this.onSelectChange(e.target.value)} className="form-control">
                <option selected disabled>...</option>
                {
                    this.props.querystring.split(" ").map(function (txt) {
                        return (<option value={txt}>{txt}</option>)
                    }.bind(this))
                }
            </select>
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