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
            <th className="center">Total Count</th>
            <th className="center">Reloads Count</th>
            <th className="center">Average Delay (seconds)</th>
            <th className="center">Max Delay (seconds)</th>
            <th className="center">Min Delay (seconds)</th>
          </tr>
        </thead>
        <tbody>
          {
            patternCountData.filter(p => p.count > 1).map((p, i) =>
              <tr key={"row-" + i}>
                <td className="center"><small>{i}</small></td>
                <td>{p.from}</td>
                <td>{p.to}</td>
                <td className="center"><strong>{p.count}</strong></td>
                <td className="center">{p.reloadCount > 0 ? p.reloadCount : '-'}</td>
                <td className="center"><strong>{p.averageDelay}</strong></td>
                <td className="center">{p.maxDelay}</td>
                <td className="center">{p.minDelay}</td>
              </tr>
            )
          }
        </tbody>
      </table>
      <div className="detail-box"></div>
    </div>
  );
}

export default RoutedContent;
