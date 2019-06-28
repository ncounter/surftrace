import React from "react";
import { BrowserRouter as Router, Route, Redirect, NavLink } from "react-router-dom";
import './App.css';
import urlCountData from './data/url-count.json';
import patternCountData from './data/pattern-count.json';

function RoutedContent() {
  return (
    <Router>
      <menu>
        <ul>
          <li>
            <NavLink to="/urlcount">URL Count</NavLink>
          </li>
          <li>
            <NavLink to="/patterns">Patterns</NavLink>
          </li>
        </ul>
      </menu>

      <Route exact path="/" component={Home} />
      <Route path="/urlcount" component={URLCount} />
      <Route path="/patterns" component={Patterns} />
    </Router>
  );
}

function Home() { return ( <Redirect to={{pathname: "/urlcount"}}/> ); }

function URLCount() {
  return (
    <div className="content-wrapper">
      <h2>URL Count</h2>
      <table>
        <thead>
          <tr>
            <th className="center width-1em"></th>
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
                <td className="center"><strong>{d.count}</strong></td>
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
    <div className="content-wrapper">
      <h2>Patterns</h2>
      <table>
        <thead>
          <tr>
            <th className="center width-1em"></th>
            <th>From</th>
            <th>To</th>
            <th className="center">Count</th>
            <th className="center">Average Delay (s)</th>
          </tr>
        </thead>
        <tbody>
          {
            patternCountData.map((p, i) =>
              <tr key={"row-" + i}>
                <td className="center"><small>{i}</small></td>
                <td>{p.from}</td>
                <td>{p.to}</td>
                <td className="center"><strong>{p.count}</strong></td>
                <td className="center">
                  <strong>{ Math.round(p.delay.reduce((a,b) => a+b) / p.delay.length, 0) }</strong>
                  &nbsp;
                  <span><small>[max: {Math.max.apply(Math, p.delay)}</small></span>
                  &nbsp;
                  <span><small>min: {Math.min.apply(Math, p.delay)}]</small></span>
                </td>
              </tr>
            )
          }
        </tbody>
      </table>
      <div className="detail-box"></div>
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

// function Topic({ match }) {
//   return (
//     <div>
//       <h3>{match.params.topicId}</h3>
//     </div>
//   );
// }

export default RoutedContent;
