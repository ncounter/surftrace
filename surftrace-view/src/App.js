import React from "react";
import { BrowserRouter as Router, Route, Redirect, Link } from "react-router-dom";
import './App.css';
import urlCountData from './data/url-count.json';
import patternCountData from './data/pattern-count.json';

function BasicExample() {
  return (
    <Router>
      <menu>
        <ul>
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
    <Redirect to={{pathname: "/urlcount"}}/>
  );
}

function URLCount() {
  return (
    <div>
      <h2>URLCount</h2>
      <table>
        <thead>
          <tr>
            <th className="center"><small>id</small></th>
            <th>URL</th>
            <th className="center">Count</th>
          </tr>
        </thead>
        <tbody>
          {
            urlCountData.map((d, i) =>
              <tr key={"row-" + i}>
                <td className="center"><small>{i}</small></td>
                <td>{d.url}</td>
                <td className="center">{d.count}</td>
              </tr>
            )
          }
        </tbody>
      </table>
    </div>
  );
}

function Patterns({ match }) {
  return (
    <div>
      <h2>Patterns</h2>
      <table>
        <thead>
          <tr>
            <th className="center"><small>id</small></th>
            <th>From</th>
            <th>To</th>
            <th className="center">Count</th>
          </tr>
        </thead>
        <tbody>
          {
            patternCountData.map((p, i) =>
              <tr key={"row-" + i}>
                <td className="center"><small>{i}</small></td>
                <td>{p.from.url}</td>
                <td>{p.to.url}</td>
                <td className="center">{p.count}</td>
              </tr>
            )
          }
        </tbody>
      </table>
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
