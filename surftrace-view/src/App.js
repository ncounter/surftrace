import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './App.css';

function BasicExample() {
  return (
    <Router>
      <menu>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/urlcount">URL Count</Link>
          </li>
          <li>
            <Link to="/patterns">Patterns</Link>
          </li>
        </ul>
      </menu>

      <Route exact path="/" component={Home} />
      <Route path="/urlcount" component={URLCount} />
      <Route path="/patterns" component={Patterns} />
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
        <ul>
          <li>
            <Link to="/urlcount">URL Count</Link>
          </li>
          <li>
            <Link to="/patterns">Patterns</Link>
          </li>
        </ul>
    </div>
  );
}

function URLCount() {
  return (
    <div>
      <h2>URLCount</h2>
    </div>
  );
}

function Patterns({ match }) {
  return (
    <div>
      <h2>Patterns</h2>
      {/* <ul>
        <li>
          <Link to={`${match.url}/rendering`}>Rendering with React</Link>
        </li>
        <li>
          <Link to={`${match.url}/components`}>Components</Link>
        </li>
        <li>
          <Link to={`${match.url}/props-v-state`}>Props v. State</Link>
        </li>
      </ul>

      <Route path={`${match.path}/:topicId`} component={Topic} />
      <Route
        exact
        path={match.path}
        render={() => <h3>Please select a topic.</h3>}
      /> */}
    </div>
  );
}

function Topic({ match }) {
  return (
    <div>
      <h3>{match.params.topicId}</h3>
    </div>
  );
}

export default BasicExample;