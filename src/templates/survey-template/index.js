import React, { Component } from "react";
import * as Survey from "survey-react";
import "./survey.css"
import "./index.css"
import eventFeedbackSurvey from './eventFeedbackSurvey.json'
import conferenceFeedbackSurvey from './conferenceFeedbackSurvey.json'
import demoSurvey from './demoSurvey.json'
import courseFeedbackSurvey from './courseFeedbackSurvey.json'

class App extends Component {
  constructor(props){
    super();
    this.state = {
      surveyJSON: [demoSurvey, eventFeedbackSurvey, conferenceFeedbackSurvey, courseFeedbackSurvey]
    };
  }

  render() {
    // Choose between different templates
    var model = new Survey.Model(this.state.surveyJSON[3]);

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Survey</h1>
        </header>
        <Survey.Survey
            model={model}
            onComplete={this.onComplete}
            onValueChanged={this.onValueChanged}
          />

        {/* <script src="https://surveyjs.azureedge.net/1.0.29/survey.react.min.js" /> */}
        </div>
    );
  }
}

export default App;
 